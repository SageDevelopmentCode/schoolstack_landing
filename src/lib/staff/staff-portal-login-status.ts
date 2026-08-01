import type { SupabaseClient } from "@supabase/supabase-js";
import {
  classifyParentPortalLoginStatus,
  fetchAuthLoginStatusByUserIds,
} from "@/lib/admissions/parent-portal-login-status";
import type { StaffMemberRecord } from "./staff-members";

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
