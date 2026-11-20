/**
 * Researched cold-outreach plan for one demo school. One file per school in this folder,
 * written by the `school-outreach-research` skill (.agents/skills/school-outreach-research)
 * and validated by `outreach-plans.test.ts`. Sent emails are logged in `crm_outreach_emails`.
 */

export type OutreachFact = {
  /** The fact, as plain as possible, in past tense if it is about the past. */
  fact: string;
  /** Page title or site name. */
  source: string;
  url: string;
  /** Date the page was read, YYYY-MM-DD. */
  readOn: string;
};

export type OutreachStepId = "first" | "follow-1" | "social" | "follow-2" | "close";

export type OutreachEmailStep = {
  id: Exclude<OutreachStepId, "social">;
  kind: "email";
  /** Business days after the first email was sent (0 for the first email). */
  businessDay: number;
  /** Why this step exists (each follow-up must add something new). */
  purpose: string;
  /** First email only. Follow-ups reply in the same thread ("Re: <first subject>"). */
  subject?: string;
  /** Plain text, signed "Julius", without the legal footer (added at send time). */
  body: string;
};

export type OutreachSocialStep = {
  id: "social";
  kind: "social";
  businessDay: number;
  purpose: string;
  /** Where to send it, e.g. "Instagram or Facebook". */
  where: string;
  /** No pitch. Under 200 characters. */
  body: string;
};

export type OutreachStep = OutreachEmailStep | OutreachSocialStep;

export type OutreachPlan = {
  /** Demo slug (key in schoolDemoRegistry). */
  slug: string;
  schoolName: string;
  /** YYYY-MM-DD the research was done. */
  researchedAt: string;
  recipient: {
    firstName: string;
    role: string;
    /** Where the name and role came from. Never store email addresses or phone numbers here. */
    source: string;
  };
  /** The one angle the sequence takes, e.g. "Why now: TEFA". */
  angle: string;
  facts: OutreachFact[];
  /** Things a person must confirm before the first email goes out. */
  checkBeforeSending: string[];
  /** When set, the school must not be emailed (paused, closing, asked not to be contacted…). */
  doNotEmail?: { reason: string; source?: string };
  steps: OutreachStep[];
};

/** Placeholder tokens a person fills in at send time. Any other `{…}` is a mistake. */
export const OUTREACH_FILL_IN_TOKENS = ["{loom link}"] as const;
