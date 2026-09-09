import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = resolve(
  __dirname,
  "data/rooted-meadows-demo-kindergarten-coop-supply-list.csv",
);
const OUTPUT_PATH = resolve(
  __dirname,
  "../supabase/migrations_manual/seed_rooted_meadows_demo_kindergarten_coop_supply_list_2026_09_09.sql",
);

const MONTH_ORDER = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
];

const MONTH_ALIASES = {
  september: "Sep",
  sept: "Sep",
  sep: "Sep",
  october: "Oct",
  oct: "Oct",
  november: "Nov",
  nov: "Nov",
  december: "Dec",
  dec: "Dec",
  january: "Jan",
  jan: "Jan",
  february: "Feb",
  feb: "Feb",
  march: "Mar",
  mar: "Mar",
  april: "Apr",
  apr: "Apr",
  may: "May",
};

const COLOR_LEGEND = [
  {
    colorId: "lavender",
    hex: "#8B7BA8",
    label: "Second Hand and asking around",
  },
  { colorId: "clay", hex: "#C4845C", label: "Buy new" },
  { colorId: "forest", hex: "#3D6B4F", label: "Anyone" },
];

const NON_ASSIGNMENT_PATTERNS = [
  /^not sure\b/i,
  /^probably\b/i,
  /^do we\b/i,
  /^the\s+/i,
  /^if\s+/i,
  /\?$/,
];

const NON_NAME_WORDS = new Set([
  "a",
  "an",
  "can",
  "do",
  "get",
  "have",
  "i",
  "if",
  "it",
  "just",
  "more",
  "not",
  "one",
  "probably",
  "some",
  "sure",
  "the",
  "too",
  "use",
  "we",
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (char === "\r") i += 1;
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function stableUuid(namespace, key) {
  const hash = createHash("sha256")
    .update(`${namespace}:${key}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

function titleCaseName(raw) {
  const trimmed = raw
    .trim()
    .replace(/\s*x\d+\s*$/i, "")
    .replace(/\(\d+\)\s*$/, "")
    .trim();
  const beforeDash = trimmed.split(/\s*-\s*/)[0].trim();
  const firstToken = beforeDash.split(/[,\s]/)[0]?.trim();
  if (!firstToken || !/^[A-Za-z]/.test(firstToken)) return null;
  return (
    firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase()
  );
}

function normalizeMonthToken(token) {
  const cleaned = token
    .trim()
    .replace(/\(\d+x?\)\s*$/i, "")
    .replace(/\(.*\)\s*$/, "")
    .trim()
    .toLowerCase();
  return MONTH_ALIASES[cleaned] ?? null;
}

function sortMonths(months) {
  const unique = [...new Set(months)];
  return unique.sort(
    (a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b),
  );
}

function parseUsedIn(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { usageTiming: "year_round", months: [] };
  }
  if (trimmed.toLowerCase() === "core") {
    return { usageTiming: "year_round", months: [] };
  }

  const months = [];
  let remainder = trimmed;

  if (/autumn core/i.test(remainder)) {
    months.push("Sep", "Oct", "Nov");
    remainder = remainder.replace(/autumn core\s*,?\s*/i, "");
  }

  const parts = remainder
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const month = normalizeMonthToken(part);
    if (month) months.push(month);
  }

  return {
    usageTiming: "specific_months",
    months: sortMonths(months),
  };
}

function parseItemType(value) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized.includes("consumable") && normalized.includes("reusable")) {
    return "both";
  }
  if (normalized.includes("reusable")) return "reusable";
  if (normalized.includes("consumable")) return "consumable";
  return "consumable";
}

function isNonAssignment(text) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return true;
  if (trimmed === "[ ]") return true;
  return NON_ASSIGNMENT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function parseAssignedFamilies(value) {
  const text = (value ?? "").trim();
  if (!text || text === "[ ]") return [];

  const hasBrackets = /\[[^\]]*\]/.test(text);
  if (!hasBrackets && /^i have\b/i.test(text)) {
    return ["Rachael"];
  }

  const families = [];
  const addFamily = (name) => {
    if (!name || families.includes(name) || families.length >= 5) return;
    families.push(name);
  };

  const bracketRegex = /\[([^\]]*)\]/g;
  let match;

  while ((match = bracketRegex.exec(text)) !== null) {
    const content = match[1].trim();
    if (!content) continue;
    if (/^i have\b/i.test(content)) {
      addFamily("Rachael");
      continue;
    }
    addFamily(titleCaseName(content));
  }

  const outsideBrackets = text.replace(/\[[^\]]*\]/g, " ").trim();
  if (outsideBrackets) {
    if (/i have\b/i.test(outsideBrackets)) {
      addFamily("Rachael");
    }

    const nameBeforeComma = outsideBrackets.split(",")[0]?.trim() ?? "";
    const firstWord = nameBeforeComma.split(/\s+/)[0]?.toLowerCase() ?? "";
    if (
      nameBeforeComma &&
      !/^i have\b/i.test(nameBeforeComma) &&
      !NON_NAME_WORDS.has(firstWord)
    ) {
      addFamily(titleCaseName(nameBeforeComma));
    }

    const trailingNameMatch = outsideBrackets.match(
      /\b([A-Za-z]+)\s+(?:x\d+|lots)\b/i,
    );
    if (trailingNameMatch) {
      addFamily(titleCaseName(trailingNameMatch[1]));
    }
  }

  if (families.length === 0) {
    if (/i have\b/i.test(text)) {
      addFamily("Rachael");
    } else if (!isNonAssignment(text)) {
      const firstSegment = text.split(",")[0]?.trim() ?? text;
      addFamily(titleCaseName(firstSegment));
    }
  }

  return families.filter(Boolean);
}

function parseQuantity(value) {
  const text = (value ?? "").trim();
  if (!text) return { quantity: 1, quantityLabel: "" };
  if (/^as needed/i.test(text)) {
    return { quantity: 1, quantityLabel: "as needed" };
  }

  const rangeMatch = text.match(/^(\d+)\s*[–-]\s*(\d+)\s*(.*)$/);
  if (rangeMatch) {
    return {
      quantity: Number.parseInt(rangeMatch[1], 10),
      quantityLabel: rangeMatch[3].trim(),
    };
  }

  const singleMatch = text.match(/^(\d+)\s*(.*)$/);
  if (singleMatch) {
    return {
      quantity: Number.parseInt(singleMatch[1], 10),
      quantityLabel: singleMatch[2].trim(),
    };
  }

  return { quantity: 1, quantityLabel: text };
}

function parsePrice(value) {
  const text = (value ?? "").trim();
  if (!text) return { mode: "unset" };
  if (text.toLowerCase() === "free") return { mode: "free" };

  const freeSlash = text.match(/^free\s*\/\s*\$?(\d+(?:\.\d+)?)/i);
  if (freeSlash) {
    return {
      mode: "range",
      minCents: 0,
      maxCents: Math.round(Number.parseFloat(freeSlash[1]) * 100),
    };
  }

  const range = text.match(
    /\$?(\d+(?:\.\d+)?)\s*[–-]\s*\$?(\d+(?:\.\d+)?)/,
  );
  if (range) {
    return {
      mode: "range",
      minCents: Math.round(Number.parseFloat(range[1]) * 100),
      maxCents: Math.round(Number.parseFloat(range[2]) * 100),
    };
  }

  const single = text.match(/\$?(\d+(?:\.\d+)?)/);
  if (single) {
    return {
      mode: "single",
      cents: Math.round(Number.parseFloat(single[1]) * 100),
    };
  }

  return { mode: "unset" };
}

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlTextArray(values) {
  if (values.length === 0) return "ARRAY[]::text[]";
  return `ARRAY[${values.map(sqlString).join(", ")}]::text[]`;
}

function sqlJson(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function parseRows(csvRows) {
  const [header, ...dataRows] = csvRows;
  const items = [];

  for (let index = 0; index < dataRows.length; index += 1) {
    const row = dataRows[index];
    const [
      supplyItem = "",
      usedIn = "",
      itemType = "",
      parentSignup = "",
      whereToBuy = "",
      qtyNeeded = "",
      estPrice = "",
    ] = row;

    const name = supplyItem.trim();
    if (!name) continue;
    if (/^items used/i.test(name)) continue;
    if (/^purple lets source second hand/i.test(name)) continue;

    const { usageTiming, months } = parseUsedIn(usedIn);
    const { quantity, quantityLabel } = parseQuantity(qtyNeeded);

    items.push({
      id: stableUuid("rooted-meadows-demo-coop-supply-item", `${index}:${name}`),
      sortOrder: items.length,
      name,
      itemType: parseItemType(itemType),
      usageTiming,
      months,
      assignedFamilies: parseAssignedFamilies(parentSignup),
      whereToBuy: whereToBuy.trim(),
      quantity,
      quantityLabel,
      estimatedPrice: parsePrice(estPrice),
    });
  }

  return items;
}

function buildSql(items) {
  const legendInserts = COLOR_LEGEND
    .map(
      (entry, index) => `    (
      ${sqlString(stableUuid("rooted-meadows-demo-coop-supply-legend", entry.colorId))}::uuid,
      v_program_id,
      v_org_id,
      ${sqlString(entry.colorId)},
      ${sqlString(entry.hex)},
      ${sqlString(entry.label)},
      ${index}
    )`,
    )
    .join(",\n");

  const itemInserts = items
    .map(
      (item) => `    (
      ${sqlString(item.id)}::uuid,
      v_program_id,
      v_org_id,
      ${sqlString(item.name)},
      ${sqlString(item.itemType)},
      ${sqlString(item.usageTiming)},
      ${sqlTextArray(item.months)},
      null,
      ${sqlTextArray(item.assignedFamilies)},
      ${sqlString(item.whereToBuy)},
      ${item.quantity},
      ${sqlString(item.quantityLabel)},
      ${sqlJson(item.estimatedPrice)},
      ${item.sortOrder}
    )`,
    )
    .join(",\n");

  return `-- Seed Kindergarten Co-op supply list for rooted-meadows-demo.
-- Generated by scripts/generate-rooted-meadows-demo-coop-supply-list-sql.mjs
-- Run in Supabase SQL Editor after add_program_coop_supply_list migration.
-- Date: 2026-09-09

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
begin
  select id into v_org_id
  from public.organizations
  where slug = 'rooted-meadows-demo'
  limit 1;

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found';
  end if;

  select id into v_program_id
  from public.programs
  where organization_id = v_org_id
    and portal_slug = 'kindergarten-co-op'
  limit 1;

  if v_program_id is null then
    raise exception 'Kindergarten Co-op program not found for rooted-meadows-demo';
  end if;

  delete from public.program_coop_supply_items
  where program_id = v_program_id;

  delete from public.program_coop_supply_color_legend
  where program_id = v_program_id;

  insert into public.program_coop_supply_color_legend (
    id,
    program_id,
    organization_id,
    color_id,
    hex,
    label,
    sort_order
  )
  values
${legendInserts};

  insert into public.program_coop_supply_items (
    id,
    program_id,
    organization_id,
    name,
    item_type,
    usage_timing,
    months,
    color_id,
    assigned_families,
    where_to_buy,
    quantity,
    quantity_label,
    estimated_price,
    sort_order
  )
  values
${itemInserts};

  raise notice 'Seeded % supply items for rooted-meadows-demo Kindergarten Co-op', ${items.length};
end $$;
`;
}

function main() {
  const csvText = readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(csvText);
  const items = parseRows(rows);
  const sql = buildSql(items);
  writeFileSync(OUTPUT_PATH, sql, "utf8");
  console.log(`Wrote ${items.length} supply items to ${OUTPUT_PATH}`);
}

main();
