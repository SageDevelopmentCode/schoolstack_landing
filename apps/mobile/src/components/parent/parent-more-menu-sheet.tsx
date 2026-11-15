import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AccountPortalSwitcherPanel } from '@/components/account-portal-switcher-panel';
import {
  GardenMoreEmpty,
  GardenMoreGrid,
  GardenMoreGridSkeleton,
  GardenMorePanel,
  GardenMoreSectionTabs,
  GardenMoreSheet,
  GardenProfileCard,
  type GardenMoreGroup,
} from '@/components/garden-nav/garden-more';
import { useGardenToast } from '@/components/parent/garden/toast';
import { PreviewAccountPortalSwitcherPanel } from '@/components/platform-admin/preview-account-portal-switcher-panel';
import { ProgramSwitcherPanel, useProgramSwitcherVisibility } from '@/components/program-switcher-panel';
import { useAuth } from '@/contexts/auth-context';
import { portalTypeToAccountPortalId } from '@/lib/auth/school-portal-options-types';
import { useMoreMenuAccountPortalTab } from '@/lib/more-menu-account-portal-tab';
import { prefetchSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';
import { useParentHome } from '@/contexts/parent-home-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';
import {
  isParentHomeFridayBranchEnabled,
  isParentNavFridayBranchEnabled,
  resolveFridayBranchSettingsFromHome,
} from '@/lib/parent/parent-features';
import { resolveMobileMoreMenuFeatureKeys } from '@/lib/parent/mobile-parent-portal-nav';
import {
  PARENT_MORE_MENU_META,
  parentMoreMenuItemIdForFeatureKey,
} from '@/lib/parent/parent-more-menu-meta';
import { isParentMoreMenuItemActive, type ParentMoreMenuItemId } from '@/lib/parent/parent-nav';
import {
  buildMoreMenuTabs,
  shouldShowMoreMenuSectionTabs,
  type MoreMenuTabId,
} from '@/lib/more-menu-tab-ids';

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
  const pathname = usePathname();
  const toast = useGardenToast();
  const { user, portalType, previewSession } = useAuth();
  const { data: homeData, ensureLoaded, hasLoaded: homeHasLoaded, isLoading: homeIsLoading } =
    useParentHome();
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

  const {
    accountPortalTabLoading,
    showAccountPortalTab,
    showAccountPortalSwitcher,
  } = useMoreMenuAccountPortalTab(organizationId, slug, visible);

  const showProgramSection = useProgramSwitcherVisibility({
    loading: portalContextsLoading,
    showSwitcher,
    contextCount: contexts.length,
  });

  const tabs = useMemo(
    () =>
      buildMoreMenuTabs({
        showAccountPortal: showAccountPortalTab,
        showProgram: showProgramSection,
      }),
    [showAccountPortalTab, showProgramSection],
  );

  const useSectionTabs = shouldShowMoreMenuSectionTabs(tabs);
  const showSectionTabsSkeleton = accountPortalTabLoading && showAccountPortalTab;

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

  const fridayBranchSettings = resolveFridayBranchSettingsFromHome(homeData);

  const schoolGalleryEnabled = homeData?.schoolGalleryEnabled ?? false;

  const parentNewslettersEnabled =
    (homeData?.parentNewslettersEnabled ?? false) &&
    portalFeatureRecord?.newsletters !== false;

  const mainPortalFeaturesPending =
    !activeProgramSlug && !portalFeatureRecord && (homeIsLoading || !homeHasLoaded);

  const visibleMenuItemIds = useMemo(() => {
    if (programPortalFeaturesPending || mainPortalFeaturesPending) {
      return [] as ParentMoreMenuItemId[];
    }

    if (!portalFeatureRecord) {
      return [] as ParentMoreMenuItemId[];
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

    if (schoolGalleryEnabled && !ids.includes('photos')) {
      ids.push('photos');
    }

    if (parentNewslettersEnabled && !ids.includes('newsletters')) {
      const formsIndex = ids.indexOf('forms-documents');
      const insertAt = formsIndex >= 0 ? formsIndex + 1 : ids.length;
      ids.splice(insertAt, 0, 'newsletters');
    }

    return ids.filter((id) => {
      if (id === 'friday-branch') {
        return isParentNavFridayBranchEnabled(
          { parent: portalFeatureRecord },
          fridayBranchSettings,
        );
      }
      if (id === 'photos') {
        return schoolGalleryEnabled;
      }
      if (id === 'newsletters') {
        return parentNewslettersEnabled;
      }
      return true;
    });
  }, [
    activePortalFeatures,
    activeProgramSlug,
    fridayBranchSettings,
    homeData?.features?.parent_home,
    mainPortalFeaturesPending,
    parentNewslettersEnabled,
    portalFeatureRecord,
    programPortalFeaturesPending,
    schoolGalleryEnabled,
  ]);

  const visibleMenuItems = useMemo(
    () =>
      visibleMenuItemIds
        .map((id) => ({ id, ...PARENT_MORE_MENU_META[id] }))
        .filter((item) => item.label),
    [visibleMenuItemIds],
  );

  const showCoopResourcesKicker = Boolean(
    activePortalFeatures?.coopMode && visibleMenuItems.some((item) => item.id === 'curriculum'),
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

  const currentItemId = useMemo(
    () => visibleMenuItems.find((item) => isParentMoreMenuItemActive(pathname, item.id))?.id ?? null,
    [pathname, visibleMenuItems],
  );

  const menuGroups = useMemo<GardenMoreGroup<ParentMoreMenuItemId>[]>(() => {
    if (!showCoopResourcesKicker) {
      return [{ key: 'all', items: visibleMenuItems }];
    }
    return [
      {
        key: 'coop',
        kicker: 'Co-op',
        items: visibleMenuItems.filter((item) => COOP_ITEM_IDS.has(item.id)),
      },
      {
        key: 'family',
        kicker: 'Family',
        items: visibleMenuItems.filter((item) => !COOP_ITEM_IDS.has(item.id)),
      },
    ];
  }, [showCoopResourcesKicker, visibleMenuItems]);

  const menuLoading = programPortalFeaturesPending || mainPortalFeaturesPending;

  return (
    <GardenMoreSheet
      visible={visible}
      onClose={onClose}
      kicker={activePortalFeatures?.coopMode ? 'Co-op program portal' : 'Family portal'}
      subtitle="Children and account settings">
      {useSectionTabs ? (
        <GardenMoreSectionTabs
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          loading={showSectionTabsSkeleton}
        />
      ) : null}

      <GardenMorePanel visible={showProgramPanel}>
        <ProgramSwitcherPanel
          contexts={contexts}
          activeContextId={activeContext?.id ?? null}
          loading={portalContextsLoading}
          onSelect={(context) => {
            onClose();
            const match = contexts.find((c) => c.id === context.id);
            if (match) {
              switchToContext(match);
              setTimeout(() => {
                toast.success(`Switched to ${match.label}`, {
                  id: 'parent-program-switch',
                  description: 'Your tabs and menu now show this program.',
                });
              }, SHEET_DISMISS_MS);
            }
          }}
        />
      </GardenMorePanel>

      <GardenMorePanel visible={showAccountPortalPanel && showAccountPortalTab}>
        {previewSession ? (
          <PreviewAccountPortalSwitcherPanel
            enabled={visible && (showAccountPortalSwitcher || accountPortalTabLoading)}
            onAfterSelect={onClose}
          />
        ) : organizationId && slug ? (
          <AccountPortalSwitcherPanel
            organizationId={organizationId}
            slug={slug}
            currentPortalId={currentPortalId}
            enabled={visible && (showAccountPortalSwitcher || accountPortalTabLoading)}
            onAfterSelect={onClose}
          />
        ) : null}
      </GardenMorePanel>

      <GardenMorePanel visible={showMenuPanel}>
        <View style={styles.menuPanel}>
          {user ? (
            <GardenProfileCard
              name={displayName}
              photoUrl={homeData?.userProfile.profilePhotoUrl}
              meta={['Account settings']}
              accessibilityLabel={`Account for ${displayName}`}
              onPress={onSelectAccount}
            />
          ) : null}

          {menuLoading ? (
            <GardenMoreGridSkeleton />
          ) : visibleMenuItems.length > 0 ? (
            <GardenMoreGrid groups={menuGroups} currentId={currentItemId} onSelect={onSelect} />
          ) : (
            <GardenMoreEmpty message="Nothing extra to show here yet. Your school can turn on more features." />
          )}
        </View>
      </GardenMorePanel>
    </GardenMoreSheet>
  );
}

const COOP_ITEM_IDS = new Set<ParentMoreMenuItemId>(['curriculum', 'supply-list']);

/** Wait for the native sheet to finish dismissing before toasting (see Home `closeThen`). */
const SHEET_DISMISS_MS = 220;

const styles = StyleSheet.create({
  menuPanel: {
    gap: 14,
  },
});
