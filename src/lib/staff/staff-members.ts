import type { SupabaseClient } from "@supabase/supabase-js";
import { createOrGetConfirmedAuthUser } from "@/lib/admin/auth-users";

export type StaffPortalRole = "teacher" | "staff";

export type StaffEmploymentStatus = "active" | "inactive" | "on_leave";

export type StaffMemberRecord = {
  id: string;
  organizationId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  roleTitle: string | null;
  employmentStatus: StaffEmploymentStatus;
  portalRole: StaffPortalRole | null;
  membershipStatus: "invited" | "active" | "disabled" | null;
  isLinked: boolean;
  hasEverSignedIn?: boolean;
  lastSignInAt?: string | null;
  assignedStudentCount?: number;
  profilePhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export class StaffMemberError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "StaffMemberError";
    this.code = code;
    this.status = status;
  }
}

const CONFLICTING_MEMBERSHIP_ROLES = new Set(["owner", "admin", "parent"]);
const STAFF_PORTAL_ROLES = new Set<StaffPortalRole>(["teacher", "staff"]);

function mapStaffRow(
  row: Record<string, unknown>,
  membership?: { role: string; status: string } | null,
): StaffMemberRecord {
  const userId =
    row.user_id != null && String(row.user_id).trim() !== ""
      ? String(row.user_id)
      : null;

  const portalRole =
    membership?.role === "teacher" || membership?.role === "staff"
      ? (membership.role as StaffPortalRole)
      : null;

  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    userId,
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: typeof row.email === "string" ? row.email : null,
    roleTitle: typeof row.role_title === "string" ? row.role_title : null,
    employmentStatus: (row.status as StaffEmploymentStatus) ?? "active",
    portalRole,
    membershipStatus: membership
      ? (membership.status as StaffMemberRecord["membershipStatus"])
      : null,
    isLinked: userId != null,
    profilePhotoUrl:
      typeof row.profile_photo_url === "string" && row.profile_photo_url.trim() !== ""
        ? row.profile_photo_url.trim()
        : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function getMembershipForUser(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<{ id: string; role: string; status: string } | null> {
  const { data, error } = await admin
    .from("organization_memberships")
    .select("id, role, status")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new StaffMemberError(error.message, "membership_lookup_failed", 500);
  }

  return data
    ? {
        id: String(data.id),
        role: String(data.role),
        status: String(data.status),
      }
    : null;
}

function membershipRoleLabel(role: string): string {
  switch (role) {
    case "parent":
      return "parent";
    case "admin":
    case "owner":
      return "admin";
    default:
      return role;
  }
}

export async function listStaffMembers(
  admin: SupabaseClient,
  organizationId: string,
): Promise<StaffMemberRecord[]> {
  const { data, error } = await admin
    .from("staff_members")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const userIds = rows
    .map((row) => (row.user_id ? String(row.user_id) : null))
    .filter((userId): userId is string => userId != null);

  const membershipByUserId = new Map<
    string,
    { role: string; status: string }
  >();

  if (userIds.length > 0) {
    const { data: memberships, error: membershipError } = await admin
      .from("organization_memberships")
      .select("user_id, role, status")
      .eq("organization_id", organizationId)
      .in("user_id", userIds);

    if (membershipError) throw membershipError;

    for (const membership of memberships ?? []) {
      membershipByUserId.set(String(membership.user_id), {
        role: String(membership.role),
        status: String(membership.status),
      });
    }
  }

  return rows.map((row) =>
    mapStaffRow(
      row as Record<string, unknown>,
      row.user_id
        ? (membershipByUserId.get(String(row.user_id)) ?? null)
        : null,
    ),
  );
}

export type AddStaffPortalAccessInput = {
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleTitle: string;
  portalRole: StaffPortalRole;
};

export type UpdateStaffMemberInput = {
  organizationId: string;
  staffMemberId: string;
  firstName?: string;
  lastName?: string;
  roleTitle?: string;
  employmentStatus?: StaffEmploymentStatus;
  portalRole?: StaffPortalRole;
};

async function upsertStaffMembership(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  portalRole: StaffPortalRole,
  existingMembership: { id: string; role: string; status: string } | null,
): Promise<void> {
  if (!existingMembership) {
    const { error } = await admin.from("organization_memberships").insert({
      organization_id: organizationId,
      user_id: userId,
      role: portalRole,
      status: "active",
    });

    if (error) {
      throw new StaffMemberError(error.message, "membership_insert_failed", 500);
    }
    return;
  }

  if (CONFLICTING_MEMBERSHIP_ROLES.has(existingMembership.role)) {
    throw new StaffMemberError(
      `This email already has ${membershipRoleLabel(existingMembership.role)} access at this school.`,
      "conflicting_membership",
      409,
    );
  }

  if (
    existingMembership.role === "teacher" ||
    existingMembership.role === "staff"
  ) {
    const { error } = await admin
      .from("organization_memberships")
      .update({
        role: portalRole,
        status: "active",
      })
      .eq("id", existingMembership.id);

    if (error) {
      throw new StaffMemberError(error.message, "membership_update_failed", 500);
    }
    return;
  }

  throw new StaffMemberError(
    "This email already has access at this school with an unsupported role.",
    "conflicting_membership",
    409,
  );
}

export async function addStaffPortalAccess(
  admin: SupabaseClient,
  input: AddStaffPortalAccessInput,
): Promise<StaffMemberRecord> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedFirst = input.firstName.trim();
  const trimmedLast = input.lastName.trim();
  const trimmedRoleTitle = input.roleTitle.trim();

  if (!normalizedEmail) {
    throw new StaffMemberError("Email is required.", "missing_email", 400);
  }

  if (!trimmedFirst || !trimmedLast) {
    throw new StaffMemberError(
      "First name and last name are required.",
      "missing_name",
      400,
    );
  }

  if (!trimmedRoleTitle) {
    throw new StaffMemberError("Job title is required.", "missing_role_title", 400);
  }

  if (!STAFF_PORTAL_ROLES.has(input.portalRole)) {
    throw new StaffMemberError(
      "Portal role must be teacher or staff.",
      "invalid_portal_role",
      400,
    );
  }

  const { data: existingStaffRows, error: existingStaffError } = await admin
    .from("staff_members")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .eq("organization_id", input.organizationId)
    .ilike("email", normalizedEmail);

  if (existingStaffError) {
    throw new StaffMemberError(
      existingStaffError.message,
      "staff_lookup_failed",
      500,
    );
  }

  const existingStaff = (existingStaffRows ?? []).find(
    (row) => String(row.email ?? "").trim().toLowerCase() === normalizedEmail,
  );

  if (existingStaff?.user_id) {
    const membership = await getMembershipForUser(
      admin,
      input.organizationId,
      String(existingStaff.user_id),
    );

    if (membership?.status === "active") {
      throw new StaffMemberError(
        "This email already has staff portal access at this school.",
        "duplicate_staff",
        409,
      );
    }
  }

  const authUser = await createOrGetConfirmedAuthUser(admin, {
    email: normalizedEmail,
    firstName: trimmedFirst,
    lastName: trimmedLast,
  });

  const existingMembership = await getMembershipForUser(
    admin,
    input.organizationId,
    authUser.id,
  );

  if (
    existingMembership &&
    CONFLICTING_MEMBERSHIP_ROLES.has(existingMembership.role) &&
    existingMembership.status === "active"
  ) {
    throw new StaffMemberError(
      `This email already has ${membershipRoleLabel(existingMembership.role)} access at this school.`,
      "conflicting_membership",
      409,
    );
  }

  let staffRow: Record<string, unknown>;

  if (existingStaff) {
    const { data: updated, error: updateError } = await admin
      .from("staff_members")
      .update({
        user_id: authUser.id,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        email: normalizedEmail,
        role_title: trimmedRoleTitle,
        status: "active",
      })
      .eq("id", existingStaff.id)
      .select(
        "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
      )
      .single();

    if (updateError || !updated) {
      throw new StaffMemberError(
        updateError?.message ?? "Failed to update staff member.",
        "staff_update_failed",
        500,
      );
    }

    staffRow = updated as Record<string, unknown>;
  } else {
    const { data: inserted, error: insertError } = await admin
      .from("staff_members")
      .insert({
        organization_id: input.organizationId,
        user_id: authUser.id,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        email: normalizedEmail,
        role_title: trimmedRoleTitle,
        status: "active",
      })
      .select(
        "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
      )
      .single();

    if (insertError || !inserted) {
      throw new StaffMemberError(
        insertError?.message ?? "Failed to create staff member.",
        "staff_insert_failed",
        500,
      );
    }

    staffRow = inserted as Record<string, unknown>;
  }

  await upsertStaffMembership(
    admin,
    input.organizationId,
    authUser.id,
    input.portalRole,
    existingMembership,
  );

  const membership = await getMembershipForUser(
    admin,
    input.organizationId,
    authUser.id,
  );

  return mapStaffRow(staffRow, membership);
}

export async function updateStaffMember(
  admin: SupabaseClient,
  input: UpdateStaffMemberInput,
): Promise<StaffMemberRecord> {
  const { data: existing, error: existingError } = await admin
    .from("staff_members")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .eq("id", input.staffMemberId)
    .eq("organization_id", input.organizationId)
    .maybeSingle();

  if (existingError) {
    throw new StaffMemberError(
      existingError.message,
      "staff_lookup_failed",
      500,
    );
  }

  if (!existing) {
    throw new StaffMemberError("Staff member not found.", "staff_not_found", 404);
  }

  const patch: Record<string, unknown> = {};

  if (input.firstName !== undefined) {
    const trimmed = input.firstName.trim();
    if (!trimmed) {
      throw new StaffMemberError("First name is required.", "missing_name", 400);
    }
    patch.first_name = trimmed;
  }

  if (input.lastName !== undefined) {
    const trimmed = input.lastName.trim();
    if (!trimmed) {
      throw new StaffMemberError("Last name is required.", "missing_name", 400);
    }
    patch.last_name = trimmed;
  }

  if (input.roleTitle !== undefined) {
    const trimmed = input.roleTitle.trim();
    if (!trimmed) {
      throw new StaffMemberError("Job title is required.", "missing_role_title", 400);
    }
    patch.role_title = trimmed;
  }

  if (input.employmentStatus !== undefined) {
    patch.status = input.employmentStatus;
  }

  const userId = existing.user_id ? String(existing.user_id) : null;

  if (input.portalRole && userId) {
    const membership = await getMembershipForUser(
      admin,
      input.organizationId,
      userId,
    );

    if (
      membership &&
      (membership.role === "teacher" || membership.role === "staff")
    ) {
      const { error: membershipError } = await admin
        .from("organization_memberships")
        .update({ role: input.portalRole })
        .eq("id", membership.id);

      if (membershipError) {
        throw new StaffMemberError(
          membershipError.message,
          "membership_update_failed",
          500,
        );
      }
    }
  }

  if (Object.keys(patch).length === 0 && !input.portalRole) {
    const membership = userId
      ? await getMembershipForUser(admin, input.organizationId, userId)
      : null;
    return mapStaffRow(existing as Record<string, unknown>, membership);
  }

  const { data, error } = await admin
    .from("staff_members")
    .update(patch)
    .eq("id", input.staffMemberId)
    .eq("organization_id", input.organizationId)
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new StaffMemberError(
      error?.message ?? "Failed to update staff member.",
      "staff_update_failed",
      500,
    );
  }

  const membership = userId
    ? await getMembershipForUser(admin, input.organizationId, userId)
    : null;

  return mapStaffRow(data as Record<string, unknown>, membership);
}

export async function deactivateStaffPortalAccess(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<StaffMemberRecord> {
  const { data: existing, error: existingError } = await admin
    .from("staff_members")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .eq("id", staffMemberId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existingError) {
    throw new StaffMemberError(
      existingError.message,
      "staff_lookup_failed",
      500,
    );
  }

  if (!existing) {
    throw new StaffMemberError("Staff member not found.", "staff_not_found", 404);
  }

  const userId = existing.user_id ? String(existing.user_id) : null;

  if (userId) {
    const membership = await getMembershipForUser(admin, organizationId, userId);

    if (
      membership &&
      (membership.role === "teacher" || membership.role === "staff")
    ) {
      const { error: membershipError } = await admin
        .from("organization_memberships")
        .update({ status: "disabled" })
        .eq("id", membership.id);

      if (membershipError) {
        throw new StaffMemberError(
          membershipError.message,
          "membership_update_failed",
          500,
        );
      }
    }
  }

  const { data, error } = await admin
    .from("staff_members")
    .update({ status: "inactive" })
    .eq("id", staffMemberId)
    .eq("organization_id", organizationId)
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new StaffMemberError(
      error?.message ?? "Failed to deactivate staff member.",
      "staff_update_failed",
      500,
    );
  }

  const membership = userId
    ? await getMembershipForUser(admin, organizationId, userId)
    : null;

  return mapStaffRow(data as Record<string, unknown>, membership);
}

export async function reactivateStaffPortalAccess(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<StaffMemberRecord> {
  const { data: existing, error: existingError } = await admin
    .from("staff_members")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .eq("id", staffMemberId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existingError) {
    throw new StaffMemberError(
      existingError.message,
      "staff_lookup_failed",
      500,
    );
  }

  if (!existing) {
    throw new StaffMemberError("Staff member not found.", "staff_not_found", 404);
  }

  const userId = existing.user_id ? String(existing.user_id) : null;

  if (!userId) {
    throw new StaffMemberError(
      "This staff member does not have portal access yet.",
      "portal_not_linked",
      409,
    );
  }

  const membership = await getMembershipForUser(admin, organizationId, userId);

  if (
    !membership ||
    (membership.role !== "teacher" && membership.role !== "staff")
  ) {
    throw new StaffMemberError(
      "No staff portal membership found for this person.",
      "membership_not_found",
      404,
    );
  }

  const { error: membershipError } = await admin
    .from("organization_memberships")
    .update({ status: "active" })
    .eq("id", membership.id);

  if (membershipError) {
    throw new StaffMemberError(
      membershipError.message,
      "membership_update_failed",
      500,
    );
  }

  const { data, error } = await admin
    .from("staff_members")
    .update({ status: "active" })
    .eq("id", staffMemberId)
    .eq("organization_id", organizationId)
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url, status, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new StaffMemberError(
      error?.message ?? "Failed to reactivate staff member.",
      "staff_update_failed",
      500,
    );
  }

  const updatedMembership = await getMembershipForUser(
    admin,
    organizationId,
    userId,
  );

  return mapStaffRow(data as Record<string, unknown>, updatedMembership);
}
