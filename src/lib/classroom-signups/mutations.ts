import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countAssignedFamiliesForTeacher,
  countFamiliesForClassroomIds,
  resolveAudienceFamilyIds,
} from "./audience";
import {
  CLASSROOM_SIGNUP_RESPONSE_SELECT,
  CLASSROOM_SIGNUP_SELECT,
  mapClassroomSignupResponseRow,
  mapClassroomSignupRow,
  type ClassroomSignupResponseRow,
  type ClassroomSignupRow,
} from "./db-mapper";
import type {
  ClassroomSignup,
  ClassroomSignupDraft,
  ClassroomSignupResponse,
  ClassroomSignupStatus,
} from "./types";

export type PublishClassroomSignupInput = Omit<
  ClassroomSignupDraft,
  "id" | "status" | "familyCount"
> & {
  status?: "open" | "draft";
};

export async function publishClassroomSignup(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  input: PublishClassroomSignupInput,
): Promise<ClassroomSignup> {
  const now = new Date().toISOString();
  const status = input.status ?? "open";
  const classroomIds = input.classroomIds ?? [];
  const draftSignup = {
    organizationId,
    createdByStaffMemberId: staffMemberId,
    audience: input.audience,
    classroomId: input.classroomId,
    classroomIds,
  };

  let familyCount = 0;
  if (status === "open") {
    if (input.audience === "assigned") {
      familyCount = await countAssignedFamiliesForTeacher(
        admin,
        organizationId,
        staffMemberId,
      );
    } else if (input.audience === "classrooms" && classroomIds.length > 0) {
      const result = await countFamiliesForClassroomIds(
        admin,
        organizationId,
        classroomIds,
      );
      familyCount = result.count;
    } else if (input.classroomId) {
      const familyIds = await resolveAudienceFamilyIds(admin, {
        ...draftSignup,
        organizationId,
        createdByStaffMemberId: staffMemberId,
      });
      familyCount = familyIds.length;
    }
  }

  let config = input.config ?? {};
  if (input.audience === "classrooms" && classroomIds.length > 0) {
    const audienceClassroomNames = await fetchClassroomNames(
      admin,
      organizationId,
      classroomIds,
    );
    config = {
      ...config,
      audienceClassroomNames,
    };
  }

  const { data, error } = await admin
    .from("classroom_signups")
    .insert({
      organization_id: organizationId,
      created_by_staff_member_id: staffMemberId,
      title: input.title.trim(),
      description: input.description.trim(),
      signup_type: input.signupType,
      audience: input.audience,
      classroom_id: input.audience === "classroom" ? input.classroomId : null,
      classroom_ids: input.audience === "classrooms" ? classroomIds : [],
      family_count: familyCount,
      status,
      response_deadline: input.responseDeadline,
      config,
      published_at: status === "open" ? now : null,
      closed_at: null,
    })
    .select(CLASSROOM_SIGNUP_SELECT)
    .single();

  if (error) throw error;
  return mapClassroomSignupRow(data as ClassroomSignupRow);
}

async function fetchClassroomNames(
  admin: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<string[]> {
  if (classroomIds.length === 0) return [];

  const { data, error } = await admin
    .from("classrooms")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", classroomIds);

  if (error) throw error;

  const nameById = new Map(
    (data ?? []).map((row) => [String(row.id), String(row.name ?? "Classroom")]),
  );

  return classroomIds
    .map((id) => nameById.get(id))
    .filter((name): name is string => Boolean(name));
}

export type UpdateClassroomSignupInput = {
  title?: string;
  description?: string;
  responseDeadline?: string | null;
  signupType?: ClassroomSignupDraft["signupType"];
  audience?: ClassroomSignupDraft["audience"];
  classroomId?: string | null;
  classroomIds?: string[];
  config?: ClassroomSignupDraft["config"];
  status?: "open" | "draft";
};

async function resolveSignupFamilyCount(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  input: {
    audience: ClassroomSignupDraft["audience"];
    classroomId: string | null;
    classroomIds: string[];
    status: ClassroomSignupStatus;
  },
): Promise<number> {
  if (input.status !== "open") return 0;

  if (input.audience === "assigned") {
    return countAssignedFamiliesForTeacher(admin, organizationId, staffMemberId);
  }

  if (input.audience === "classrooms" && input.classroomIds.length > 0) {
    const result = await countFamiliesForClassroomIds(
      admin,
      organizationId,
      input.classroomIds,
    );
    return result.count;
  }

  if (input.classroomId) {
    const familyIds = await resolveAudienceFamilyIds(admin, {
      organizationId,
      createdByStaffMemberId: staffMemberId,
      audience: input.audience,
      classroomId: input.classroomId,
      classroomIds: input.classroomIds,
    });
    return familyIds.length;
  }

  return 0;
}

export async function updateClassroomSignup(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  signupId: string,
  input: UpdateClassroomSignupInput,
  options: { safeFieldsOnly: boolean },
): Promise<ClassroomSignup> {
  const { data: existingRow, error: loadError } = await admin
    .from("classroom_signups")
    .select(CLASSROOM_SIGNUP_SELECT)
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", signupId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existingRow) {
    throw new Error("Signup not found.");
  }

  const existing = mapClassroomSignupRow(existingRow as ClassroomSignupRow);
  const now = new Date().toISOString();

  if (options.safeFieldsOnly) {
    const { data, error } = await admin
      .from("classroom_signups")
      .update({
        title: input.title?.trim() ?? existing.title,
        description: input.description?.trim() ?? existing.description,
        response_deadline:
          input.responseDeadline !== undefined
            ? input.responseDeadline
            : existing.responseDeadline,
        updated_at: now,
      })
      .eq("organization_id", organizationId)
      .eq("created_by_staff_member_id", staffMemberId)
      .eq("id", signupId)
      .select(CLASSROOM_SIGNUP_SELECT)
      .single();

    if (error) throw error;
    return mapClassroomSignupRow(data as ClassroomSignupRow);
  }

  const audience = input.audience ?? existing.audience;
  const classroomIds = input.classroomIds ?? existing.classroomIds;
  const classroomId =
    input.classroomId !== undefined
      ? input.classroomId
      : audience === "classroom"
        ? existing.classroomId
        : null;
  const nextStatus = input.status ?? existing.status;

  let config = input.config ?? existing.config;
  if (audience === "classrooms" && classroomIds.length > 0) {
    const audienceClassroomNames = await fetchClassroomNames(
      admin,
      organizationId,
      classroomIds,
    );
    config = {
      ...config,
      audienceClassroomNames,
    };
  }

  const familyCount = await resolveSignupFamilyCount(
    admin,
    organizationId,
    staffMemberId,
    {
      audience,
      classroomId,
      classroomIds,
      status: nextStatus,
    },
  );

  const wasDraft = existing.status === "draft";
  const publishing = wasDraft && nextStatus === "open";

  const { data, error } = await admin
    .from("classroom_signups")
    .update({
      title: input.title?.trim() ?? existing.title,
      description: input.description?.trim() ?? existing.description,
      signup_type: input.signupType ?? existing.signupType,
      audience,
      classroom_id: audience === "classroom" ? classroomId : null,
      classroom_ids: audience === "classrooms" ? classroomIds : [],
      family_count: familyCount,
      status: nextStatus,
      response_deadline:
        input.responseDeadline !== undefined
          ? input.responseDeadline
          : existing.responseDeadline,
      config,
      published_at: publishing ? now : existing.publishedAt,
      updated_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", signupId)
    .select(CLASSROOM_SIGNUP_SELECT)
    .single();

  if (error) throw error;
  return mapClassroomSignupRow(data as ClassroomSignupRow);
}

export async function closeClassroomSignup(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  signupId: string,
): Promise<ClassroomSignup> {
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("classroom_signups")
    .update({
      status: "closed",
      closed_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", signupId)
    .select(CLASSROOM_SIGNUP_SELECT)
    .single();

  if (error) throw error;
  return mapClassroomSignupRow(data as ClassroomSignupRow);
}

export type UpsertClassroomSignupResponseInput = {
  organizationId: string;
  signupId: string;
  familyId: string;
  studentId: string;
  selectedSlotIds: string[];
  selectedRoleIds: string[];
  note: string | null;
};

export async function upsertClassroomSignupResponse(
  admin: SupabaseClient,
  input: UpsertClassroomSignupResponseInput,
): Promise<ClassroomSignupResponse> {
  const { data, error } = await admin
    .from("classroom_signup_responses")
    .upsert(
      {
        organization_id: input.organizationId,
        signup_id: input.signupId,
        family_id: input.familyId,
        student_id: input.studentId,
        selected_slot_ids: input.selectedSlotIds,
        selected_role_ids: input.selectedRoleIds,
        note: input.note,
        status: "confirmed",
      },
      { onConflict: "signup_id,family_id" },
    )
    .select(CLASSROOM_SIGNUP_RESPONSE_SELECT)
    .single();

  if (error) throw error;
  return mapClassroomSignupResponseRow(data as ClassroomSignupResponseRow);
}

export async function withdrawClassroomSignupResponse(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
  familyId: string,
): Promise<ClassroomSignupResponse | null> {
  const { data, error } = await admin
    .from("classroom_signup_responses")
    .update({ status: "withdrawn" })
    .eq("organization_id", organizationId)
    .eq("signup_id", signupId)
    .eq("family_id", familyId)
    .select(CLASSROOM_SIGNUP_RESPONSE_SELECT)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapClassroomSignupResponseRow(data as ClassroomSignupResponseRow);
}
