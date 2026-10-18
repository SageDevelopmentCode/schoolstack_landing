export type DemoTimezoneOption = {
  value: string;
  label: string;
};

/** US-focused zones for demo scheduling display (matches org admin picker). */
export const DEMO_DISPLAY_TIMEZONE_OPTIONS: readonly DemoTimezoneOption[] = [
  { value: "America/New_York", label: "Eastern — New York" },
  { value: "America/Chicago", label: "Central — Chicago" },
  { value: "America/Denver", label: "Mountain — Denver" },
  { value: "America/Phoenix", label: "Arizona — Phoenix" },
  { value: "America/Los_Angeles", label: "Pacific — Los Angeles" },
  { value: "America/Anchorage", label: "Alaska — Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii — Honolulu" },
];

export function isValidIanaTimezone(timezone: string): boolean {
  const trimmed = timezone.trim();
  if (!trimmed) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: trimmed });
    return true;
  } catch {
    return false;
  }
}

export function resolveDemoDisplayTimezoneOptions(
  browserTimezone: string,
): DemoTimezoneOption[] {
  const browser = browserTimezone.trim();
  const base = [...DEMO_DISPLAY_TIMEZONE_OPTIONS];
  if (!browser || !isValidIanaTimezone(browser)) {
    return base;
  }
  if (base.some((opt) => opt.value === browser)) {
    return base;
  }
  return [{ value: browser, label: `Your timezone — ${browser}` }, ...base];
}

export function detectBrowserTimezone(fallback = "America/Chicago"): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && isValidIanaTimezone(tz) ? tz : fallback;
  } catch {
    return fallback;
  }
}
