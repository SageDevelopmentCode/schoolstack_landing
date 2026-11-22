export const PUBLIC_SITE_ORIGIN = "https://www.trymudkitchen.com";

/**
 * A ready-to-paste Claude Code prompt that runs the school-outreach-research skill for one school.
 * Never includes email addresses or phone numbers.
 */
export function buildResearchPrompt(input: {
  slug: string;
  schoolName: string;
  demoHref: string;
  website?: string | null;
  crmStatusLabel: string;
  contactName?: string | null;
  /** The school was already emailed by hand: ask for the skill's re-contact mode. */
  recontact?: boolean;
}): string {
  const clean = (value: string | null | undefined) =>
    (value ?? "")
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "")
      .replace(/\+?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const website = clean(input.website);
  const contact = clean(input.contactName);
  const demoUrl = `${PUBLIC_SITE_ORIGIN}${input.demoHref.startsWith("/") ? "" : "/"}${input.demoHref}`;

  return [
    `/school-outreach-research ${input.slug}`,
    "",
    `School: ${input.schoolName}`,
    `Demo: ${demoUrl}`,
    `Website: ${website || "not in the CRM yet. Find it."}`,
    `CRM status: ${input.crmStatusLabel}`,
    `Known contact: ${contact || "none yet. Find the founder or director on their site."}`,
    "",
    "Research this school and write its outreach sequence the way the skill says: read their own site, the directories and any job posts or social pages, check they're still open and enrolling, pick one angle, then write " +
      `src/data/outreach/${input.slug}.ts, register it, and run the validator test and tsc. ` +
      "Report the facts you used with links, anything you dropped and why, and what I need to check before sending. Don't send anything.",
    ...(input.recontact
      ? [
          "",
          "This school was already emailed by hand before the funnel existed, so use the skill's re-contact mode: set priorContact, acknowledge that email honestly, and build the Family experience snapshot it offers.",
        ]
      : []),
  ].join("\n");
}
