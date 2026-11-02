import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForAuthUser } from "@/lib/admissions/application-auth";
import {
  getStudentIdsForFamilies,
  listEnrolledProgramsForStudentIds,
  parentPortalNavContextsFromPrograms,
  type EnrolledProgramPortalSummary,
} from "@/lib/admissions/program-parent-portal-access";
import {
  getFamilyUserProfile as getFamilyUserProfileImpl,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import {
  getPortalAccountLinkContext,
  type PortalAccountLinkContext,
} from "@/lib/auth/portal-account-link-context";
import { getRequestUser } from "@/lib/auth/session";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/server";

const getCachedRequestUser = cache(async () => getRequestUser());

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

const getPortalLinkContextByOrg = cache(
  async (organizationId: string): Promise<PortalAccountLinkContext | null> => {
    const user = await getCachedRequestUser();
    if (!user) return null;

    const supabase = await getRequestSupabase();
    return getPortalAccountLinkContext(supabase, organizationId, user.id);
  },
);

const getFamilyIdsByOrg = cache(async (organizationId: string): Promise<string[]> => {
  const user = await getCachedRequestUser();
  if (!user) return [];

  const link = await getPortalLinkContextByOrg(organizationId);
  const memberUserIds = link?.memberUserIds ?? [user.id];
  const supabase = await getRequestSupabase();
  const batches = await Promise.all(
    memberUserIds.map((memberUserId) =>
      getFamilyIdsForAuthUser(supabase, memberUserId, organizationId),
    ),
  );
  const familyIds = new Set<string>();
  for (const ids of batches) {
    for (const familyId of ids) {
      familyIds.add(familyId);
    }
  }
  return [...familyIds];
});

const getStudentIdsByOrg = cache(async (organizationId: string): Promise<string[]> => {
  const familyIds = await getFamilyIdsByOrg(organizationId);
  if (familyIds.length === 0) return [];

  const supabase = await getRequestSupabase();
  return getStudentIdsForFamilies(supabase, organizationId, familyIds);
});

const getRequestUserHasEnrolledAccessByOrg = cache(
  async (organizationId: string): Promise<boolean> => {
    const studentIds = await getStudentIdsByOrg(organizationId);
    if (studentIds.length === 0) return false;

    const supabase = await getRequestSupabase();
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("status", "enrolled")
      .in("student_id", studentIds)
      .limit(1);

    if (error) throw error;
    return (data ?? []).length > 0;
  },
);

const getRequestUserHasProgramAccess = cache(
  async (organizationId: string, programId: string): Promise<boolean> => {
    const studentIds = await getStudentIdsByOrg(organizationId);
    if (studentIds.length === 0) return false;

    const supabase = await getRequestSupabase();
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("program_id", programId)
      .eq("status", "enrolled")
      .in("student_id", studentIds)
      .limit(1);

    if (error) throw error;
    return (data ?? []).length > 0;
  },
);

const getEnrolledProgramsByOrg = cache(
  async (organizationId: string): Promise<EnrolledProgramPortalSummary[]> => {
    const studentIds = await getStudentIdsByOrg(organizationId);
    const supabase = await getRequestSupabase();
    return listEnrolledProgramsForStudentIds(
      supabase,
      organizationId,
      studentIds,
    );
  },
);

export async function getParentPortalUserProfile(
  _supabase: SupabaseClient,
  organizationId: string,
): Promise<FamilyUserProfile> {
  const profile = await getFamilyUserProfileByOrg(organizationId);
  if (!profile) {
    throw new Error("Parent portal user profile is not available.");
  }
  return profile;
}

export async function getParentPortalFamilyIds(
  _supabase: SupabaseClient,
  organizationId: string,
): Promise<string[]> {
  return getFamilyIdsByOrg(organizationId);
}

export async function getParentPortalPrimaryFamilyId(
  _supabase: SupabaseClient,
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
