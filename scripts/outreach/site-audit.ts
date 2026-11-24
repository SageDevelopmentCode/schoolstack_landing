/**
 * Crawl a prospect school's website and write a Markdown audit for the school-outreach-research skill.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/site-audit.ts https://example-school.org [--slug demo-slug] [--render] [--max 60]
 *
 * - Respects robots.txt (`User-agent: *`), reads sitemap.xml (and sitemap indexes), then follows same-site links.
 * - About one request per second (or the robots.txt Crawl-delay if longer), 15s timeout, User-Agent MudKitchenSiteAudit/1.0.
 * - HTML only: PDFs and other files are recorded from links, never downloaded. Nothing is submitted.
 * - `--render` loads pages in headless Chromium (Playwright) for JavaScript-heavy Wix/Squarespace sites.
 * - Page content is parsed as text data only (src/lib/outreach/site-audit.ts); it is never evaluated in Node.
 *
 * Writes .site-audits/<slug or hostname>.md (git-ignored) and prints a short summary.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  analyzePage,
  classifyFileUrl,
  computeGaps,
  crawlKey,
  crawlPriority,
  isAllowedByRobots,
  isAssetUrl,
  isSameSite,
  parseRobotsTxt,
  parseSitemap,
  renderReport,
  shouldSkipPage,
  summarizeFamilyTools,
  type GapKind,
  type PageResult,
  type RobotsRules,
  type SiteAudit,
} from "@/lib/outreach/site-audit";

const USER_AGENT = "MudKitchenSiteAudit/1.0";
const TIMEOUT_MS = 15_000;
const MIN_GAP_MS = 1_000;
const MAX_SITEMAP_FETCHES = 10;
const MAX_SITEMAP_URLS = 2_000;

interface Options {
  start: URL;
  slug?: string;
  render: boolean;
  max: number;
}

function usage(message?: string): never {
  if (message) console.error(message);
  console.error(
    "Usage: npx tsx --tsconfig tsconfig.json scripts/outreach/site-audit.ts <https://site> [--slug <demo-slug>] [--render] [--max 60]",
  );
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let url: string | undefined;
  let slug: string | undefined;
  let render = false;
  let max = 60;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--render") render = true;
    else if (arg === "--slug") slug = argv[++i];
    else if (arg === "--max") max = Number(argv[++i]);
    else if (arg.startsWith("--")) usage(`Unknown option ${arg}`);
    else url = arg;
  }
  if (!url || !/^https?:\/\//i.test(url)) usage("Pass the school's site URL (https://...).");
  if (slug !== undefined && !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) usage("--slug must be letters, numbers and dashes.");
  if (!Number.isInteger(max) || max < 1 || max > 500) usage("--max must be a whole number from 1 to 500.");
  return { start: new URL(url), slug, render, max };
}

function sleep(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

/** Spaces request starts at least `gapMs` apart. */
class Throttle {
  private nextAt = 0;
  constructor(public gapMs: number) {}
  async wait(): Promise<void> {
    const now = Date.now();
    const at = Math.max(now, this.nextAt);
    this.nextAt = at + this.gapMs;
    if (at > now) await sleep(at - now);
  }
}

interface Fetched {
  status: number;
  finalUrl: string;
  contentType: string;
  headers?: Record<string, string>;
  body?: string;
  error?: string;
}

const isHtmlType = (type: string) => /text\/html|application\/xhtml/i.test(type);
const isTextType = (type: string) => !type || /text\/|xml/i.test(type);

async function fetchResource(url: string, throttle: Throttle, wantBody: (type: string) => boolean): Promise<Fetched> {
  await throttle.wait();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8" },
    });
    const contentType = res.headers.get("content-type") ?? "";
    const headers = Object.fromEntries(res.headers.entries());
    if (!wantBody(contentType)) {
      await res.body?.cancel().catch(() => undefined);
      return { status: res.status, finalUrl: res.url || url, contentType, headers };
    }
    return { status: res.status, finalUrl: res.url || url, contentType, headers, body: await res.text() };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return { status: 0, finalUrl: url, contentType: "", error: aborted ? "timed out after 15s" : String((error as Error)?.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

interface PageLoader {
  load(url: string): Promise<Fetched>;
  close(): Promise<void>;
}

function fetchLoader(throttle: Throttle): PageLoader {
  return {
    load: (url) => fetchResource(url, throttle, isHtmlType),
    close: async () => undefined,
  };
}

async function chromiumLoader(throttle: Throttle): Promise<PageLoader> {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT, acceptDownloads: false, serviceWorkers: "block" });
  // Skip heavy assets; we only need the rendered DOM.
  await context.route("**/*", (route) =>
    ["image", "media", "font"].includes(route.request().resourceType()) ? route.abort() : route.continue(),
  );
  return {
    async load(url) {
      await throttle.wait();
      const page = await context.newPage();
      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
        await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
        const headers = response?.headers() ?? {};
        const contentType = headers["content-type"] ?? "text/html";
        const status = response?.status() ?? 0;
        if (!isHtmlType(contentType)) return { status, finalUrl: page.url(), contentType, headers };
        return { status, finalUrl: page.url(), contentType, headers, body: await page.content() };
      } catch (error) {
        return { status: 0, finalUrl: url, contentType: "", error: String((error as Error)?.message ?? error).split("\n")[0] };
      } finally {
        await page.close().catch(() => undefined);
      }
    },
    async close() {
      await browser.close();
    },
  };
}

interface QueueItem {
  url: string;
  priority: number;
  order: number;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const siteOrigin = options.start.origin;
  const label = options.slug ?? options.start.hostname.replace(/^www\./, "");
  const today = new Date();
  const throttle = new Throttle(MIN_GAP_MS);

  console.log(`Auditing ${options.start.href} (max ${options.max} pages${options.render ? ", rendered" : ""})...`);

  // robots.txt
  let robots: RobotsRules = { allow: [], disallow: [], sitemaps: [] };
  let robotsFound = false;
  const robotsRes = await fetchResource(`${siteOrigin}/robots.txt`, throttle, isTextType);
  if (robotsRes.status === 200 && robotsRes.body && !isHtmlType(robotsRes.contentType)) {
    robots = parseRobotsTxt(robotsRes.body);
    robotsFound = true;
    if (robots.crawlDelaySeconds) throttle.gapMs = Math.max(MIN_GAP_MS, Math.min(10, robots.crawlDelaySeconds) * 1000);
  }

  // Crawl state
  const queue = new Map<string, QueueItem>();
  const visited = new Set<string>();
  const linkedFrom = new Map<string, string[]>();
  const robotsBlocked: string[] = [];
  let order = 0;

  const discover = (href: string, from?: string) => {
    let url: URL;
    try {
      url = new URL(href, siteOrigin);
    } catch {
      return;
    }
    if (!isSameSite(url, siteOrigin) || shouldSkipPage(url) || isAssetUrl(url) || classifyFileUrl(url)) return;
    const key = crawlKey(url, siteOrigin);
    if (from) {
      const refs = linkedFrom.get(key) ?? [];
      if (!refs.includes(from) && refs.length < 10) refs.push(from);
      linkedFrom.set(key, refs);
    }
    if (visited.has(key) || queue.has(key) || robotsBlocked.includes(key)) return;
    if (!isAllowedByRobots(`${url.pathname}${url.search}`, robots)) {
      robotsBlocked.push(key);
      return;
    }
    const fetchUrl = new URL(`${url.pathname}${url.search}`, siteOrigin).href;
    queue.set(key, { url: fetchUrl, priority: crawlPriority(url), order: order++ });
  };

  discover(options.start.href);

  // Sitemaps
  const sitemapSources: string[] = [];
  let sitemapUrlCount = 0;
  const sitemapQueue = robots.sitemaps.length ? [...robots.sitemaps] : [`${siteOrigin}/sitemap.xml`, `${siteOrigin}/sitemap_index.xml`];
  const seenSitemaps = new Set<string>();
  let sitemapFetches = 0;
  while (sitemapQueue.length && sitemapFetches < MAX_SITEMAP_FETCHES && sitemapUrlCount < MAX_SITEMAP_URLS) {
    const sm = sitemapQueue.shift() as string;
    let smUrl: URL;
    try {
      smUrl = new URL(sm, siteOrigin);
    } catch {
      continue;
    }
    if (seenSitemaps.has(smUrl.href) || !isSameSite(smUrl, siteOrigin) || /\.gz$/i.test(smUrl.pathname)) continue;
    seenSitemaps.add(smUrl.href);
    sitemapFetches++;
    const res = await fetchResource(smUrl.href, throttle, isTextType);
    if (res.status !== 200 || !res.body || !/<(urlset|sitemapindex)\b/i.test(res.body)) continue;
    const parsed = parseSitemap(res.body);
    sitemapSources.push(new URL(res.finalUrl).pathname);
    sitemapQueue.push(...parsed.sitemaps);
    for (const pageUrl of parsed.urls.slice(0, MAX_SITEMAP_URLS - sitemapUrlCount)) {
      sitemapUrlCount++;
      discover(pageUrl);
    }
    // sitemap_index.xml is only a fallback when sitemap.xml is missing.
    if (!robots.sitemaps.length && smUrl.pathname === "/sitemap.xml") {
      const idx = sitemapQueue.indexOf(`${siteOrigin}/sitemap_index.xml`);
      if (idx >= 0) sitemapQueue.splice(idx, 1);
    }
  }

  // Pages
  const loader = options.render ? await chromiumLoader(throttle) : fetchLoader(throttle);
  const pages: PageResult[] = [];
  let attempts = 0;
  try {
    while (queue.size > 0 && pages.length < options.max && attempts < options.max * 2 + 20) {
      const [key, item] = Array.from(queue.entries()).sort(
        (a, b) => b[1].priority - a[1].priority || a[1].order - b[1].order,
      )[0];
      queue.delete(key);
      visited.add(key);
      attempts++;

      const res = await loader.load(item.url);
      const final = new URL(res.finalUrl);
      const finalKey = isSameSite(final, siteOrigin) ? crawlKey(final, siteOrigin) : null;
      if (finalKey && finalKey !== key) {
        if (visited.has(finalKey)) continue; // redirect to a page we already have
        visited.add(finalKey);
        queue.delete(finalKey);
      }

      const result: PageResult = {
        url: item.url,
        finalUrl: res.finalUrl,
        status: res.status,
        linkedFrom: linkedFrom.get(key) ?? [],
      };
      if (res.error) result.error = res.error;
      if (!finalKey && res.status > 0) result.offSiteRedirect = final.hostname;
      else if (res.status > 0 && !isHtmlType(res.contentType)) result.nonHtmlType = res.contentType.split(";")[0] || "unknown";
      else if (res.body && res.status < 400) {
        result.facts = analyzePage(res.body, res.finalUrl, siteOrigin, today, res.headers);
        for (const link of result.facts.internalLinks) discover(link, item.url);
      }
      pages.push(result);
      const words = result.facts ? `${result.facts.wordCount} words` : result.error ?? result.nonHtmlType ?? "";
      console.log(`  [${pages.length}/${options.max}] ${res.status || "ERR"} ${item.url} ${words}`);
    }
  } finally {
    await loader.close();
  }

  // Broken-link evidence: referrers recorded after the page was fetched.
  for (const p of pages) {
    const refs = linkedFrom.get(crawlKey(new URL(p.url), siteOrigin));
    if (refs) p.linkedFrom = refs;
  }

  const audit: SiteAudit = {
    startUrl: options.start.href,
    siteOrigin,
    label,
    generatedOn: today.toISOString().slice(0, 10),
    rendered: options.render,
    maxPages: options.max,
    robots: { found: robotsFound, disallow: robots.disallow },
    sitemap: { found: sitemapSources.length > 0, urlCount: sitemapUrlCount, sources: sitemapSources },
    pages,
    notCrawled: Array.from(queue.values())
      .sort((a, b) => b.priority - a.priority || a.order - b.order)
      .map((q) => q.url),
    robotsBlocked,
  };

  const outDir = resolve(process.cwd(), ".site-audits");
  await mkdir(outDir, { recursive: true });
  const outPath = resolve(outDir, `${label}.md`);
  await writeFile(outPath, renderReport(audit), "utf8");

  // Console summary
  const analysed = pages.filter((p) => p.facts);
  const statusCounts = new Map<string, number>();
  for (const p of pages) statusCounts.set(String(p.status || "failed"), (statusCounts.get(String(p.status || "failed")) ?? 0) + 1);
  const platforms = Array.from(new Set(analysed.flatMap((p) => p.facts?.platforms ?? [])));
  const tools = Array.from(new Set(analysed.flatMap((p) => p.facts?.tools.map((t) => t.name) ?? [])));
  const funding = Array.from(new Set(analysed.flatMap((p) => p.facts?.funding.map((f) => f.term) ?? [])));
  const files = new Set(analysed.flatMap((p) => p.facts?.files.map((f) => f.url) ?? []));
  const gapCounts = new Map<GapKind, number>();
  for (const g of computeGaps(pages, siteOrigin)) gapCounts.set(g.kind, (gapCounts.get(g.kind) ?? 0) + 1);

  console.log("");
  console.log(`Pages: ${pages.length} (${Array.from(statusCounts.entries()).map(([k, v]) => `${k}: ${v}`).join(", ")})${audit.notCrawled.length ? `, ${audit.notCrawled.length} more found but not crawled` : ""}`);
  console.log(`Platform: ${platforms.join(", ") || "not detected"}`);
  console.log(`Tools: ${tools.join(", ") || "none detected"}`);
  console.log(`Funding mentions: ${funding.join(", ") || "none"}`);
  console.log(`PDFs/flipbooks/files: ${files.size}`);
  console.log(summarizeFamilyTools(pages).line);
  console.log(`Gap flags: ${Array.from(gapCounts.entries()).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}`);
  console.log(`Report: ${outPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
