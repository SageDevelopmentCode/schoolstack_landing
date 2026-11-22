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
  const verb = next.kind === "social" ? "Log" : "Send";
  if (!next.dueAt) return `${verb} ${next.label.toLowerCase()} · ready`;
  return `${verb} ${next.label.toLowerCase()} · ${dueText(next.dueAt, now)}`;
}
