-- Run against the approved Frankfurt project only. All fixtures are rolled back.
DO $test$
DECLARE
  published_family text;
  published_series text;
  denied boolean;
BEGIN
  BEGIN
    SELECT id INTO STRICT published_family FROM public."ProductFamily" WHERE "isActive" AND "catalogStatus"='PUBLISHED' ORDER BY id LIMIT 1;
    SELECT id INTO STRICT published_series FROM public."ProductSeries" WHERE "catalogStatus"='PUBLISHED' AND "familyId"=published_family ORDER BY id LIMIT 1;

    INSERT INTO public."ProductFamily" (id,key,slug,"catalogStatus","updatedAt")
      VALUES ('__runtime_probe_family','__runtime_probe_family','__runtime_probe_family','DRAFT',now());
    INSERT INTO public."ProductSeries" (id,"familyId",code,slug,name,"catalogStatus","updatedAt") VALUES
      ('__runtime_probe_series_draft',published_family,'__runtime_probe_series_draft','__runtime_probe_series_draft','test','DRAFT',now()),
      ('__runtime_probe_series_hidden_family','__runtime_probe_family','__runtime_probe_series_hidden_family','__runtime_probe_series_hidden_family','test','PUBLISHED',now());
    INSERT INTO public."ProductModel" (id,"seriesId","rawModel",model,"sortKey","catalogStatus","isActive","updatedAt") VALUES
      ('__runtime_probe_model_draft',published_series,'test','__runtime_probe_model_draft','test','DRAFT',true,now()),
      ('__runtime_probe_model_review',published_series,'test','__runtime_probe_model_review','test','NEEDS_REVIEW',true,now()),
      ('__runtime_probe_model_inactive',published_series,'test','__runtime_probe_model_inactive','test','PUBLISHED',false,now()),
      ('__runtime_probe_model_hidden_series','__runtime_probe_series_draft','test','__runtime_probe_model_hidden_series','test','PUBLISHED',true,now()),
      ('__runtime_probe_model_hidden_family','__runtime_probe_series_hidden_family','test','__runtime_probe_model_hidden_family','test','PUBLISHED',true,now()),
      ('__runtime_probe_model_public',published_series,'test','__runtime_probe_model_public','test','PUBLISHED',true,now());
    INSERT INTO public."ProductSpecDefinition" (id,key,"labelEn","labelZh","dataType","familyId")
      VALUES ('__runtime_probe_spec','__runtime_probe_spec','test','test','NUMBER',published_family);
    INSERT INTO public."ProductSpecValue" (id,"modelId","specDefinitionId","valueNumber") VALUES
      ('__runtime_probe_value_hidden','__runtime_probe_model_draft','__runtime_probe_spec',42),
      ('__runtime_probe_value_public','__runtime_probe_model_public','__runtime_probe_spec',42);
    INSERT INTO public."ProductSourceReference" (id,"modelId","sourceType","sourcePath","sourceTitle",language,"extractionMethod") VALUES
      ('__runtime_probe_source_hidden','__runtime_probe_model_draft','MANUAL_SEED','test-only','test','en','runtime-smoke'),
      ('__runtime_probe_source_public','__runtime_probe_model_public','MANUAL_SEED','test-only','test','en','runtime-smoke');

    SET LOCAL ROLE vibro_runtime;
    IF current_user <> 'vibro_runtime' THEN RAISE EXCEPTION 'Wrong test role'; END IF;
    IF (SELECT count(*) FROM public."ProductModel" WHERE left(id,16)='__runtime_probe_') <> 1 THEN
      RAISE EXCEPTION 'Draft, review, inactive or hidden-parent models leaked';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public."ProductModel" WHERE id='__runtime_probe_model_public') THEN RAISE EXCEPTION 'Published model unreadable'; END IF;
    IF EXISTS (SELECT 1 FROM public."ProductFamily" WHERE id='__runtime_probe_family') THEN RAISE EXCEPTION 'Draft family leaked'; END IF;
    IF EXISTS (SELECT 1 FROM public."ProductSeries" WHERE left(id,16)='__runtime_probe_') THEN RAISE EXCEPTION 'Draft or hidden-parent series leaked'; END IF;
    IF EXISTS (SELECT 1 FROM public."ProductSpecValue" WHERE id='__runtime_probe_value_hidden') THEN RAISE EXCEPTION 'Hidden model specs leaked'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public."ProductSpecValue" WHERE id='__runtime_probe_value_public') THEN RAISE EXCEPTION 'Published model specs unreadable'; END IF;
    IF EXISTS (SELECT 1 FROM public."ProductSourceReference" WHERE id='__runtime_probe_source_hidden') THEN RAISE EXCEPTION 'Hidden source leaked'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public."ProductSourceReference" WHERE id='__runtime_probe_source_public') THEN RAISE EXCEPTION 'Published source unreadable'; END IF;

    denied := false;
    BEGIN PERFORM 1 FROM public."SelectionLog" LIMIT 1; EXCEPTION WHEN insufficient_privilege THEN denied := true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Historical logs are readable'; END IF;
    denied := false;
    BEGIN UPDATE public."ProductModel" SET "isActive"=false WHERE false; EXCEPTION WHEN insufficient_privilege THEN denied := true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Catalog writes are allowed'; END IF;
    INSERT INTO public."SelectionLog" (id,"viewMode","rawInputJson","matchedProductCount")
      VALUES ('__runtime_probe_log','ENGINEER','{"test":"runtime-access"}',0);
    RESET ROLE;
    IF NOT EXISTS (SELECT 1 FROM public."SelectionLog" WHERE id='__runtime_probe_log') THEN RAISE EXCEPTION 'Append log failed'; END IF;

    RAISE EXCEPTION USING ERRCODE='ZX010', MESSAGE='Rollback successful runtime access test';
  EXCEPTION WHEN SQLSTATE 'ZX010' THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM public."ProductModel" WHERE left(id,16)='__runtime_probe_')
    OR EXISTS (SELECT 1 FROM public."SelectionLog" WHERE id='__runtime_probe_log') THEN
    RAISE EXCEPTION 'Runtime fixtures were not rolled back';
  END IF;
END;
$test$;
