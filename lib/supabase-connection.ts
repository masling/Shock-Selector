import fs from "node:fs";
import path from "node:path";
import { X509Certificate } from "node:crypto";
import type { PoolConfig } from "pg";

const projectRef = "nvfbyhprwiyigdcqgjtd";
const poolerHost = "aws-0-eu-central-1.pooler.supabase.com";
const caFingerprint = "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA";

export function supabasePoolConfig(value: string | undefined, selectedProject: string | undefined): PoolConfig | undefined {
  if (!selectedProject) return undefined; // Existing Neon/local environments keep the native Prisma driver.
  if (selectedProject !== projectRef || !value) throw new Error("Supabase runtime project is not configured correctly");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Invalid Supabase runtime URL"); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || url.hostname !== poolerHost || url.port !== "6543"
    || url.username !== `vibro_runtime.${projectRef}` || !url.password || url.pathname !== "/postgres") throw new Error("Supabase runtime must use the approved least-privilege connection");
  const caPath = path.join(process.cwd(), "supabase/certs/prod-ca-2021.crt");
  const ca = fs.readFileSync(caPath, "utf8");
  const certificate = new X509Certificate(ca);
  if (certificate.fingerprint256 !== caFingerprint) throw new Error("Supabase CA differs from the verified official certificate");
  // pg-connection-string can replace the explicit TLS options if SSL query
  // parameters remain present. Use one authoritative, strictly verified config.
  for (const key of ["ssl", "sslmode", "sslcert", "sslrootcert", "sslkey", "sslpassword", "sslaccept", "pgbouncer", "connection_limit", "connect_timeout", "pool_timeout", "socket_timeout"]) url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: { ca, rejectUnauthorized: true, servername: poolerHost },
    max: 3,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    allowExitOnIdle: true,
    application_name: "vibroabsorber-runtime",
  };
}
