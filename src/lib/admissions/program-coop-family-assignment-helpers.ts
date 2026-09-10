export type CoopFamilyNameMap = ReadonlyMap<string, string>;

export function isCoopFamilyAssigned(
  assignedFamilyIds: ReadonlyArray<string>,
  familyId: string,
): boolean {
  const trimmed = familyId.trim();
  if (!trimmed) return false;
  return assignedFamilyIds.some((id) => id === trimmed);
}

export function canAddCoopAssignedFamily(
  assignedFamilyIds: ReadonlyArray<string>,
  familyId: string,
  maxFamilies: number,
): boolean {
  const trimmed = familyId.trim();
  if (!trimmed) return false;
  if (assignedFamilyIds.length >= maxFamilies) return false;
  return !assignedFamilyIds.some((id) => id === trimmed);
}

export function formatCoopAssignedFamilyLabels(
  assignedFamilyIds: ReadonlyArray<string>,
  nameMap: CoopFamilyNameMap,
  emptyLabel = "Unassigned",
): string {
  if (assignedFamilyIds.length === 0) return emptyLabel;
  return assignedFamilyIds
    .map((familyId) => nameMap.get(familyId) ?? "Unknown family")
    .join(", ");
}
