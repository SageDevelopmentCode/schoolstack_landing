import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { fetchWithAuth } from '@/lib/auth/auth-session';
import type { PortalType, ResolvedPortal } from '@/lib/auth/resolve-portal';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

export type MobilePortalSurface = 'parent_portal' | 'school_admin' | 'teacher_portal';

export type MobileOperationalErrorPayload = {
  organizationId: string;
  surface: MobilePortalSurface;
  operation: string;
  error: string;
  code?: string;
  details?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  notify?: boolean;
};

export type MobileAuthActivityAction =
  | 'auth.signed_in'
  | 'auth.signed_out'
  | 'auth.session_restored';

type MobileActivityPayload = {
  organizationId?: string;
  surface: MobilePortalSurface;
  action: MobileAuthActivityAction;
  metadata?: Record<string, unknown>;
};

function mobilePlatform(): 'ios' | 'android' | undefined {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }
  return undefined;
}

function mobileAppVersion(): string | undefined {
  const version = Constants.expoConfig?.version?.trim();
  return version || undefined;
}

export function mobileClientMetadata(): Record<string, unknown> {
  const platform = mobilePlatform();
  const appVersion = mobileAppVersion();

  return {
    client: 'mobile',
    ...(platform ? { platform } : {}),
    ...(appVersion ? { appVersion } : {}),
  };
}

async function postMobileApi(path: string, body: Record<string, unknown>): Promise<void> {
  try {
    await fetchWithAuth(`${siteUrl}${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      includeJson: true,
      signOutOnFailure: false,
    });
  } catch (reportError) {
    console.error(`[mobile-activity] ${path} report failed:`, reportError);
  }
}

export function parseMobileOperationalError(err: unknown): {
  message: string;
  code?: string;
  details?: string;
} {
  if (err instanceof Error && err.message.trim()) {
    return { message: err.message.trim() };
  }

  if (typeof err === 'string' && err.trim()) {
    return { message: err.trim() };
  }

  return { message: 'Unknown error' };
}

export function shouldReportMobileOperationalError(
  err: unknown,
  responseStatus?: number,
): boolean {
  if (responseStatus !== undefined && responseStatus >= 400 && responseStatus < 500) {
    return false;
  }

  if (err instanceof Error) {
    return true;
  }

  return typeof err === 'string' && err.trim().length > 0;
}

export async function reportMobileOperationalError(
  payload: MobileOperationalErrorPayload,
  err?: unknown,
  responseStatus?: number,
): Promise<void> {
  if (!payload.organizationId || !payload.operation.trim()) {
    return;
  }

  if (err !== undefined && !shouldReportMobileOperationalError(err, responseStatus)) {
    return;
  }

  const parsed = err !== undefined ? parseMobileOperationalError(err) : null;

  await postMobileApi('/api/mobile/operational-errors', {
    surface: payload.surface,
    organizationId: payload.organizationId,
    operation: payload.operation,
    error: payload.error || parsed?.message || 'Unknown error',
    code: payload.code ?? parsed?.code,
    details: payload.details ?? parsed?.details,
    entityType: payload.entityType,
    entityId: payload.entityId,
    metadata: {
      ...mobileClientMetadata(),
      ...(payload.metadata ?? {}),
    },
    notify: payload.notify ?? true,
  });
}

export async function reportMobileActivity(payload: MobileActivityPayload): Promise<void> {
  await postMobileApi('/api/mobile/activity-events', {
    action: payload.action,
    surface: payload.surface,
    organizationId: payload.organizationId,
    metadata: {
      ...mobileClientMetadata(),
      ...(payload.metadata ?? {}),
    },
  });
}

export function portalTypeToMobileSurface(
  portalType: PortalType | null,
): MobilePortalSurface | null {
  if (portalType === 'parent' || portalType === 'parent_apply') {
    return 'parent_portal';
  }
  if (portalType === 'school_admin') {
    return 'school_admin';
  }
  if (portalType === 'teacher') {
    return 'teacher_portal';
  }
  return null;
}

export async function logMobileAuthSignedIn(
  portal: ResolvedPortal,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const surface = portalTypeToMobileSurface(portal.portalType);
  if (!surface || !portal.school?.id) {
    return;
  }

  await reportMobileActivity({
    action: 'auth.signed_in',
    surface,
    organizationId: portal.school.id,
    metadata,
  });
}

export async function logMobileAuthSignedOut(
  portalType: PortalType | null,
  organizationId: string | null | undefined,
): Promise<void> {
  const surface = portalTypeToMobileSurface(portalType);
  if (!surface || !organizationId) {
    return;
  }

  await reportMobileActivity({
    action: 'auth.signed_out',
    surface,
    organizationId,
  });
}

export async function logMobileAuthSessionRestored(
  portalType: PortalType | null,
  organizationId: string | null | undefined,
): Promise<void> {
  const surface = portalTypeToMobileSurface(portalType);
  if (!surface || !organizationId) {
    return;
  }

  await reportMobileActivity({
    action: 'auth.session_restored',
    surface,
    organizationId,
  });
}
