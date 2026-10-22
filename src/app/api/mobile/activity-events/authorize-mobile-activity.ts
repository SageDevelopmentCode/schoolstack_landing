import type { SupabaseClient } from "@supabase/supabase-js";
import { userHasParentAccess } from "@/lib/admissions/parent-portal-access";
import {
  isPlatformAdmin,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { userHasTeacherPortalAccess } from "@/lib/staff/teacher-portal-access";

export type MobilePortalSurface =
  | "parent_portal"
  | "school_admin"
  | "teacher_portal"
  | "platform_admin";

export type MobileActivityAuthResult =
  | {
      ok: true;
      actorType: "parent" | "school_admin" | "platform_admin" | "teacher";
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
  if (surface === "platform_admin") {
    const platformAdmin = await isPlatformAdmin(supabase, userId);
    if (!platformAdmin) {
      return {
        ok: false,
        status: 403,
        error: "Platform admin access is required.",
        code: "forbidden",
      };
    }

    return { ok: true, actorType: "platform_admin" };
  }

  if (!organizationId) {
    return {
      ok: false,
      status: 400,
      error: "organizationId is required for this surface.",
      code: "invalid_organization",
    };
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

  if (surface === "teacher_portal") {
    const allowed = await userHasTeacherPortalAccess(
      supabase,
      userId,
      organizationId,
    );

    if (!allowed) {
      return {
        ok: false,
        status: 403,
        error: "You do not have teacher portal access to this school.",
        code: "forbidden",
      };
    }

    return { ok: true, actorType: "teacher" };
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
