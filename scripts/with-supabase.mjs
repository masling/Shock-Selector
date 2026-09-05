import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

export const approvedProject = "nvfbyhprwiyigdcqgjtd";
export const poolerHost = "aws-0-eu-central-1.pooler.supabase.com";

export function validateRuntimeEnvironment(values) {
  if (values.SUPABASE_PROJECT_REF !== approvedProject) throw new Error("Unexpected Supabase project ref");
  for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
    let url;
    try { url = new URL(values[key]); } catch { throw new Error(`${key} is missing or invalid`); }
    if (!["postgres:", "postgresql:"].includes(url.protocol)
      || url.hostname !== poolerHost
      || url.username !== `vibro_runtime.${approvedProject}`
      || url.pathname !== "/postgres"
      || !url.password || /PASSWORD|YOUR-|PLACEHOLDER/.test(url.password)
      || url.searchParams.get("sslmode") !== "require"
      || url.searchParams.get("sslaccept") !== "strict") throw new Error(`${key} must use the approved least-privilege role and verified TLS endpoint`);
    const port = key === "DATABASE_URL" ? "6543" : "5432";
    if (url.port !== port || (key === "DATABASE_URL" && url.searchParams.get("pgbouncer") !== "true")) throw new Error(`${key} has the wrong pooler mode`);
  }
  return { projectId: approvedProject, role: "vibro_runtime", host: poolerHost };
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "--help") {
    console.log("node scripts/with-supabase.mjs config|smoke|dev [--port <port>]\nLoads only the ignored .env.supabase.local runtime credentials; never changes .env or deployment settings.");
    return;
  }
  if (!["config", "smoke", "dev"].includes(command)) throw new Error("Use config, smoke or dev");
  if (args.length && (command !== "dev" || args.length !== 2 || args[0] !== "--port" || !/^\d+$/.test(args[1]) || Number(args[1]) < 1024 || Number(args[1]) > 65535)) throw new Error("Invalid arguments");
  const file = path.resolve(".env.supabase.local");
  if (!fs.existsSync(file)) throw new Error("Create the ignored .env.supabase.local file from .env.supabase.example first");
  if ((fs.statSync(file).mode & 0o077) !== 0) throw new Error(".env.supabase.local must have owner-only permissions (chmod 600)");
  const values = parseEnv(fs.readFileSync(file, "utf8"));
  const target = validateRuntimeEnvironment(values);
  console.log(JSON.stringify({ ...target, productionConnectionChanged: false }));
  if (command === "config") return;
  const env = { ...process.env };
  for (const key of ["DATABASE_URL", "DIRECT_URL", "SHADOW_DATABASE_URL"]) delete env[key];
  for (const key of ["DATABASE_URL", "DIRECT_URL", "SUPABASE_PROJECT_REF", "NEXT_PUBLIC_SITE_URL"]) if (values[key] !== undefined) env[key] = values[key];
  const childArgs = command === "smoke"
    ? ["--import", "tsx", "scripts/supabase-runtime-smoke.ts"]
    : ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", args[1] ?? "3025"];
  const child = spawn(process.execPath, childArgs, { stdio: "inherit", env });
  child.on("error", () => { console.error("Could not start the Supabase runtime check"); process.exitCode = 1; });
  child.on("exit", (code, signal) => { process.exitCode = signal ? 1 : code ?? 1; });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
