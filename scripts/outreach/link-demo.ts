/**
 * Link a demo to its existing CRM school row (sets public.schools.demo_slug). The only CRM write the
 * school-outreach skill makes.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/link-demo.ts --school-id <uuid> --slug <demo-slug>
 *
 * Refuses if the slug has no demo config, or if another row already uses it.
 */
import { adminClient, hasDemoConfig } from "./outreach-script-env";

function arg(name: string): string {
  const i = process.argv.indexOf(name);
  return i >= 0 ? (process.argv[i + 1] ?? "") : "";
}

async function main() {
  const schoolId = arg("--school-id");
  const slug = arg("--slug");
  if (!schoolId || !slug) {
    console.error("Usage: link-demo.ts --school-id <uuid> --slug <demo-slug>");
    process.exit(1);
  }
  if (!hasDemoConfig(slug)) {
    console.error(`No demo config for "${slug}" in schoolDemoRegistry. Build the demo first.`);
    process.exit(1);
  }

  const supabase = adminClient();
  const { data: taken, error: takenError } = await supabase.from("schools").select("id, name").eq("demo_slug", slug);
  if (takenError) throw takenError;
  const other = (taken ?? []).find((row) => row.id !== schoolId);
  if (other) {
    console.error(`"${slug}" is already linked to another school: ${other.name} (${other.id}). Nothing changed.`);
    process.exit(1);
  }

  const { data, error } = await supabase.from("schools").update({ demo_slug: slug }).eq("id", schoolId).select("id, name, demo_slug");
  if (error) throw error;
  if (!data?.length) {
    console.error(`No CRM school with id ${schoolId}. Nothing changed.`);
    process.exit(1);
  }
  console.log(`Linked ${data[0].name} to demo "${slug}".`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
