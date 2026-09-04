import type { SupabaseClient } from "@supabase/supabase-js";
import { loadFamilyGuardianDisplayMaps } from "@/lib/messages/threads";

export type ProgramCoopLearner = {
  studentId: string;
  firstName: string;
  grade: string | null;
  profilePhotoUrl: string | null;
};

export type ProgramCoopFamily = {
  familyId: string;
  familyName: string;
  isCurrentFamily: boolean;
  contactGuardianId: string | null;
  learners: ProgramCoopLearner[];
};

type CoopEnrollmentRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  profilePhotoUrl: string | null;
  familyId: string;
  familyName: string | null;
};

function normalizeProfilePhotoUrl(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatLearnerGradeLine(learner: ProgramCoopLearner): string {
  if (!learner.grade?.trim()) {
    return learner.firstName;
  }
  const grade = learner.grade.trim();
  return `${learner.firstName} · Grade ${grade}`;
}

export function formatProgramCoopLearnerLine(learner: ProgramCoopLearner): string {
  return formatLearnerGradeLine(learner);
}

function familyDisplayName(row: CoopEnrollmentRow): string {
  const named = row.familyName?.trim();
  if (named) return named;

  const lastName = row.lastName.trim();
  if (lastName) {
    return `The ${lastName} family`;
  }

  return "Family";
}

export function groupEnrollmentsIntoCoopFamilies(
  rows: CoopEnrollmentRow[],
  currentFamilyId: string,
): ProgramCoopFamily[] {
  const byFamilyId = new Map<string, ProgramCoopFamily>();

  for (const row of rows) {
    const existing = byFamilyId.get(row.familyId);
    const learner: ProgramCoopLearner = {
      studentId: row.studentId,
      firstName: row.firstName.trim() || "Learner",
      grade: row.grade?.trim() ? row.grade.trim() : null,
      profilePhotoUrl: row.profilePhotoUrl,
    };

    if (existing) {
      if (!existing.learners.some((entry) => entry.studentId === learner.studentId)) {
        existing.learners.push(learner);
      }
      continue;
    }

    byFamilyId.set(row.familyId, {
      familyId: row.familyId,
      familyName: familyDisplayName(row),
      isCurrentFamily: row.familyId === currentFamilyId,
      contactGuardianId: null,
      learners: [learner],
    });
  }

  const families = [...byFamilyId.values()].map((family) => ({
    ...family,
    learners: [...family.learners].sort((a, b) =>
      a.firstName.localeCompare(b.firstName),
    ),
  }));

  return families.sort((a, b) => {
    if (a.isCurrentFamily !== b.isCurrentFamily) {
      return a.isCurrentFamily ? -1 : 1;
    }
    return a.familyName.localeCompare(b.familyName);
  });
}

export function attachContactGuardiansToCoopFamilies(
  families: ProgramCoopFamily[],
  guardianMaps: {
    familyPrimaryGuardianIds: Map<string, string>;
    familyFirstGuardianIds: Map<string, string>;
  },
): ProgramCoopFamily[] {
  return families.map((family) => ({
    ...family,
    contactGuardianId: family.isCurrentFamily
      ? null
      : guardianMaps.familyPrimaryGuardianIds.get(family.familyId) ??
        guardianMaps.familyFirstGuardianIds.get(family.familyId) ??
        null,
  }));
}

export async function listProgramCoopFamilies(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    currentFamilyId: string;
  },
): Promise<ProgramCoopFamily[]> {
  const { data, error } = await admin
    .from("enrollments")
    .select(
      `
      students!inner (
        id,
        first_name,
        last_name,
        grade,
        family_id,
        profile_photo_url,
        families (
          name
        )
      )
    `,
    )
    .eq("organization_id", input.organizationId)
    .eq("program_id", input.programId)
    .eq("status", "enrolled");

  if (error) throw error;

  const rows: CoopEnrollmentRow[] = [];

  for (const enrollment of data ?? []) {
    const student = enrollment.students as
      | {
          id?: string;
          first_name?: string;
          last_name?: string;
          grade?: string | null;
          family_id?: string;
          profile_photo_url?: string | null;
          families?:
            | { name?: string | null }
            | { name?: string | null }[]
            | null;
        }
      | {
          id?: string;
          first_name?: string;
          last_name?: string;
          grade?: string | null;
          family_id?: string;
          profile_photo_url?: string | null;
          families?:
            | { name?: string | null }
            | { name?: string | null }[]
            | null;
        }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    if (!studentRow?.id || !studentRow.family_id) continue;

    const family = studentRow.families;
    const familyRow = Array.isArray(family) ? family[0] : family;

    rows.push({
      studentId: String(studentRow.id),
      firstName: String(studentRow.first_name ?? ""),
      lastName: String(studentRow.last_name ?? ""),
      grade: studentRow.grade ? String(studentRow.grade) : null,
      profilePhotoUrl: normalizeProfilePhotoUrl(studentRow.profile_photo_url),
      familyId: String(studentRow.family_id),
      familyName: familyRow?.name ? String(familyRow.name) : null,
    });
  }

  const families = groupEnrollmentsIntoCoopFamilies(rows, input.currentFamilyId);
  const familyIds = families.map((family) => family.familyId);
  if (familyIds.length === 0) {
    return families;
  }

  const guardianMaps = await loadFamilyGuardianDisplayMaps(
    admin,
    input.organizationId,
    familyIds,
  );

  return attachContactGuardiansToCoopFamilies(families, guardianMaps);
}
