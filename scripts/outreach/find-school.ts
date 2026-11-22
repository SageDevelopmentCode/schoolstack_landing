/**
 * Find a school in the CRM (public.schools) by name, demo slug or website. Read-only.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/find-school.ts "Ascend Micro School"
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/find-school.ts ascend-micro-school
 *   npx tsx --tsconfig tsconfig.json scripts/outreach/find-school.ts https://ascendmicroschool.com
 *
 * Prints each match with its CRM status, demo link, whether a contact email is on file (never the
 * email itself), and whether a demo config, demo route, outreach plan and site audit exist.
 */
import {
  SCHOOL_COLUMNS,
  adminClient,
  auditReportExists,
  demoRouteExists,
  hasDemoConfig,
  hostOf,
  planFileExists,
  type CrmSchool,
} from "./outreach-script-env";

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('Usage: find-school.ts "<school name | demo slug | website>"');
    process.exit(1);
  }

  const supabase = adminClient();
  const host = /[./]/.test(query) ? hostOf(query) : "";
  const like = `%${query.replace(/[%_,()]/g, " ").trim()}%`;
  const filters = [`name.ilike.${like}`, `demo_slug.eq.${query}`, `school_id.eq.${query}`];
  if (host) filters.push(`website.ilike.%${host}%`);

  const { data, error } = await supabase.from("schools").select(SCHOOL_COLUMNS).or(filters.join(",")).limit(10);
  if (error) throw error;
  const rows = (data ?? []) as CrmSchool[];

  if (rows.length === 0) {
    console.log(`No CRM school matches "${query}".`);
    if (hasDemoConfig(query)) console.log(`A demo config exists for slug "${query}", but no CRM row is linked to it.`);
    process.exit(2);
  }

  for (const s of rows) {
    const slug = s.demo_slug ?? "";
    console.log(
      [
        `${s.name} (${[s.location, s.state].filter(Boolean).join(", ") || "no location"})`,
        `  id:            ${s.id}`,
        `  crm status:    ${s.crm_status}${s.is_closing ? " (closing)" : ""}`,
        `  priority:      P${s.priority_score ?? "?"}`,
        `  website:       ${s.website || "none"}`,
        `  contact:       ${s.contact_name || "none"} · email on file: ${s.contact_email ? "yes" : "no"}`,
        `  last updated:  ${s.updated_at.slice(0, 10)}`,
        `  demo_slug:     ${slug || "none"}`,
        slug
          ? `  demo:          config ${hasDemoConfig(slug) ? "yes" : "NO"} · route ${demoRouteExists(slug) ? "yes" : "NO"}`
          : "  demo:          none linked",
        slug ? `  outreach plan: ${planFileExists(slug) ? "yes" : "no"} · site audit: ${auditReportExists(slug) ? "yes" : "no"}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
