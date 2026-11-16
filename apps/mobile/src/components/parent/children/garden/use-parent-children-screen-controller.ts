import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { resolveWebUrl, schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import type { LoadedEnrollmentChecklist } from '@/lib/admissions/enrollment-checklist';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import {
  programPortalChildrenEmptyMessage,
  type ChildProfileData,
  type ParentChildRecordSection,
} from '@/lib/parent/parent-children-utils';
import { fetchParentChildProfile, type ParentHomeData } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type ParentChildrenHomeState = {
  data: ParentHomeData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * Children data + callbacks (no UI): home data (main or program), the lazy
 * per-child profile cache, the deep link to one child, and the empty-state
 * link. Same requests and operation names as the Story screen.
 */
export function useParentChildrenScreenController({
  slug,
  initialApplicationId,
  home,
  programPortalLabel,
}: {
  slug: string;
  initialApplicationId?: string;
  home: ParentChildrenHomeState;
  programPortalLabel?: string;
}) {
  const { data, isLoading, isRefreshing, error, refresh } = home;
  const children = useMemo(() => data?.familyChildren ?? [], [data?.familyChildren]);
  const organizationId = data?.organizationId ?? '';
  const { reportError } = useMobileErrorReporter(organizationId);
  const deepLinkHandled = useRef(false);

  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    children[0]?.applicationId ?? null,
  );
  const [profiles, setProfiles] = useState<Record<string, ChildProfileData>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [recordSection, setRecordSection] = useState<ParentChildRecordSection>('application');
  /** Bumped whenever the screen should scroll the record card into view. */
  const [recordScrollTick, setRecordScrollTick] = useState(0);

  const selectedChild = useMemo(
    () => children.find((child) => child.applicationId === selectedApplicationId) ?? null,
    [children, selectedApplicationId],
  );
  const selectedProfile = selectedApplicationId ? (profiles[selectedApplicationId] ?? null) : null;

  useEffect(() => {
    if (children.length === 0) {
      setSelectedApplicationId(null);
      return;
    }
    if (initialApplicationId && children.some((c) => c.applicationId === initialApplicationId)) {
      return;
    }
    if (!selectedApplicationId || !children.some((c) => c.applicationId === selectedApplicationId)) {
      setSelectedApplicationId(children[0].applicationId);
    }
  }, [children, initialApplicationId, selectedApplicationId]);

  const loadProfile = useCallback(
    async (applicationId: string, force = false) => {
      if (!organizationId || (!force && profiles[applicationId])) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      setProfileError(null);
      try {
        const profile = await fetchParentChildProfile(applicationId, organizationId);
        setProfiles((prev) => ({ ...prev, [applicationId]: profile }));
      } catch (loadError) {
        setProfileError(
          loadError instanceof Error ? loadError.message : 'Failed to load student profile.',
        );
        reportError('parent_children_load_profile', loadError, {
          entityType: 'application',
          entityId: applicationId,
        });
      } finally {
        setProfileLoading(false);
      }
    },
    [organizationId, profiles, reportError],
  );

  useEffect(() => {
    if (!selectedApplicationId) return;
    void loadProfile(selectedApplicationId);
  }, [loadProfile, selectedApplicationId]);

  useEffect(() => {
    if (!initialApplicationId || deepLinkHandled.current) return;
    if (!children.some((child) => child.applicationId === initialApplicationId)) return;
    deepLinkHandled.current = true;
    setSelectedApplicationId(initialApplicationId);
    setRecordSection('application');
    setProfileLoading(true);
    void loadProfile(initialApplicationId);
    setRecordScrollTick((tick) => tick + 1);
  }, [children, initialApplicationId, loadProfile]);

  const selectChild = useCallback(
    (applicationId: string) => {
      setSelectedApplicationId(applicationId);
      setRecordSection('application');
      if (profiles[applicationId]) return;
      setProfileLoading(true);
      void loadProfile(applicationId);
    },
    [loadProfile, profiles],
  );

  const openRecordSection = useCallback(
    (section: ParentChildRecordSection) => {
      if (!selectedApplicationId) return;
      setRecordSection(section);
      void loadProfile(selectedApplicationId);
      setRecordScrollTick((tick) => tick + 1);
    },
    [loadProfile, selectedApplicationId],
  );

  const retryProfile = useCallback(() => {
    if (selectedApplicationId) void loadProfile(selectedApplicationId, true);
  }, [loadProfile, selectedApplicationId]);

  const patchProfile = useCallback(
    (applicationId: string, patch: (profile: ChildProfileData) => ChildProfileData) => {
      setProfiles((prev) => {
        const existing = prev[applicationId];
        return existing ? { ...prev, [applicationId]: patch(existing) } : prev;
      });
    },
    [],
  );

  const onPhotoUpdated = useCallback(
    (applicationId: string, profilePhotoUrl: string) =>
      patchProfile(applicationId, (p) => ({
        ...p,
        application: { ...p.application, profilePhotoUrl },
      })),
    [patchProfile],
  );

  const onChecklistUpdated = useCallback(
    (applicationId: string, checklist: LoadedEnrollmentChecklist) =>
      patchProfile(applicationId, (p) => ({ ...p, checklist })),
    [patchProfile],
  );

  const openApplyDashboard = useCallback(async () => {
    await openExternalUrlSafely(resolveWebUrl(schoolApplyUrl(slug)), reportError, {
      operation: 'parent_children_open_apply_dashboard',
      errorTitle: 'Could not open application',
    });
  }, [reportError, slug]);

  return {
    slug,
    organizationId,
    isInitialLoading: isLoading && !data,
    loadError: error && !data ? error : null,
    refreshError: error,
    isRefreshing,
    refresh,
    children,
    selectedChild,
    selectedProfile,
    isRecordLoading:
      Boolean(selectedChild) && profileLoading && !selectedProfile?.application && !profileError,
    profileError,
    retryProfile,
    selectChild,
    recordSection,
    setRecordSection,
    openRecordSection,
    recordScrollTick,
    onPhotoUpdated,
    onChecklistUpdated,
    emptyMessage: programPortalLabel ? programPortalChildrenEmptyMessage(programPortalLabel) : null,
    openApplyDashboard,
  };
}

export type ParentChildrenScreenController = ReturnType<typeof useParentChildrenScreenController>;
