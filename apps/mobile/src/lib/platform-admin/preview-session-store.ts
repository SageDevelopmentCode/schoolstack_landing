import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';

export const MOBILE_PREVIEW_SESSION_KEY = 'mobile_auth_preview_session';
export const MOBILE_PREVIEW_HEADER = 'X-MudKitchen-Preview';

let activePreviewSession: PortalPreviewSession | null = null;

export function getActivePreviewSession(): PortalPreviewSession | null {
  return activePreviewSession;
}

export function setActivePreviewSession(session: PortalPreviewSession | null): void {
  activePreviewSession = session;
}

export function isPreviewSessionActive(): boolean {
  return activePreviewSession !== null;
}

export function assertPreviewWriteAllowed(method: string | undefined): void {
  if (!isPreviewSessionActive()) return;
  if (method && method !== 'GET') {
    throw new Error('Preview mode is read-only.');
  }
}
