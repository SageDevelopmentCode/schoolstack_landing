/**
 * Pure helpers for the prospect-school website audit (CLI: scripts/outreach/site-audit.ts).
 *
 * Regex and string parsing only: no DOM, no network, and page content is never evaluated.
 * Everything here takes HTML/text as data and returns plain objects, so it can be unit tested
 * with small fixture strings.
 */

import { SNAPSHOT_AREA_LABEL, type SnapshotArea } from "@/data/outreach/types";
import {
  TOOL_REPLACEMENTS,
  capabilityLabel,
  needsCustomWork,
  type ToolReplacement,
} from "@/lib/outreach/tool-replacements";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToolCategory =
  | "form"
  | "payment"
  | "school-software"
  | "scheduling"
  | "calendar"
  | "newsletter"
  | "e-signature"
  | "messaging";

export interface ToolHit {
  category: ToolCategory;
  name: string;
  /** Set when the tool account belongs to a microschool network (e.g. "KaiPod"), not the school itself. */
  network?: string;
}

export type FileKind = "pdf" | "flipbook" | "file";

export interface FileLink {
  url: string;
  kind: FileKind;
  /** e.g. "Issuu", "Google Drive", or the file extension ("docx"). */
  provider: string;
  /** Anchor text, or "(embedded)" for iframes/embeds. */
  text: string;
}

export type FormKind = "search" | "password" | "newsletter" | "general";

export interface FormInfo {
  kind: FormKind;
  /** Host the form posts to, "same page" when it has no action. */
  actionHost: string;
  fieldCount: number;
}

export interface FundingMention {
  term: string;
  snippet: string;
}

export interface DatedPhrase {
  phrase: string;
  /** Why it's stale, e.g. "school year 2024-25 (current is 2026-27)". */
  reason: string;
}

export interface ExternalApplyLink {
  url: string;
  text: string;
}

export interface PageFacts {
  title: string;
  wordCount: number;
  text: string;
  /** Same-site page links (absolute, hash removed). */
  internalLinks: string[];
  files: FileLink[];
  mailto: string[];
  tel: string[];
  passwordProtected: boolean;
  /** Website-builder sample product name when this page is one (template/demo store left public). */
  templateProduct: string | null;
  forms: FormInfo[];
  iframeHosts: string[];
  scriptHosts: string[];
  hasViewport: boolean;
  platforms: string[];
  tools: ToolHit[];
  funding: FundingMention[];
  staleYears: DatedPhrase[];
  pastDates: DatedPhrase[];
  /** http:// links to the school's own site. */
  httpSelfLinks: string[];
  hasDollarAmounts: boolean;
  externalApplyLinks: ExternalApplyLink[];
}

export interface PageResult {
  url: string;
  finalUrl: string;
  /** HTTP status, or 0 when the request failed. */
  status: number;
  error?: string;
  /** Pages that linked here (for broken-link evidence). */
  linkedFrom: string[];
  /** Present when the page returned HTML that was analysed. */
  facts?: PageFacts;
  /** Set when the URL turned out not to be HTML (content-type). */
  nonHtmlType?: string;
  /** Set when the page redirected to another site. */
  offSiteRedirect?: string;
}

export type GapKind =
  | "stale-school-year"
  | "past-date"
  | "broken-link"
  | "prices-in-files"
  | "no-online-application"
  | "missing-viewport"
  | "http-self-link"
  | "template-product";

export interface GapFlag {
  kind: GapKind;
  url: string;
  message: string;
}

// ---------------------------------------------------------------------------
// HTML primitives
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  copy: "©",
  reg: "®",
  trade: "™",
  bull: "•",
  middot: "·",
};

export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return whole;
      return String.fromCodePoint(code);
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? whole;
  });
}

/** Parse the attribute part of a start tag (`<a href="x" class=y>` → { href: "x", class: "y" }). */
export function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const inner = tag.replace(/^<\s*[a-z0-9-]+/i, "").replace(/\/?>$/, "");
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner))) {
    const name = m[1].toLowerCase();
    if (name in attrs) continue;
    attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

function startTags(html: string, tagName: string): Record<string, string>[] {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  return (html.match(re) ?? []).map(parseAttributes);
}

function stripNonContent(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg|head)\b[\s\S]*?<\/\1\s*>/gi, " ");
}

/** Visible text of a page, whitespace-collapsed. */
export function visibleText(html: string): string {
  const body = stripNonContent(html)
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/td|\/th|\/section|\/article|\/header|\/footer)\b[^>]*>/gi, " \n ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(body).replace(/\s+/g, " ").trim();
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

export function extractTitle(html: string): string {
  const m = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (m) {
    const title = decodeEntities(m[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    if (title) return title;
  }
  for (const meta of startTags(html, "meta")) {
    if ((meta.property ?? meta.name ?? "").toLowerCase() === "og:title" && meta.content) return meta.content.trim();
  }
  return "";
}

export function hasViewportMeta(html: string): boolean {
  return startTags(html, "meta").some((m) => (m.name ?? "").toLowerCase() === "viewport");
}

const PASSWORD_NOTICE = /this (content|page|post) is password[- ]protected|enter (the |a )?password (below )?to (view|see|access)/i;
const PASSWORD_PAGE_MAX_WORDS = 150;

/**
 * True only when the password gate is the page's main content: WordPress's per-post password form
 * (`post-password-form` on a <form>, or `post-password-required` on <body>), Squarespace's lock screen,
 * or a password notice in the visible text of an otherwise short page. Site-wide member-login widgets
 * and builder config JSON (e.g. "Please enter the password to access the page" inside an attribute)
 * don't count.
 */
export function isPasswordProtected(html: string, text = visibleText(html)): boolean {
  if (/<form\b[^>]*class=["'][^"']*\bpost-password-form\b/i.test(html)) return true;
  if (/<body\b[^>]*class=["'][^"']*\bpost-password-required\b/i.test(html)) return true;
  if (/data-slide-type=["']?lock-screen/i.test(html)) return true;
  return PASSWORD_NOTICE.test(text) && countWords(text) <= PASSWORD_PAGE_MAX_WORDS;
}

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export function resolveUrl(href: string, base: string): URL | null {
  const trimmed = href.trim();
  if (!trimmed || /^(javascript|data|about|blob):/i.test(trimmed)) return null;
  try {
    return new URL(trimmed, base);
  } catch {
    return null;
  }
}

export function siteKey(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/** Same school site: same hostname ignoring a leading "www.", http or https. */
export function isSameSite(url: URL, siteOrigin: string): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  return siteKey(url.hostname) === siteKey(new URL(siteOrigin).hostname);
}

const TRACKING_PARAM = /^(utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|_ga)$/i;

/** De-duplication key for a crawlable page: seed origin + path (no trailing slash) + query. */
export function crawlKey(url: URL, siteOrigin: string): string {
  const origin = new URL(siteOrigin).origin;
  const params = new URLSearchParams(url.search);
  for (const key of Array.from(params.keys())) if (TRACKING_PARAM.test(key)) params.delete(key);
  const query = params.toString();
  let path = url.pathname.replace(/\/{2,}/g, "/");
  path = path.replace(/\/index\.(html?|php)$/i, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return `${origin}${path}${query ? `?${query}` : ""}`;
}

const SKIP_PATH = /\/(wp-admin|wp-login\.php|wp-json|xmlrpc\.php|feed|cart|checkout|my-account|account|login|signin|sign-in|logout|cdn-cgi)(\/|$)/i;
const SKIP_QUERY = /(^|[?&])(add-to-cart|replytocom|share|format|action|s)=/i;

/** Pages the crawler should never request (admin, feeds, carts, search results...). */
export function shouldSkipPage(url: URL): boolean {
  return SKIP_PATH.test(url.pathname) || SKIP_QUERY.test(url.search);
}

const PRIORITY_WORDS: Array<[RegExp, number]> = [
  [/admission|enrol|apply|application|tuition|pricing|price|fees|cost/i, 100],
  [/tour|visit|open-?house|schedule-?a/i, 90],
  [/program|calendar|handbook|faq|parent|famil|forms?\b|pay|payment|scholarship|financial|esa|tefa/i, 70],
  [/about|contact|staff|team|curriculum|philosophy|day|schedule|summer|camp|news|events?/i, 50],
  [/blog|tag|category|author|archives?|previous|page\/\d+|\d{4}\/\d{2}/i, -40],
];

/** Higher = crawl sooner. Keeps the 60-page budget on the pages a family actually needs. */
export function crawlPriority(url: URL): number {
  const path = decodeURIComponent(url.pathname).toLowerCase();
  if (path === "/" || path === "") return 1000;
  let score = 0;
  for (const [re, weight] of PRIORITY_WORDS) if (re.test(path)) score += weight;
  const depth = path.split("/").filter(Boolean).length;
  return score - depth * 5 - (url.search ? 20 : 0);
}

// ---------------------------------------------------------------------------
// robots.txt and sitemaps
// ---------------------------------------------------------------------------

export interface RobotsRules {
  allow: string[];
  disallow: string[];
  sitemaps: string[];
  crawlDelaySeconds?: number;
}

/** Rules for `User-agent: *` (or our own agent token, which wins when present). */
export function parseRobotsTxt(text: string, agentToken = "mudkitchensiteaudit"): RobotsRules {
  type Group = { agents: string[]; allow: string[]; disallow: string[]; delay?: number };
  const groups: Group[] = [];
  const sitemaps: string[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }
    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (field === "allow" && value) current.allow.push(value);
    else if (field === "disallow" && value) current.disallow.push(value);
    else if (field === "crawl-delay") {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) current.delay = n;
    }
  }
  const own = groups.filter((g) => g.agents.some((a) => a !== "*" && agentToken.includes(a)));
  const chosen = own.length > 0 ? own : groups.filter((g) => g.agents.includes("*"));
  return {
    allow: chosen.flatMap((g) => g.allow),
    disallow: chosen.flatMap((g) => g.disallow),
    sitemaps,
    crawlDelaySeconds: chosen.map((g) => g.delay).find((d) => d !== undefined),
  };
}

function robotsPatternLength(pattern: string, path: string): number {
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const source = body
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  const re = new RegExp(`^${source}${anchored ? "$" : ""}`);
  return re.test(path) ? pattern.length : -1;
}

/** Longest matching rule wins; ties go to Allow (Google's interpretation). */
export function isAllowedByRobots(pathAndQuery: string, rules: RobotsRules): boolean {
  let best = -1;
  let allowed = true;
  for (const p of rules.disallow) {
    const len = robotsPatternLength(p, pathAndQuery);
    if (len > best) {
      best = len;
      allowed = false;
    }
  }
  for (const p of rules.allow) {
    const len = robotsPatternLength(p, pathAndQuery);
    if (len >= best && len >= 0) {
      best = len;
      allowed = true;
    }
  }
  return allowed;
}

export interface SitemapParse {
  /** Child sitemaps (from a sitemap index). */
  sitemaps: string[];
  /** Page URLs (from a urlset). */
  urls: string[];
}

export function parseSitemap(xml: string): SitemapParse {
  const locs = (xml.match(/<loc\b[^>]*>[\s\S]*?<\/loc>/gi) ?? []).map((tag) =>
    decodeEntities(
      tag
        .replace(/^<loc\b[^>]*>/i, "")
        .replace(/<\/loc>$/i, "")
        .replace(/^\s*<!\[CDATA\[/, "")
        .replace(/\]\]>\s*$/, ""),
    ).trim(),
  );
  const filtered = locs.filter(Boolean);
  return /<sitemapindex\b/i.test(xml) ? { sitemaps: filtered, urls: [] } : { sitemaps: [], urls: filtered };
}

// ---------------------------------------------------------------------------
// Links and files
// ---------------------------------------------------------------------------

const FLIPBOOK_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)issuu\.com$/i, "Issuu"],
  [/(^|\.)fliphtml5\.com$/i, "FlipHTML5"],
  [/(^|\.)canva\.(com|site)$/i, "Canva"],
  [/^drive\.google\.com$/i, "Google Drive"],
];

const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|rtf|odt|ods|odp|zip|csv|ics|mp3|mp4|mov|m4a|epub|pages|key|numbers)$/i;
const ASSET_EXT = /\.(jpe?g|png|gif|webp|svg|heic|avif|bmp|tiff?|ico|css|js|json|xml|woff2?|ttf|eot|webm)$/i;

/** Classify a link target as a file/flipbook, or null for an ordinary page. */
export function classifyFileUrl(url: URL): { kind: FileKind; provider: string } | null {
  const host = url.hostname.toLowerCase();
  if (host === "docs.google.com" && /^\/(document|presentation|spreadsheets|file)\//.test(url.pathname)) {
    return { kind: "flipbook", provider: "Google Drive" };
  }
  if (host === "canva.com" || host === "www.canva.com") {
    return /^\/design\//.test(url.pathname) ? { kind: "flipbook", provider: "Canva" } : null;
  }
  for (const [re, provider] of FLIPBOOK_HOSTS) if (re.test(host)) return { kind: "flipbook", provider };
  const ext = url.pathname.match(FILE_EXT);
  if (ext) {
    const e = ext[1].toLowerCase();
    return e === "pdf" ? { kind: "pdf", provider: "PDF" } : { kind: "file", provider: e };
  }
  return null;
}

export function isAssetUrl(url: URL): boolean {
  return ASSET_EXT.test(url.pathname);
}

function anchorText(inner: string): string {
  return decodeEntities(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 120);
}

const APPLY_WORDS = /\b(apply|application|enrol(l|ment|ling)?|register|registration|admissions? portal|waitlist)\b/i;
const SOCIAL_HOST = /(^|\.)(facebook|instagram|twitter|x|linkedin|youtube|tiktok|pinterest|google)\.com$/i;

interface LinkScan {
  internalLinks: string[];
  files: FileLink[];
  mailto: string[];
  tel: string[];
  httpSelfLinks: string[];
  externalApplyLinks: ExternalApplyLink[];
}

export function scanLinks(html: string, pageUrl: string, siteOrigin: string): LinkScan {
  const scan: LinkScan = { internalLinks: [], files: [], mailto: [], tel: [], httpSelfLinks: [], externalApplyLinks: [] };
  const seenFiles = new Set<string>();
  const addFile = (url: URL, text: string) => {
    const cls = classifyFileUrl(url);
    if (!cls) return false;
    url.hash = "";
    if (!seenFiles.has(url.href)) {
      seenFiles.add(url.href);
      scan.files.push({ url: url.href, kind: cls.kind, provider: cls.provider, text: text || "(no link text)" });
    }
    return true;
  };

  const cleaned = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, " ");
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(cleaned))) {
    const attrs = parseAttributes(`<a ${m[1]}>`);
    const href = (attrs.href ?? "").trim();
    if (!href) continue;
    const text = anchorText(m[2]) || attrs["aria-label"] || attrs.title || "";
    if (/^mailto:/i.test(href)) {
      const addr = decodeURIComponent(href.slice(7).split("?")[0]).trim().toLowerCase();
      if (addr && !scan.mailto.includes(addr)) scan.mailto.push(addr);
      continue;
    }
    if (/^tel:/i.test(href)) {
      const num = decodeURIComponent(href.slice(4)).trim();
      if (num && !scan.tel.includes(num)) scan.tel.push(num);
      continue;
    }
    const url = resolveUrl(href, pageUrl);
    if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) continue;
    const sameSite = isSameSite(url, siteOrigin);
    if (sameSite && /^http:\/\//i.test(href) && !scan.httpSelfLinks.includes(href)) scan.httpSelfLinks.push(href);
    if (addFile(new URL(url.href), text)) continue;
    if (sameSite) {
      if (isAssetUrl(url)) continue;
      url.hash = "";
      if (!scan.internalLinks.includes(url.href)) scan.internalLinks.push(url.href);
    } else if (!SOCIAL_HOST.test(url.hostname) && (APPLY_WORDS.test(text) || APPLY_WORDS.test(url.href))) {
      if (!scan.externalApplyLinks.some((l) => l.url === url.href)) scan.externalApplyLinks.push({ url: url.href, text });
    }
  }

  for (const tag of ["iframe", "embed", "object"]) {
    for (const attrs of startTags(cleaned, tag)) {
      const src = attrs.src ?? attrs.data ?? "";
      const url = src ? resolveUrl(src, pageUrl) : null;
      if (url) addFile(url, "(embedded)");
    }
  }
  return scan;
}

function hostsOf(html: string, tagName: string, pageUrl: string): string[] {
  const hosts: string[] = [];
  for (const attrs of startTags(html, tagName)) {
    const url = attrs.src ? resolveUrl(attrs.src, pageUrl) : null;
    if (url && /^https?:$/.test(url.protocol) && !hosts.includes(url.hostname)) hosts.push(url.hostname);
  }
  return hosts;
}

export function extractForms(html: string, pageUrl: string): FormInfo[] {
  const forms: FormInfo[] = [];
  const re = /<form\b([^>]*)>([\s\S]*?)<\/form\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = parseAttributes(`<form ${m[1]}>`);
    const inner = m[2];
    const inputs = (inner.match(/<input\b[^>]*>/gi) ?? []).map(parseAttributes);
    const visibleInputs = inputs.filter(
      (a) => !/^(hidden|submit|button|image|reset)$/i.test(a.type ?? "text"),
    ).length;
    const fieldCount =
      visibleInputs + (inner.match(/<select\b/gi) ?? []).length + (inner.match(/<textarea\b/gi) ?? []).length;
    let kind: FormKind = "general";
    if (/post-password-form/i.test(m[1]) || inputs.some((a) => (a.type ?? "").toLowerCase() === "password")) {
      kind = "password";
    } else if (
      (attrs.role ?? "").toLowerCase() === "search" ||
      inputs.some((a) => (a.type ?? "").toLowerCase() === "search" || /^(s|q|search|query)$/i.test(a.name ?? ""))
    ) {
      kind = "search";
    } else if (/subscribe|newsletter|mc-embedded|list-manage/i.test(m[0]) && fieldCount <= 3) {
      kind = "newsletter";
    }
    const action = (attrs.action ?? "").trim();
    const actionUrl = action ? resolveUrl(action, pageUrl) : null;
    forms.push({ kind, actionHost: actionUrl ? actionUrl.hostname : "same page", fieldCount });
  }
  return forms;
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

interface Signature {
  name: string;
  patterns: RegExp[];
}

const PLATFORM_SIGNATURES: Signature[] = [
  {
    name: "Wix",
    patterns: [
      /static\.wixstatic\.com/i,
      /parastorage\.com/i,
      /<meta[^>]+generator[^>]+Wix\.com/i,
      /wix-bolt|wix-thunderbolt|wixsite\.com/i,
      /_wixCssImports|wix-essential-viewer-model|wixBiSession/i,
    ],
  },
  {
    name: "Hostinger Website Builder",
    patterns: [/zyrosite\.com/i, /<meta[^>]+generator[^>]+(Hostinger|Zyro)/i],
  },
  { name: "Squarespace", patterns: [/squarespace(-cdn)?\.com/i, /<!-- This is Squarespace\. -->/i, /Static\.SQUARESPACE_CONTEXT/] },
  { name: "WordPress", patterns: [/\/wp-content\//i, /\/wp-includes\//i, /<meta[^>]+generator[^>]+WordPress/i] },
  { name: "WooCommerce", patterns: [/woocommerce/i] },
  { name: "Webflow", patterns: [/data-wf-(page|site)=/i, /website-files\.com/i, /<meta[^>]+generator[^>]+Webflow/i, /webflow\.js/i] },
  { name: "Google Sites", patterns: [/sites\.google\.com\/(view|site)\//i, /<meta[^>]+generator[^>]+Google Sites/i, /gstatic\.com\/atari\//i] },
  { name: "Shopify", patterns: [/cdn\.shopify\.com/i, /Shopify\.theme/] },
  { name: "Weebly", patterns: [/weebly\.com/i, /editmysite\.com/i] },
];

/** Response-header signatures (names lower-cased). */
const PLATFORM_HEADERS: Array<[string, (headers: Record<string, string>) => boolean]> = [
  ["Wix", (h) => Object.keys(h).some((k) => k.startsWith("x-wix-"))],
  ["Hostinger Website Builder", (h) => /hostinger|zyro/i.test(`${h["x-powered-by"] ?? ""} ${h.platform ?? ""}`)],
  ["Squarespace", (h) => /squarespace/i.test(h.server ?? "")],
  ["Shopify", (h) => "x-shopid" in h || "x-shopify-stage" in h],
  ["WordPress", (h) => /wp-json/i.test(h.link ?? "")],
];

export function detectPlatforms(html: string, headers: Record<string, string> = {}): string[] {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = v;
  const fromHeaders = new Set(PLATFORM_HEADERS.filter(([, test]) => test(lower)).map(([name]) => name));
  const names = [...PLATFORM_SIGNATURES.map((s) => s.name), ...PLATFORM_HEADERS.map(([name]) => name)];
  return Array.from(new Set(names)).filter(
    (name) => fromHeaders.has(name) || PLATFORM_SIGNATURES.some((s) => s.name === name && s.patterns.some((p) => p.test(html))),
  );
}

const SAMPLE_PRODUCT_TITLES = new Set([
  // Hostinger / Zyro store templates
  "classic cap",
  "face serum",
  "handmade vase",
  "hand soap",
  "set of plates",
  "sunglasses",
  "wooden chair",
  "wool sweater",
  // Wix, Squarespace, Shopify and generic placeholders
  "i'm a product",
  "i’m a product",
  "sample product",
  "example product",
  "example product title",
  "example t-shirt",
  "product name",
  "product title",
  "your product name",
]);
const SAMPLE_PRODUCT_TEXT = /I['’]m a product (detail|description)|I['’]m a great place to add more information about your product/i;

/** A website-builder sample store product still public (e.g. "Face Serum" on a school site), or null. */
export function detectTemplateProduct(title: string, text: string): string | null {
  const first = title.split(/\s+[|–—-]\s+/)[0].trim();
  if (SAMPLE_PRODUCT_TITLES.has(first.toLowerCase())) return first;
  const m = text.match(SAMPLE_PRODUCT_TEXT);
  return m ? m[0] : null;
}

const TOOL_SIGNATURES: Array<Signature & { category: ToolCategory }> = [
  // Forms
  { category: "form", name: "Google Forms", patterns: [/docs\.google\.com\/forms\//i, /forms\.gle\//i] },
  { category: "form", name: "Jotform", patterns: [/jotform\.(com|us|me)/i, /jotfor\.ms/i] },
  { category: "form", name: "Typeform", patterns: [/typeform\.com/i] },
  { category: "form", name: "Cognito Forms", patterns: [/cognitoforms\.com/i] },
  { category: "form", name: "Wufoo", patterns: [/wufoo\.com/i] },
  { category: "form", name: "HubSpot Forms", patterns: [/hsforms\.(net|com)/i, /hbspt\.forms\.create/i] },
  { category: "form", name: "Formstack", patterns: [/formstack\.com/i] },
  { category: "form", name: "Tally", patterns: [/tally\.so\//i] },
  // Payments and invoicing
  { category: "payment", name: "Stripe", patterns: [/(buy|checkout|donate|billing)\.stripe\.com/i] },
  { category: "payment", name: "PayPal", patterns: [/paypal\.(com|me)/i, /paypalobjects\.com/i] },
  { category: "payment", name: "Square", patterns: [/square\.link\//i, /squareup\.com/i, /checkout\.square\.site/i, /\.square\.site\b/i] },
  { category: "payment", name: "Square Online store", patterns: [/wsite-com-product-(price|add|form)/i, /href=["'][^"']*\/store\/p\d+\//i] },
  { category: "payment", name: "Venmo", patterns: [/\bvenmo\b/i] },
  { category: "payment", name: "Zelle", patterns: [/\bzelle\b/i] },
  { category: "payment", name: "Cash App", patterns: [/cash\.app\//i, /\bCash ?App\b/] },
  { category: "payment", name: "Zeffy", patterns: [/zeffy\.com/i] },
  { category: "payment", name: "Givebutter", patterns: [/givebutter\.com/i] },
  { category: "payment", name: "Omella", patterns: [/omella\.com/i] },
  { category: "payment", name: "Eventbrite", patterns: [/eventbrite\.[a-z.]+\//i, /\bEventbrite\b/i] },
  { category: "payment", name: "Smart Tuition", patterns: [/smarttuition\.com/i, /\bSmart ?Tuition\b/i] },
  { category: "payment", name: "Tuition Express", patterns: [/tuitionexpress/i, /\bTuition Express\b/i] },
  { category: "payment", name: "QuickBooks invoices", patterns: [/(quickbooks|connect|payments)\.intuit\.com/i, /intuit\.me\//i, /\bQuickBooks\b/i] },
  { category: "payment", name: "Wave invoices", patterns: [/waveapps\.com/i, /\bWave (invoice|invoicing|payments?)\b/i] },
  // E-signature
  { category: "e-signature", name: "DocuSign", patterns: [/docusign\.(net|com)/i, /\bDocuSign\b/i] },
  { category: "e-signature", name: "Dropbox Sign", patterns: [/hellosign\.com/i, /sign\.dropbox\.com/i, /\bDropbox Sign\b/i, /\bHelloSign\b/i] },
  { category: "e-signature", name: "PandaDoc", patterns: [/pandadoc\.com/i, /\bPandaDoc\b/i] },
  // School software
  { category: "school-software", name: "Brightwheel", patterns: [/\bbrightwheel\b/i] },
  { category: "school-software", name: "Transparent Classroom", patterns: [/transparent ?classroom/i] },
  { category: "school-software", name: "ParentSquare", patterns: [/parent ?square/i] },
  { category: "school-software", name: "Procare", patterns: [/\bprocare\b/i, /procaresoftware\.com/i] },
  { category: "school-software", name: "SignUpGenius", patterns: [/sign ?up ?genius/i] },
  { category: "school-software", name: "Remind", patterns: [/\bremind\.com\b/i, /\bRemind app\b/i] },
  { category: "school-software", name: "ClassDojo", patterns: [/classdojo\.com/i, /\bClass ?Dojo\b/i] },
  { category: "school-software", name: "Seesaw", patterns: [/(app|web)\.seesaw\.me/i, /seesaw\.me\//i, /\bSeesaw (app|App|Family|Learning|Class)\b/] },
  { category: "school-software", name: "Konstella", patterns: [/\bkonstella\b/i] },
  { category: "school-software", name: "Bloomz", patterns: [/\bbloomz\b/i] },
  {
    category: "school-software",
    name: "Newton",
    patterns: [/newton-by-kaipod/i, /com\.kaipodlearning\./i, /\bNewton\b[\s\S]{0,300}\bKai ?Pod\b/, /\bKai ?Pod\b[\s\S]{0,300}\bNewton\b/],
  },
  { category: "school-software", name: "Prenda", patterns: [/prenda\.com/i, /\bPrenda (microschool|Microschool|guide|Guide|World|world)s?\b/] },
  { category: "school-software", name: "FACTS", patterns: [/factsmgt\.com/i, /\bFACTS (Management|Tuition|Grant|Family Portal|SIS)\b/] },
  { category: "school-software", name: "Blackbaud", patterns: [/\bblackbaud\b/i, /myschoolapp\.com/i] },
  { category: "school-software", name: "Jackrabbit", patterns: [/jackrabbit(class|care|tech)\.com/i, /\bJackrabbit (Class|Care)\b/] },
  { category: "school-software", name: "Sawyer", patterns: [/hisawyer\.com/i] },
  { category: "school-software", name: "Wonderschool", patterns: [/\bwonderschool\b/i] },
  { category: "school-software", name: "Odyssey", patterns: [/withodyssey\.com/i, /\bOdyssey (ESA|marketplace|platform)\b/i, /\b(on|in|through|via|with) Odyssey\b/] },
  { category: "school-software", name: "ClassWallet", patterns: [/class ?wallet/i] },
  // Group chats
  { category: "messaging", name: "GroupMe", patterns: [/groupme\.com\/join_group/i, /\bGroupMe\b/] },
  { category: "messaging", name: "WhatsApp group", patterns: [/chat\.whatsapp\.com\//i] },
  // Scheduling, calendars, newsletters
  { category: "scheduling", name: "Calendly", patterns: [/calendly\.com/i] },
  { category: "scheduling", name: "Acuity Scheduling", patterns: [/acuityscheduling\.com/i, /[a-z0-9-]+\.as\.me\b/i] },
  {
    category: "scheduling",
    name: "Google Calendar booking",
    patterns: [/calendar\.app\.google\//i, /calendar\.google\.com\/calendar\/(u\/\d+\/)?appointments/i],
  },
  {
    category: "calendar",
    name: "Google Calendar",
    patterns: [/calendar\.google\.com\/calendar\/(u\/\d+\/)?(embed|ical|render|r\?cid|r\/?\?)/i],
  },
  { category: "newsletter", name: "Mailchimp", patterns: [/list-manage\.com/i, /chimpstatic\.com/i, /eepurl\.com/i, /mailchi\.mp/i, /mc-embedded-subscribe/i] },
  { category: "newsletter", name: "Substack", patterns: [/substack\.com/i] },
  { category: "newsletter", name: "Flodesk", patterns: [/flodesk\.com/i] },
  { category: "newsletter", name: "Constant Contact", patterns: [/constantcontact\.com/i, /ctctcdn\.com/i] },
];

const WOO_CART = "WooCommerce cart/checkout";
const DOC_FORM = "Google Docs/Drive form";

/** Every name detectTools can return (TOOL_REPLACEMENTS must cover each one). */
export const DETECTABLE_TOOL_NAMES: readonly string[] = [...TOOL_SIGNATURES.map((s) => s.name), WOO_CART, DOC_FORM];

/** Tool accounts that belong to a microschool network rather than the school. */
const NETWORK_SIGNATURES: Array<{ tool: string; network: string; pattern: RegExp }> = [
  { tool: "Jotform", network: "KaiPod", pattern: /kaipod[a-z0-9-]*\.jotform\./i },
  { tool: "Jotform", network: "Prenda", pattern: /prenda[a-z0-9-]*\.jotform\./i },
  { tool: "Newton", network: "KaiPod", pattern: /[\s\S]/ },
  { tool: "Prenda", network: "Prenda", pattern: /[\s\S]/ },
  { tool: "Wonderschool", network: "Wonderschool", pattern: /[\s\S]/ },
];

/** A Google Doc or Drive file used as a form: the link text says form/application/registration/enrollment. */
function hasDocAsForm(html: string): boolean {
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = parseAttributes(`<a ${m[1]}>`).href ?? "";
    if (!/^https?:\/\/(docs\.google\.com\/document\/|drive\.google\.com\/)/i.test(href.trim())) continue;
    if (/\b(form|application|registration|register|enrol(l|ment|ling)?)\b/i.test(anchorText(m[2]))) return true;
  }
  return false;
}

/** Schools' third-party tools, from domains and names anywhere in the raw HTML. */
export function detectTools(html: string): ToolHit[] {
  const hits: ToolHit[] = TOOL_SIGNATURES.filter((s) => s.patterns.some((p) => p.test(html))).map((s) => ({
    category: s.category,
    name: s.name,
  }));
  const wooCart = /woocommerce/i.test(html) && /(wc-block-(cart|checkout)|woocommerce-(cart|checkout)|[?&]add-to-cart=|name=["']add-to-cart["']|(single_)?add_to_cart_button|woocommerce-Price-amount|href=["'][^"']*\/(cart|checkout)\/?["'])/i.test(html);
  if (wooCart) hits.push({ category: "payment", name: WOO_CART });
  if (hasDocAsForm(html)) hits.push({ category: "form", name: DOC_FORM });
  for (const hit of hits) {
    const net = NETWORK_SIGNATURES.find((n) => n.tool === hit.name && n.pattern.test(html));
    if (net) hit.network = net.network;
  }
  return hits;
}

const STAFF_PAGE =
  /\bstaff\b|invoice|reimburs|(^|[^a-z])eft([^a-z]|$)|payroll|\bjobs?\b|careers?|join[- ]our[- ]team|employ(ment|ee)|volunteer[- ]application/i;

/** Pages for staff, not families (tools found only here stay out of the family count). */
export function isStaffPage(url: string, title: string): boolean {
  return STAFF_PAGE.test(pathOf(url)) || STAFF_PAGE.test(title);
}

const FUNDING_TERMS: Array<[string, RegExp]> = [
  ["TEFA", /\bTEFA\b|Texas Education Freedom Accounts?/g],
  ["ESA", /\bESAs?\b|Education Savings Accounts?|Empowerment Scholarship Accounts?/gi],
  ["Education Freedom", /Education Freedom/gi],
  ["GATOR", /\bGATOR\b/g],
  ["Step Up", /\bStep Up\b/g],
  ["Charter / enrichment funds", /\bcharter (school )?funds?\b|\benrichment funds?\b|\bhomeschool charter\b/gi],
  ["Voucher", /\bvouchers?\b/gi],
  ["ClassWallet", /\bclass ?wallet\b/gi],
];

function snippetAround(text: string, index: number, length: number, radius = 70): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

/** Funding programs mentioned in visible text (max 2 snippets per term). */
export function detectFunding(text: string): FundingMention[] {
  const out: FundingMention[] = [];
  for (const [term, re] of FUNDING_TERMS) {
    re.lastIndex = 0;
    let count = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) && count < 2) {
      out.push({ term, snippet: snippetAround(text, m.index, m[0].length) });
      count++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** The school year starts August 1: 2026-11-22 → 2026; 2026-07-31 → 2025. */
export function currentSchoolYearStart(today: Date): number {
  return today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
}

export function formatSchoolYear(start: number): string {
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

const FORWARD_WORDS =
  /\b(opens?|opening|starts?|starting|begins?|beginning|deadline|due|until|through|thru|before|register|registration|apply|applications?|enrol(l|ling|lment)?s?|accepting|tours?|open house|launch(es|ing)?|upcoming|coming|next|join us|kicks? off|first day)\b/i;
const PAST_CONTEXT = /\b(posted|published|updated|written|founded|established|since)\b/i;

/**
 * School-year ranges older than the current one ("2024-2025", "2025–26"), plus forward-looking
 * season phrases for past terms ("enrolling for Fall 2025").
 */
export function findStaleSchoolYears(text: string, today: Date): DatedPhrase[] {
  const current = currentSchoolYearStart(today);
  const out: DatedPhrase[] = [];
  const seen = new Set<string>();
  const push = (phrase: string, reason: string) => {
    const key = phrase.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ phrase, reason });
  };

  const rangeRe = /\b(20\d{2})\s*[-–—\/]\s*(20\d{2}|\d{2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = rangeRe.exec(text))) {
    const start = Number(m[1]);
    const endRaw = m[2];
    const end = endRaw.length === 4 ? Number(endRaw) : NaN;
    const isNext = endRaw.length === 4 ? end === start + 1 : Number(endRaw) === (start + 1) % 100;
    if (!isNext || start >= current) continue;
    const before = text.slice(Math.max(0, m.index - 20), m.index);
    if (/©|copyright|\(c\)/i.test(before)) continue;
    push(snippetAround(text, m.index, m[0].length, 50), `school year ${formatSchoolYear(start)} (current is ${formatSchoolYear(current)})`);
  }

  const seasonRe = /\b(Fall|Autumn|Spring|Summer|Winter)\s+(20\d{2})\b/gi;
  while ((m = seasonRe.exec(text))) {
    const season = m[1].toLowerCase();
    const year = Number(m[2]);
    const schoolYear = season === "fall" || season === "autumn" ? year : year - 1;
    if (schoolYear >= current) continue;
    const before = text.slice(Math.max(0, m.index - 50), m.index);
    if (!FORWARD_WORDS.test(before) || PAST_CONTEXT.test(before)) continue;
    push(snippetAround(text, m.index, m[0].length, 50), `${m[1]} ${year} has passed`);
  }
  return out;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Forward-looking phrases with a full date already in the past ("opens January 16, 2026"). */
export function findPastDatedPhrases(text: string, today: Date): DatedPhrase[] {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const re =
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/gi;
  const out: DatedPhrase[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    const day = Number(m[2]);
    const year = Number(m[3]);
    if (month < 0 || day < 1 || day > 31) continue;
    const date = new Date(year, month, day);
    if (date >= todayMidnight) continue;
    const before = text.slice(Math.max(0, m.index - 50), m.index);
    if (!FORWARD_WORDS.test(before) || PAST_CONTEXT.test(before)) continue;
    const phrase = snippetAround(text, m.index, m[0].length, 50);
    if (seen.has(phrase)) continue;
    seen.add(phrase);
    out.push({ phrase, reason: `${m[0]} is in the past` });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Page analysis
// ---------------------------------------------------------------------------

export function hasDollarAmounts(text: string): boolean {
  return /\$\s?\d/.test(text) || /\b\d[\d,]*\s?(USD|dollars)\b/i.test(text);
}

export function analyzePage(
  html: string,
  pageUrl: string,
  siteOrigin: string,
  today: Date,
  headers: Record<string, string> = {},
): PageFacts {
  const text = visibleText(html);
  const links = scanLinks(html, pageUrl, siteOrigin);
  const title = extractTitle(html);
  return {
    title,
    wordCount: countWords(text),
    text,
    ...links,
    passwordProtected: isPasswordProtected(html, text),
    templateProduct: detectTemplateProduct(title, text),
    forms: extractForms(html, pageUrl),
    iframeHosts: hostsOf(html, "iframe", pageUrl),
    scriptHosts: hostsOf(html, "script", pageUrl),
    hasViewport: hasViewportMeta(html),
    platforms: detectPlatforms(html, headers),
    tools: detectTools(html),
    funding: detectFunding(text),
    staleYears: findStaleSchoolYears(text, today),
    pastDates: findPastDatedPhrases(text, today),
    hasDollarAmounts: hasDollarAmounts(text),
  };
}

// ---------------------------------------------------------------------------
// Site-level summary and gaps
// ---------------------------------------------------------------------------

const PRICING_PAGE = /tuition|pric|fees?\b|rates|cost|program/i;
const APPLICATION_PAGE = /admission|apply|application|enrol|register|registration/i;
const APPLICATION_SOFTWARE = new Set([
  "Brightwheel",
  "Transparent Classroom",
  "Procare",
  "FACTS",
  "Blackbaud",
  "Jackrabbit",
  "Sawyer",
  "Wonderschool",
]);

export function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return `${decodeURIComponent(u.pathname)}${u.search}` || "/";
  } catch {
    return url;
  }
}

export function isPricingPage(url: string, title: string): boolean {
  return PRICING_PAGE.test(pathOf(url)) || PRICING_PAGE.test(title);
}

export interface ApplicationEvidence {
  found: boolean;
  evidence: string[];
}

/** Is there any way to apply online (a form tool, application software, an apply link, or a real form)? */
export function findOnlineApplication(pages: PageResult[]): ApplicationEvidence {
  const evidence: string[] = [];
  for (const page of pages) {
    const f = page.facts;
    if (!f) continue;
    for (const tool of f.tools) {
      if (tool.category === "form" || APPLICATION_SOFTWARE.has(tool.name)) {
        evidence.push(`${tool.name} on ${page.url}`);
      }
    }
    for (const link of f.externalApplyLinks) evidence.push(`"${link.text || link.url}" → ${link.url} (on ${page.url})`);
    const isApplyPage = APPLICATION_PAGE.test(pathOf(page.url)) || APPLICATION_PAGE.test(f.title);
    if (isApplyPage && f.forms.some((form) => form.kind === "general" && form.fieldCount >= 5)) {
      evidence.push(`${f.forms.find((form) => form.kind === "general" && form.fieldCount >= 5)?.fieldCount}-field form on ${page.url}`);
    }
  }
  return { found: evidence.length > 0, evidence: Array.from(new Set(evidence)) };
}

export function computeGaps(pages: PageResult[], siteOrigin: string): GapFlag[] {
  const gaps: GapFlag[] = [];
  const analysed = pages.filter((p) => p.facts);

  for (const page of pages) {
    if (page.status >= 400) {
      const from = page.linkedFrom.slice(0, 3).map(pathOf).join(", ");
      gaps.push({
        kind: "broken-link",
        url: page.url,
        message: `Returns ${page.status}${from ? `; linked from ${from}` : ""}`,
      });
    }
  }

  for (const page of analysed) {
    const f = page.facts as PageFacts;
    for (const s of f.staleYears) gaps.push({ kind: "stale-school-year", url: page.url, message: `${s.reason}: "${s.phrase}"` });
    for (const d of f.pastDates) gaps.push({ kind: "past-date", url: page.url, message: `${d.reason}: "${d.phrase}"` });
    if (isPricingPage(page.url, f.title) && !f.hasDollarAmounts) {
      const docs = f.files.filter((file) => file.kind !== "file");
      if (docs.length > 0) {
        gaps.push({
          kind: "prices-in-files",
          url: page.url,
          message: `No $ amounts in page text, but links ${docs.length} PDF/flipbook(s): ${docs
            .slice(0, 3)
            .map((d) => `${d.text} (${d.provider})`)
            .join("; ")}`,
        });
      }
    }
    if (f.templateProduct) {
      gaps.push({
        kind: "template-product",
        url: page.url,
        message: `Template/demo store product still public: "${f.templateProduct}"`,
      });
    }
    if (!f.hasViewport) gaps.push({ kind: "missing-viewport", url: page.url, message: "No <meta name=\"viewport\"> tag" });
    if (f.httpSelfLinks.length > 0) {
      gaps.push({
        kind: "http-self-link",
        url: page.url,
        message: `${f.httpSelfLinks.length} http:// link(s) to its own site, e.g. ${f.httpSelfLinks[0]}`,
      });
    }
  }

  if (analysed.length > 0) {
    const app = findOnlineApplication(analysed);
    if (!app.found) {
      const admissions = analysed.find((p) => APPLICATION_PAGE.test(pathOf(p.url)) || APPLICATION_PAGE.test(p.facts?.title ?? ""));
      const mailto = Array.from(new Set(analysed.flatMap((p) => p.facts?.mailto ?? [])));
      const contactForms = analysed.filter((p) => p.facts?.forms.some((form) => form.kind === "general")).length;
      gaps.push({
        kind: "no-online-application",
        url: admissions?.url ?? new URL(siteOrigin).href,
        message: `No form tool, application software or apply link found on ${analysed.length} page(s); only ${
          mailto.length ? `email (${mailto.slice(0, 2).join(", ")})` : "no email links"
        }${contactForms ? ` and ${contactForms} page(s) with a contact-style form` : ""}`,
      });
    }
  }
  return gaps;
}

// ---------------------------------------------------------------------------
// Tools families juggle
// ---------------------------------------------------------------------------

export interface JuggledTool {
  name: string;
  moment?: SnapshotArea;
  network?: string;
  familyPages: string[];
  staffPages: string[];
  replacement?: ToolReplacement;
}

export interface FamilyToolSummary {
  /** Tools seen on at least one family-facing page, in family-moment order. */
  family: JuggledTool[];
  /** Tools seen only on staff pages (invoices, payroll, jobs...). */
  staffOnly: JuggledTool[];
  /** One-line summary for the report and console. */
  line: string;
}

const MOMENT_ORDER = Object.keys(SNAPSHOT_AREA_LABEL) as SnapshotArea[];

export function summarizeFamilyTools(pages: PageResult[]): FamilyToolSummary {
  const byName = new Map<string, JuggledTool>();
  for (const page of pages) {
    const f = page.facts;
    if (!f) continue;
    const staff = isStaffPage(page.url, f.title);
    for (const hit of f.tools) {
      const replacement = TOOL_REPLACEMENTS[hit.name];
      const entry = byName.get(hit.name) ?? {
        name: hit.name,
        moment: replacement?.moment,
        replacement,
        familyPages: [],
        staffPages: [],
      };
      entry.network = entry.network ?? hit.network;
      (staff ? entry.staffPages : entry.familyPages).push(page.url);
      byName.set(hit.name, entry);
    }
  }
  const all = Array.from(byName.values());
  const rank = (t: JuggledTool) => (t.moment ? MOMENT_ORDER.indexOf(t.moment) : MOMENT_ORDER.length);
  const family = all.filter((t) => t.familyPages.length > 0).sort((a, b) => rank(a) - rank(b));
  const staffOnly = all.filter((t) => t.familyPages.length === 0);

  let line: string;
  if (family.length === 0) {
    line = "Families touch no third-party tools we could detect.";
  } else {
    const replaceable = family.filter((t) => t.replacement && !t.replacement.keep);
    const build = replaceable.filter((t) => t.replacement && needsCustomWork(t.replacement)).length;
    const today = replaceable.length - build;
    line =
      `Families touch ${family.length} separate tool${family.length === 1 ? "" : "s"} across the year (${family
        .map((t) => t.name)
        .join(", ")}). ` + `MudKitchen could replace ${replaceable.length}: ${today} today, ${build} we'd build.`;
    const networks = new Map<string, string[]>();
    for (const t of family) if (t.network) networks.set(t.network, [...(networks.get(t.network) ?? []), t.name]);
    if (networks.size) {
      line += ` Network tools: ${Array.from(networks.entries())
        .map(([network, names]) => `${names.join(", ")} (${network})`)
        .join("; ")}.`;
    }
  }
  return { family, staffOnly, line };
}

function replacementText(replacement: ToolReplacement | undefined): string {
  if (!replacement) return "not mapped yet";
  const labels = replacement.replacedBy.map(capabilityLabel).join("; ");
  if (replacement.keep) {
    return `Keep, we work alongside${replacement.note ? ` (${replacement.note})` : ""}${labels ? `; connects via ${labels}` : ""}`;
  }
  return `${labels}${replacement.note ? ` — ${replacement.note}` : ""}`;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

export interface SiteAudit {
  startUrl: string;
  siteOrigin: string;
  label: string;
  generatedOn: string;
  rendered: boolean;
  maxPages: number;
  robots: { found: boolean; disallow: string[] };
  sitemap: { found: boolean; urlCount: number; sources: string[] };
  pages: PageResult[];
  /** Same-site URLs found but not fetched because of the page budget. */
  notCrawled: string[];
  /** Same-site URLs skipped because robots.txt disallows them. */
  robotsBlocked: string[];
}

function cell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function pageNotes(page: PageResult): string {
  const notes: string[] = [];
  if (page.error) notes.push(`error: ${page.error}`);
  if (page.status && page.status !== 200) notes.push(`HTTP ${page.status}`);
  if (page.offSiteRedirect) notes.push(`redirects off-site to ${page.offSiteRedirect}`);
  if (page.nonHtmlType) notes.push(`not HTML (${page.nonHtmlType})`);
  if (page.finalUrl && page.finalUrl !== page.url && !page.offSiteRedirect) notes.push(`→ ${pathOf(page.finalUrl)}`);
  const f = page.facts;
  if (f) {
    if (f.passwordProtected) notes.push("password-protected");
    if (f.templateProduct) notes.push("template product");
    if (f.wordCount < 60) notes.push("thin text");
    const pdfs = f.files.filter((x) => x.kind === "pdf").length;
    const flips = f.files.filter((x) => x.kind === "flipbook").length;
    if (pdfs) notes.push(`${pdfs} PDF`);
    if (flips) notes.push(`${flips} flipbook/Drive`);
    const forms = f.forms.filter((x) => x.kind !== "search");
    if (forms.length) notes.push(`forms: ${forms.map((x) => `${x.kind} ${x.fieldCount}f→${x.actionHost}`).join(", ")}`);
    if (f.tools.length) notes.push(`tools: ${f.tools.map((t) => t.name).join(", ")}`);
    if (f.hasDollarAmounts) notes.push("$ amounts");
    if (f.funding.length) notes.push(`funding: ${Array.from(new Set(f.funding.map((x) => x.term))).join(", ")}`);
    if (f.staleYears.length || f.pastDates.length) notes.push("stale dates");
    if (!f.hasViewport) notes.push("no viewport");
  }
  return notes.join("; ");
}

const KEY_PAGES: Array<[string, RegExp]> = [
  ["Admissions / apply / enroll", /admission|apply|application|enrol|register/i],
  ["Tuition / pricing / fees", /tuition|pric|fees?\b|rates|cost/i],
  ["Tours / visits", /tour|visit|open-?house/i],
  ["Programs", /program|camp|summer|after-?school/i],
  ["Calendar / events", /calendar|events?\b|schedule/i],
  ["Families / parents / handbook / forms", /parent|famil|handbook|forms?\b|resources/i],
  ["FAQ", /faq|questions/i],
  ["Contact", /contact/i],
];

export function renderReport(audit: SiteAudit): string {
  const { pages } = audit;
  const analysed = pages.filter((p) => p.facts);
  const lines: string[] = [];
  const platforms = Array.from(new Set(analysed.flatMap((p) => p.facts?.platforms ?? [])));
  const byStatus = new Map<string, number>();
  for (const p of pages) {
    const key = p.status ? String(p.status) : "failed";
    byStatus.set(key, (byStatus.get(key) ?? 0) + 1);
  }

  lines.push(`# Site audit: ${audit.label}`, "");
  lines.push(
    `Crawled ${audit.startUrl} on ${audit.generatedOn}${audit.rendered ? " (rendered with Chromium)" : " (server HTML)"}. ` +
      "Page content was treated as data only. Every finding below links to the page it came from; open the page to confirm before quoting it.",
    "",
  );

  lines.push("## Overview", "");
  lines.push(`- Pages crawled: ${pages.length} (limit ${audit.maxPages})`);
  lines.push(`- Platform: ${platforms.length ? platforms.join(", ") : "not detected"}`);
  lines.push(
    `- Pages by status: ${Array.from(byStatus.entries())
      .sort()
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}`,
  );
  lines.push(
    `- robots.txt: ${audit.robots.found ? (audit.robots.disallow.length ? `disallows ${audit.robots.disallow.join(", ")}` : "found, nothing disallowed") : "not found"}`,
  );
  lines.push(
    `- Sitemap: ${audit.sitemap.found ? `${audit.sitemap.urlCount} URL(s) from ${audit.sitemap.sources.join(", ")}` : "not found"}`,
  );
  if (audit.notCrawled.length) {
    lines.push(`- Found but not crawled (page limit): ${audit.notCrawled.length}; first few: ${audit.notCrawled.slice(0, 8).map(pathOf).join(", ")}`);
  }
  if (audit.robotsBlocked.length) lines.push(`- Skipped by robots.txt: ${audit.robotsBlocked.slice(0, 8).map(pathOf).join(", ")}`);
  const totalWords = analysed.reduce((n, p) => n + (p.facts?.wordCount ?? 0), 0);
  lines.push(`- Visible words across pages: ${totalWords}`);
  if (!audit.rendered && analysed.length > 0 && totalWords / analysed.length < 80) {
    lines.push("- Very little server HTML text: re-run with `--render` (likely a JavaScript-rendered site).");
  }
  lines.push("");

  lines.push("## Key pages", "");
  for (const [label, re] of KEY_PAGES) {
    const matches = analysed.filter((p) => re.test(pathOf(p.url)) || re.test(p.facts?.title ?? ""));
    lines.push(`- ${label}: ${matches.length ? matches.slice(0, 6).map((p) => p.url).join(", ") : "none found"}`);
  }
  lines.push("");

  lines.push("## Pages", "", "| Path | Title | Words | Notes |", "| --- | --- | ---: | --- |");
  for (const p of pages) {
    lines.push(`| ${cell(pathOf(p.url))} | ${cell(p.facts?.title ?? "")} | ${p.facts?.wordCount ?? ""} | ${cell(pageNotes(p))} |`);
  }
  lines.push("");

  lines.push("## Tools found", "");
  const tools = new Map<string, { category: string; network?: string; urls: string[] }>();
  for (const p of analysed) {
    for (const t of p.facts?.tools ?? []) {
      const entry = tools.get(t.name) ?? { category: t.category, urls: [] };
      entry.urls.push(p.url);
      entry.network = entry.network ?? t.network;
      tools.set(t.name, entry);
    }
  }
  if (tools.size === 0) lines.push("None detected.");
  else {
    lines.push("| Tool | Category | Pages |", "| --- | --- | --- |");
    for (const [name, t] of Array.from(tools.entries()).sort((a, b) => a[1].category.localeCompare(b[1].category))) {
      const shown = t.urls.slice(0, 5).join(", ");
      const label = t.network ? `${name} (${t.network} network)` : name;
      lines.push(`| ${label} | ${t.category} | ${shown}${t.urls.length > 5 ? ` (+${t.urls.length - 5} more)` : ""} |`);
    }
  }
  const app = findOnlineApplication(analysed);
  lines.push("", `Online application: ${app.found ? app.evidence.slice(0, 6).join("; ") : "none found"}`);
  const embedHosts = Array.from(new Set(analysed.flatMap((p) => p.facts?.iframeHosts ?? []))).sort();
  if (embedHosts.length) lines.push("", `Iframe hosts: ${embedHosts.join(", ")}`);
  const scriptHosts = Array.from(new Set(analysed.flatMap((p) => p.facts?.scriptHosts ?? []))).sort();
  if (scriptHosts.length) lines.push("", `Script hosts: ${scriptHosts.join(", ")}`);
  const formHosts = Array.from(
    new Set(analysed.flatMap((p) => (p.facts?.forms ?? []).filter((f) => f.kind !== "search").map((f) => f.actionHost))),
  );
  if (formHosts.length) lines.push("", `Form action hosts: ${formHosts.join(", ")}`);
  lines.push("");

  lines.push("## Tools families juggle", "");
  const juggle = summarizeFamilyTools(pages);
  if (juggle.family.length === 0) lines.push("No family-facing third-party tools detected.");
  else {
    lines.push("| Moment | Tool | Pages | Replaced by | Network |", "| --- | --- | --- | --- | --- |");
    for (const t of juggle.family) {
      const shown = t.familyPages.slice(0, 4).map(pathOf).join(", ") + (t.familyPages.length > 4 ? ` (+${t.familyPages.length - 4})` : "");
      lines.push(
        `| ${t.moment ? SNAPSHOT_AREA_LABEL[t.moment] : "?"} | ${cell(t.name)} | ${cell(shown)} | ${cell(replacementText(t.replacement))} | ${t.network ?? ""} |`,
      );
    }
  }
  lines.push("", juggle.line);
  if (juggle.staffOnly.length) {
    lines.push(
      "",
      `Staff-only tools (left out of the count): ${juggle.staffOnly
        .map((t) => `${t.name}${t.network ? ` (${t.network})` : ""} on ${t.staffPages.slice(0, 4).map(pathOf).join(", ")}`)
        .join("; ")}`,
    );
  }
  lines.push("");

  lines.push("## Funding mentions", "");
  // The same sentence often repeats on archive/listing pages: show it once with the extra pages counted.
  const funding = new Map<string, { term: string; snippet: string; urls: string[] }>();
  for (const p of analysed) {
    for (const m of p.facts?.funding ?? []) {
      const key = `${m.term}|${m.snippet}`;
      const entry = funding.get(key) ?? { term: m.term, snippet: m.snippet, urls: [] };
      if (!entry.urls.includes(p.url)) entry.urls.push(p.url);
      funding.set(key, entry);
    }
  }
  if (funding.size === 0) lines.push("None found.");
  for (const m of Array.from(funding.values())) {
    const more = m.urls.length > 1 ? ` (also on ${m.urls.length - 1} other page(s))` : "";
    lines.push(`- **${m.term}** — ${m.urls[0]}${more}: "${m.snippet}"`);
  }
  lines.push("");

  lines.push("## Gap flags", "");
  const gaps = computeGaps(pages, audit.siteOrigin);
  if (gaps.length === 0) lines.push("None flagged.", "");
  const order: GapKind[] = [
    "no-online-application",
    "prices-in-files",
    "template-product",
    "stale-school-year",
    "past-date",
    "broken-link",
    "http-self-link",
    "missing-viewport",
  ];
  for (const kind of order) {
    const group = gaps.filter((g) => g.kind === kind);
    if (group.length === 0) continue;
    lines.push(`### ${kind} (${group.length})`, "");
    for (const g of group) lines.push(`- ${g.url} — ${g.message}`);
    lines.push("");
  }

  lines.push("## PDFs and flipbooks", "");
  const files = new Map<string, FileLink & { pages: string[] }>();
  for (const p of analysed) {
    for (const f of p.facts?.files ?? []) {
      const entry = files.get(f.url) ?? { ...f, pages: [] };
      entry.pages.push(pathOf(p.url));
      files.set(f.url, entry);
    }
  }
  if (files.size === 0) lines.push("None linked.");
  else {
    lines.push("| File | Kind | Link text | Found on |", "| --- | --- | --- | --- |");
    for (const f of Array.from(files.values())) {
      const on = Array.from(new Set(f.pages));
      lines.push(`| ${cell(f.url)} | ${f.provider} | ${cell(f.text)} | ${cell(on.slice(0, 4).join(", "))}${on.length > 4 ? ` (+${on.length - 4})` : ""} |`);
    }
  }
  lines.push("");

  lines.push("## Password-protected pages", "");
  const locked = analysed.filter((p) => p.facts?.passwordProtected);
  if (locked.length === 0) lines.push("None found.");
  else for (const p of locked) lines.push(`- ${p.url}${p.facts?.title ? ` (${p.facts.title})` : ""}`);
  lines.push("");

  lines.push("## Email and phone links", "");
  const contacts = new Map<string, string[]>();
  for (const p of analysed) {
    for (const m of p.facts?.mailto ?? []) contacts.set(`mailto:${m}`, [...(contacts.get(`mailto:${m}`) ?? []), pathOf(p.url)]);
    for (const t of p.facts?.tel ?? []) contacts.set(`tel:${t}`, [...(contacts.get(`tel:${t}`) ?? []), pathOf(p.url)]);
  }
  if (contacts.size === 0) lines.push("None found.");
  else {
    for (const [link, on] of Array.from(contacts.entries())) {
      lines.push(`- ${link} — ${on.length} page(s): ${on.slice(0, 4).join(", ")}${on.length > 4 ? " …" : ""}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}
