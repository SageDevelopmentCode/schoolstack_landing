/**
 * One-time seed script — inserts all schools from data.ts into Supabase.
 * Run with:  npx tsx scripts/seed-schools.ts
 *
 * Schools already in the DB (matched by school_id) are skipped via upsert.
 */

import { createClient } from "@supabase/supabase-js";
import { schools } from "../src/app/research/data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log(`🌱  Seeding ${schools.length} schools into Supabase…`);

  const rows = schools.map((s) => ({
    school_id:           s.id,
    name:                s.name,
    state:               s.state,
    location:            s.location,
    website:             s.website,
    school_model:        s.schoolModel,
    grades:              s.grades,
    estimated_size:      s.estimatedSize,
    tuition_schedule:    s.tuitionSchedule,
    strengths:           s.strengths,
    pain_points:         s.painPoints,
    software_fit_reason: s.softwareFitReason,
    priority_score:      s.priorityScore,
    confidence:          s.confidence,
    is_closing:          s.isClosing ?? false,
    source_file:         s.sourceFile,
    // CRM defaults
    crm_status:          "not_contacted",
    contact_name:        "",
    contact_email:       "",
    contact_phone:       "",
    notes:               "",
    last_contacted_at:   null,
  }));

  const { error, count } = await supabase
    .from("schools")
    .upsert(rows, { onConflict: "school_id", ignoreDuplicates: true })
    .select("school_id", { count: "exact" });

  if (error) {
    console.error("❌  Supabase error:", error.message);
    process.exit(1);
  }

  console.log(`✅  Done! Inserted/updated ${count ?? rows.length} schools.`);
}

main();
