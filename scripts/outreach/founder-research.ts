/**
 * Gather leads about a school's founder for the handwritten letter (school-letter skill).
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/founder-research.ts <demo-slug> [--name "Full Name"]
 *
 * - Reads the outreach plan, the CRM row (`schools.demo_slug`) and .site-audits/<slug>.md.
 * - Fetches the school's About / Story / Team / Contact pages (robots.txt respected, one request a
 *   second, 15s timeout, HTML only, nothing submitted) and keeps the paragraphs about the founder.
 * - Looks for the school's published mailing address (schema.org PostalAddress or a street address in the text).
 * - Searches podcast episodes with the free iTunes Search API (no key) by founder name and school name.
 * - Prints the web searches to run by hand (YouTube, local news, grants, conferences).
 *
 * Everything here is a lead, not a fact: open each page before quoting it in a letter.
 * Writes .founder-research/<slug>.md (git-ignored) and prints a short summary. Read-only: no CRM writes.
 */

import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getOutreachPlan } from "@/data/outreach";
import { decodeEntities, isAllowedByRobots, parseRobotsTxt, visibleText, type RobotsRules } from "@/lib/outreach/site-audit";
import { adminClient, SCHOOL_COLUMNS, type CrmSchool } from "./outreach-script-env";

const USER_AGENT = "MudKitchenSiteAudit/1.0";
const TIMEOUT_MS = 15_000;
const MIN_GAP_MS = 1_000;
const MAX_PAGES = 10;

/** Pages most likely to tell the founder's story. */
const STORY_PATH = /about|story|team|founder|staff|who-we-are|meet|leader|director|our-|mission|why|history|contact|faq/i;
/** Paragraphs worth reading even when they don't name the founder. */
const STORY_WORDS =
  /\b(found(?:ed|er|ers|ing)|co-?found|started|began|opened|launched|our story|my story|why i|why we|dream|vision|years? (?:of|as|in) (?:a |an )?(?:teach|educat|classroom|public school)|former(?:ly)? (?:a |an )?(?:teacher|educator|principal)|certified|master'?s|degree|award|grant|featured|podcast|interview|spoke|speaker|conference|expan|new (?:campus|location|building)|waitlist)\b/i;
const STREET_RE =
  /\b\d{2,6}\s+(?:[NSEW]\.?\s+)?[A-Z0-9][\w.'-]*(?:\s+[A-Z0-9][\w.'-]*){0,4}\s+(?:St|Street|Rd|Road|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Pkwy|Parkway|Hwy|Highway|Ct|Court|Cir|Circle|Trail|Trl|Pl|Place|Loop|Pike|Run)\b\.?(?:,?\s*(?:Suite|Ste|Unit|#)\s*[\w-]+)?,?\s+[A-Z][A-Za-z .'-]{1,30},?\s+[A-Z]{2}\s+\d{5}\b/g;

type Options = { slug: string; name?: string };

type Paragraph = { url: string; text: string; namesFounder: boolean };
type AddressLead = { address: string; url: string; how: string };
type Episode = { title: string; show: string; date: string; url: string; matches: boolean; query: string };

function usage(message?: string): never {
  if (message) console.error(message);
  console.error('Usage: npx tsx --tsconfig tsconfig.json scripts/outreach/founder-research.ts <demo-slug> [--name "Full Name"]');
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let slug: string | undefined;
  let name: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--name") name = argv[++i];
    else if (arg.startsWith("--")) usage(`Unknown option ${arg}`);
    else slug = arg;
  }
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) usage("Pass the demo slug, e.g. athena-microacademy.");
  return { slug, name: name?.trim() || undefined };
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
let lastFetchAt = 0;

async function politeFetch(url: string, accept = "text/html"): Promise<{ status: number; type: string; body: string } | null> {
  const wait = lastFetchAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastFetchAt = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: accept },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const type = res.headers.get("content-type") ?? "";
    const body = /html|json|xml|text/.test(type) ? await res.text() : "";
    return { status: res.status, type, body };
  } catch {
    return null;
  }
}

async function loadRobots(origin: string): Promise<RobotsRules | null> {
  const res = await politeFetch(`${origin}/robots.txt`, "text/plain");
  return res && res.status === 200 ? parseRobotsTxt(res.body) : null;
}

/** Same-site paths from the audit's "Pages" table, story pages first. */
function auditPages(slug: string, origin: string): string[] {
  const file = resolve(process.cwd(), ".site-audits", `${slug}.md`);
  if (!existsSync(file)) return [];
  const rows = readFileSync(file, "utf8").match(/^\| (\/[^|]*?) \| ([^|]*) \|/gm) ?? [];
  const pages = rows
    .map((row) => row.match(/^\| (\/[^|]*?) \| ([^|]*) \|/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => ({ path: m[1].trim(), title: m[2] }))
    .filter((p) => p.path === "/" || STORY_PATH.test(`${p.path} ${p.title}`));
  return pages.map((p) => new URL(p.path, origin).toString());
}

/** Text blocks (paragraphs, list items, headings) of a page, as plain text. */
function blocks(html: string): string[] {
  const body = html.replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, " ");
  return body
    .split(/<\/(?:p|li|h[1-6]|blockquote|td|div)>|<br\s*\/?>/i)
    .map((chunk) => decodeEntities(visibleText(chunk)).replace(/\s+/g, " ").trim())
    .filter((text) => text.split(" ").length >= 8);
}

function addressLeads(html: string, url: string): AddressLead[] {
  const leads: AddressLead[] = [];
  for (const m of html.matchAll(/"streetAddress"\s*:\s*"([^"]+)"[\s\S]{0,300}?"addressLocality"\s*:\s*"([^"]+)"[\s\S]{0,200}?"addressRegion"\s*:\s*"([^"]+)"[\s\S]{0,200}?"postalCode"\s*:\s*"([^"]+)"/g)) {
    leads.push({ address: `${m[1]}, ${m[2]}, ${m[3]} ${m[4]}`, url, how: "schema.org PostalAddress" });
  }
  const text = visibleText(html).replace(/\s+/g, " ");
  for (const m of text.matchAll(STREET_RE)) leads.push({ address: m[0].trim(), url, how: "street address in page text" });
  return leads;
}

async function podcastEpisodes(query: string, mustMatch: string[]): Promise<Episode[]> {
  const url = `https://itunes.apple.com/search?${new URLSearchParams({
    term: query,
    media: "podcast",
    entity: "podcastEpisode",
    limit: "25",
    country: "US",
  })}`;
  const res = await politeFetch(url, "application/json");
  if (!res || res.status !== 200) return [];
  let results: Record<string, unknown>[] = [];
  try {
    results = (JSON.parse(res.body) as { results?: Record<string, unknown>[] }).results ?? [];
  } catch {
    return [];
  }
  const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const needles = mustMatch.filter((t) => t.length >= 4).map((t) => new RegExp(`\\b${escape(t)}\\b`, "i"));
  return results.map((r) => {
    const title = String(r.trackName ?? "");
    const haystack = `${title} ${r.collectionName ?? ""} ${r.description ?? ""} ${r.shortDescription ?? ""}`;
    return {
      title,
      show: String(r.collectionName ?? ""),
      date: String(r.releaseDate ?? "").slice(0, 10),
      url: String(r.trackViewUrl ?? r.episodeUrl ?? ""),
      matches: needles.some((n) => n.test(haystack)),
      query,
    };
  });
}

function manualSearches(school: string, fullName: string | null, city: string | null): string[] {
  const who = fullName ? `"${fullName}"` : null;
  const q = (s: string) => `https://www.google.com/search?q=${encodeURIComponent(s)}`;
  const lines = [
    who && `${who} podcast OR interview OR episode`,
    who && `${who} "${school}"`,
    who && `${who} microschool OR "micro school" OR homeschool`,
    `"${school}" site:youtube.com`,
    `"${school}" ${city ?? ""} news`.trim(),
    `"${school}" VELA OR KaiPod OR Prenda OR "Acton" grant OR fellow`,
    `"${school}" conference OR summit OR panel OR speaker`,
    `"${school}" site:facebook.com`,
    `"${school}" site:instagram.com`,
    who && `${who} site:linkedin.com`,
  ].filter((s): s is string => Boolean(s));
  return lines.map((s) => `- [${s}](${q(s)})`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const plan = getOutreachPlan(opts.slug);
  if (!plan) usage(`No outreach plan for ${opts.slug}. Run /school-outreach first.`);

  const { data, error } = await adminClient().from("schools").select(SCHOOL_COLUMNS).eq("demo_slug", opts.slug).maybeSingle();
  if (error) throw error;
  const crm = data as CrmSchool | null;

  const website = crm?.website?.trim() || plan.facts[0]?.url;
  if (!website || !/^https?:\/\//.test(website)) usage(`No website for ${opts.slug} in the CRM.`);
  const origin = new URL(website).origin;

  const fullName = opts.name ?? plan.letter?.founder.fullName ?? (crm?.contact_name?.trim() || null);
  const firstName = plan.recipient.firstName;
  const lastName = fullName && fullName.split(/\s+/).length > 1 ? fullName.split(/\s+/).at(-1)! : null;
  const nameRe = new RegExp(`\\b(${[firstName, lastName].filter(Boolean).map((n) => n!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");

  console.log(`Founder research: ${plan.schoolName} (${opts.slug})`);
  console.log(`Founder: ${fullName ?? `${firstName} (full name unknown, pass --name once you find it)`} · ${plan.recipient.role}`);

  const robots = await loadRobots(origin);
  let pages = auditPages(opts.slug, origin);
  if (pages.length === 0) {
    pages = ["/", "/about", "/about-us", "/our-story", "/team", "/contact", "/contact-us"].map((p) => new URL(p, origin).toString());
  }
  pages = [...new Set(pages)].slice(0, MAX_PAGES);

  const paragraphs: Paragraph[] = [];
  const addresses: AddressLead[] = [];
  const skipped: string[] = [];
  for (const page of pages) {
    const u = new URL(page);
    if (robots && !isAllowedByRobots(`${u.pathname}${u.search}`, robots)) {
      skipped.push(`${page} (robots.txt)`);
      continue;
    }
    const res = await politeFetch(page);
    if (!res || res.status !== 200 || !/html/.test(res.type)) {
      skipped.push(`${page} (${res ? res.status : "no response"})`);
      continue;
    }
    addresses.push(...addressLeads(res.body, page));
    const seen = new Set(paragraphs.map((p) => p.text));
    for (const text of blocks(res.body)) {
      if (seen.has(text)) continue;
      const namesFounder = nameRe.test(text);
      if (namesFounder || STORY_WORDS.test(text)) {
        paragraphs.push({ url: page, text: text.length > 700 ? `${text.slice(0, 700)}…` : text, namesFounder });
        seen.add(text);
      }
    }
  }

  const episodes: Episode[] = [];
  const schoolWords = plan.schoolName.replace(/\(.*?\)/g, "").trim();
  if (fullName) episodes.push(...(await podcastEpisodes(fullName, [fullName, schoolWords])));
  episodes.push(...(await podcastEpisodes(schoolWords, [schoolWords, ...(lastName ? [lastName] : [])])));
  const uniqueEpisodes = [...new Map(episodes.filter((e) => e.url).map((e) => [e.url, e])).values()];
  const matched = uniqueEpisodes.filter((e) => e.matches);

  const uniqueAddresses = [...new Map(addresses.map((a) => [a.address.toLowerCase(), a])).values()];
  const today = new Date().toISOString().slice(0, 10);

  const md = [
    `# Founder research: ${plan.schoolName}`,
    "",
    `Run on ${today} for \`${opts.slug}\`. These are leads, not facts: open every page before quoting it, and keep to public, school-related facts (no family, kids, health or private social media).`,
    "",
    "## Who",
    "",
    `- Recipient in the plan: ${firstName}, ${plan.recipient.role} (${plan.recipient.source})`,
    `- Full name: ${fullName ?? "unknown. Find it on the About page, a news story or a state filing, then re-run with --name"}`,
    `- CRM: ${crm ? `${crm.name} · ${crm.location ?? crm.state ?? "location unknown"} · status ${crm.crm_status}` : "no CRM row with this demo slug"}`,
    `- Website: ${website}`,
    "",
    "## Mailing address leads",
    "",
    uniqueAddresses.length
      ? uniqueAddresses.map((a) => `- ${a.address} — ${a.how}, [source](${a.url})`).join("\n")
      : "- None found on the pages read. Check the Contact page, Google Maps, the state private-school directory or the school's Facebook About tab.",
    "",
    "Mail only to an address the school publishes for business. If it looks like a home, don't use it: say so in `checkBeforeMailing`.",
    "",
    "## Podcast episodes (iTunes Search)",
    "",
    matched.length
      ? matched.map((e) => `- **${e.title}** — ${e.show}, ${e.date} · [listen](${e.url}) _(query: ${e.query})_`).join("\n")
      : "- No episode mentions the founder or school by name.",
    uniqueEpisodes.length > matched.length
      ? `\n<details><summary>${uniqueEpisodes.length - matched.length} other results (probably not them)</summary>\n\n${uniqueEpisodes
          .filter((e) => !e.matches)
          .slice(0, 15)
          .map((e) => `- ${e.title} — ${e.show}, ${e.date} · ${e.url}`)
          .join("\n")}\n\n</details>`
      : "",
    "",
    "## On their own site",
    "",
    paragraphs.length
      ? [...paragraphs]
          .sort((a, b) => Number(b.namesFounder) - Number(a.namesFounder))
          .map((p) => `- ${p.namesFounder ? "**[names founder]** " : ""}${p.text} — [source](${p.url})`)
          .join("\n")
      : "- Nothing about the founder on the pages read.",
    "",
    skipped.length ? `Skipped: ${skipped.join(", ")}\n` : "",
    "## Search by hand",
    "",
    "Open the results that look like them; quote only what you've read on the page.",
    "",
    ...manualSearches(schoolWords, fullName, crm?.location ?? null),
    "",
  ].join("\n");

  const dir = resolve(process.cwd(), ".founder-research");
  await mkdir(dir, { recursive: true });
  const out = resolve(dir, `${opts.slug}.md`);
  await writeFile(out, md);

  console.log(`Pages read: ${pages.length - skipped.length}/${pages.length} · founder paragraphs: ${paragraphs.filter((p) => p.namesFounder).length} · story paragraphs: ${paragraphs.length}`);
  console.log(`Address leads: ${uniqueAddresses.length} · podcast matches: ${matched.length}/${uniqueEpisodes.length}`);
  console.log(`Wrote ${out}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
