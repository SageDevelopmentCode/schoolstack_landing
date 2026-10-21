import type { SupabaseClient } from '@supabase/supabase-js';

import type { PersistedPortalState } from '@/lib/auth/portal-persistence';
import { resolvePortalForSchool } from '@/lib/auth/resolve-portal';

async function isPlatformAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role === 'admin';
}

export type ReconciledPortalState = PersistedPortalState & {
  didChange: boolean;
};

function resolvePlatformAdminSessionFlag(
  resolvedPortalType: PersistedPortalState['portalType'],
  persistedIsPlatformAdminSession: boolean,
  userIsPlatformAdmin: boolean,
): boolean {
  if (resolvedPortalType === 'platform_admin') {
    return true;
  }
  if (resolvedPortalType === 'school_admin') {
    return userIsPlatformAdmin && persistedIsPlatformAdminSession;
  }
  return false;
}

/**
 * Re-resolve portal access for a persisted school session so stale school_admin
 * state cannot outrank a teacher/parent membership after sign-in or app resume.
 */
export async function reconcilePersistedPortal(
  supabase: SupabaseClient,
  userId: string,
  persisted: PersistedPortalState,
): Promise<ReconciledPortalState> {
  if (persisted.previewSession) {
    return { ...persisted, didChange: false };
  }

  if (!persisted.portalType || !persisted.selectedSchool) {
    return { ...persisted, didChange: false };
  }

  if (persisted.portalType === 'platform_admin') {
    return { ...persisted, didChange: false };
  }

  const resolved = await resolvePortalForSchool(
    supabase,
    userId,
    persisted.selectedSchool,
  );

  const portalTypeChanged = resolved.portalType !== persisted.portalType;
  const userIsPlatformAdmin = await isPlatformAdmin(supabase, userId);
  const isPlatformAdminSession = resolvePlatformAdminSessionFlag(
    resolved.portalType,
    persisted.isPlatformAdminSession,
    userIsPlatformAdmin,
  );

  const platformAdminFlagChanged =
    isPlatformAdminSession !== persisted.isPlatformAdminSession;

  return {
    portalType: resolved.portalType,
    selectedSchool: resolved.school ?? persisted.selectedSchool,
    isPlatformAdminSession,
    previewSession: null,
    persistedUserId: persisted.persistedUserId,
    didChange: portalTypeChanged || platformAdminFlagChanged,
  };
}
