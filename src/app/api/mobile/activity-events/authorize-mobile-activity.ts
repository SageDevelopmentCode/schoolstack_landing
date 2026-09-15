import type { SupabaseClient } from "@supabase/supabase-js";
import { userHasParentAccess } from "@/lib/admissions/parent-portal-access";
import {
  isPlatformAdmin,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";

export type MobilePortalSurface = "parent_portal" | "school_admin";

export type MobileActivityAuthResult =
  | {
      ok: true;
      actorType: "parent" | "school_admin" | "platform_admin";
    }
  | {
      ok: false;
      status: number;
      error: string;
      code: string;
      cause?: unknown;
    };

export async function authorizeMobileActivityEvent(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string | undefined,
  surface: MobilePortalSurface,
  request?: Request,
): Promise<MobileActivityAuthResult> {
  if (!organizationId) {
    return { ok: true, actorType: "parent" };
  }

  if (surface === "parent_portal") {
    const allowed = await userHasParentAccess(supabase, userId, organizationId);

    if (!allowed) {
      return {
        ok: false,
        status: 403,
        error: "You do not have parent portal access to this school.",
        code: "forbidden",
      };
    }

    return { ok: true, actorType: "parent" };
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return {
        ok: false,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      };
    }
    throw err;
  }

  const platformAdmin = await isPlatformAdmin(supabase, userId);

  return {
    ok: true,
    actorType: platformAdmin ? "platform_admin" : "school_admin",
  };
}
