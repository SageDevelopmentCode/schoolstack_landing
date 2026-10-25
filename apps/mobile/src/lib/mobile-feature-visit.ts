import { InteractionManager } from 'react-native';

import { fetchWithAuth } from '@/lib/auth/auth-session';
import { isBenignClientNetworkError } from '@/lib/client-network-errors';
import { mobileClientMetadata, type MobilePortalSurface } from '@/lib/mobile-activity';
import {
  hasRecordedMobileFeatureVisit,
  markMobileFeatureVisitRecorded,
  mobileFeatureVisitSessionKey,
} from '@/lib/mobile-feature-visit-session';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

const MAX_PATHNAME_LENGTH = 200;

type ReportMobileFeatureVisitInput = {
  organizationId: string;
  surface: MobilePortalSurface;
  featureKey: string;
  pathname?: string;
  programSlug?: string;
};

function postFeatureVisit(body: Record<string, unknown>): void {
  void fetchWithAuth(`${siteUrl}/api/mobile/feature-visits`, {
    method: 'POST',
    body: JSON.stringify(body),
    includeJson: true,
    signOutOnFailure: false,
  }).catch((error) => {
    if (isBenignClientNetworkError(error)) {
      return;
    }
    console.error('[mobile-feature-visit] report failed:', error);
  });
}

export function reportMobileFeatureVisit(input: ReportMobileFeatureVisitInput): void {
  const organizationId = input.organizationId.trim();
  const featureKey = input.featureKey.trim();
  if (!organizationId || !featureKey) {
    return;
  }

  if (input.surface === 'platform_admin') {
    return;
  }
  if (
    input.surface !== 'parent_portal' &&
    input.surface !== 'teacher_portal' &&
    input.surface !== 'school_admin'
  ) {
    return;
  }

  const dedupKey = mobileFeatureVisitSessionKey(input.surface, featureKey);
  if (hasRecordedMobileFeatureVisit(dedupKey)) {
    return;
  }
  markMobileFeatureVisitRecorded(dedupKey);

  const pathname = input.pathname?.trim().slice(0, MAX_PATHNAME_LENGTH);
  const programSlug = input.programSlug?.trim();

  const payload = {
    organizationId,
    surface: input.surface,
    featureKey,
    metadata: mobileClientMetadata(),
    ...(pathname ? { pathname } : {}),
    ...(programSlug ? { programSlug } : {}),
  };

  const handle = InteractionManager.runAfterInteractions(() => {
    postFeatureVisit(payload);
  });

  void handle;
}
