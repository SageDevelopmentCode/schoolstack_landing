import { useRouter } from 'expo-router';
import { useState } from 'react';

import { StoryEmbeddedSwitcherSection } from '@/components/story/more/story-embedded-switcher-section';
import { StoryEmbeddedSwitcherSkeleton } from '@/components/story/more/story-embedded-switcher-skeleton';
import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryMoreMenuSelectionRow } from '@/components/story/more/story-more-menu-selection-row';
import { useAuth } from '@/contexts/auth-context';
import { usePortalTransition } from '@/contexts/portal-transition-context';
import { ACCOUNT_PORTAL_MORE_MENU_META } from '@/lib/auth/account-portal-more-menu-meta';
import { getMobileEntryRoute } from '@/lib/auth/mobile-portal-entry';
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
  const {
    switchAccountPortal,
    clearAccountPortalSwitchInProgress,
    isPlatformAdminSession,
    previewSession,
  } = useAuth();
  const { beginPortalTransition } = usePortalTransition();
  const [switching, setSwitching] = useState(false);

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
    return <StoryEmbeddedSwitcherSkeleton kicker={sectionTitle} />;
  }

  if (!showSwitcher) {
    return null;
  }

  const handleSelect = async (option: SchoolPortalOption) => {
    if (option.id === currentPortalId || switching) {
      return;
    }

    setSwitching(true);
    try {
      onAfterSelect?.();
      beginPortalTransition({ targetPortalType: accountPortalIdToPortalType(option.id) });
      const portal = await switchAccountPortal(option.id);
      router.replace(getMobileEntryRoute(portal.portalType, slug));
    } finally {
      clearAccountPortalSwitchInProgress();
      setSwitching(false);
    }
  };

  return (
    <StoryEmbeddedSwitcherSection kicker={sectionTitle}>
      {options.map((option, index) => {
        const meta = ACCOUNT_PORTAL_MORE_MENU_META[option.id];
        const isCurrent = option.id === currentPortalId;
        return (
          <StoryMoreMenuSelectionRow
            key={option.id}
            isFirst={index === 0}
            label={option.label}
            subtitle={meta.subtitle}
            selected={isCurrent}
            disabled={switching}
            onPress={() => void handleSelect(option)}
            icon={
              <StoryMoreMenuIcon
                name={meta.icon}
                iconBg={meta.iconBg}
                iconColor={meta.iconColor}
              />
            }
          />
        );
      })}
    </StoryEmbeddedSwitcherSection>
  );
}
