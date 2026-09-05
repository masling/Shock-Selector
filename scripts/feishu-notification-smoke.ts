import { sendFeishuText } from "@/lib/notifications/feishu";

async function main() {
  const result = await sendFeishuText("TEST ONLY — EKD inquiry notification integration test. No customer data.");

  if (result.status !== "accepted") {
    console.error(JSON.stringify({ delivered: false, status: result.status, code: result.code }));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ delivered: true, channel: "feishu", containsCustomerData: false }));
  }
}

void main();
