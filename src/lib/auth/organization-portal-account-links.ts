import type { SupabaseClient } from "@supabase/supabase-js";
import { findUserByEmail } from "@/lib/admin/auth-users";
import {
  getFamilyIdsForAuthUser,
  userIsOrgAdminForAuthUser,
} from "@/lib/admissions/application-auth";
import type { PortalId, SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import {
  findMemberRowForUserInOrg,
  listMemberUserIdsForLinkGroup,
} from "@/lib/auth/portal-account-link-context";
import { isPlatformAdmin } from "@/lib/school-admin/access";

export type { PortalAccountLinkContext } from "@/lib/auth/portal-account-link-context";
export {
  getPortalAccountLinkContext,
  resolvePortalAccountMemberUserIds,
} from "@/lib/auth/portal-account-link-context";

export type MemberPortalBadges = {
  userId: string;
  email: string | null;
  schoolAdmin: boolean;
  teacherPortal: boolean;
  familyApply: boolean;
  parentPortal: boolean;
};

export type PortalAccountLinkMemberRecord = {
  id: string;
  userId: string;
  email: string | null;
  badges: MemberPortalBadges;
};

export type PortalAccountLinkGroupRecord = {
  id: string;
  organizationId: string;
  primaryUserId: string;
  primaryEmail: string | null;
  label: string | null;
  members: PortalAccountLinkMemberRecord[];
  effectiveBadges: Omit<MemberPortalBadges, "userId" | "email">;
  createdAt: string;
  updatedAt: string;
};

export type UnlinkedPortalIdentity = {
  userId: string;
  email: string | null;
  sources: ("membership" | "guardian" | "staff")[];
  badges: Omit<MemberPortalBadges, "userId" | "email">;
};

export type PortalRolePillars = {
  schoolAdmin: boolean;
  staffPortal: boolean;
  familyPortal: boolean;
};

export type CrossRoleSingleLoginAccount = {
  userId: string;
  loginEmail: string | null;
  guardianContactEmails: string[];
  sources: UnlinkedPortalIdentity["sources"];
  pillars: PortalRolePillars;
};

export class PortalAccountLinkError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "PortalAccountLinkError";
    this.code = code;
    this.status = status;
  }
}

export function mergeSchoolPortalOptionsById(
  optionSets: SchoolPortalOption[][],
): SchoolPortalOption[] {
  const byId = new Map<PortalId, SchoolPortalOption>();

  for (const options of optionSets) {
    for (const option of options) {
      if (!byId.has(option.id)) {
        byId.set(option.id, option);
      }
    }
  }

  const order: PortalId[] = [
    "admin",
    "teacher",
    "family_apply",
    "family_parent",
  ];

  return order
    .map((id) => byId.get(id))
    .filter((option): option is SchoolPortalOption => option != null);
}

export type PortalAccessBadgeFlags = Omit<
  MemberPortalBadges,
  "userId" | "email"
>;

const PORTAL_ACCESS_LABELS: {
  key: keyof PortalAccessBadgeFlags;
  label: string;
}[] = [
  { key: "schoolAdmin", label: "School admin" },
  { key: "teacherPortal", label: "Staff portal" },
  { key: "familyApply", label: "Applications" },
  { key: "parentPortal", label: "Parent portal" },
];

export function unionPortalBadges(
  badgeSets: PortalAccessBadgeFlags[],
): PortalAccessBadgeFlags {
  return {
    schoolAdmin: badgeSets.some((badges) => badges.schoolAdmin),
    teacherPortal: badgeSets.some((badges) => badges.teacherPortal),
    familyApply: badgeSets.some((badges) => badges.familyApply),
    parentPortal: badgeSets.some((badges) => badges.parentPortal),
  };
}

export function formatPortalAccessSummary(
  badges: PortalAccessBadgeFlags,
): string {
  const labels = PORTAL_ACCESS_LABELS.filter(({ key }) => badges[key]).map(
    ({ label }) => label,
  );
  return labels.length > 0 ? labels.join(", ") : "No portal access";
}

export function countActivePortalAccessTypes(
  badges: PortalAccessBadgeFlags,
): number {
  return PORTAL_ACCESS_LABELS.filter(({ key }) => badges[key]).length;
}

const PORTAL_PILLAR_LABELS: {
  key: keyof PortalRolePillars;
  label: string;
}[] = [
  { key: "schoolAdmin", label: "School admin" },
  { key: "staffPortal", label: "Staff portal" },
  { key: "familyPortal", label: "Family portal" },
];

export function badgesToRolePillars(
  badges: PortalAccessBadgeFlags,
): PortalRolePillars {
  return {
    schoolAdmin: badges.schoolAdmin,
    staffPortal: badges.teacherPortal,
    familyPortal: badges.familyApply || badges.parentPortal,
  };
}

export function unionRolePillars(
  pillarSets: PortalRolePillars[],
): PortalRolePillars {
  return {
    schoolAdmin: pillarSets.some((pillars) => pillars.schoolAdmin),
    staffPortal: pillarSets.some((pillars) => pillars.staffPortal),
    familyPortal: pillarSets.some((pillars) => pillars.familyPortal),
  };
}

export function countActiveRolePillars(pillars: PortalRolePillars): number {
  return PORTAL_PILLAR_LABELS.filter(({ key }) => pillars[key]).length;
}

export function formatPortalPillarSummary(pillars: PortalRolePillars): string {
  const labels = PORTAL_PILLAR_LABELS.filter(({ key }) => pillars[key]).map(
    ({ label }) => label,
  );
  return labels.length > 0 ? labels.join(", ") : "No portal access";
}

export function listCrossRoleSingleLoginIdentities(
  unlinked: UnlinkedPortalIdentity[],
): UnlinkedPortalIdentity[] {
  return unlinked.filter(
    (identity) =>
      countActiveRolePillars(badgesToRolePillars(identity.badges)) >= 2,
  );
}

async function loadGuardianContactEmailsByUserId(
  admin: SupabaseClient,
  organizationId: string,
  userIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (userIds.length === 0) return map;

  const { data, error } = await admin
    .from("guardians")
    .select("user_id, email")
    .eq("organization_id", organizationId)
    .in("user_id", userIds)
    .not("email", "is", null);

  if (error) throw error;

  for (const row of data ?? []) {
    if (!row.user_id) continue;
    const userId = String(row.user_id);
    const email = String(row.email).trim();
    if (!email) continue;

    const existing = map.get(userId) ?? [];
    const normalized = email.toLowerCase();
    if (!existing.some((item) => item.toLowerCase() === normalized)) {
      existing.push(email);
      map.set(userId, existing);
    }
  }

  return map;
}

export async function listCrossRoleSingleLoginAccounts(
  admin: SupabaseClient,
  organizationId: string,
): Promise<CrossRoleSingleLoginAccount[]> {
  const unlinked = await listUnlinkedOrgPortalIdentities(admin, organizationId);
  const crossRoleIdentities = listCrossRoleSingleLoginIdentities(unlinked);

  if (crossRoleIdentities.length === 0) {
    return [];
  }

  const guardianContacts = await loadGuardianContactEmailsByUserId(
    admin,
    organizationId,
    crossRoleIdentities.map((identity) => identity.userId),
  );

  const accounts: CrossRoleSingleLoginAccount[] = crossRoleIdentities.map(
    (identity) => ({
      userId: identity.userId,
      loginEmail: identity.email,
      guardianContactEmails: guardianContacts.get(identity.userId) ?? [],
      sources: identity.sources,
      pillars: badgesToRolePillars(identity.badges),
    }),
  );

  accounts.sort((left, right) =>
    (left.loginEmail ?? left.userId).localeCompare(
      right.loginEmail ?? right.userId,
    ),
  );

  return accounts;
}

function unionEffectiveBadges(
  members: MemberPortalBadges[],
): PortalAccessBadgeFlags {
  return unionPortalBadges(
    members.map((member) => ({
      schoolAdmin: member.schoolAdmin,
      teacherPortal: member.teacherPortal,
      familyApply: member.familyApply,
      parentPortal: member.parentPortal,
    })),
  );
}

async function resolveUserEmail(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}

export async function userHasOrgPortalFootprint(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const [membership, guardian, staff] = await Promise.all([
    supabase
      .from("organization_memberships")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("guardians")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("staff_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
  ]);

  if (membership.error) throw membership.error;
  if (guardian.error) throw guardian.error;
  if (staff.error) throw staff.error;

  return Boolean(membership.data || guardian.data || staff.data);
}

async function userHasTeacherMembership(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .in("role", ["teacher", "staff"])
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function userHasEnrolledAccessForAuthUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForAuthUser(
    supabase,
    userId,
    organizationId,
  );

  if (familyIds.length === 0) return false;

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .in("family_id", familyIds);

  if (studentsError) throw studentsError;

  const studentIds = (students ?? []).map((row) => String(row.id));
  if (studentIds.length === 0) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

async function userHasFamilyApplyFootprint(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForAuthUser(
    supabase,
    userId,
    organizationId,
  );
  if (familyIds.length > 0) return true;

  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("created_by_user_id", userId)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function computeMemberPortalBadges(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  email: string | null = null,
): Promise<MemberPortalBadges> {
  const [
    platformAdmin,
    orgAdmin,
    teacherPortal,
    familyApply,
    hasEnrolledAccess,
  ] = await Promise.all([
    isPlatformAdmin(supabase, userId),
    userIsOrgAdminForAuthUser(supabase, userId, organizationId),
    userHasTeacherMembership(supabase, userId, organizationId),
    userHasFamilyApplyFootprint(supabase, userId, organizationId),
    userHasEnrolledAccessForAuthUser(supabase, userId, organizationId),
  ]);

  const schoolAdmin = platformAdmin || orgAdmin;

  return {
    userId,
    email,
    schoolAdmin,
    teacherPortal,
    familyApply,
    parentPortal: hasEnrolledAccess && familyApply,
  };
}

async function mapGroupRecord(
  admin: SupabaseClient,
  organizationId: string,
  group: Record<string, unknown>,
  members: Record<string, unknown>[],
): Promise<PortalAccountLinkGroupRecord> {
  const memberBadges: MemberPortalBadges[] = [];

  for (const member of members) {
    const userId = String(member.user_id);
    const email = await resolveUserEmail(admin, userId);
    memberBadges.push(
      await computeMemberPortalBadges(admin, organizationId, userId, email),
    );
  }

  const primaryUserId = String(group.primary_user_id);
  const primaryEmail = await resolveUserEmail(admin, primaryUserId);

  return {
    id: String(group.id),
    organizationId: String(group.organization_id),
    primaryUserId,
    primaryEmail,
    label: typeof group.label === "string" ? group.label : null,
    members: members.map((member, index) => ({
      id: String(member.id),
      userId: String(member.user_id),
      email: memberBadges[index]?.email ?? null,
      badges: memberBadges[index]!,
    })),
    effectiveBadges: unionEffectiveBadges(memberBadges),
    createdAt: String(group.created_at),
    updatedAt: String(group.updated_at),
  };
}

export async function listOrganizationPortalAccountLinkGroups(
  admin: SupabaseClient,
  organizationId: string,
): Promise<PortalAccountLinkGroupRecord[]> {
  const { data: groups, error: groupsError } = await admin
    .from("organization_portal_account_link_groups")
    .select(
      "id, organization_id, primary_user_id, label, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (groupsError) throw groupsError;

  const records: PortalAccountLinkGroupRecord[] = [];

  for (const group of groups ?? []) {
    const { data: members, error: membersError } = await admin
      .from("organization_portal_account_link_members")
      .select("id, user_id, created_at")
      .eq("group_id", group.id)
      .order("created_at", { ascending: true });

    if (membersError) throw membersError;

    records.push(
      await mapGroupRecord(
        admin,
        organizationId,
        group as Record<string, unknown>,
        (members ?? []) as Record<string, unknown>[],
      ),
    );
  }

  return records;
}

async function collectOrgPortalUserIds(
  admin: SupabaseClient,
  organizationId: string,
): Promise<Map<string, Set<"membership" | "guardian" | "staff">>> {
  const map = new Map<string, Set<"membership" | "guardian" | "staff">>();

  const add = (userId: string, source: "membership" | "guardian" | "staff") => {
    const existing = map.get(userId) ?? new Set();
    existing.add(source);
    map.set(userId, existing);
  };

  const [memberships, guardians, staff] = await Promise.all([
    admin
      .from("organization_memberships")
      .select("user_id")
      .eq("organization_id", organizationId),
    admin
      .from("guardians")
      .select("user_id")
      .eq("organization_id", organizationId)
      .not("user_id", "is", null),
    admin
      .from("staff_members")
      .select("user_id")
      .eq("organization_id", organizationId)
      .not("user_id", "is", null),
  ]);

  if (memberships.error) throw memberships.error;
  if (guardians.error) throw guardians.error;
  if (staff.error) throw staff.error;

  for (const row of memberships.data ?? []) {
    if (row.user_id) add(String(row.user_id), "membership");
  }
  for (const row of guardians.data ?? []) {
    if (row.user_id) add(String(row.user_id), "guardian");
  }
  for (const row of staff.data ?? []) {
    if (row.user_id) add(String(row.user_id), "staff");
  }

  return map;
}

export async function listUnlinkedOrgPortalIdentities(
  admin: SupabaseClient,
  organizationId: string,
): Promise<UnlinkedPortalIdentity[]> {
  const footprint = await collectOrgPortalUserIds(admin, organizationId);

  const { data: linkedMembers, error: linkedError } = await admin
    .from("organization_portal_account_link_members")
    .select("user_id")
    .eq("organization_id", organizationId);

  if (linkedError) throw linkedError;

  const linkedUserIds = new Set(
    (linkedMembers ?? []).map((row) => String(row.user_id)),
  );

  const unlinked: UnlinkedPortalIdentity[] = [];

  for (const [userId, sources] of footprint) {
    if (linkedUserIds.has(userId)) continue;

    const email = await resolveUserEmail(admin, userId);
    const badges = await computeMemberPortalBadges(
      admin,
      organizationId,
      userId,
      email,
    );

    unlinked.push({
      userId,
      email,
      sources: [...sources],
      badges: {
        schoolAdmin: badges.schoolAdmin,
        teacherPortal: badges.teacherPortal,
        familyApply: badges.familyApply,
        parentPortal: badges.parentPortal,
      },
    });
  }

  unlinked.sort((left, right) =>
    (left.email ?? left.userId).localeCompare(right.email ?? right.userId),
  );

  return unlinked;
}

export function guardianContactEmailsForDisplay(
  loginEmail: string | null,
  guardianContactEmails: string[],
): string[] {
  const loginNormalized = loginEmail?.trim().toLowerCase() ?? "";
  return guardianContactEmails.filter(
    (email) => email.trim().toLowerCase() !== loginNormalized,
  );
}

async function ensureUserHasFootprint(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  email: string,
): Promise<void> {
  const hasFootprint = await userHasOrgPortalFootprint(
    admin,
    organizationId,
    userId,
  );

  if (!hasFootprint) {
    throw new PortalAccountLinkError(
      `${email} has no school admin, staff, or family portal footprint in this organization.`,
      "no_portal_footprint",
      400,
    );
  }
}

async function insertGroupMember(
  admin: SupabaseClient,
  organizationId: string,
  groupId: string,
  userId: string,
): Promise<void> {
  const { error } = await admin.from("organization_portal_account_link_members").insert({
    group_id: groupId,
    organization_id: organizationId,
    user_id: userId,
  });

  if (error) {
    if (error.code === "23505") {
      throw new PortalAccountLinkError(
        "This account is already linked in another group for this school.",
        "already_linked",
        409,
      );
    }
    throw error;
  }
}

async function createLinkGroupWithMembers(
  admin: SupabaseClient,
  organizationId: string,
  primaryUserId: string,
  memberUserIds: string[],
  label?: string | null,
): Promise<string> {
  const uniqueMembers = [...new Set(memberUserIds)];
  if (!uniqueMembers.includes(primaryUserId)) {
    uniqueMembers.push(primaryUserId);
  }

  const { data: group, error: groupError } = await admin
    .from("organization_portal_account_link_groups")
    .insert({
      organization_id: organizationId,
      primary_user_id: primaryUserId,
      label: label?.trim() ? label.trim() : null,
    })
    .select("id")
    .single();

  if (groupError) throw groupError;

  const groupId = String(group.id);

  for (const userId of uniqueMembers) {
    await insertGroupMember(admin, organizationId, groupId, userId);
  }

  return groupId;
}

async function mergeGroups(
  admin: SupabaseClient,
  organizationId: string,
  targetGroupId: string,
  sourceGroupId: string,
  primaryUserId: string,
): Promise<void> {
  if (targetGroupId === sourceGroupId) return;

  const sourceMemberIds = await listMemberUserIdsForLinkGroup(
    admin,
    sourceGroupId,
  );

  for (const userId of sourceMemberIds) {
    const existing = await findMemberRowForUserInOrg(
      admin,
      organizationId,
      userId,
    );
    if (!existing) {
      await insertGroupMember(admin, organizationId, targetGroupId, userId);
    }
  }

  const { error: deleteError } = await admin
    .from("organization_portal_account_link_groups")
    .delete()
    .eq("id", sourceGroupId);

  if (deleteError) throw deleteError;

  const { error: primaryError } = await admin
    .from("organization_portal_account_link_groups")
    .update({ primary_user_id: primaryUserId })
    .eq("id", targetGroupId);

  if (primaryError) throw primaryError;
}

export async function linkPortalAccountsByEmail(
  admin: SupabaseClient,
  organizationId: string,
  input: {
    primaryEmail: string;
    linkedEmail: string;
    label?: string | null;
  },
): Promise<PortalAccountLinkGroupRecord> {
  const primaryAuth = await findUserByEmail(admin, input.primaryEmail);
  const linkedAuth = await findUserByEmail(admin, input.linkedEmail);

  if (!primaryAuth) {
    throw new PortalAccountLinkError(
      `No auth account found for ${input.primaryEmail.trim()}.`,
      "user_not_found",
      404,
    );
  }

  if (!linkedAuth) {
    throw new PortalAccountLinkError(
      `No auth account found for ${input.linkedEmail.trim()}.`,
      "user_not_found",
      404,
    );
  }

  if (primaryAuth.id === linkedAuth.id) {
    throw new PortalAccountLinkError(
      "Primary and linked emails must be different accounts.",
      "same_user",
      400,
    );
  }

  await ensureUserHasFootprint(
    admin,
    organizationId,
    primaryAuth.id,
    input.primaryEmail,
  );
  await ensureUserHasFootprint(
    admin,
    organizationId,
    linkedAuth.id,
    input.linkedEmail,
  );

  const primaryMember = await findMemberRowForUserInOrg(
    admin,
    organizationId,
    primaryAuth.id,
  );
  const linkedMember = await findMemberRowForUserInOrg(
    admin,
    organizationId,
    linkedAuth.id,
  );

  let groupId: string;

  if (!primaryMember && !linkedMember) {
    groupId = await createLinkGroupWithMembers(
      admin,
      organizationId,
      primaryAuth.id,
      [primaryAuth.id, linkedAuth.id],
      input.label,
    );
  } else if (primaryMember && !linkedMember) {
    groupId = primaryMember.group_id;
    await insertGroupMember(
      admin,
      organizationId,
      groupId,
      linkedAuth.id,
    );
    if (input.label?.trim()) {
      await admin
        .from("organization_portal_account_link_groups")
        .update({ label: input.label.trim() })
        .eq("id", groupId);
    }
    await admin
      .from("organization_portal_account_link_groups")
      .update({ primary_user_id: primaryAuth.id })
      .eq("id", groupId);
  } else if (!primaryMember && linkedMember) {
    groupId = linkedMember.group_id;
    await insertGroupMember(admin, organizationId, groupId, primaryAuth.id);
    await admin
      .from("organization_portal_account_link_groups")
      .update({
        primary_user_id: primaryAuth.id,
        ...(input.label?.trim() ? { label: input.label.trim() } : {}),
      })
      .eq("id", groupId);
  } else {
    groupId = primaryMember!.group_id;
    if (primaryMember!.group_id !== linkedMember!.group_id) {
      await mergeGroups(
        admin,
        organizationId,
        primaryMember!.group_id,
        linkedMember!.group_id,
        primaryAuth.id,
      );
    }
    await admin
      .from("organization_portal_account_link_groups")
      .update({
        primary_user_id: primaryAuth.id,
        ...(input.label?.trim() ? { label: input.label.trim() } : {}),
      })
      .eq("id", groupId);
  }

  const groups = await listOrganizationPortalAccountLinkGroups(
    admin,
    organizationId,
  );
  const group = groups.find((candidate) => candidate.id === groupId);

  if (!group) {
    throw new PortalAccountLinkError(
      "Link group was created but could not be loaded.",
      "group_load_failed",
      500,
    );
  }

  return group;
}

export async function createPortalAccountLinkGroupFromEmails(
  admin: SupabaseClient,
  organizationId: string,
  input: {
    primaryEmail: string;
    memberEmails: string[];
    label?: string | null;
  },
): Promise<PortalAccountLinkGroupRecord> {
  const primaryNormalized = input.primaryEmail.trim().toLowerCase();
  const additionalEmails = [
    ...new Set(
      input.memberEmails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    ),
  ];

  if (additionalEmails.length === 0) {
    throw new PortalAccountLinkError(
      "Select at least one other account to link.",
      "missing_members",
      400,
    );
  }

  if (additionalEmails.includes(primaryNormalized)) {
    throw new PortalAccountLinkError(
      "Additional accounts must be different from the primary login.",
      "duplicate_primary",
      400,
    );
  }

  let group = await linkPortalAccountsByEmail(admin, organizationId, {
    primaryEmail: input.primaryEmail,
    linkedEmail: additionalEmails[0]!,
    label: input.label,
  });

  for (let index = 1; index < additionalEmails.length; index += 1) {
    group = await addMemberToLinkGroupByEmail(
      admin,
      organizationId,
      group.id,
      additionalEmails[index]!,
    );
  }

  return group;
}

export async function addMemberToLinkGroupByEmail(
  admin: SupabaseClient,
  organizationId: string,
  groupId: string,
  email: string,
): Promise<PortalAccountLinkGroupRecord> {
  const authUser = await findUserByEmail(admin, email);

  if (!authUser) {
    throw new PortalAccountLinkError(
      `No auth account found for ${email.trim()}.`,
      "user_not_found",
      404,
    );
  }

  await ensureUserHasFootprint(admin, organizationId, authUser.id, email);

  const { data: group, error: groupError } = await admin
    .from("organization_portal_account_link_groups")
    .select("id")
    .eq("id", groupId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (groupError) throw groupError;
  if (!group) {
    throw new PortalAccountLinkError("Link group not found.", "not_found", 404);
  }

  await insertGroupMember(admin, organizationId, groupId, authUser.id);

  const groups = await listOrganizationPortalAccountLinkGroups(
    admin,
    organizationId,
  );
  const updated = groups.find((candidate) => candidate.id === groupId);

  if (!updated) {
    throw new PortalAccountLinkError(
      "Member was added but the group could not be loaded.",
      "group_load_failed",
      500,
    );
  }

  return updated;
}

export async function setPrimaryUserForLinkGroup(
  admin: SupabaseClient,
  organizationId: string,
  groupId: string,
  primaryUserId: string,
): Promise<PortalAccountLinkGroupRecord> {
  const memberRow = await findMemberRowForUserInOrg(
    admin,
    organizationId,
    primaryUserId,
  );

  if (!memberRow || memberRow.group_id !== groupId) {
    throw new PortalAccountLinkError(
      "Primary user must already be a member of this link group.",
      "not_group_member",
      400,
    );
  }

  const { error } = await admin
    .from("organization_portal_account_link_groups")
    .update({ primary_user_id: primaryUserId })
    .eq("id", groupId)
    .eq("organization_id", organizationId);

  if (error) throw error;

  const groups = await listOrganizationPortalAccountLinkGroups(
    admin,
    organizationId,
  );
  const updated = groups.find((candidate) => candidate.id === groupId);

  if (!updated) {
    throw new PortalAccountLinkError(
      "Primary login was updated but the group could not be loaded.",
      "group_load_failed",
      500,
    );
  }

  return updated;
}

export async function updateLinkGroupLabel(
  admin: SupabaseClient,
  organizationId: string,
  groupId: string,
  label: string | null,
): Promise<PortalAccountLinkGroupRecord> {
  const { error } = await admin
    .from("organization_portal_account_link_groups")
    .update({ label: label?.trim() ? label.trim() : null })
    .eq("id", groupId)
    .eq("organization_id", organizationId);

  if (error) throw error;

  const groups = await listOrganizationPortalAccountLinkGroups(
    admin,
    organizationId,
  );
  const updated = groups.find((candidate) => candidate.id === groupId);

  if (!updated) {
    throw new PortalAccountLinkError("Link group not found.", "not_found", 404);
  }

  return updated;
}

export async function removeMemberFromLinkGroup(
  admin: SupabaseClient,
  organizationId: string,
  groupId: string,
  memberId: string,
): Promise<{ dissolved: boolean }> {
  const { data: member, error: memberError } = await admin
    .from("organization_portal_account_link_members")
    .select("id, user_id, group_id")
    .eq("id", memberId)
    .eq("group_id", groupId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!member) {
    throw new PortalAccountLinkError("Link member not found.", "not_found", 404);
  }

  const { data: group, error: groupError } = await admin
    .from("organization_portal_account_link_groups")
    .select("primary_user_id")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError) throw groupError;
  if (!group) {
    throw new PortalAccountLinkError("Link group not found.", "not_found", 404);
  }

  const remainingIds = (
    await listMemberUserIdsForLinkGroup(admin, groupId)
  ).filter((userId) => userId !== String(member.user_id));

  if (remainingIds.length === 0) {
    const { error: deleteGroupError } = await admin
      .from("organization_portal_account_link_groups")
      .delete()
      .eq("id", groupId);

    if (deleteGroupError) throw deleteGroupError;
    return { dissolved: true };
  }

  const { error: deleteMemberError } = await admin
    .from("organization_portal_account_link_members")
    .delete()
    .eq("id", memberId);

  if (deleteMemberError) throw deleteMemberError;

  if (String(group.primary_user_id) === String(member.user_id)) {
    const nextPrimary = remainingIds[0]!;
    const { error: primaryError } = await admin
      .from("organization_portal_account_link_groups")
      .update({ primary_user_id: nextPrimary })
      .eq("id", groupId);

    if (primaryError) throw primaryError;
  }

  return { dissolved: false };
}
