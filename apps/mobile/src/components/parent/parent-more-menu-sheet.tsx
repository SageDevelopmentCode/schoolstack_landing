import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AccountPortalSwitcherPanel,
  useAccountPortalSwitcherVisibility,
} from '@/components/account-portal-switcher-panel';
import { ProgramSwitcherPanel } from '@/components/program-switcher-panel';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { StoryCard } from '@/components/story/story-card';
import { StoryMoreMenuHeader } from '@/components/story/more/story-more-menu-header';
import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryMoreMenuItemRow } from '@/components/story/more/story-more-menu-item-row';
import { StoryMoreMenuItemsCard } from '@/components/story/more/story-more-menu-items-card';
import { StoryMoreMenuSectionTabs } from '@/components/story/more/story-more-menu-section-tabs';
import { StoryMoreMenuTabPanel } from '@/components/story/more/story-more-menu-tab-panel';
import { useProgramSwitcherVisibility } from '@/components/program-switcher-panel';
import { StoryMoreMenuSheetShell } from '@/components/story/more/story-more-menu-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { portalTypeToAccountPortalId } from '@/lib/auth/school-portal-options-types';
import { prefetchSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';
import { useParentHome } from '@/contexts/parent-home-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';
import {
  isParentHomeFridayBranchEnabled,
  isParentNavFridayBranchEnabled,
} from '@/lib/parent/parent-features';
import { resolveMobileMoreMenuFeatureKeys } from '@/lib/parent/mobile-parent-portal-nav';
import {
  PARENT_MORE_MENU_META,
  parentMoreMenuItemIdForFeatureKey,
} from '@/lib/parent/parent-more-menu-meta';
import type { ParentMoreMenuItemId } from '@/lib/parent/parent-nav';
import {
  buildMoreMenuTabs,
  shouldShowMoreMenuSectionTabs,
  type MoreMenuTabId,
} from '@/lib/more-menu-tab-ids';
import { ParentPortalMoreMenuItemsSkeleton } from '@/components/parent/parent-portal-program-chrome-skeleton';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentMoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: ParentMoreMenuItemId) => void;
  onSelectAccount: () => void;
};

function getDisplayName(user: User): string {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim();
  }
  const emailLocalPart = user.email?.split('@')[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart;
  }
  return 'Account';
}

export function ParentMoreMenuSheet({
  visible,
  onClose,
  onSelect,
  onSelectAccount,
}: ParentMoreMenuSheetProps) {
  const theme = useParentTheme();
  const { user, portalType } = useAuth();
  const { data: homeData, ensureLoaded } = useParentHome();
  const [activeTab, setActiveTab] = useState<MoreMenuTabId>('menu');
  const {
    contexts,
    activeContext,
    activeProgramSlug,
    showSwitcher,
    switchToContext,
    activePortalFeatures,
    isLoading: portalContextsLoading,
    programsByPortalSlug,
    slug,
    organizationId,
  } = useParentPortalContext();

  const { showAccountPortalSection } = useAccountPortalSwitcherVisibility(
    organizationId,
    slug,
    visible,
  );

  const showProgramSection = useProgramSwitcherVisibility({
    loading: portalContextsLoading,
    showSwitcher,
    contextCount: contexts.length,
  });

  const tabs = useMemo(
    () =>
      buildMoreMenuTabs({
        showAccountPortal: showAccountPortalSection,
        showProgram: showProgramSection,
      }),
    [showAccountPortalSection, showProgramSection],
  );

  const useSectionTabs = shouldShowMoreMenuSectionTabs(tabs);

  useEffect(() => {
    if (visible && organizationId && slug) {
      void prefetchSchoolPortalOptions(organizationId, slug);
    }
  }, [organizationId, slug, visible]);

  useEffect(() => {
    if (visible) {
      setActiveTab('menu');
    }
  }, [visible]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('menu');
    }
  }, [activeTab, tabs]);

  const programPortalFeaturesPending = Boolean(
    activeProgramSlug &&
      (portalContextsLoading || !programsByPortalSlug[activeProgramSlug]),
  );

  const displayName = useMemo(() => {
    const profileName = homeData?.userProfile.displayName?.trim();
    if (profileName) return profileName;
    return user ? getDisplayName(user) : '';
  }, [homeData?.userProfile.displayName, user]);

  const portalFeatureRecord = activePortalFeatures?.parent ?? homeData?.features?.parent;

  const fridayBranchSettings = homeData?.fridayBranchParentPortalPaused
    ? { parent_portal_paused: true as const }
    : { parent_portal_paused: false as const };

  const visibleMenuItemIds = useMemo(() => {
    if (programPortalFeaturesPending) {
      return [] as ParentMoreMenuItemId[];
    }

    if (!portalFeatureRecord) {
      return Object.keys(PARENT_MORE_MENU_META) as ParentMoreMenuItemId[];
    }

    const featureKeys = resolveMobileMoreMenuFeatureKeys({
      mode: activeProgramSlug ? 'program' : 'main',
      parentFeatures: portalFeatureRecord as Parameters<
        typeof resolveMobileMoreMenuFeatureKeys
      >[0]['parentFeatures'],
      portalNav: activePortalFeatures?.featureNav as Parameters<
        typeof resolveMobileMoreMenuFeatureKeys
      >[0]['portalNav'],
      coopMode: activePortalFeatures?.coopMode,
    });

    const ids = featureKeys.map((key) => parentMoreMenuItemIdForFeatureKey(key));

    if (
      isParentHomeFridayBranchEnabled(
        {
          parent: portalFeatureRecord,
          parent_home: homeData?.features?.parent_home,
        },
        fridayBranchSettings,
      ) &&
      ids.includes('friday-branch') === false &&
      isParentNavFridayBranchEnabled({ parent: portalFeatureRecord }, fridayBranchSettings)
    ) {
      ids.push('friday-branch');
    }

    return ids.filter((id) => {
      if (id === 'friday-branch') {
        return isParentNavFridayBranchEnabled(
          { parent: portalFeatureRecord },
          fridayBranchSettings,
        );
      }
      return true;
    });
  }, [
    activePortalFeatures,
    activeProgramSlug,
    fridayBranchSettings,
    homeData?.features?.parent_home,
    portalFeatureRecord,
    programPortalFeaturesPending,
  ]);

  const visibleMenuItems = useMemo(
    () =>
      visibleMenuItemIds
        .map((id) => ({ id, ...PARENT_MORE_MENU_META[id] }))
        .filter((item) => item.label),
    [visibleMenuItemIds],
  );

  useEffect(() => {
    if (visible) {
      ensureLoaded();
    }
  }, [visible, ensureLoaded]);

  const showMenuPanel = !useSectionTabs || activeTab === 'menu';
  const showAccountPortalPanel = useSectionTabs && activeTab === 'account_portal';
  const showProgramPanel = useSectionTabs && activeTab === 'program';

  const currentPortalId = portalTypeToAccountPortalId(portalType);

  return (
    <StoryMoreMenuSheetShell visible={visible} onClose={onClose}>
      <StoryMoreMenuHeader
        kicker={activePortalFeatures?.coopMode ? 'Co-op program portal' : 'Family portal'}
        title="More"
        subtitle="Children and account settings"
      />

      {useSectionTabs ? (
        <StoryMoreMenuSectionTabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
      ) : null}

      <StoryMoreMenuTabPanel visible={showProgramPanel}>
        <ProgramSwitcherPanel
          contexts={contexts}
          activeContextId={activeContext?.id ?? null}
          loading={portalContextsLoading}
          onSelect={(context) => {
            onClose();
            const match = contexts.find((c) => c.id === context.id);
            if (match) {
              switchToContext(match);
            }
          }}
        />
      </StoryMoreMenuTabPanel>

      <StoryMoreMenuTabPanel visible={showAccountPortalPanel && Boolean(organizationId && slug)}>
        {organizationId && slug ? (
          <AccountPortalSwitcherPanel
            organizationId={organizationId}
            slug={slug}
            currentPortalId={currentPortalId}
            enabled={visible}
            onAfterSelect={onClose}
          />
        ) : null}
      </StoryMoreMenuTabPanel>

      <StoryMoreMenuTabPanel visible={showMenuPanel}>
        <>
          {programPortalFeaturesPending ? (
            <ParentPortalMoreMenuItemsSkeleton />
          ) : (
            <StoryMoreMenuItemsCard>
              {visibleMenuItems.map((item, index) => (
                <StoryMoreMenuItemRow
                  key={item.id}
                  isFirst={index === 0}
                  label={item.label}
                  subtitle={item.subtitle}
                  onPress={() => onSelect(item.id)}
                  icon={
                    <StoryMoreMenuIcon
                      name={item.icon}
                      iconBg={item.iconBg}
                      iconColor={item.iconColor}
                    />
                  }
                />
              ))}
            </StoryMoreMenuItemsCard>
          )}

          {user ? (
            <StoryCard compact style={styles.accountCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Account for ${displayName}`}
                onPress={onSelectAccount}
                style={({ pressed }) => [styles.accountRow, pressed && styles.pressed]}>
                <MessagesAvatar
                  name={displayName}
                  color={theme.primary}
                  photoUrl={homeData?.userProfile.profilePhotoUrl}
                  size="md"
                />
                <View style={styles.accountCopy}>
                  <Text style={[styles.accountName, { color: theme.ink }]}>{displayName}</Text>
                  <Text style={[styles.accountMeta, { color: theme.muted }]}>Account settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.muted} />
              </Pressable>
            </StoryCard>
          ) : null}
        </>
      </StoryMoreMenuTabPanel>
    </StoryMoreMenuSheetShell>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    padding: StoryCardPadding,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  accountName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  accountMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
