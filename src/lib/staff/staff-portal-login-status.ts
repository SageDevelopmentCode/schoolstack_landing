import type { SupabaseClient } from "@supabase/supabase-js";
import {
  classifyParentPortalLoginStatus,
  fetchAuthLoginStatusByUserIds,
} from "@/lib/admissions/parent-portal-login-status";
import type { StaffMemberRecord } from "./staff-members";

export type StaffPortalLoginSummary = {
  total: number;
  withPortalAccess: number;
  signedIn: number;
  neverSignedIn: number;
  noAccount: number;
};

function staffHasPortalAccess(member: StaffMemberRecord): boolean {
  return (
    member.portalRole != null &&
    (member.membershipStatus === "active" || member.membershipStatus === "invited")
  );
}

export function summarizeStaffPortalLoginStatus(
  members: StaffMemberRecord[],
): StaffPortalLoginSummary {
  let withPortalAccess = 0;
  let signedIn = 0;
  let neverSignedIn = 0;
  let noAccount = 0;

  for (const member of members) {
    if (!staffHasPortalAccess(member)) continue;

    withPortalAccess += 1;

    if (!member.isLinked) {
      noAccount += 1;
    } else if (member.hasEverSignedIn) {
      signedIn += 1;
    } else {
      neverSignedIn += 1;
    }
  }

  return {
    total: members.length,
    withPortalAccess,
    signedIn,
    neverSignedIn,
    noAccount,
  };
}

export function enrichStaffMembersWithLoginStatus(
  staffMembers: StaffMemberRecord[],
  loginByUserId: Map<string, { lastSignInAt: string | null }>,
): StaffMemberRecord[] {
  return staffMembers.map((member) => {
    const authLogin = member.userId ? loginByUserId.get(member.userId) : undefined;
    const classification = classifyParentPortalLoginStatus({
      userId: member.userId,
      lastSignInAt: authLogin?.lastSignInAt ?? null,
    });

    return {
      ...member,
      hasEverSignedIn: classification.hasEverSignedIn,
      lastSignInAt: classification.lastSignInAt,
    };
  });
}

export async function listStaffMembersWithLoginStatus(
  admin: SupabaseClient,
  organizationId: string,
  listStaffMembers: (
    client: SupabaseClient,
    orgId: string,
  ) => Promise<StaffMemberRecord[]>,
): Promise<StaffMemberRecord[]> {
  const staffMembers = await listStaffMembers(admin, organizationId);
  const userIds = staffMembers
    .map((member) => member.userId)
    .filter((userId): userId is string => userId != null);

  const loginByUserId = await fetchAuthLoginStatusByUserIds(admin, userIds);
  return enrichStaffMembersWithLoginStatus(staffMembers, loginByUserId);
}
