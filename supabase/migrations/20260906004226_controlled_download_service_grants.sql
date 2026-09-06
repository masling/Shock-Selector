-- The secure public-table default removes service_role table access. Restore
-- only the columns needed by the server-side controlled-download publisher.
grant select (id, model, "catalogStatus", "isActive")
  on table public."ProductModel" to service_role;

grant select (id, "modelId", format, sha256, "bucketId", "objectKey", approved)
  on table public."CatalogDownload" to service_role;

grant insert ("modelId", title, filename, format, "byteSize", sha256, "bucketId", "objectKey", approved)
  on table public."CatalogDownload" to service_role;
