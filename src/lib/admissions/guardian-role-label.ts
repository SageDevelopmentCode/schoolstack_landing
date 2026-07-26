export type GuardianRoleLabel = "primary" | "added";

export function getGuardianRoleLabel(input: {
  guardianId: string;
  primaryGuardianId: string | null;
  guardianIndex: number;
  totalGuardians: number;
}): GuardianRoleLabel | null {
  if (input.totalGuardians <= 1) {
    return null;
  }

  const primaryId = input.primaryGuardianId?.trim() || null;

  if (primaryId) {
    return input.guardianId === primaryId ? "primary" : "added";
  }

  return input.guardianIndex === 0 ? "primary" : "added";
}

export function guardianRoleLabelText(role: GuardianRoleLabel): string {
  switch (role) {
    case "primary":
      return "Primary contact";
    case "added":
      return "Added parent";
  }
}
