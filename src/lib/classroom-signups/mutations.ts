import type { SupabaseClient } from "@supabase/supabase-js";
import { countAssignedFamiliesForTeacher, resolveAudienceFamilyIds } from "./audience";
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
  const draftSignup = {
    organizationId,
    createdByStaffMemberId: staffMemberId,
    audience: input.audience,
    classroomId: input.classroomId,
  };

  let familyCount = 0;
  if (status === "open") {
    if (input.audience === "assigned") {
      familyCount = await countAssignedFamiliesForTeacher(
        admin,
        organizationId,
        staffMemberId,
      );
    } else if (input.classroomId) {
      const familyIds = await resolveAudienceFamilyIds(admin, {
        ...draftSignup,
        organizationId,
        createdByStaffMemberId: staffMemberId,
      });
      familyCount = familyIds.length;
    }
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
      classroom_id: input.classroomId,
      family_count: familyCount,
      status,
      response_deadline: input.responseDeadline,
      config: input.config ?? {},
      published_at: status === "open" ? now : null,
      closed_at: null,
    })
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
