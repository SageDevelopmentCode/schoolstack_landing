const DEFAULT_MAX_NAMES = 3;
const DEFAULT_MAX_LENGTH = 120;

export type FormatBroadcastRecipientSummaryOptions = {
  maxNames?: number;
  maxLength?: number;
};

export function formatBroadcastRecipientSummary(
  names: string[],
  options?: FormatBroadcastRecipientSummaryOptions,
): string {
  const trimmed = names.map((name) => name.trim()).filter(Boolean);
  if (trimmed.length === 0) return "";

  const maxNames = options?.maxNames ?? DEFAULT_MAX_NAMES;
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH;

  let summary = "";
  if (trimmed.length === 1) {
    summary = trimmed[0]!;
  } else if (trimmed.length === 2) {
    summary = `${trimmed[0]} and ${trimmed[1]}`;
  } else if (trimmed.length <= maxNames) {
    const last = trimmed[trimmed.length - 1];
    const rest = trimmed.slice(0, -1);
    summary = `${rest.join(", ")}, and ${last}`;
  } else {
    const shown = trimmed.slice(0, maxNames);
    const others = trimmed.length - maxNames;
    summary = `${shown.join(", ")}, and ${others} other${others === 1 ? "" : "s"}`;
  }

  if (summary.length <= maxLength) {
    return summary;
  }

  return `${summary.slice(0, maxLength - 1).trimEnd()}…`;
}
