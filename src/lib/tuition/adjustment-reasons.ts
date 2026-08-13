import type { TuitionOrgSettings } from "./types";

export const DEFAULT_ADJUSTMENT_REASONS = [
  "Sibling discount",
  "Financial aid",
  "Staff/faculty",
  "Custom arrangement",
] as const;

export const MAX_ADJUSTMENT_REASON_LENGTH = 80;

export type AdjustmentReasonValidationResult =
  | { ok: true; reasons: string[] }
  | { ok: false; error: string };

export function resolveAdjustmentReasons(settings: TuitionOrgSettings): string[] {
  if (settings.adjustmentReasons && settings.adjustmentReasons.length > 0) {
    return [...settings.adjustmentReasons];
  }
  return [...DEFAULT_ADJUSTMENT_REASONS];
}

export function normalizeAdjustmentReasons(reasons: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of reasons) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const capped =
      trimmed.length > MAX_ADJUSTMENT_REASON_LENGTH
        ? trimmed.slice(0, MAX_ADJUSTMENT_REASON_LENGTH)
        : trimmed;

    const key = capped.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(capped);
  }

  return normalized;
}

export function sanitizeAdjustmentReasonDraft(
  reasons: string[],
): AdjustmentReasonValidationResult {
  const normalized = normalizeAdjustmentReasons(reasons);

  if (normalized.length === 0) {
    return { ok: false, error: "Add at least one adjustment reason." };
  }

  for (const reason of reasons) {
    const trimmed = reason.trim();
    if (!trimmed) continue;
    if (trimmed.length > MAX_ADJUSTMENT_REASON_LENGTH) {
      return {
        ok: false,
        error: `Each reason must be ${MAX_ADJUSTMENT_REASON_LENGTH} characters or fewer.`,
      };
    }
  }

  return { ok: true, reasons: normalized };
}
