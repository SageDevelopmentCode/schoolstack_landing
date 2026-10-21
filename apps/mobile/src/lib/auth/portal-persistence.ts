import * as SecureStore from 'expo-secure-store';

import type { PortalType, ResolvedPortal } from '@/lib/auth/resolve-portal';
import type { LiveOrganization } from '@/lib/organizations';
import { normalizeStoredOrganization } from '@/lib/organizations';
import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';
import { setActivePreviewSession } from '@/lib/platform-admin/preview-session-store';

export const PORTAL_TYPE_KEY = 'mobile_auth_portal_type';
export const SELECTED_SCHOOL_KEY = 'mobile_auth_selected_school';
export const PLATFORM_ADMIN_SESSION_KEY = 'mobile_auth_platform_admin_session';
export const PREVIEW_SESSION_KEY = 'mobile_auth_preview_session';
export const PORTAL_USER_ID_KEY = 'mobile_auth_portal_user_id';

export type PersistedPortalState = {
  portalType: PortalType | null;
  selectedSchool: LiveOrganization | null;
  isPlatformAdminSession: boolean;
  previewSession: PortalPreviewSession | null;
  persistedUserId: string | null;
};

const EMPTY_PERSISTED_STATE: PersistedPortalState = {
  portalType: null,
  selectedSchool: null,
  isPlatformAdminSession: false,
  previewSession: null,
  persistedUserId: null,
};

async function persistPreviewSession(session: PortalPreviewSession | null) {
  if (session) {
    await SecureStore.setItemAsync(PREVIEW_SESSION_KEY, JSON.stringify(session));
  } else {
    await SecureStore.deleteItemAsync(PREVIEW_SESSION_KEY);
  }
  setActivePreviewSession(session);
}

export async function persistPortalState(
  portal: ResolvedPortal,
  isPlatformAdminSession: boolean,
  previewSession: PortalPreviewSession | null,
  userId: string,
) {
  await SecureStore.setItemAsync(PORTAL_USER_ID_KEY, userId);
  await SecureStore.setItemAsync(PORTAL_TYPE_KEY, portal.portalType);
  await SecureStore.setItemAsync(
    PLATFORM_ADMIN_SESSION_KEY,
    isPlatformAdminSession ? 'true' : 'false',
  );
  if (portal.school) {
    await SecureStore.setItemAsync(SELECTED_SCHOOL_KEY, JSON.stringify(portal.school));
  } else {
    await SecureStore.deleteItemAsync(SELECTED_SCHOOL_KEY);
  }
  await persistPreviewSession(previewSession);
}

export async function clearPortalState() {
  setActivePreviewSession(null);
  await Promise.all([
    SecureStore.deleteItemAsync(PORTAL_TYPE_KEY),
    SecureStore.deleteItemAsync(SELECTED_SCHOOL_KEY),
    SecureStore.deleteItemAsync(PLATFORM_ADMIN_SESSION_KEY),
    SecureStore.deleteItemAsync(PREVIEW_SESSION_KEY),
    SecureStore.deleteItemAsync(PORTAL_USER_ID_KEY),
  ]);
}

export async function readPersistedPortalState(
  expectedUserId?: string | null,
): Promise<PersistedPortalState> {
  const [portalType, schoolJson, platformAdminSession, previewJson, persistedUserId] =
    await Promise.all([
      SecureStore.getItemAsync(PORTAL_TYPE_KEY),
      SecureStore.getItemAsync(SELECTED_SCHOOL_KEY),
      SecureStore.getItemAsync(PLATFORM_ADMIN_SESSION_KEY),
      SecureStore.getItemAsync(PREVIEW_SESSION_KEY),
      SecureStore.getItemAsync(PORTAL_USER_ID_KEY),
    ]);

  if (
    expectedUserId &&
    persistedUserId &&
    persistedUserId !== expectedUserId
  ) {
    await clearPortalState();
    return EMPTY_PERSISTED_STATE;
  }

  let selectedSchool: LiveOrganization | null = null;
  if (schoolJson) {
    try {
      selectedSchool = normalizeStoredOrganization(JSON.parse(schoolJson) as LiveOrganization);
    } catch {
      selectedSchool = null;
    }
  }

  let previewSession: PortalPreviewSession | null = null;
  if (previewJson) {
    try {
      previewSession = JSON.parse(previewJson) as PortalPreviewSession;
    } catch {
      previewSession = null;
    }
  }

  setActivePreviewSession(previewSession);

  return {
    portalType: portalType as PortalType | null,
    selectedSchool,
    isPlatformAdminSession: platformAdminSession === 'true',
    previewSession,
    persistedUserId,
  };
}
