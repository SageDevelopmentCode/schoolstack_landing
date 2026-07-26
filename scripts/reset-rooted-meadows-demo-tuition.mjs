#!/usr/bin/env node
/**
 * Reset tuition data for rooted-meadows-demo so the setup wizard shows again.
 * Uses SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL from .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const slug = "rooted-meadows-demo";

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!url.includes("127.0.0.1") && url.includes("rxrmlfyoqzdpjxztluyd")) {
  console.log(`Target: remote project (${slug})`);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) {
    console.error(`Organization "${slug}" not found.`);
    process.exit(1);
  }

  const orgId = org.id;
  console.log(`Resetting tuition for ${org.name} (${org.slug})…`);

  const unlink = await supabase
    .from("application_payments")
    .update({ tuition_charge_id: null })
    .eq("organization_id", orgId)
    .not("tuition_charge_id", "is", null);

  if (unlink.error) throw unlink.error;

  const tables = [
    "tuition_charges",
    "tuition_adjustments",
    "tuition_enrollment_assignments",
    "tuition_payment_plans",
    "tuition_fee_components",
    "tuition_rate_plans",
    "tuition_adjustment_rules",
    "tuition_billing_accounts",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("organization_id", orgId);
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`  deleted from ${table}`);
  }

  const { count, error: countError } = await supabase
    .from("tuition_rate_plans")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "active");

  if (countError) throw countError;

  console.log(`\nActive rate plans: ${count ?? 0} (expected 0)`);
  console.log("Done. Hard-refresh /school/rooted-meadows-demo/admin/my_school/tuition");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
