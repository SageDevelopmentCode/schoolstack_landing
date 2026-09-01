import type { SupabaseClient } from "@supabase/supabase-js";
import { isFamilyInSignupAudience } from "./audience";
import {
  CLASSROOM_SIGNUP_SELECT,
  mapClassroomSignupRow,
  type ClassroomSignupRow,
} from "./db-mapper";
import type { ClassroomSignup, ParentSignupAttentionItem } from "./types";

export async function loadParentSignupAttentionItems(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<ParentSignupAttentionItem[]> {
  const { data: signups, error: signupsError } = await admin
    .from("classroom_signups")
    .select(CLASSROOM_SIGNUP_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "open")
    .order("published_at", { ascending: false });

  if (signupsError) throw signupsError;

  const signupRows = (signups ?? []) as ClassroomSignupRow[];
  if (signupRows.length === 0) return [];

  const signupIds = signupRows.map((row) => String(row.id));
  const { data: responses, error: responsesError } = await admin
    .from("classroom_signup_responses")
    .select("signup_id, status")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .in("signup_id", signupIds);

  if (responsesError) throw responsesError;

  const respondedSignupIds = new Set(
    (responses ?? [])
      .filter((row) => row.status === "confirmed")
      .map((row) => String(row.signup_id)),
  );

  const items: ParentSignupAttentionItem[] = [];

  for (const row of signupRows) {
    const signup = mapClassroomSignupRow(row);
    if (respondedSignupIds.has(signup.id)) continue;
    const visible = await isFamilyInSignupAudience(admin, signup, familyId);
    if (!visible) continue;
    items.push({
      signupId: signup.id,
      teacherName: signup.teacherName,
      title: signup.title,
      classroomName: signup.classroomName,
    });
  }

  return items;
}

export async function getParentVisibleClassroomSignup(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
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

  const signup = mapClassroomSignupRow(data as ClassroomSignupRow);
  if (signup.status === "draft") return null;

  const visible = await isFamilyInSignupAudience(admin, signup, familyId);
  return visible ? signup : null;
}
