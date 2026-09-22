import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { impersonateBackRoute } from '@/lib/platform-admin/impersonate-nav';
import { getActivePreviewSession, isPreviewSessionActive } from '@/lib/platform-admin/preview-session-store';
import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';

export function usePortalPreview(): {
  isPreview: boolean;
  readOnly: boolean;
  session: PortalPreviewSession | null;
} {
  const { previewSession } = useAuth();
  const session = previewSession ?? getActivePreviewSession();

  return useMemo(
    () => ({
      isPreview: session !== null,
      readOnly: session !== null,
      session,
    }),
    [session],
  );
}

export function usePortalReadOnly(): boolean {
  return usePortalPreview().readOnly;
}

export function combinePreviewDisabled(disabled = false): boolean {
  return disabled || isPreviewSessionActive();
}

export function guardPreviewWrite(action: () => void): void {
  if (isPreviewSessionActive()) {
    Alert.alert('Read-only preview', 'This action is disabled while previewing a portal.');
    return;
  }
  action();
}

export function useExitPortalPreviewNavigation() {
  const router = useRouter();
  const { exitPortalPreview } = useAuth();

  return useCallback(async () => {
    await exitPortalPreview();
    router.replace(impersonateBackRoute() as never);
  }, [exitPortalPreview, router]);
}
