/**
 * Import schools from a research CSV into Supabase.
 * Run with:  npm run import-schools
 * Or:        npx tsx scripts/import-schools-csv.ts [path/to/file.csv]
 *
 * Schools already in the DB (matched by school_id) are skipped via upsert.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STATE_CODES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

type CsvRow = Record<string, string>;

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((values) => {
    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record;
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractWebsite(raw: string): string {
  const markdownMatch = raw.match(/\((https?:\/\/[^)]+)\)/);
  if (markdownMatch) return markdownMatch[1];
  const urlMatch = raw.match(/https?:\/\/[^\s)\]"']+/);
  if (urlMatch) return urlMatch[0];
  return raw.trim();
}

function parseListField(raw: string, warnings: string[], label: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const jsonLike = trimmed.replace(/'/g, '"');
      const parsed = JSON.parse(jsonLike);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      // fall through to regex extraction
    }

    const items = [...trimmed.matchAll(/'((?:\\'|[^'])*)'/g)].map((m) =>
      m[1].replace(/\\'/g, "'")
    );
    if (items.length > 0) return items;
  }

  warnings.push(`${label}: could not parse list, storing as single item`);
  return [trimmed];
}

function normalizeState(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (STATE_CODES[lower]) return STATE_CODES[lower];

  for (const [name, code] of Object.entries(STATE_CODES)) {
    if (lower.includes(name)) return code;
  }

  return trimmed;
}

function isClosing(signal: string): boolean {
  const lower = signal.toLowerCase();
  return lower.includes("closing") || lower.includes("closed");
}

function rowToSchool(row: CsvRow, warnings: string[]) {
  const name = row["School Name"]?.trim() ?? "";
  if (!name) return null;

  return {
    school_id: slugify(name),
    name,
    state: normalizeState(row["State"] ?? ""),
    location: row["Location"]?.trim() ?? "",
    website: extractWebsite(row["Website"] ?? ""),
    school_model: row["School Model"]?.trim() ?? "",
    grades: row["Grades/Ages"]?.trim() ?? "",
    estimated_size: row["Estimated Size"]?.trim() ?? "",
    tuition_schedule: row["Tuition/Schedule"]?.trim() ?? "",
    strengths: parseListField(row["What They Do Well"] ?? "", warnings, name),
    pain_points: parseListField(
      row["Possible Gaps/Pain Points"] ?? "",
      warnings,
      name
    ),
    software_fit_reason: row["Software Fit Reason"]?.trim() ?? "",
    priority_score: parseInt(row["Priority Score"] ?? "4", 10) || 4,
    confidence: row["Confidence"]?.trim() ?? "",
    is_closing: isClosing(row["New/Outdated Signal"] ?? ""),
    source_file: "expanded",
    crm_status: "not_contacted",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    notes: "",
    last_contacted_at: null,
  };
}

async function main() {
  const csvPath =
    process.argv[2] ?? resolve(process.cwd(), "data/research_results_mp9vym16.csv");
  const content = readFileSync(csvPath, "utf-8");
  const parsed = parseCsv(content);
  const warnings: string[] = [];

  const rows = parsed
    .map((row) => rowToSchool(row, warnings))
    .filter((row): row is NonNullable<typeof row> => row !== null);

  console.log(`📄  Parsed ${rows.length} schools from ${csvPath}`);

  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} parse warning(s):`);
    warnings.slice(0, 10).forEach((w) => console.warn(`   - ${w}`));
    if (warnings.length > 10) {
      console.warn(`   … and ${warnings.length - 10} more`);
    }
  }

  const { data, error } = await supabase
    .from("schools")
    .upsert(rows, { onConflict: "school_id", ignoreDuplicates: true })
    .select("school_id");

  if (error) {
    console.error("❌  Supabase error:", error.message);
    process.exit(1);
  }

  const inserted = data?.length ?? 0;
  const skipped = rows.length - inserted;

  console.log(`✅  Done! Inserted ${inserted} new schools.`);
  if (skipped > 0) {
    console.log(`   Skipped ${skipped} duplicate school_id(s).`);
  }
}

main();
