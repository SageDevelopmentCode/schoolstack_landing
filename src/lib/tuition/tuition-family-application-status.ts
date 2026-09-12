export type TuitionFamilyApplicationRef = {
  status: string;
};

export type TuitionFamilyApplicationRow = {
  familyId: string | null;
  primaryGuardianId: string | null;
  status: string;
};

export function indexApplicationsByFamilyId(input: {
  applications: TuitionFamilyApplicationRow[];
  guardianIdToFamilyId: Map<string, string>;
  familyIds: Set<string>;
}): Map<string, TuitionFamilyApplicationRef[]> {
  const applicationsByFamilyId = new Map<string, TuitionFamilyApplicationRef[]>();

  for (const application of input.applications) {
    const familyId =
      application.familyId && input.familyIds.has(application.familyId)
        ? application.familyId
        : application.primaryGuardianId
          ? input.guardianIdToFamilyId.get(application.primaryGuardianId)
          : undefined;

    if (!familyId || !input.familyIds.has(familyId)) continue;

    const existing = applicationsByFamilyId.get(familyId) ?? [];
    existing.push({ status: application.status });
    applicationsByFamilyId.set(familyId, existing);
  }

  return applicationsByFamilyId;
}

export function familyHasWithdrawnApplication(
  applications: TuitionFamilyApplicationRef[],
): boolean {
  if (!applications.some((application) => application.status === "withdrawn")) {
    return false;
  }

  return !applications.some((application) => application.status === "enrolled");
}
