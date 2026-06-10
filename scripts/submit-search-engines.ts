import { readFile } from "node:fs/promises";
import path from "node:path";
import sitemap from "../app/sitemap";
import { getSiteUrl } from "../lib/seo";

const indexNowEndpoint = "https://api.indexnow.org/indexnow";

async function readIndexNowKey() {
  return (await readFile(path.join(process.cwd(), "public/indexnow-key.txt"), "utf8")).trim();
}

async function main() {
  const key = await readIndexNowKey();
  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);
  const siteUrl = new URL(getSiteUrl());
  const keyLocation = new URL("/indexnow-key.txt", siteUrl).toString();

  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: siteUrl.host,
      key,
      keyLocation,
      urlList: urls,
    }),
  });

  if (!response.ok) {
    throw new Error(`IndexNow submission failed: ${response.status} ${await response.text()}`);
  }

  console.log(`Submitted ${urls.length} URLs to IndexNow for ${siteUrl.host}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
