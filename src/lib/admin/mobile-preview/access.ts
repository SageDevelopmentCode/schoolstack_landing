import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { assertStaffMemberBelongsToOrg } from "@/lib/staff/staff-preview-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";

export type MobilePreviewQuery = {
  organizationId: string;
  slug: string;
  familyId: string | null;
  staffMemberId: string | null;
  membershipId: string | null;
};

export class MobilePreviewAccessError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "MobilePreviewAccessError";
    this.code = code;
  }
}

export function parseMobilePreviewQuery(request: Request): MobilePreviewQuery {
  const { searchParams } = new URL(request.url);

  return {
    organizationId: searchParams.get("organizationId")?.trim() ?? "",
    slug: searchParams.get("slug")?.trim() ?? "",
    familyId: searchParams.get("familyId")?.trim() || null,
    staffMemberId: searchParams.get("staffMemberId")?.trim() || null,
    membershipId: searchParams.get("membershipId")?.trim() || null,
  };
}

export async function requireMobilePreviewPlatformAdmin(request: Request) {
  const supabase = await createClientFromRequest(request);
  return requirePlatformAdminUser(supabase);
}

export async function validateFamilyInOrganization(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<void> {
  const { data, error } = await admin
    .from("families")
    .select("id")
    .eq("id", familyId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new MobilePreviewAccessError("Family not found.", "not_found");
  }
}

export async function validateStaffInOrganization(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<void> {
  await assertStaffMemberBelongsToOrg(admin, organizationId, staffMemberId);
}

export function readOnlyPreviewResponse(): Response {
  return NextResponse.json(
    {
      error: "Preview mode is read-only.",
      code: "read_only_preview",
    },
    { status: 403 },
  );
}

/** Sentinel user id when the previewed guardian has no linked auth account. */
export const PREVIEW_NO_USER_ID = "00000000-0000-0000-0000-000000000000";
