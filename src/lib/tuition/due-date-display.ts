export type DueCountdownUrgency = "overdue" | "urgent" | "soon" | "normal";

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function todayUtcDate(todayIso?: string): Date {
  if (todayIso) return parseIsoDate(todayIso);
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function formatBillingDueDate(iso: string): string {
  const date = parseIsoDate(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function daysUntilDue(iso: string, todayIso?: string): number {
  const due = parseIsoDate(iso);
  const today = todayUtcDate(todayIso);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((due.getTime() - today.getTime()) / msPerDay);
}

export function formatDueCountdown(
  iso: string,
  todayIso?: string,
): { label: string; urgency: DueCountdownUrgency } {
  const days = daysUntilDue(iso, todayIso);

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      label: overdueDays === 1 ? "1 day overdue" : `${overdueDays} days overdue`,
      urgency: "overdue",
    };
  }

  if (days === 0) {
    return { label: "Due today", urgency: "overdue" };
  }

  if (days <= 7) {
    return {
      label: days === 1 ? "1 day remaining" : `${days} days remaining`,
      urgency: "urgent",
    };
  }

  if (days <= 30) {
    return { label: `${days} days remaining`, urgency: "soon" };
  }

  return { label: `${days} days remaining`, urgency: "normal" };
}
