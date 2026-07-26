import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS,
  ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS,
} from "../src/data/school-demos/rooted-meadows-enrollment-contracts";

function replaceSectionsBlock(
  sql: string,
  variableName: string,
  sections: typeof ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS,
): string {
  const markers = [
    `${variableName} jsonb := $sections$`,
    `${variableName} := $sections$`,
  ];
  const marker = markers.find((candidate) => sql.includes(candidate));
  if (!marker) {
    throw new Error(`Could not find sections marker for ${variableName}`);
  }

  const start = sql.indexOf(marker);
  const jsonStart = start + marker.length;
  const end = sql.indexOf("$sections$::jsonb;", jsonStart);
  if (end === -1) {
    throw new Error(`Could not find closing $sections$::jsonb for ${variableName}`);
  }

  const json = JSON.stringify(sections, null, 2);
  return `${sql.slice(0, jsonStart)}${json}${sql.slice(end)}`;
}

const files = [
  resolve(
    "supabase/migrations/rooted-meadows/seed_rooted_meadows_enrollment_agreement_variants.sql",
  ),
  resolve(
    "supabase/migrations_manual/update_rooted_meadows_enrollment_agreements_2026_07_26.sql",
  ),
];

for (const file of files) {
  let sql = readFileSync(file, "utf8");
  sql = replaceSectionsBlock(sql, "v_standard_sections", ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS);
  sql = replaceSectionsBlock(sql, "v_conditional_sections", ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS);
  writeFileSync(file, sql, "utf8");
  console.log(`Updated ${file}`);
}
