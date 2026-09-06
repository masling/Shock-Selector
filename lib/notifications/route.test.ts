import assert from "node:assert/strict";
import test from "node:test";
import { GET, POST } from "@/app/api/internal/notifications/route";

test("notification endpoint rejects missing and wrong bearer tokens", async () => {
  const previous = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "test-secret";
  try {
    const missing = await POST(new Request("https://www.vibroabsorber.com/api/internal/notifications", { method: "POST" }));
    assert.equal(missing.status, 401);

    const wrong = await POST(new Request("https://www.vibroabsorber.com/api/internal/notifications", {
      method: "POST",
      headers: { Authorization: "Bearer wrong" },
    }));
    assert.equal(wrong.status, 401);
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});

test("notification endpoint is disabled without cron secret", async () => {
  const previous = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  try {
    const response = await POST(new Request("https://www.vibroabsorber.com/api/internal/notifications", { method: "POST" }));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { status: "disabled" });
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});

test("notification endpoint accepts correct bearer but remains worker-disabled by default", async () => {
  const previousCron = process.env.CRON_SECRET;
  const previousWorker = process.env.NOTIFICATION_WORKER_ENABLED;
  process.env.CRON_SECRET = "test-secret";
  process.env.NOTIFICATION_WORKER_ENABLED = "false";
  try {
    const response = await POST(new Request("https://www.vibroabsorber.com/api/internal/notifications", {
      method: "POST",
      headers: { Authorization: "Bearer test-secret" },
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "disabled", reason: "worker_disabled", claimed: 0, finished: 0 });
  } finally {
    if (previousCron === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousCron;
    if (previousWorker === undefined) delete process.env.NOTIFICATION_WORKER_ENABLED;
    else process.env.NOTIFICATION_WORKER_ENABLED = previousWorker;
  }
});

test("Vercel cron GET uses the same bearer protection", async () => {
  const previous = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "test-only-cron-secret";
  try {
    const denied = await GET(new Request("https://www.vibroabsorber.com/api/internal/notifications"));
    assert.equal(denied.status, 401);
    const accepted = await GET(new Request("https://www.vibroabsorber.com/api/internal/notifications", {
      headers: { authorization: "Bearer test-only-cron-secret" },
    }));
    assert.equal(accepted.status, 200);
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});
