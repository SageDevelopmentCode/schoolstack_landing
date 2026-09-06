import type { SupabaseClient } from "@supabase/supabase-js";

export const PROGRAM_COOP_CURRICULUM_DISCUSSION_MAX_BODY_LENGTH = 4000;

export type ProgramCoopCurriculumDiscussionMessageRecord = {
  id: string;
  organizationId: string;
  programId: string;
  senderGuardianId: string;
  body: string;
  pageNumber: number | null;
  createdAt: string;
};

export type ProgramCoopCurriculumDiscussionMessage = ProgramCoopCurriculumDiscussionMessageRecord & {
  senderDisplayName: string;
  /** @deprecated Use senderDisplayName */
  senderLabel: string;
  familyName: string;
  guardianFirstName: string;
  guardianLastName: string;
  senderUserId: string | null;
  profilePhotoUrl: string | null;
};

type DiscussionMessageRow = {
  id: string;
  organization_id: string;
  program_id: string;
  sender_guardian_id: string;
  body: string;
  page_number: number | null;
  created_at: string;
};

type GuardianRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  family_id: string | null;
  profile_photo_url: string | null;
  user_id: string | null;
};

type FamilyRow = {
  id: string;
  name: string | null;
};

type ProgramStudentPhotoRow = {
  family_id: string | null;
  profile_photo_url: string | null;
  first_name: string | null;
};

export function validateProgramCoopCurriculumDiscussionBody(
  body: string,
): string | null {
  const trimmed = body.trim();
  if (!trimmed) {
    return "Message cannot be empty.";
  }
  if (trimmed.length > PROGRAM_COOP_CURRICULUM_DISCUSSION_MAX_BODY_LENGTH) {
    return `Message must be ${PROGRAM_COOP_CURRICULUM_DISCUSSION_MAX_BODY_LENGTH} characters or fewer.`;
  }
  return null;
}

export function formatCurriculumDiscussionFamilyName(input: {
  familyName?: string | null;
  guardianLastName?: string | null;
}): string {
  const named = input.familyName?.trim();
  if (named) return named;

  const lastName = input.guardianLastName?.trim();
  if (lastName) {
    return `The ${lastName} family`;
  }

  return "Family";
}

export function formatCurriculumDiscussionSenderDisplayName(input: {
  guardianFirstName?: string | null;
  guardianLastName?: string | null;
  familyName?: string | null;
}): string {
  const fullName = [input.guardianFirstName, input.guardianLastName]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) return fullName;

  const familyName = formatCurriculumDiscussionFamilyName({
    familyName: input.familyName,
    guardianLastName: input.guardianLastName,
  });

  if (familyName !== "Family") return familyName;

  return "Co-op parent";
}

/** @deprecated Use formatCurriculumDiscussionSenderDisplayName */
export function formatCurriculumDiscussionSenderLabel(input: {
  familyName: string;
  guardianFirstName: string;
}): string {
  return formatCurriculumDiscussionSenderDisplayName({
    guardianFirstName: input.guardianFirstName,
    familyName: input.familyName,
  });
}

export function resolveDiscussionProfilePhotoUrl(input: {
  guardianPhotoUrl?: string | null;
  familyStudentPhotoUrl?: string | null;
}): string | null {
  const guardianPhoto = input.guardianPhotoUrl?.trim();
  if (guardianPhoto) return guardianPhoto;

  const studentPhoto = input.familyStudentPhotoUrl?.trim();
  if (studentPhoto) return studentPhoto;

  return null;
}

function mapDiscussionMessageRecord(
  row: DiscussionMessageRow,
  display: {
    senderDisplayName: string;
    familyName: string;
    guardianFirstName: string;
    guardianLastName: string;
    senderUserId: string | null;
    profilePhotoUrl: string | null;
  },
): ProgramCoopCurriculumDiscussionMessage {
  return {
    id: row.id,
    organizationId: row.organization_id,
    programId: row.program_id,
    senderGuardianId: row.sender_guardian_id,
    body: row.body,
    pageNumber: row.page_number,
    createdAt: row.created_at,
    senderDisplayName: display.senderDisplayName,
    senderLabel: display.senderDisplayName,
    familyName: display.familyName,
    guardianFirstName: display.guardianFirstName,
    guardianLastName: display.guardianLastName,
    senderUserId: display.senderUserId,
    profilePhotoUrl: display.profilePhotoUrl,
  };
}

async function enrichDiscussionMessagesWithSenderDisplay(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    messages: DiscussionMessageRow[];
  },
): Promise<ProgramCoopCurriculumDiscussionMessage[]> {
  if (input.messages.length === 0) return [];

  const guardianIds = [
    ...new Set(input.messages.map((message) => message.sender_guardian_id)),
  ];

  const { data: guardianRows, error: guardianError } = await admin
    .from("guardians")
    .select("id, first_name, last_name, family_id, profile_photo_url, user_id")
    .eq("organization_id", input.organizationId)
    .in("id", guardianIds);

  if (guardianError) throw new Error(guardianError.message);

  const guardians = (guardianRows ?? []) as GuardianRow[];
  const guardiansById = new Map(guardians.map((guardian) => [guardian.id, guardian]));
  const familyIds = [
    ...new Set(
      guardians
        .map((guardian) => guardian.family_id)
        .filter((familyId): familyId is string => Boolean(familyId)),
    ),
  ];

  const [familiesResult, studentPhotosResult] = await Promise.all([
    familyIds.length > 0
      ? admin
          .from("families")
          .select("id, name")
          .eq("organization_id", input.organizationId)
          .in("id", familyIds)
      : Promise.resolve({ data: [], error: null }),
    familyIds.length > 0
      ? admin
          .from("enrollments")
          .select(
            "students!inner(family_id, profile_photo_url, first_name)",
          )
          .eq("organization_id", input.organizationId)
          .eq("program_id", input.programId)
          .eq("status", "enrolled")
          .in("students.family_id", familyIds)
          .order("first_name", {
            referencedTable: "students",
            ascending: true,
          })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (familiesResult.error) throw new Error(familiesResult.error.message);
  if (studentPhotosResult.error) throw new Error(studentPhotosResult.error.message);

  const familiesById = new Map(
    ((familiesResult.data ?? []) as FamilyRow[]).map((family) => [family.id, family]),
  );

  const studentPhotoByFamilyId = new Map<string, string>();
  for (const row of (studentPhotosResult.data ?? []) as Array<{
    students: ProgramStudentPhotoRow | ProgramStudentPhotoRow[] | null;
  }>) {
    const student = Array.isArray(row.students) ? row.students[0] : row.students;
    const familyId = student?.family_id ? String(student.family_id) : null;
    const photoUrl = student?.profile_photo_url?.trim();
    if (!familyId || !photoUrl || studentPhotoByFamilyId.has(familyId)) continue;
    studentPhotoByFamilyId.set(familyId, photoUrl);
  }

  return input.messages.map((row) => {
    const guardian = guardiansById.get(row.sender_guardian_id);
    const familyId = guardian?.family_id ? String(guardian.family_id) : null;
    const family = familyId ? familiesById.get(familyId) : null;
    const guardianFirstName = guardian?.first_name?.trim() ?? "";
    const guardianLastName = guardian?.last_name?.trim() ?? "";
    const familyName = formatCurriculumDiscussionFamilyName({
      familyName: family?.name,
      guardianLastName,
    });
    const senderDisplayName = formatCurriculumDiscussionSenderDisplayName({
      guardianFirstName,
      guardianLastName,
      familyName: family?.name,
    });

    return mapDiscussionMessageRecord(row, {
      senderDisplayName,
      familyName,
      guardianFirstName,
      guardianLastName,
      senderUserId: guardian?.user_id?.trim() || null,
      profilePhotoUrl: resolveDiscussionProfilePhotoUrl({
        guardianPhotoUrl: guardian?.profile_photo_url,
        familyStudentPhotoUrl: familyId ? studentPhotoByFamilyId.get(familyId) : null,
      }),
    });
  });
}

export async function listProgramCoopCurriculumDiscussionMessages(
  admin: SupabaseClient,
  input: { organizationId: string; programId: string },
): Promise<ProgramCoopCurriculumDiscussionMessage[]> {
  const organizationId = input.organizationId.trim();
  const programId = input.programId.trim();
  if (!organizationId || !programId) {
    throw new Error("organizationId and programId are required.");
  }

  const { data, error } = await admin
    .from("program_coop_curriculum_discussion_messages")
    .select(
      "id, organization_id, program_id, sender_guardian_id, body, page_number, created_at",
    )
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return enrichDiscussionMessagesWithSenderDisplay(admin, {
    organizationId,
    programId,
    messages: (data ?? []) as DiscussionMessageRow[],
  });
}

async function guardianIsEnrolledInProgram(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    guardianId: string;
  },
): Promise<boolean> {
  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .select("id, family_id")
    .eq("organization_id", input.organizationId)
    .eq("id", input.guardianId)
    .maybeSingle();

  if (guardianError) throw new Error(guardianError.message);
  if (!guardian?.family_id) return false;

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("id, students!inner(family_id)")
    .eq("organization_id", input.organizationId)
    .eq("program_id", input.programId)
    .eq("status", "enrolled")
    .eq("students.family_id", guardian.family_id)
    .limit(1)
    .maybeSingle();

  if (enrollmentError) throw new Error(enrollmentError.message);
  return Boolean(enrollment?.id);
}

export async function postProgramCoopCurriculumDiscussionMessage(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    senderGuardianId: string;
    body: string;
    pageNumber?: number | null;
  },
): Promise<ProgramCoopCurriculumDiscussionMessage> {
  const organizationId = input.organizationId.trim();
  const programId = input.programId.trim();
  const senderGuardianId = input.senderGuardianId.trim();
  const bodyError = validateProgramCoopCurriculumDiscussionBody(input.body);
  if (bodyError) {
    throw new Error(bodyError);
  }

  if (!organizationId || !programId || !senderGuardianId) {
    throw new Error("organizationId, programId, and senderGuardianId are required.");
  }

  const enrolled = await guardianIsEnrolledInProgram(admin, {
    organizationId,
    programId,
    guardianId: senderGuardianId,
  });
  if (!enrolled) {
    throw new Error("You must be enrolled in this co-op to post.");
  }

  const pageNumber =
    typeof input.pageNumber === "number" && input.pageNumber > 0
      ? Math.floor(input.pageNumber)
      : null;

  const { data, error } = await admin
    .from("program_coop_curriculum_discussion_messages")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      sender_guardian_id: senderGuardianId,
      body: input.body.trim(),
      page_number: pageNumber,
    })
    .select(
      "id, organization_id, program_id, sender_guardian_id, body, page_number, created_at",
    )
    .single();

  if (error) throw new Error(error.message);

  const [enriched] = await enrichDiscussionMessagesWithSenderDisplay(admin, {
    organizationId,
    programId,
    messages: [data as DiscussionMessageRow],
  });

  if (!enriched) {
    throw new Error("Failed to load posted message.");
  }

  return enriched;
}
