# Supabase database CA

Public root certificate downloaded from the link in this project's authenticated Supabase Database Settings page:

https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

Verified on 2026-09-04. Subject/issuer: Supabase Root 2021 CA. Expires 2031-04-26.

SHA-256 certificate fingerprint:

`80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`

The CA is scoped to this application's Supabase connection, not installed in the OS trust store. Prisma's official pg adapter receives the CA explicitly with `rejectUnauthorized: true` and the expected server name. SSL query parameters are removed before node-postgres parses the URL so they cannot override those options. Do not disable verification. Re-fetch from an official authenticated/documented source and review the fingerprint if Supabase rotates this CA.
