/**
 * Mobile PageSpeed score for a school's website, to paste into an outreach plan's `snapshot.pageSpeed`.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/snapshot-pagespeed.ts https://example-school.org
 *
 * Needs PAGESPEED_API_KEY in .env.local. Read-only: it only calls Google PageSpeed Insights.
 */

import { resolve } from "node:path";
import { config } from "dotenv";
import { runPageSpeedInsights } from "@/lib/performance/psi-client";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.argv[2];
  if (!url || !/^https:\/\//.test(url)) {
    console.error("Pass the school's https:// URL, e.g. scripts/outreach/snapshot-pagespeed.ts https://example.org");
    process.exit(1);
  }
  const { metrics } = await runPageSpeedInsights(url, "mobile");
  if (metrics.performanceScore === null) {
    console.error("PageSpeed returned no performance score; leave pageSpeed out of the snapshot.");
    process.exit(1);
  }
  const checkedOn = new Date().toISOString().slice(0, 10);
  console.log(JSON.stringify({ mobileScore: metrics.performanceScore, url, checkedOn }, null, 2));
  console.log(`\nLCP ${metrics.lcpMs ?? "?"}ms · total weight ${metrics.totalByteWeight ?? "?"} bytes`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
