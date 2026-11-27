import type { GChipTone } from "@/components/school-parent/garden/ui";
import { FUNNEL_STAGE_LABEL, type OutreachJourney } from "@/lib/admin-crm/outreach-journey";

const OUTCOME_TONE: Partial<Record<OutreachJourney["stage"], GChipTone>> = {
  replied: "info",
  call_booked: "info",
  proposal: "warning",
  won: "success",
  not_interested: "neutral",
  nurturing: "neutral",
  do_not_email: "neutral",
  finished: "neutral",
  needs_plan: "warning",
  needs_demo: "neutral",
  not_started: "neutral",
};

/** "today", "tomorrow", "Thu", or "Dec 4". */
export function formatDue(iso: string, now = new Date()): string {
  const due = new Date(iso);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(due) - startOf(now)) / 86_400_000);
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return due.toLocaleDateString("en-US", { weekday: "short" });
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "due today", "due Thu", or "2 days overdue". */
export function dueText(iso: string, now = new Date()): string {
  const when = formatDue(iso, now);
  return when.endsWith("overdue") ? when : `due ${when}`;
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Stage chip for a list row or header. */
export function journeyChip(journey: OutreachJourney): { tone: GChipTone; label: string } {
  if (journey.stage === "letter") {
    return journey.letter?.readyAt ? { tone: "info", label: "Ready to mail" } : { tone: "alert", label: "Letter to mail" };
  }
  if (journey.next) {
    const label = `${journey.next.number} · ${journey.next.label}`;
    return { tone: journey.actionable ? "alert" : "info", label };
  }
  return { tone: OUTCOME_TONE[journey.stage] ?? "neutral", label: FUNNEL_STAGE_LABEL[journey.stage] };
}

/** One line for what happens next, from data only. */
export function journeyNextLine(journey: OutreachJourney, now = new Date()): string | null {
  const next = journey.next;
  if (!next) return null;
  if (journey.stage === "letter") return "Write and mail the letter · first email follows";
  const verb = next.kind === "social" ? "Log" : "Send";
  if (!next.dueAt) return `${verb} ${next.label.toLowerCase()} · ready`;
  return `${verb} ${next.label.toLowerCase()} · ${dueText(next.dueAt, now)}`;
}

// ── "Has" filters (multi-select, AND) ─────────────────────────────────────────

export const SCHOOL_TRAITS = ["demo", "snapshot", "letter"] as const;
export type SchoolTrait = (typeof SCHOOL_TRAITS)[number];

export const SCHOOL_TRAIT_LABEL: Record<SchoolTrait, string> = {
  demo: "Demo",
  snapshot: "Snapshot",
  letter: "Letter",
};

type TraitSource = {
  school: { demo_slug: string | null };
  plan: { snapshot?: unknown; letter?: unknown; doNotEmail?: unknown } | null;
};

export function isSchoolTrait(value: string): value is SchoolTrait {
  return (SCHOOL_TRAITS as readonly string[]).includes(value);
}

/** What a school has ready: a linked demo, a snapshot page, a handwritten letter. */
export function schoolTraits(row: TraitSource): Set<SchoolTrait> {
  const traits = new Set<SchoolTrait>();
  if (row.school.demo_slug) traits.add("demo");
  if (row.plan?.snapshot && !row.plan.doNotEmail) traits.add("snapshot");
  if (row.plan?.letter && !row.plan.doNotEmail) traits.add("letter");
  return traits;
}

/** True when the school has every wanted trait (no traits wanted = everything matches). */
export function matchesTraits(row: TraitSource, wanted: readonly SchoolTrait[]): boolean {
  if (wanted.length === 0) return true;
  const has = schoolTraits(row);
  return wanted.every((trait) => has.has(trait));
}

/** `?has=demo,letter` → ["demo", "letter"] (unknown values dropped, order kept, no repeats). */
export function parseTraitsParam(value: string | null): SchoolTrait[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((v) => v.trim()).filter(isSchoolTrait))];
}
