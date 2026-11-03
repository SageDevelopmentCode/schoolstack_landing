import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  getFamilyPreviewProfile as getFamilyPreviewProfileImpl,
  familyHasEnrolledAccess as familyHasEnrolledAccessImpl,
} from "./family-preview-access";

const getFamilyPreviewProfileByFamily = cache(
  async (
    organizationId: string,
    familyId: string,
    overrideGuardianId: string | null,
  ) => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return getFamilyPreviewProfileImpl(
      supabase,
      organizationId,
      familyId,
      overrideGuardianId ?? undefined,
    );
  },
);

const familyHasEnrolledAccessByFamily = cache(
  async (organizationId: string, familyId: string) => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return familyHasEnrolledAccessImpl(supabase, organizationId, familyId);
  },
);

export async function getFamilyPreviewProfile(
  _supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  overrideGuardianId?: string | null,
) {
  return getFamilyPreviewProfileByFamily(
    organizationId,
    familyId,
    overrideGuardianId?.trim() || null,
  );
}

export async function familyHasEnrolledAccess(
  _supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
) {
  return familyHasEnrolledAccessByFamily(organizationId, familyId);
}
