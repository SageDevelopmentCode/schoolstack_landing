import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  getOrderedPortalAccountUserIds,
} from "@/lib/auth/portal-account-link-context";
import type { StaffPortalRole } from "@/lib/staff/staff-members";

export type StaffUserProfile = {
  email: string;
  displayName: string;
  profilePhotoUrl: string | null;
};

export class TeacherPortalAuthError extends Error {
  code: "unauthenticated" | "forbidden";
  status: number;

  constructor(
    message: string,
    code: "unauthenticated" | "forbidden",
    status: number,
  ) {
    super(message);
    this.name = "TeacherPortalAuthError";
    this.code = code;
    this.status = status;
  }
}

const TEACHER_PORTAL_ROLES = new Set(["teacher", "staff"]);

type StaffMemberContextRow = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_photo_url: string | null;
  role_title: string | null;
};

/**
 * Everything the teacher portal needs to know about the signed-in login, read once.
 *
 * Before this, `userHasTeacherPortalAccess`, `getTeacherPortalStaffMemberIdForUser`,
 * `getStaffPortalRoleForUser` and `getStaffUserProfile` each reloaded the link group and then
 * queried one linked login at a time, so a teacher request spent 10+ sequential round trips on
 * access alone. Now: the link group, then memberships and staff records for every linked login
 * in parallel.
 */
export type TeacherPortalContext = {
  /** Link-group logins, primary first. */
  orderedUserIds: string[];
  /** Same logins, those with an active teacher/staff membership first (see below). */
  teacherOrderedUserIds: string[];
  hasAccess: boolean;
  /** Role of the first login (primary first) with an active teacher/staff membership. */
  portalRole: StaffPortalRole | null;
  /** Staff record the teacher portal acts as (first in `teacherOrderedUserIds` that has one). */
  staffMember: StaffMemberContextRow | null;
};

/**
 * Request-scoped memo. Route handlers and server components create a fresh Supabase client per
 * request, so keying on the client instance scopes the cache to that request. The short TTL is a
 * backstop in case a long-lived client is ever passed in.
 */
const TEACHER_CONTEXT_TTL_MS = 5_000;
const teacherContextCache = new WeakMap<
  object,
  Map<string, { at: number; promise: Promise<TeacherPortalContext> }>
>();

async function fetchTeacherPortalContext(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<TeacherPortalContext> {
  const orderedUserIds = await getOrderedPortalAccountUserIds(
    supabase,
    organizationId,
    userId,
  );

  const [membershipResult, staffResult] = await Promise.all([
    supabase
      .from("organization_memberships")
      .select("user_id, role")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .in("role", ["teacher", "staff"])
      .in("user_id", orderedUserIds),
    supabase
      .from("staff_members")
      .select(
        "id, user_id, first_name, last_name, email, profile_photo_url, role_title",
      )
      .eq("organization_id", organizationId)
      .in("user_id", orderedUserIds),
  ]);

  if (membershipResult.error) throw membershipResult.error;
  if (staffResult.error) throw staffResult.error;

  const roleByUserId = new Map<string, StaffPortalRole>();
  for (const row of Array.isArray(membershipResult.data)
    ? membershipResult.data
    : []) {
    const role = row.role === "teacher" || row.role === "staff" ? row.role : null;
    const memberUserId = String(row.user_id);
    if (role && !roleByUserId.has(memberUserId)) {
      roleByUserId.set(memberUserId, role);
    }
  }

  const staffByUserId = new Map<string, StaffMemberContextRow>();
  for (const row of Array.isArray(staffResult.data) ? staffResult.data : []) {
    const memberUserId = String(row.user_id);
    if (!staffByUserId.has(memberUserId)) {
      staffByUserId.set(memberUserId, {
        ...(row as StaffMemberContextRow),
        id: String(row.id),
        user_id: memberUserId,
      });
    }
  }

  // A school admin is often the primary login and has its own auto-created "School admin" staff
  // record, so primary-first would open the teacher portal as that record instead of the linked
  // teacher login's own record (classes, name, photo). Single logins are unchanged.
  const teacherOrderedUserIds = [
    ...orderedUserIds.filter((id) => roleByUserId.has(id)),
    ...orderedUserIds.filter((id) => !roleByUserId.has(id)),
  ];

  const portalUserId = orderedUserIds.find((id) => roleByUserId.has(id));
  const staffUserId = teacherOrderedUserIds.find((id) => staffByUserId.has(id));

  return {
    orderedUserIds,
    teacherOrderedUserIds,
    hasAccess: portalUserId !== undefined,
    portalRole: portalUserId ? (roleByUserId.get(portalUserId) ?? null) : null,
    staffMember: staffUserId ? (staffByUserId.get(staffUserId) ?? null) : null,
  };
}

export function loadTeacherPortalContext(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<TeacherPortalContext> {
  const key = `${organizationId}:${userId}`;
  let perClient = teacherContextCache.get(supabase);
  if (!perClient) {
    perClient = new Map();
    teacherContextCache.set(supabase, perClient);
  }

  const now = Date.now();
  const cached = perClient.get(key);
  if (cached && now - cached.at < TEACHER_CONTEXT_TTL_MS) {
    return cached.promise;
  }

  const promise = fetchTeacherPortalContext(supabase, userId, organizationId);
  perClient.set(key, { at: now, promise });
  // Never keep a failed read: the next caller should retry.
  promise.catch(() => {
    if (perClient.get(key)?.promise === promise) perClient.delete(key);
  });
  return promise;
}

export async function userHasTeacherPortalAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const context = await loadTeacherPortalContext(supabase, userId, organizationId);
  return context.hasAccess;
}

async function getStaffMemberIdForAuthUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("staff_members")
    .select("id, status")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ? String(data.id) : null;
}

/**
 * Link-group user ids for the teacher portal: logins with an active teacher/staff
 * membership first, then the rest (primary-first order kept in each bucket).
 */
export async function getTeacherPortalOrderedUserIds(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<string[]> {
  const context = await loadTeacherPortalContext(supabase, userId, organizationId);
  return context.teacherOrderedUserIds;
}

async function findStaffMemberIdInOrder(
  supabase: SupabaseClient,
  orderedUserIds: string[],
  organizationId: string,
): Promise<string | null> {
  for (const memberUserId of orderedUserIds) {
    const staffMemberId = await getStaffMemberIdForAuthUser(
      supabase,
      memberUserId,
      organizationId,
    );
    if (staffMemberId) {
      return staffMemberId;
    }
  }

  return null;
}

/**
 * Staff record the teacher portal acts as. Prefers a linked login that is a teacher/staff
 * member (see `getTeacherPortalOrderedUserIds`). Admin-side callers (admin messages, form
 * publishing) keep using `getStaffMemberIdForUser`, which is primary-first.
 */
export async function getTeacherPortalStaffMemberIdForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const context = await loadTeacherPortalContext(supabase, userId, organizationId);
  return context.staffMember?.id ?? null;
}

export async function getStaffMemberIdForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const orderedUserIds = await getOrderedPortalAccountUserIds(
    supabase,
    organizationId,
    userId,
  );

  return findStaffMemberIdInOrder(supabase, orderedUserIds, organizationId);
}

export async function getStaffPortalRoleForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<StaffPortalRole | null> {
  const context = await loadTeacherPortalContext(supabase, userId, organizationId);
  return context.portalRole;
}

export async function getStaffUserProfile(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  user: User,
): Promise<StaffUserProfile> {
  // Teacher-portal only: show the linked teacher login's name/photo, not the admin record.
  const { staffMember } = await loadTeacherPortalContext(
    supabase,
    userId,
    organizationId,
  );
  const metadata = user.user_metadata ?? {};
  const metadataFirstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const metadataLastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";

  const staffFirstName = String(staffMember?.first_name ?? "").trim();
  const staffLastName = String(staffMember?.last_name ?? "").trim();
  const firstName = staffFirstName || metadataFirstName;
  const lastName = staffLastName || metadataLastName;

  const email =
    user.email?.trim() ||
    (typeof staffMember?.email === "string" ? staffMember.email.trim() : "") ||
    "";

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email || "Account";

  const profilePhotoUrl =
    typeof staffMember?.profile_photo_url === "string" &&
    staffMember.profile_photo_url.trim()
      ? staffMember.profile_photo_url.trim()
      : null;

  return { email, displayName, profilePhotoUrl };
}

export function isTeacherPortalRole(role: string): boolean {
  return TEACHER_PORTAL_ROLES.has(role);
}
