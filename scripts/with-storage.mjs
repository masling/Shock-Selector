import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const projectRef = "nvfbyhprwiyigdcqgjtd";
const localFileName = ".env.storage.local";

export function validateStorageEnvironment(values) {
  if (values.SUPABASE_PROJECT_REF !== projectRef) throw new Error("Unexpected Supabase project ref");
  let url;
  try { url = new URL(values.NEXT_PUBLIC_SUPABASE_URL); } catch { throw new Error("Supabase URL is missing or invalid"); }
  if (url.protocol !== "https:" || url.hostname !== `${projectRef}.supabase.co` || url.pathname !== "/") throw new Error("Supabase URL does not match the approved Frankfurt project");
  if (!/^sb_secret_[A-Za-z0-9_-]{20,}$/.test(values.SUPABASE_SECRET_KEY ?? "")) throw new Error("A modern server-only Supabase secret key is required");
  if (!values.ENGINEERING_ASSET_ROOT || !path.isAbsolute(values.ENGINEERING_ASSET_ROOT)) throw new Error("Engineering asset root must be an absolute local path");
  return { projectRef, host: url.hostname, modernSecretKey: true, productionEnvironmentChanged: false };
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "--help") {
    console.log("node scripts/with-storage.mjs config|plan|apply\nConfig and plan never upload. Apply creates/uses the private bucket and uploads only registry-approved files.");
    return;
  }
  if (!["config", "plan", "apply"].includes(command) || args.length) throw new Error("Use config, plan or apply");
  const file = path.resolve(localFileName);
  if (!fs.existsSync(file)) throw new Error(`Create the ignored ${localFileName} file first`);
  if ((fs.statSync(file).mode & 0o077) !== 0) throw new Error(`${localFileName} must have owner-only permissions (chmod 600)`);
  const values = parseEnv(fs.readFileSync(file, "utf8"));
  const safe = validateStorageEnvironment(values);
  if (command === "config") {
    console.log(JSON.stringify({ ...safe, uploaded: false }));
    return;
  }
  const env = { ...process.env };
  for (const key of ["SUPABASE_PROJECT_REF", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "ENGINEERING_ASSET_ROOT", "CONTROLLED_DOWNLOAD_APPLY"]) delete env[key];
  for (const key of ["SUPABASE_PROJECT_REF", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "ENGINEERING_ASSET_ROOT"]) env[key] = values[key];
  env.CONTROLLED_DOWNLOAD_APPLY = command === "apply" ? "true" : "false";
  const child = spawn(process.execPath, ["scripts/upload-controlled-downloads.mjs"], { stdio: "inherit", env });
  child.on("error", () => { console.error("Could not start the controlled-download tool"); process.exitCode = 1; });
  child.on("exit", (code, signal) => { process.exitCode = signal ? 1 : code ?? 1; });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
