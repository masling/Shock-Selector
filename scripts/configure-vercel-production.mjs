import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { approvedProject, validateRuntimeEnvironment } from "./with-supabase.mjs";

const project = { projectId: "prj_KwQ9b0fYR8TmQ6YJ1hb2WPA3QKua", orgId: "team_iAWkTtejf4AxnD3fI8nMQmSu", name: "shock-selector" };
const safeToken = (value) => typeof value === "string" && value.trim().length >= 20 && !/\s|PLACEHOLDER|YOUR-|CHANGE-ME/i.test(value.trim());

function readPrivateEnv(name) {
  const file = path.resolve(name);
  if (!fs.existsSync(file)) throw new Error(`Missing ${name}`);
  if ((fs.statSync(file).mode & 0o077) !== 0) throw new Error(`${name} must have owner-only permissions`);
  return parseEnv(fs.readFileSync(file, "utf8"));
}

export function buildProductionEnvironment({ supabase, storage, notifications, cronSecret }) {
  validateRuntimeEnvironment(supabase);
  if (supabase.NEXT_PUBLIC_SUPABASE_URL !== `https://${approvedProject}.supabase.co` || !supabase.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_")) {
    throw new Error("Invalid public Supabase configuration");
  }
  if (storage.SUPABASE_PROJECT_REF !== approvedProject || !safeToken(storage.SUPABASE_SECRET_KEY) || !storage.SUPABASE_SECRET_KEY.startsWith("sb_secret_")) {
    throw new Error("Invalid server-only Supabase configuration");
  }
  const zeptoMailToken = (notifications.ZEPTOMAIL_SEND_TOKEN ?? "").trim().replace(/^zoho-enczapikey\s+/i, "");
  if (notifications.ZEPTOMAIL_API_ENABLED !== "true" || !safeToken(zeptoMailToken)) {
    throw new Error("Invalid ZeptoMail API configuration");
  }
  let feishu;
  try { feishu = new URL(notifications.FEISHU_WEBHOOK_URL); } catch { throw new Error("Invalid Feishu configuration"); }
  if (notifications.FEISHU_WEBHOOK_ENABLED !== "true" || feishu.protocol !== "https:" || !["open.feishu.cn", "open.larksuite.com"].includes(feishu.hostname)
    || !safeToken(notifications.FEISHU_WEBHOOK_SIGNING_SECRET) || !safeToken(cronSecret)) throw new Error("Invalid notification configuration");

  const config = {
    SUPABASE_PROJECT_REF: approvedProject,
    NEXT_PUBLIC_SITE_URL: "https://www.vibroabsorber.com",
    NEXT_PUBLIC_SUPABASE_URL: supabase.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabase.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: "true",
    INQUIRY_PORTAL_ENABLED: "true",
    CONTROLLED_DOWNLOADS_ENABLED: "true",
    ZEPTOMAIL_API_ENABLED: "true",
    ZEPTOMAIL_API_TIMEOUT_MS: notifications.ZEPTOMAIL_API_TIMEOUT_MS ?? "10000",
    FEISHU_WEBHOOK_ENABLED: "true",
    FEISHU_TIMEOUT_MS: notifications.FEISHU_TIMEOUT_MS ?? "5000",
    NOTIFICATION_WORKER_ENABLED: "true",
    NOTIFICATION_WORKER_BATCH_SIZE: "10",
    NOTIFICATION_WORKER_LEASE_SECONDS: "300",
  };
  const secret = {
    DATABASE_URL: supabase.DATABASE_URL,
    DIRECT_URL: supabase.DIRECT_URL,
    SUPABASE_SECRET_KEY: storage.SUPABASE_SECRET_KEY,
    ZEPTOMAIL_SEND_TOKEN: zeptoMailToken,
    FEISHU_WEBHOOK_URL: notifications.FEISHU_WEBHOOK_URL,
    FEISHU_WEBHOOK_SIGNING_SECRET: notifications.FEISHU_WEBHOOK_SIGNING_SECRET,
    NOTIFICATION_STAFF_EMAILS: "service@vibroabsorber.com",
    CRON_SECRET: cronSecret,
  };
  for (const [name, value] of Object.entries({ ...config, ...secret })) if (!value) throw new Error(`Missing production value: ${name}`);
  return { config, secret };
}

function verifyLink() {
  const linked = JSON.parse(fs.readFileSync(path.resolve(".vercel/project.json"), "utf8"));
  if (linked.projectId !== project.projectId || linked.orgId !== project.orgId || linked.projectName !== project.name) throw new Error("Unexpected linked Vercel project");
}

function runVercel(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["dlx", "vercel@latest", ...args], { env: { ...process.env, CI: "1" }, stdio: ["pipe", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.stdin.end(`${input}\n`);
    child.on("error", () => reject(new Error("Could not start Vercel CLI")));
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else {
        const lastLine = stderr.split("\n").filter(Boolean).slice(-1)[0]?.replaceAll(input, "[redacted]") ?? "unknown error";
        reject(new Error(`Vercel CLI failed (${code}); ${lastLine}`));
      }
    });
  });
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!["plan", "apply"].includes(command) || args.length) throw new Error("Use plan or apply");
  verifyLink();
  const cronSecret = command === "apply" ? randomBytes(32).toString("base64url") : "test-only-cron-secret-1234567890";
  const values = buildProductionEnvironment({
    supabase: readPrivateEnv(".env.supabase.local"),
    storage: readPrivateEnv(".env.storage.local"),
    notifications: readPrivateEnv(".env.notifications.local"),
    cronSecret,
  });
  const plan = [
    ...Object.keys(values.config).map((name) => ({ name, type: "config" })),
    ...Object.keys(values.secret).map((name) => ({ name, type: "secret" })),
  ];
  if (command === "plan") {
    console.log(JSON.stringify({ project: project.name, target: "production", variables: plan, writes: false }, null, 2));
    return;
  }
  for (const item of plan) {
    const value = item.type === "config" ? values.config[item.name] : values.secret[item.name];
    await runVercel(["env", "add", item.name, "production", "--force", "--type", item.type, "--yes"], value);
    console.log(JSON.stringify({ configured: item.name, type: item.type, valuePrinted: false }));
  }
  console.log(JSON.stringify({ project: project.name, target: "production", configured: plan.length, secretsPrinted: false }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
