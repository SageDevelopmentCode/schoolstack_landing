import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CLASSROOM_SIGNUP_RESPONSE_SELECT,
  CLASSROOM_SIGNUP_SELECT,
  mapClassroomSignupResponseRow,
  mapClassroomSignupRow,
  type ClassroomSignupResponseRow,
  type ClassroomSignupRow,
} from "./db-mapper";
import type { ClassroomSignup, ClassroomSignupResponse } from "./types";

export async function listTeacherClassroomSignups(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<ClassroomSignup[]> {
  const { data, error } = await admin
    .from("classroom_signups")
    .select(CLASSROOM_SIGNUP_SELECT)
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ClassroomSignupRow[]).map(mapClassroomSignupRow);
}

export async function getTeacherClassroomSignupById(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  signupId: string,
): Promise<ClassroomSignup | null> {
  const { data, error } = await admin
    .from("classroom_signups")
    .select(CLASSROOM_SIGNUP_SELECT)
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", signupId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapClassroomSignupRow(data as ClassroomSignupRow);
}

export async function getClassroomSignupById(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
): Promise<ClassroomSignup | null> {
  const { data, error } = await admin
    .from("classroom_signups")
    .select(CLASSROOM_SIGNUP_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", signupId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapClassroomSignupRow(data as ClassroomSignupRow);
}

export async function listClassroomSignupResponses(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
): Promise<ClassroomSignupResponse[]> {
  const { data, error } = await admin
    .from("classroom_signup_responses")
    .select(CLASSROOM_SIGNUP_RESPONSE_SELECT)
    .eq("organization_id", organizationId)
    .eq("signup_id", signupId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ClassroomSignupResponseRow[]).map(
    mapClassroomSignupResponseRow,
  );
}

export async function listClassroomSignupResponsesBySignupIds(
  admin: SupabaseClient,
  organizationId: string,
  signupIds: string[],
): Promise<Record<string, ClassroomSignupResponse[]>> {
  if (signupIds.length === 0) return {};

  const { data, error } = await admin
    .from("classroom_signup_responses")
    .select(CLASSROOM_SIGNUP_RESPONSE_SELECT)
    .eq("organization_id", organizationId)
    .in("signup_id", signupIds);

  if (error) throw error;

  const map: Record<string, ClassroomSignupResponse[]> = {};
  for (const row of (data ?? []) as ClassroomSignupResponseRow[]) {
    const response = mapClassroomSignupResponseRow(row);
    if (!map[response.signupId]) map[response.signupId] = [];
    map[response.signupId].push(response);
  }
  return map;
}

export async function getFamilyClassroomSignupResponse(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
  familyId: string,
): Promise<ClassroomSignupResponse | null> {
  const { data, error } = await admin
    .from("classroom_signup_responses")
    .select(CLASSROOM_SIGNUP_RESPONSE_SELECT)
    .eq("organization_id", organizationId)
    .eq("signup_id", signupId)
    .eq("family_id", familyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapClassroomSignupResponseRow(data as ClassroomSignupResponseRow);
}
