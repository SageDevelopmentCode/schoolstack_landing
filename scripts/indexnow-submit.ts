/**
 * Tell Bing (and other IndexNow engines) that pages changed, so they're recrawled within hours
 * instead of weeks. Bing's index feeds ChatGPT search and Copilot.
 *
 *   INDEXNOW_KEY=<key> npx tsx scripts/indexnow-submit.ts            # every URL in the live sitemap
 *   INDEXNOW_KEY=<key> npx tsx scripts/indexnow-submit.ts /blog/foo  # just these paths
 *
 * The same INDEXNOW_KEY must be set on the deployed site, which serves it at /indexnow-key.txt.
 */
import { PRODUCTION_SITE_URL } from "../src/lib/site";

const ENDPOINT = "https://api.indexnow.org/indexnow";

async function sitemapUrls(site: string): Promise<string[]> {
  const res = await fetch(`${site}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) throw new Error("Set INDEXNOW_KEY (the same value as on the deployed site).");
  const site = (process.env.INDEXNOW_SITE_URL ?? PRODUCTION_SITE_URL).replace(/\/$/, "");
  const keyLocation = `${site}/indexnow-key.txt`;

  const served = await fetch(keyLocation).then((r) => (r.ok ? r.text() : ""));
  if (served.trim() !== key) throw new Error(`${keyLocation} doesn't serve this key yet. Deploy with INDEXNOW_KEY set first.`);

  const paths = process.argv.slice(2);
  const urlList = paths.length ? paths.map((p) => `${site}${p.startsWith("/") ? p : `/${p}`}`) : await sitemapUrls(site);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(site).host, key, keyLocation, urlList }),
  });
  // 200 = accepted, 202 = accepted pending key validation.
  if (res.status !== 200 && res.status !== 202) throw new Error(`IndexNow returned ${res.status}: ${await res.text()}`);
  console.log(`Submitted ${urlList.length} URL(s) to IndexNow (${res.status}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
