import type { SupabaseClient } from "@supabase/supabase-js";
import { isFamilyInSignupAudience } from "./audience";
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
  ClassroomSignupResponse,
  ParentClassroomSignupListItem,
  ParentClassroomSignupStudentOption,
  ParentClassroomSignupsPageBundle,
  ParentSignupAttentionItem,
} from "./types";

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

export async function loadParentClassroomSignupsPageData(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<ParentClassroomSignupListItem[]> {
  const { data: signups, error: signupsError } = await admin
    .from("classroom_signups")
    .select(CLASSROOM_SIGNUP_SELECT)
    .eq("organization_id", organizationId)
    .in("status", ["open", "closed"])
    .order("published_at", { ascending: false });

  if (signupsError) throw signupsError;

  const signupRows = (signups ?? []) as ClassroomSignupRow[];
  if (signupRows.length === 0) return [];

  const signupIds = signupRows.map((row) => String(row.id));
  const { data: responses, error: responsesError } = await admin
    .from("classroom_signup_responses")
    .select(CLASSROOM_SIGNUP_RESPONSE_SELECT)
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .in("signup_id", signupIds);

  if (responsesError) throw responsesError;

  const responseBySignupId = new Map(
    ((responses ?? []) as ClassroomSignupResponseRow[]).map((row) => {
      const response = mapClassroomSignupResponseRow(row);
      return [response.signupId, response] as const;
    }),
  );

  const items: ParentClassroomSignupListItem[] = [];

  for (const row of signupRows) {
    const signup = mapClassroomSignupRow(row);
    const visible = await isFamilyInSignupAudience(admin, signup, familyId);
    if (!visible) continue;

    const familyResponse = responseBySignupId.get(signup.id) ?? null;
    const hasConfirmed = familyResponse?.status === "confirmed";

    if (signup.status === "open") {
      items.push({
        signup,
        familyResponse: hasConfirmed ? familyResponse : null,
        listStatus: hasConfirmed ? "signed_up" : "needs_response",
      });
      continue;
    }

    if (signup.status === "closed" && hasConfirmed) {
      items.push({
        signup,
        familyResponse,
        listStatus: "closed",
      });
    }
  }

  return items;
}

export async function loadParentClassroomSignupsPageBundle(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  studentOptions: ParentClassroomSignupStudentOption[],
): Promise<ParentClassroomSignupsPageBundle> {
  const items = await loadParentClassroomSignupsPageData(
    admin,
    organizationId,
    familyId,
  );

  return {
    items,
    responsesBySignupId: {},
    studentOptions,
  };
}

export function classifyParentClassroomSignupListItem(
  signup: ClassroomSignup,
  familyResponse: ClassroomSignupResponse | null,
): ParentClassroomSignupListItem | null {
  const hasConfirmed = familyResponse?.status === "confirmed";

  if (signup.status === "open") {
    return {
      signup,
      familyResponse: hasConfirmed ? familyResponse : null,
      listStatus: hasConfirmed ? "signed_up" : "needs_response",
    };
  }

  if (signup.status === "closed" && hasConfirmed) {
    return {
      signup,
      familyResponse,
      listStatus: "closed",
    };
  }

  return null;
}
