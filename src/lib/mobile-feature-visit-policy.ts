export const MAX_MOBILE_FEATURE_KEY_LENGTH = 80;

export function normalizeMobileFeatureKey(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed.length > MAX_MOBILE_FEATURE_KEY_LENGTH) {
    return null;
  }
  return trimmed;
}

export function shouldRecordMobileFeatureVisit(input: {
  isPreview: boolean;
  actorType: "parent" | "teacher" | "school_admin" | "platform_admin";
}): boolean {
  if (input.isPreview) {
    return false;
  }
  return input.actorType !== "platform_admin";
}
