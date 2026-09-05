
-- New Frankfurt project only. No existing application tables are modified.
CREATE SCHEMA private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION private.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
DECLARE
  target record;
BEGIN
  FOR target IN
    SELECT DISTINCT n.nspname, c.relname
    FROM pg_event_trigger_ddl_commands() AS cmd
    JOIN pg_class AS c ON cmd.classid = 'pg_class'::regclass AND c.oid = cmd.objid
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE cmd.command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND c.relkind IN ('r', 'p')
      AND n.nspname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', target.nspname, target.relname);
  END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION private.rls_auto_enable() FROM PUBLIC, anon, authenticated, service_role;

CREATE EVENT TRIGGER ensure_rls
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
EXECUTE FUNCTION private.rls_auto_enable();

-- Assert new-table RLS and default API denial. The deliberate subtransaction
-- exception rolls back the probe table/sequence; failures abort the migration.
DO $verify$
DECLARE
  api_role text;
  probe_sequence text;
BEGIN
  BEGIN
    CREATE TABLE public.__vibro_security_probe_20260904 (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      value text
    );

    IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.__vibro_security_probe_20260904'::regclass) THEN
      RAISE EXCEPTION 'Automatic RLS verification failed';
    END IF;

    probe_sequence := pg_get_serial_sequence('public.__vibro_security_probe_20260904', 'id');
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
      IF has_table_privilege(api_role, 'public.__vibro_security_probe_20260904', 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER') THEN
        RAISE EXCEPTION 'Unexpected default table privileges for %', api_role;
      END IF;
      IF has_sequence_privilege(api_role, probe_sequence, 'USAGE, SELECT, UPDATE') THEN
        RAISE EXCEPTION 'Unexpected default sequence privileges for %', api_role;
      END IF;
    END LOOP;

    RAISE EXCEPTION USING ERRCODE = 'ZX001', MESSAGE = 'Rollback successful security probe';
  EXCEPTION WHEN SQLSTATE 'ZX001' THEN
    NULL;
  END;

  IF to_regclass('public.__vibro_security_probe_20260904') IS NOT NULL THEN
    RAISE EXCEPTION 'Security probe cleanup failed';
  END IF;
END;
$verify$;
