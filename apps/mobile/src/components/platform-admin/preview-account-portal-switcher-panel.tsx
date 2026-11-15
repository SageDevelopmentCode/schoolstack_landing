import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import {
  GardenInlineError,
  GardenSelectionList,
  GardenSelectionRow,
  GardenSelectionSkeleton,
} from '@/components/garden-nav/garden-more';
import { useAuth } from '@/contexts/auth-context';
import { usePortalTransition } from '@/contexts/portal-transition-context';
import { ACCOUNT_PORTAL_MORE_MENU_META } from '@/lib/auth/account-portal-more-menu-meta';
import {
  ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE,
  accountPortalIdToPortalType,
  portalTypeToAccountPortalId,
  shouldShowMobilePortalSwitcher,
  type AccountPortalId,
  type SchoolPortalOption,
} from '@/lib/auth/school-portal-options-types';
import { impersonatePreviewHomeRoute } from '@/lib/platform-admin/impersonate-nav';
import {
  fetchPreviewPortalOptions,
  resolvePreviewTargetForOption,
  type PreviewPortalSwitchTarget,
} from '@/lib/platform-admin/preview-portal-switch';

type PreviewAccountPortalSwitcherPanelProps = {
  enabled?: boolean;
  sectionTitle?: string;
  onAfterSelect?: () => void;
};

export function usePreviewAccountPortalSwitcherVisibility(enabled = true): {
  showPreviewAccountPortalSection: boolean;
  loading: boolean;
} {
  const { previewSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  useEffect(() => {
    if (!enabled || !previewSession) {
      setShowSwitcher(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void fetchPreviewPortalOptions(previewSession)
      .then((payload) => {
        if (cancelled) return;
        setShowSwitcher(shouldShowMobilePortalSwitcher(payload.options));
      })
      .catch(() => {
        if (!cancelled) {
          setShowSwitcher(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    previewSession?.organizationId,
    previewSession?.slug,
    previewSession?.membershipId,
    previewSession?.staffMemberId,
    previewSession?.familyId,
    previewSession?.portal,
  ]);

  return {
    showPreviewAccountPortalSection: Boolean(enabled && previewSession && showSwitcher),
    loading,
  };
}

export function PreviewAccountPortalSwitcherPanel({
  enabled = true,
  sectionTitle = ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE,
  onAfterSelect,
}: PreviewAccountPortalSwitcherPanelProps) {
  const router = useRouter();
  const { previewSession, portalType, switchPortalPreview } = useAuth();
  const { beginPortalTransition } = usePortalTransition();
  const [options, setOptions] = useState<SchoolPortalOption[]>([]);
  const [targets, setTargets] = useState<
    Partial<Record<AccountPortalId, PreviewPortalSwitchTarget>>
  >({});
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchingId, setSwitchingId] = useState<AccountPortalId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const currentPortalId = portalTypeToAccountPortalId(portalType);

  const load = useCallback(async () => {
    if (!enabled || !previewSession) {
      setOptions([]);
      setTargets({});
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchPreviewPortalOptions(previewSession);
      if (requestId !== requestIdRef.current) return;
      setOptions(payload.options);
      setTargets(payload.targets);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      setOptions([]);
      setTargets({});
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load preview portal options.',
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    enabled,
    previewSession?.organizationId,
    previewSession?.slug,
    previewSession?.membershipId,
    previewSession?.staffMemberId,
    previewSession?.familyId,
    previewSession?.portal,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!enabled || !previewSession) {
    return null;
  }

  if (loading && options.length === 0) {
    return <GardenSelectionSkeleton kicker={sectionTitle} />;
  }

  if (!shouldShowMobilePortalSwitcher(options)) {
    return null;
  }

  const handleSelect = async (option: SchoolPortalOption) => {
    if (option.id === currentPortalId || switching) {
      return;
    }

    const target = resolvePreviewTargetForOption(option.id, targets);
    if (!target) {
      setError('Preview mode could not switch to that portal.');
      return;
    }

    setSwitching(true);
    setSwitchingId(option.id);
    setError(null);
    try {
      beginPortalTransition({ targetPortalType: accountPortalIdToPortalType(option.id) });
      await switchPortalPreview(target);

      let entryPath = impersonatePreviewHomeRoute(target.portal, previewSession.slug);
      if (target.portal === 'parent') {
        try {
          const { fetchParentPortalContexts } = await import('@/lib/parent/parent-portal-api');
          const contexts = await fetchParentPortalContexts(
            previewSession.organizationId,
            previewSession.slug,
          );
          entryPath = contexts.defaultMobileEntryPath;
        } catch {
          // Fall back to main parent home.
        }
      }

      router.replace(entryPath as never);
      onAfterSelect?.();
    } catch (selectError) {
      setError(
        selectError instanceof Error
          ? selectError.message
          : 'Unable to switch preview portal.',
      );
    } finally {
      setSwitching(false);
      setSwitchingId(null);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <GardenSelectionList kicker={sectionTitle}>
        {options.map((option, index) => {
          const meta = ACCOUNT_PORTAL_MORE_MENU_META[option.id];
          const isCurrent = option.id === currentPortalId;
          return (
            <GardenSelectionRow
              key={option.id}
              isFirst={index === 0}
              label={option.label}
              subtitle={meta.subtitle}
              icon={meta.icon}
              iconBg={meta.iconBg}
              selected={isCurrent}
              busy={switchingId === option.id}
              disabled={switching}
              onPress={() => void handleSelect(option)}
            />
          );
        })}
      </GardenSelectionList>
      {error ? <GardenInlineError message={error} /> : null}
    </View>
  );
}
