import type { SupabaseClient } from "@supabase/supabase-js";
import { countFamiliesForClassroomIds } from "@/lib/classroom-signups/audience";
import {
  formatEnrolledStudentFirstNames,
  listFamilyEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { colorForKey } from "./format";
import {
  resolveGuardianDisplayName,
  resolveGuardianProfilePhotoUrl,
  toMessageStudentRefs,
  toMessageStudentSummaries,
  type ParticipantDisplayContext,
} from "./mappers";
import { loadFamilyGuardianDisplayMaps } from "./threads";
import type { MessageContact } from "./types";

export type AdminBroadcastAudienceInput = {
  programIds?: string[];
  classroomIds?: string[];
  gradeValues?: string[];
  guardianIds?: string[];
};

export type AdminBroadcastAudiencePreview = {
  count: number;
  recipientNames: string[];
};

function uniqueStrings(values?: string[]): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

async function familyIdsForPrograms(
  admin: SupabaseClient,
  organizationId: string,
  programIds: string[],
): Promise<string[]> {
  if (programIds.length === 0) return [];

  const { data, error } = await admin
    .from("enrollments")
    .select("students!inner(family_id)")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("program_id", programIds);

  if (error) throw new Error(error.message);

  const familyIds = new Set<string>();
  for (const row of data ?? []) {
    const students = row.students as
      | { family_id?: string | null }
      | { family_id?: string | null }[]
      | null;
    const student = Array.isArray(students) ? students[0] : students;
    if (student?.family_id) {
      familyIds.add(String(student.family_id));
    }
  }

  return [...familyIds];
}

async function familyIdsForGrades(
  admin: SupabaseClient,
  organizationId: string,
  gradeValues: string[],
): Promise<string[]> {
  if (gradeValues.length === 0) return [];

  const { data: enrollmentRows, error: enrollmentError } = await admin
    .from("enrollments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled");

  if (enrollmentError) throw new Error(enrollmentError.message);

  const enrolledStudentIds = (enrollmentRows ?? [])
    .map((row) => (row.student_id ? String(row.student_id) : null))
    .filter((id): id is string => Boolean(id));

  if (enrolledStudentIds.length === 0) return [];

  const { data: students, error: studentsError } = await admin
    .from("students")
    .select("id, family_id, grade")
    .eq("organization_id", organizationId)
    .in("id", enrolledStudentIds)
    .in("grade", gradeValues);

  if (studentsError) throw new Error(studentsError.message);

  const familyIds = new Set<string>();
  for (const student of students ?? []) {
    if (student.family_id) {
      familyIds.add(String(student.family_id));
    }
  }

  return [...familyIds];
}

export function dedupeBroadcastGuardianContacts(
  contacts: MessageContact[],
): MessageContact[] {
  const byFamily = new Map<string, MessageContact>();
  const withoutFamily: MessageContact[] = [];

  for (const contact of contacts) {
    if (contact.kind !== "guardian" || !contact.guardianId) continue;
    const familyId = contact.familyId;
    if (!familyId) {
      withoutFamily.push(contact);
      continue;
    }
    if (!byFamily.has(familyId)) {
      byFamily.set(familyId, contact);
    }
  }

  const byGuardian = new Map<string, MessageContact>();
  for (const contact of [...byFamily.values(), ...withoutFamily]) {
    if (contact.guardianId && !byGuardian.has(contact.guardianId)) {
      byGuardian.set(contact.guardianId, contact);
    }
  }

  return [...byGuardian.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function pickGuardianIdForFamily(
  familyId: string,
  context: ParticipantDisplayContext,
): string | null {
  const primaryGuardianId = context.familyPrimaryGuardianIds.get(familyId);
  if (primaryGuardianId && context.guardians.has(primaryGuardianId)) {
    return primaryGuardianId;
  }

  const firstGuardianId = context.familyFirstGuardianIds.get(familyId);
  if (firstGuardianId && context.guardians.has(firstGuardianId)) {
    return firstGuardianId;
  }

  for (const [guardianId, guardian] of context.guardians) {
    if (guardian.familyId === familyId) {
      return guardianId;
    }
  }

  return null;
}

function buildGuardianContact(
  guardianId: string,
  context: ParticipantDisplayContext,
  enrolledStudentsByFamily: Map<string, AdminEnrolledStudentSummary[]>,
): MessageContact | null {
  const guardian = context.guardians.get(guardianId);
  const familyId = guardian?.familyId;
  if (!familyId) return null;

  const enrolledStudents = enrolledStudentsByFamily.get(familyId) ?? [];
  if (enrolledStudents.length === 0) return null;

  const name = resolveGuardianDisplayName(guardianId, context) ?? "Parent";
  const profilePhotoUrl =
    guardian?.profilePhotoUrl ??
    resolveGuardianProfilePhotoUrl(guardian?.profilePhotoUrl ?? null, enrolledStudents);

  return {
    key: `guardian:${guardianId}`,
    kind: "guardian",
    guardianId,
    familyId,
    name,
    subtitle: formatEnrolledStudentFirstNames(enrolledStudents),
    subtitleStudents: toMessageStudentRefs(enrolledStudents),
    subtitleStudentSummaries: toMessageStudentSummaries(enrolledStudents),
    color: colorForKey(guardianId),
    profilePhotoUrl,
  };
}

export async function resolveAdminBroadcastGuardians(
  admin: SupabaseClient,
  organizationId: string,
  input: AdminBroadcastAudienceInput,
): Promise<MessageContact[]> {
  const programIds = uniqueStrings(input.programIds);
  const classroomIds = uniqueStrings(input.classroomIds);
  const gradeValues = uniqueStrings(input.gradeValues);
  const manualGuardianIds = uniqueStrings(input.guardianIds);

  const [programFamilyIds, gradeFamilyIds, classroomFamilies] = await Promise.all([
    familyIdsForPrograms(admin, organizationId, programIds),
    familyIdsForGrades(admin, organizationId, gradeValues),
    classroomIds.length > 0
      ? countFamiliesForClassroomIds(admin, organizationId, classroomIds)
      : Promise.resolve({ familyIds: [] as string[], count: 0 }),
  ]);

  const presetFamilyIds = [
    ...new Set([
      ...programFamilyIds,
      ...gradeFamilyIds,
      ...classroomFamilies.familyIds,
    ]),
  ];

  const allFamilyIds = [...new Set(presetFamilyIds)];
  const manualFamilyIds =
    manualGuardianIds.length > 0
      ? await loadFamilyIdsForGuardians(admin, organizationId, manualGuardianIds)
      : [];

  const lookupFamilyIds = [...new Set([...allFamilyIds, ...manualFamilyIds])];
  if (lookupFamilyIds.length === 0 && manualGuardianIds.length === 0) {
    return [];
  }

  const [guardianMaps, enrolledStudentsByFamily] = await Promise.all([
    loadFamilyGuardianDisplayMaps(admin, organizationId, lookupFamilyIds),
    listFamilyEnrolledStudents(admin, organizationId, lookupFamilyIds),
  ]);

  const displayContext: ParticipantDisplayContext = {
    families: guardianMaps.families,
    staffMembers: new Map(),
    guardians: guardianMaps.guardians,
    familyPrimaryGuardianIds: guardianMaps.familyPrimaryGuardianIds,
    familyFirstGuardianIds: guardianMaps.familyFirstGuardianIds,
    familyEnrolledStudents: enrolledStudentsByFamily,
    schoolOfficeLabel: "",
    currentUserId: "",
  };

  const contacts: MessageContact[] = [];

  for (const familyId of presetFamilyIds) {
    const guardianId = pickGuardianIdForFamily(familyId, displayContext);
    if (!guardianId) continue;
    const contact = buildGuardianContact(
      guardianId,
      displayContext,
      enrolledStudentsByFamily,
    );
    if (contact) contacts.push(contact);
  }

  for (const guardianId of manualGuardianIds) {
    const contact = buildGuardianContact(
      guardianId,
      displayContext,
      enrolledStudentsByFamily,
    );
    if (contact) contacts.push(contact);
  }

  return dedupeBroadcastGuardianContacts(contacts);
}

async function loadFamilyIdsForGuardians(
  admin: SupabaseClient,
  organizationId: string,
  guardianIds: string[],
): Promise<string[]> {
  if (guardianIds.length === 0) return [];

  const { data, error } = await admin
    .from("guardians")
    .select("family_id")
    .eq("organization_id", organizationId)
    .in("id", guardianIds);

  if (error) throw new Error(error.message);

  return [
    ...new Set(
      (data ?? [])
        .map((row) => (row.family_id ? String(row.family_id) : null))
        .filter((familyId): familyId is string => Boolean(familyId)),
    ),
  ];
}

export function previewAdminBroadcastAudience(
  contacts: MessageContact[],
): AdminBroadcastAudiencePreview {
  return {
    count: contacts.length,
    recipientNames: contacts.map((contact) => contact.name),
  };
}
