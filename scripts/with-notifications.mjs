import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const localFileName = ".env.notifications.local";
const approvedHosts = new Set(["open.feishu.cn", "open.larksuite.com"]);

export function validateFeishuEnvironment(values) {
  if (values.FEISHU_WEBHOOK_ENABLED !== "true") throw new Error("Feishu webhook must be explicitly enabled");
  let url;
  try { url = new URL(values.FEISHU_WEBHOOK_URL); } catch { throw new Error("Feishu webhook URL is missing or invalid"); }
  if (url.protocol !== "https:" || !approvedHosts.has(url.hostname)
    || !/^\/open-apis\/bot\/v2\/hook\/[A-Za-z0-9-]+$/.test(url.pathname)
    || url.search || url.hash) throw new Error("Feishu webhook URL is outside the approved custom-bot endpoint");
  const secret = values.FEISHU_WEBHOOK_SIGNING_SECRET?.trim();
  if (!secret || /PLACEHOLDER|YOUR-|CHANGE-ME/i.test(secret)) throw new Error("Feishu signing secret is missing");
  const timeoutMs = Number(values.FEISHU_TIMEOUT_MS ?? "5000");
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 10000) throw new Error("Feishu timeout must be between 1000 and 10000 milliseconds");
  return { webhookHost: url.hostname, signingEnabled: true, timeoutMs };
}

export function validateEmailEnvironment(values) {
  if (values.TRANSACTIONAL_EMAIL_ENABLED !== "true") throw new Error("Transactional email must be explicitly enabled");
  if (values.SMTP_HOST !== "smtp.zeptomail.com") throw new Error("Only the approved ZeptoMail SMTP host is allowed");
  const port = Number(values.SMTP_PORT ?? "587");
  if (port !== 465 && port !== 587) throw new Error("ZeptoMail SMTP port must be 465 or 587");
  const username = values.SMTP_USERNAME?.trim();
  const password = values.SMTP_PASSWORD?.trim();
  if (!username || !password || /PLACEHOLDER|YOUR-|CHANGE-ME/i.test(`${username}:${password}`)) {
    throw new Error("ZeptoMail SMTP credentials are missing");
  }
  const testEmail = values.NOTIFICATION_TEST_EMAIL?.trim().toLowerCase();
  if (!testEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail)) throw new Error("Notification test recipient is missing or invalid");
  return {
    smtpHost: values.SMTP_HOST,
    port,
    tlsMode: port === 465 ? "implicit_tls" : "starttls",
    testRecipientDomain: testEmail.slice(testEmail.lastIndexOf("@") + 1),
  };
}

function readLocalValues() {
  const file = path.resolve(localFileName);
  if (!fs.existsSync(file)) throw new Error(`Create the ignored ${localFileName} file first`);
  if ((fs.statSync(file).mode & 0o077) !== 0) throw new Error(`${localFileName} must have owner-only permissions (chmod 600)`);
  return parseEnv(fs.readFileSync(file, "utf8"));
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "--help") {
    console.log("node scripts/with-notifications.mjs config|feishu-test|email-config|email-test\nLoads only the ignored .env.notifications.local file. Config commands never send messages.");
    return;
  }
  if (!["config", "feishu-test", "email-config", "email-test"].includes(command) || args.length) throw new Error("Use config, feishu-test, email-config or email-test");
  const values = readLocalValues();
  const result = command.startsWith("email-") ? validateEmailEnvironment(values) : validateFeishuEnvironment(values);
  if (command === "config") {
    console.log(JSON.stringify({ ...result, readyToSendTest: true, messageSent: false }));
    return;
  }
  if (command === "email-config") {
    console.log(JSON.stringify({ ...result, readyToSendTest: true, emailSent: false }));
    return;
  }
  const env = { ...process.env };
  const notificationKeys = [
    "FEISHU_WEBHOOK_ENABLED", "FEISHU_WEBHOOK_URL", "FEISHU_WEBHOOK_SIGNING_SECRET", "FEISHU_TIMEOUT_MS",
    "TRANSACTIONAL_EMAIL_ENABLED", "SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD", "NOTIFICATION_TEST_EMAIL",
  ];
  for (const key of notificationKeys) delete env[key];
  const keys = command === "feishu-test" ? notificationKeys.slice(0, 4) : notificationKeys.slice(4);
  for (const key of keys) {
    if (values[key] !== undefined) env[key] = values[key];
  }
  const script = command === "feishu-test" ? "scripts/feishu-notification-smoke.ts" : "scripts/email-notification-smoke.ts";
  const child = spawn(process.execPath, ["--import", "tsx", script], { stdio: "inherit", env });
  child.on("error", () => { console.error("Could not start the notification test"); process.exitCode = 1; });
  child.on("exit", (code, signal) => { process.exitCode = signal ? 1 : code ?? 1; });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
