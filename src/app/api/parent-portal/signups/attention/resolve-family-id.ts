export type ResolveSignupAttentionFamilyIdResult =
  | { familyId: string }
  | { error: "forbidden" };

export function resolveSignupAttentionFamilyId(
  familyIds: string[],
  requestedFamilyId: string,
): ResolveSignupAttentionFamilyIdResult {
  if (requestedFamilyId) {
    if (!familyIds.includes(requestedFamilyId)) {
      return { error: "forbidden" };
    }
    return { familyId: requestedFamilyId };
  }

  return { familyId: familyIds[0] ?? "" };
}
