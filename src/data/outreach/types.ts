import type { CapabilityId } from "./mudkitchen-capabilities";

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
  /**
   * Set for a re-contact sequence: the school already got an email from us outside the funnel.
   * The first email must acknowledge it honestly (it has to mention `when`).
   */
  priorContact?: {
    /** As written in the email, e.g. "June". */
    when: string;
    /** What that email was, e.g. "the first email, with a link to their MudKitchen demo". */
    what: string;
  };
  /** The free "Family experience snapshot" page at /snapshot/<slug>/<token>. */
  snapshot?: OutreachSnapshot;
  steps: OutreachStep[];
};

/** Moments in a family's journey, in the order the snapshot shows them. */
export const SNAPSHOT_AREAS = ["find", "tour", "apply", "enroll", "pay", "updates", "website"] as const;
export type SnapshotArea = (typeof SNAPSHOT_AREAS)[number];

export const SNAPSHOT_AREA_LABEL: Record<SnapshotArea, string> = {
  find: "Finding programs and tuition",
  tour: "Visiting the school",
  apply: "Applying",
  enroll: "Enrollment paperwork",
  pay: "Paying tuition",
  updates: "Staying in the loop",
  website: "The website itself",
};

/** "In your demo" (shown in their demo) or "We can set this up for you" (in MudKitchen, or we'd build it). */
export type SnapshotFixLabel = "in_demo" | "set_up";

export const SNAPSHOT_FIX_LABEL: Record<SnapshotFixLabel, string> = {
  in_demo: "In your demo",
  set_up: "We can set this up for you",
};

/** One sourced gap on the school's current site, and what MudKitchen would do about it. */
export type SnapshotObservation = {
  area: SnapshotArea;
  /** Short headline naming the gap, e.g. "Tuition is only in a PDF flipbook". Direct but kind. */
  gap: string;
  /** What a family sees today, plainly. */
  saw: string;
  /** What it costs a family or the school. */
  impact: string;
  /** Page title or site name. */
  source: string;
  url: string;
  /** YYYY-MM-DD the page was read. */
  readOn: string;
  fix: {
    /** `in_demo` only when every capability shows in this school's demo (checked by the validator). */
    label: SnapshotFixLabel;
    capabilities: CapabilityId[];
    /** One or two sentences on what we'd do. Custom work must read as something we'd set up, not as existing. */
    text: string;
    /** Optional path inside their demo, appended to the demo link (in_demo only). */
    demoPath?: string;
  };
};

export type OutreachSnapshot = {
  /** Unguessable, url-safe, 16+ characters. The page 404s without it. */
  token: string;
  /** YYYY-MM-DD. */
  preparedOn: string;
  /** One sentence from the site audit, e.g. "We read 23 pages of amaustin.org on Nov 22." */
  summary?: string;
  /** 4–8 observations, the most useful first within each area. */
  observations: SnapshotObservation[];
  /** Google PageSpeed Insights, mobile (scripts/outreach/snapshot-pagespeed.ts). */
  pageSpeed?: { mobileScore: number; url: string; checkedOn: string };
  /**
   * The separate tools families use today (from the site audit's "Tools families juggle"), each
   * confirmed on its page. Family-facing only. Shown as "Your tools today → one place" (2+ tools).
   */
  toolStack?: SnapshotTool[];
};

export type SnapshotTool = {
  /** As families know it, e.g. "Jotform", "Square", "Google Calendar". */
  name: string;
  /** What families use it for, e.g. "Inquiry form", "Camp payments". */
  usedFor: string;
  /** The page where we saw it. */
  url: string;
  /** Set when the tool comes from a network's account (e.g. "KaiPod"); needs a check-before-sending line. */
  network?: string;
};

/** Placeholder tokens filled in at send time. Any other `{…}` is a mistake. */
export const OUTREACH_FILL_IN_TOKENS = ["{loom link}", "{snapshot link}"] as const;

/** Filled automatically from the plan's snapshot; never typed by a person. */
export const SNAPSHOT_LINK_TOKEN = "{snapshot link}";
