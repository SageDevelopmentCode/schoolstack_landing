import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  GardenInlineError,
  GardenSelectionList,
  GardenSelectionRow,
  GardenSelectionSkeleton,
} from '@/components/garden-nav/garden-more';
import { useAuth } from '@/contexts/auth-context';
import { usePortalTransition } from '@/contexts/portal-transition-context';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { ACCOUNT_PORTAL_MORE_MENU_META } from '@/lib/auth/account-portal-more-menu-meta';
import { getMobileEntryRoute } from '@/lib/auth/mobile-portal-entry';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import {
  ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE,
  accountPortalIdToPortalType,
  type AccountPortalId,
  type SchoolPortalOption,
} from '@/lib/auth/school-portal-options-types';
import { useSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';

type AccountPortalSwitcherPanelProps = {
  organizationId: string;
  slug: string;
  currentPortalId: AccountPortalId | null;
  enabled?: boolean;
  sectionTitle?: string;
  onAfterSelect?: () => void;
};

export function useAccountPortalSwitcherVisibility(
  organizationId: string | null | undefined,
  slug: string | null | undefined,
  enabled = true,
) {
  const { isPlatformAdminSession, previewSession } = useAuth();
  const portalOptionsEnabled =
    enabled && Boolean(organizationId && slug) && !isPlatformAdminSession && !previewSession;

  const { loading, showSwitcher } = useSchoolPortalOptions({
    organizationId,
    slug,
    enabled: portalOptionsEnabled,
  });

  const showAccountPortalSection = portalOptionsEnabled && !loading && showSwitcher;

  return { showAccountPortalSection, loading, showSwitcher, portalOptionsEnabled };
}

export function AccountPortalSwitcherPanel({
  organizationId,
  slug,
  currentPortalId,
  enabled = true,
  sectionTitle = ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE,
  onAfterSelect,
}: AccountPortalSwitcherPanelProps) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const {
    switchAccountPortal,
    clearAccountPortalSwitchInProgress,
    isPlatformAdminSession,
    previewSession,
  } = useAuth();
  const { beginPortalTransition } = usePortalTransition();
  const [switching, setSwitching] = useState(false);
  const [switchingId, setSwitchingId] = useState<AccountPortalId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const portalOptionsEnabled =
    enabled && !isPlatformAdminSession && !previewSession;

  const { options, loading, showSwitcher } = useSchoolPortalOptions({
    organizationId,
    slug,
    enabled: portalOptionsEnabled,
  });

  if (!portalOptionsEnabled) {
    return null;
  }

  if (loading) {
    return <GardenSelectionSkeleton kicker={sectionTitle} />;
  }

  if (!showSwitcher) {
    return null;
  }

  const handleSelect = async (option: SchoolPortalOption) => {
    if (option.id === currentPortalId || switching) {
      return;
    }

    setSwitching(true);
    setSwitchingId(option.id);
    setError(null);
    try {
      beginPortalTransition({ targetPortalType: accountPortalIdToPortalType(option.id) });
      const portal = await switchAccountPortal(option.id);
      router.replace(getMobileEntryRoute(portal.portalType, slug));
      onAfterSelect?.();
    } catch (selectError) {
      clearAccountPortalSwitchInProgress();
      if (!(selectError instanceof PortalAccessError)) {
        reportError('account_portal_switch', selectError, {
          entityType: 'portal',
          entityId: option.id,
        });
      }
      setSwitchingId(null);
      setError(
        selectError instanceof PortalAccessError || selectError instanceof Error
          ? selectError.message
          : 'Unable to switch portal. Please try again.',
      );
      setSwitching(false);
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
