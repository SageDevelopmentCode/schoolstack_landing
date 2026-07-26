import type { SupabaseClient } from "@supabase/supabase-js";
import { findUserByEmail } from "@/lib/admin/auth-users";

export type OrganizationMembershipRole =
  | "owner"
  | "admin"
  | "teacher"
  | "parent"
  | "staff";

export type OrganizationMembershipStatus = "invited" | "active" | "disabled";

export type OrganizationMembershipRecord = {
  id: string;
  organizationId: string;
  userId: string;
  email: string | null;
  role: OrganizationMembershipRole;
  status: OrganizationMembershipStatus;
  createdAt: string;
  updatedAt: string;
};

const SCHOOL_ADMIN_ASSIGNABLE_ROLES = new Set<OrganizationMembershipRole>([
  "owner",
  "admin",
]);

function rowToMembership(
  row: Record<string, unknown>,
  email: string | null,
): OrganizationMembershipRecord {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    userId: String(row.user_id),
    email,
    role: row.role as OrganizationMembershipRole,
    status: row.status as OrganizationMembershipStatus,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function resolveUserEmail(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}

export async function listOrganizationMemberships(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationMembershipRecord[]> {
  const { data, error } = await admin
    .from("organization_memberships")
    .select(
      "id, organization_id, user_id, role, status, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .in("role", ["owner", "admin"])
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const memberships: OrganizationMembershipRecord[] = [];

  for (const row of rows) {
    const email = await resolveUserEmail(admin, String(row.user_id));
    memberships.push(
      rowToMembership(row as Record<string, unknown>, email),
    );
  }

  return memberships;
}

export async function addOrganizationAdminMembership(
  admin: SupabaseClient,
  organizationId: string,
  email: string,
  role: OrganizationMembershipRole,
): Promise<OrganizationMembershipRecord> {
  if (!SCHOOL_ADMIN_ASSIGNABLE_ROLES.has(role)) {
    throw new Error("Only owner or admin roles can be assigned from this UI.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const authUser = await findUserByEmail(admin, normalizedEmail);

  if (!authUser) {
    throw new Error(
      "No account found for this email. Create the user in Supabase Auth first.",
    );
  }

  const { data, error } = await admin
    .from("organization_memberships")
    .upsert(
      {
        organization_id: organizationId,
        user_id: authUser.id,
        role,
        status: "active",
      },
      { onConflict: "organization_id,user_id" },
    )
    .select(
      "id, organization_id, user_id, role, status, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to save membership.");
  }

  return rowToMembership(
    data as Record<string, unknown>,
    authUser.email ?? normalizedEmail,
  );
}

export async function updateOrganizationMembership(
  admin: SupabaseClient,
  organizationId: string,
  membershipId: string,
  patch: {
    role?: OrganizationMembershipRole;
    status?: OrganizationMembershipStatus;
  },
): Promise<OrganizationMembershipRecord> {
  if (patch.role && !SCHOOL_ADMIN_ASSIGNABLE_ROLES.has(patch.role)) {
    throw new Error("Only owner or admin roles can be assigned from this UI.");
  }

  const { data: existing, error: existingError } = await admin
    .from("organization_memberships")
    .select(
      "id, organization_id, user_id, role, status, created_at, updated_at",
    )
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) {
    throw new Error("Membership not found.");
  }

  const { data, error } = await admin
    .from("organization_memberships")
    .update(patch)
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
    .select(
      "id, organization_id, user_id, role, status, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to update membership.");
  }

  const email = await resolveUserEmail(admin, String(data.user_id));
  return rowToMembership(data as Record<string, unknown>, email);
}
