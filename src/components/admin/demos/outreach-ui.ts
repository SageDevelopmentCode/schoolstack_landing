import type { OutreachPlan, OutreachStep } from "@/data/outreach/types";
import { completedOutreachSteps, type DemoOutreach, type OutreachEmailRecord } from "@/lib/admin-crm/demo-outreach-types";
import { addBusinessDays } from "@/lib/admin-crm/outreach-email";

export const OUTREACH_STEP_LABEL: Record<OutreachStep["id"], string> = {
  first: "First email",
  "follow-1": "Follow-up 1",
  social: "Social note",
  "follow-2": "Follow-up 2",
  close: "Close",
};

export type StepState =
  | { kind: "done"; record: OutreachEmailRecord }
  | { kind: "attempted"; record: OutreachEmailRecord }
  | { kind: "due"; dueAt: string | null }
  | { kind: "upcoming"; dueAt: string | null };

/** Where one step of the sequence stands for a school. */
export function stepState(plan: OutreachPlan, step: OutreachStep, outreach: DemoOutreach | undefined, now = new Date()): StepState {
  const emails = outreach?.emails ?? [];
  const done = emails.find((e) => e.stepId === step.id && (e.status === "sent" || e.status === "logged"));
  if (done) return { kind: "done", record: done };

  const firstDone = completedOutreachSteps(emails).find((c) => c.stepId === "first");
  const dueAt = firstDone ? addBusinessDays(firstDone.at, step.businessDay).toISOString() : null;
  const attempted = emails.find((e) => e.stepId === step.id);

  // The next unfinished step is the one to act on; later steps are upcoming.
  const doneIds = new Set(completedOutreachSteps(emails).map((c) => c.stepId));
  const next = plan.steps.find((s) => !doneIds.has(s.id));
  if (attempted && next?.id === step.id) return { kind: "attempted", record: attempted };
  if (next?.id !== step.id) return { kind: "upcoming", dueAt };
  if (!dueAt) return { kind: "due", dueAt: null };
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return new Date(dueAt).getTime() <= endOfToday.getTime() ? { kind: "due", dueAt } : { kind: "upcoming", dueAt };
}

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
  ].join("\n");
}
