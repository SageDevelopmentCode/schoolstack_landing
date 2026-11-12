import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  parentPortalNavContextsFromPrograms,
  type EnrolledProgramPortalSummary,
} from "@/lib/admissions/program-parent-portal-access";
import {
  getFamilyUserProfile as getFamilyUserProfileImpl,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type { PortalAccountLinkContext } from "@/lib/auth/portal-account-link-context";
import {
  fetchParentPortalAccess,
  parentPortalAccessHasProgram,
  type ParentPortalAccess,
} from "@/lib/parent-portal/parent-portal-access-rpc";
import { getRequestUserFromClaims } from "@/lib/auth/session";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/server";

const getCachedRequestUser = cache(async () => getRequestUserFromClaims());

const getRequestSupabase = cache(async () => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
});

const getFamilyUserProfileByOrg = cache(
  async (organizationId: string): Promise<FamilyUserProfile | null> => {
    const user = await getCachedRequestUser();
    if (!user) return null;

    const supabase = await getRequestSupabase();
    return getFamilyUserProfileImpl(supabase, user.id, organizationId, user);
  },
);

/**
 * One `parent_portal_access` RPC per school per request. Family ids, student ids, enrolled
 * programs and the enrolled-access flags below are all derived from it.
 */
const getParentPortalAccessByOrg = cache(
  async (organizationId: string): Promise<ParentPortalAccess | null> => {
    const user = await getCachedRequestUser();
    if (!user) return null;

    const supabase = await getRequestSupabase();
    return fetchParentPortalAccess(supabase, organizationId, user.id);
  },
);

const getPortalLinkContextByOrg = cache(
  async (organizationId: string): Promise<PortalAccountLinkContext | null> => {
    const access = await getParentPortalAccessByOrg(organizationId);
    return access?.link ?? null;
  },
);

const getFamilyIdsByOrg = cache(async (organizationId: string): Promise<string[]> => {
  const access = await getParentPortalAccessByOrg(organizationId);
  return access?.familyIds ?? [];
});

const getRequestUserHasEnrolledAccessByOrg = cache(
  async (organizationId: string): Promise<boolean> => {
    const access = await getParentPortalAccessByOrg(organizationId);
    return access?.hasEnrolledAccess ?? false;
  },
);

const getRequestUserHasProgramAccess = cache(
  async (organizationId: string, programId: string): Promise<boolean> => {
    const access = await getParentPortalAccessByOrg(organizationId);
    return access ? parentPortalAccessHasProgram(access, programId) : false;
  },
);

const getEnrolledProgramsByOrg = cache(
  async (organizationId: string): Promise<EnrolledProgramPortalSummary[]> => {
    const access = await getParentPortalAccessByOrg(organizationId);
    return access?.enrolledPrograms ?? [];
  },
);

/** Cached access snapshot for the signed-in parent (null when signed out). */
export async function getParentPortalAccess(
  organizationId: string,
): Promise<ParentPortalAccess | null> {
  return getParentPortalAccessByOrg(organizationId);
}

export async function getParentPortalUserProfile(
  organizationId: string,
): Promise<FamilyUserProfile> {
  const profile = await getFamilyUserProfileByOrg(organizationId);
  if (!profile) {
    throw new Error("Parent portal user profile is not available.");
  }
  return profile;
}

export async function getParentPortalFamilyIds(
  organizationId: string,
): Promise<string[]> {
  return getFamilyIdsByOrg(organizationId);
}

export async function getParentPortalPrimaryFamilyId(
  organizationId: string,
): Promise<string | null> {
  const familyIds = await getFamilyIdsByOrg(organizationId);
  return familyIds[0] ?? null;
}

export async function getCachedPortalAccountLinkContext(
  organizationId: string,
): Promise<PortalAccountLinkContext> {
  const context = await getPortalLinkContextByOrg(organizationId);
  if (!context) {
    throw new Error("Parent portal account link context is not available.");
  }
  return context;
}

export async function getCachedParentPortalEnrolledAccess(
  organizationId: string,
): Promise<boolean> {
  return getRequestUserHasEnrolledAccessByOrg(organizationId);
}

export async function getCachedParentPortalProgramAccess(
  organizationId: string,
  programId: string,
): Promise<boolean> {
  return getRequestUserHasProgramAccess(organizationId, programId);
}

/**
 * Page-level access guard for parent portal routes. Layouts are not guaranteed to
 * run on every navigation, so any page that loads data (especially with the admin
 * client) must call this before loading it. Uses the same per-request cached
 * checks as the layouts, so it adds no extra queries when a layout already ran.
 *
 * - No session: `notFound()`.
 * - Program scope without enrollment in that program: `notFound()`.
 * - Main portal without any enrolled student: redirect to the apply page when
 *   `schoolSlug` is given (matches the protected layout), otherwise `notFound()`.
 */
export async function requireParentPortalAccess(input: {
  organizationId: string;
  programId?: string | null;
  schoolSlug?: string;
}): Promise<{ userId: string }> {
  const user = await getCachedRequestUser();
  if (!user) {
    notFound();
  }

  if (input.programId) {
    const hasProgramAccess = await getRequestUserHasProgramAccess(
      input.organizationId,
      input.programId,
    );
    if (!hasProgramAccess) {
      notFound();
    }
    return { userId: user.id };
  }

  const hasEnrolledAccess = await getRequestUserHasEnrolledAccessByOrg(
    input.organizationId,
  );
  if (!hasEnrolledAccess) {
    if (input.schoolSlug) {
      redirect(`/school/${input.schoolSlug}/apply`);
    }
    notFound();
  }

  return { userId: user.id };
}

export async function getCachedParentPortalNavContexts(input: {
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
}): Promise<ParentPortalContextOption[]> {
  const enrolledPrograms = await getEnrolledProgramsByOrg(input.organizationId);
  return parentPortalNavContextsFromPrograms({
    schoolSlug: input.schoolSlug,
    schoolName: input.schoolName,
    orgFeatures: input.orgFeatures,
    enrolledPrograms,
  });
}
