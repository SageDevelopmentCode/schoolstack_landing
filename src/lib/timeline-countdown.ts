export type PhaseCountdownStatus = "upcoming" | "in_progress" | "complete";

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function parseDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

function formatTargetDate(endDate: string) {
  return parseDate(endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getPhaseCountdown(
  startDate: string,
  endDate: string,
  now = new Date(),
): { status: PhaseCountdownStatus; label: string; compactLabel: string } {
  const today = startOfDay(now);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const targetDate = formatTargetDate(endDate);

  if (today > end) {
    return { status: "complete", label: "Complete", compactLabel: "done" };
  }

  if (today >= start && today <= end) {
    return {
      status: "in_progress",
      label: `Target · ${targetDate}`,
      compactLabel: targetDate,
    };
  }

  return {
    status: "upcoming",
    label: `Target · ${targetDate}`,
    compactLabel: targetDate,
  };
}
