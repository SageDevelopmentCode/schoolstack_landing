import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getParentCommitteeWorkspace,
  listBrowsableCommitteesForParent,
  listParentCommitteeMemberships,
} from "./parent-committees";

export type ResolvedTeacherStaff = {
  id: string;
  displayName: string;
  email: string;
};

export async function resolveTeacherStaffForOrg(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  fallbackEmail = "",
): Promise<ResolvedTeacherStaff> {
  const { data: staffMember, error } = await supabase
    .from("staff_members")
    .select("id, first_name, last_name, email")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!staffMember) {
    throw new Error("Staff profile not found for this school.");
  }

  const displayName =
    [staffMember.first_name, staffMember.last_name].filter(Boolean).join(" ").trim() ||
    String(staffMember.email ?? fallbackEmail) ||
    "Staff member";

  return {
    id: String(staffMember.id),
    displayName,
    email: String(staffMember.email ?? fallbackEmail).trim(),
  };
}

export const listBrowsableCommitteesForTeacher = listBrowsableCommitteesForParent;
export const listTeacherCommitteeMemberships = listParentCommitteeMemberships;
export const getTeacherCommitteeWorkspace = getParentCommitteeWorkspace;
