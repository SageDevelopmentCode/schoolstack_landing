import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  getStaffPreviewContext as getStaffPreviewContextImpl,
  getStaffPreviewProfile as getStaffPreviewProfileImpl,
} from "./staff-preview-access";

const getStaffPreviewProfileByMember = cache(
  async (organizationId: string, staffMemberId: string) => {
    const admin = createAdminClient();
    return getStaffPreviewProfileImpl(admin, organizationId, staffMemberId);
  },
);

const getStaffPreviewContextByMember = cache(
  async (organizationId: string, staffMemberId: string) => {
    const admin = createAdminClient();
    return getStaffPreviewContextImpl(admin, organizationId, staffMemberId);
  },
);

export async function getStaffPreviewProfile(
  _supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
) {
  return getStaffPreviewProfileByMember(organizationId, staffMemberId);
}

export async function getStaffPreviewContext(
  _supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
) {
  return getStaffPreviewContextByMember(organizationId, staffMemberId);
}
