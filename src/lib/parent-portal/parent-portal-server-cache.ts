import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser as getFamilyIdsForUserImpl } from "@/lib/admissions/application-auth";
import {
  getFamilyUserProfile as getFamilyUserProfileImpl,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import { getRequestUser } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";

const getCachedRequestUser = cache(async () => getRequestUser());

const getFamilyUserProfileByOrg = cache(
  async (organizationId: string): Promise<FamilyUserProfile | null> => {
    const user = await getCachedRequestUser();
    if (!user) return null;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return getFamilyUserProfileImpl(supabase, user.id, organizationId, user);
  },
);

const getFamilyIdsByOrg = cache(async (organizationId: string): Promise<string[]> => {
  const user = await getCachedRequestUser();
  if (!user) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return getFamilyIdsForUserImpl(supabase, user.id, organizationId);
});

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
