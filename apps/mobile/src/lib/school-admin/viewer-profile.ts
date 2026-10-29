import type { User } from '@supabase/supabase-js';
import { useMemo } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { userFirstNameFromMetadata } from '@/lib/school-admin/greeting';
import { usePortalPreview } from '@/lib/portal-preview-gating';

export type SchoolAdminViewerProfile = {
  displayName: string;
  email: string;
  firstName: string | null;
  profilePhotoUrl: string | null;
  isPreview: boolean;
};

function firstNameFromDisplayName(displayName: string): string | null {
  const trimmed = displayName.trim();
  if (!trimmed) return null;
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0] || null;
  }
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function profileFromSubjectLabel(subjectLabel: string): Pick<
  SchoolAdminViewerProfile,
  'displayName' | 'email' | 'firstName'
> {
  const label = subjectLabel.trim();
  const email = label.includes('@') ? label : '';
  const displayName = email ? email.split('@')[0] || label : label;
  return {
    displayName: displayName || 'School admin',
    email: email || label,
    firstName: firstNameFromDisplayName(displayName || label),
  };
}

export function resolveSchoolAdminViewerProfile(
  user: User | null,
  previewSession: ReturnType<typeof usePortalPreview>['session'],
  apiProfile?: {
    displayName?: string;
    email?: string;
    profilePhotoUrl?: string | null;
  } | null,
): SchoolAdminViewerProfile {
  if (previewSession?.portal === 'school_admin') {
    const fromSubject = profileFromSubjectLabel(previewSession.subjectLabel);
    const displayName = apiProfile?.displayName?.trim() || fromSubject.displayName;
    const email = apiProfile?.email?.trim() || fromSubject.email;
    return {
      displayName,
      email,
      firstName: firstNameFromDisplayName(displayName),
      profilePhotoUrl: apiProfile?.profilePhotoUrl ?? null,
      isPreview: true,
    };
  }

  const firstName = userFirstNameFromMetadata(user);
  const displayName = firstName ?? user?.email?.split('@')[0] ?? 'Admin';

  return {
    displayName,
    email: user?.email?.trim() ?? '',
    firstName,
    profilePhotoUrl: null,
    isPreview: false,
  };
}

export function useSchoolAdminViewerProfile(
  apiProfile?: {
    displayName?: string;
    email?: string;
    profilePhotoUrl?: string | null;
  } | null,
): SchoolAdminViewerProfile {
  const { user } = useAuth();
  const { session } = usePortalPreview();

  return useMemo(
    () => resolveSchoolAdminViewerProfile(user, session, apiProfile),
    [apiProfile, session, user],
  );
}
