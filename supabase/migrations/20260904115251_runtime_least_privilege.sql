-- Server-side runtime role only. Password provisioning is separate and must
-- never be committed to migration history. Public Data API roles stay denied.
CREATE ROLE vibro_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 5;
GRANT vibro_runtime TO postgres;
ALTER ROLE vibro_runtime SET statement_timeout = '15s';
ALTER ROLE vibro_runtime SET idle_in_transaction_session_timeout = '30s';
GRANT USAGE ON SCHEMA public TO vibro_runtime;
GRANT SELECT ON public."ProductFamily", public."ProductFamilyTranslation",
  public."ProductSeries", public."ProductModel", public."ProductSpecDefinition",
  public."ProductSpecValue", public."ProductSourceReference" TO vibro_runtime;
GRANT INSERT ON public."SelectionLog" TO vibro_runtime;

CREATE POLICY runtime_read_published ON public."ProductFamily"
  FOR SELECT TO vibro_runtime
  USING ("isActive" AND "catalogStatus" = 'PUBLISHED');

CREATE POLICY runtime_read_published ON public."ProductFamilyTranslation"
  FOR SELECT TO vibro_runtime
  USING (EXISTS (SELECT 1 FROM public."ProductFamily" f WHERE f.id = "familyId"));

CREATE POLICY runtime_read_published ON public."ProductSeries"
  FOR SELECT TO vibro_runtime
  USING ("catalogStatus" = 'PUBLISHED'
    AND EXISTS (SELECT 1 FROM public."ProductFamily" f WHERE f.id = "familyId"));

CREATE POLICY runtime_read_published ON public."ProductModel"
  FOR SELECT TO vibro_runtime
  USING ("isActive" AND "catalogStatus" = 'PUBLISHED'
    AND EXISTS (SELECT 1 FROM public."ProductSeries" s WHERE s.id = "seriesId"));

CREATE POLICY runtime_read_published ON public."ProductSpecDefinition"
  FOR SELECT TO vibro_runtime
  USING (("familyId" IS NULL OR EXISTS (SELECT 1 FROM public."ProductFamily" f WHERE f.id = "familyId"))
    AND ("seriesId" IS NULL OR EXISTS (SELECT 1 FROM public."ProductSeries" s WHERE s.id = "seriesId")));

CREATE POLICY runtime_read_published ON public."ProductSpecValue"
  FOR SELECT TO vibro_runtime
  USING (EXISTS (SELECT 1 FROM public."ProductModel" m WHERE m.id = "modelId")
    AND EXISTS (SELECT 1 FROM public."ProductSpecDefinition" d WHERE d.id = "specDefinitionId"));

CREATE POLICY runtime_read_published ON public."ProductSourceReference"
  FOR SELECT TO vibro_runtime
  USING (("modelId" IS NOT NULL OR "seriesId" IS NOT NULL)
    AND ("modelId" IS NULL OR EXISTS (SELECT 1 FROM public."ProductModel" m WHERE m.id = "modelId"))
    AND ("seriesId" IS NULL OR EXISTS (SELECT 1 FROM public."ProductSeries" s WHERE s.id = "seriesId")));

CREATE POLICY runtime_append_engineer_log ON public."SelectionLog"
  FOR INSERT TO vibro_runtime
  WITH CHECK ("viewMode" = 'ENGINEER' AND "matchedProductCount" >= 0);
