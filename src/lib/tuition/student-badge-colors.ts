import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type StudentBadgeColors = {
  backgroundColor: string;
  color: string;
};

const PALETTE_LENGTH = 5;

export function buildStudentColorIndexMap(
  enrollmentIds: string[],
): Map<string, number> {
  const uniqueSorted = [...new Set(enrollmentIds)].sort();
  const map = new Map<string, number>();
  uniqueSorted.forEach((enrollmentId, index) => {
    map.set(enrollmentId, index % PALETTE_LENGTH);
  });
  return map;
}

export function getStudentBadgeColors(
  C: AdminThemeTokens,
  index: number,
): StudentBadgeColors {
  const palette: StudentBadgeColors[] = [
    { backgroundColor: C.accentLight, color: C.accent },
    { backgroundColor: C.successBg, color: C.success },
    { backgroundColor: C.infoBg, color: C.info },
    { backgroundColor: C.warningBg, color: C.warning },
    { backgroundColor: C.clayBg, color: C.clay },
  ];

  return palette[((index % PALETTE_LENGTH) + PALETTE_LENGTH) % PALETTE_LENGTH]!;
}
