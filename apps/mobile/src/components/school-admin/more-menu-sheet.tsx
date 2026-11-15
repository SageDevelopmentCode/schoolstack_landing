import { useRouter, usePathname } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AccountPortalSwitcherPanel } from '@/components/account-portal-switcher-panel';
import { PreviewAccountPortalSwitcherPanel } from '@/components/platform-admin/preview-account-portal-switcher-panel';
import { AccountDeletionRequest } from '@/components/account-deletion-request';
import { AccountLegalLinks } from '@/components/account-legal-links';
import {
  GardenMoreGrid,
  GardenMorePanel,
  GardenMoreSectionTabs,
  GardenMoreSheet,
  GardenProfileCard,
  isMoreItemPathActive,
} from '@/components/garden-nav/garden-more';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GOutlineButton, GPressable } from '@/components/parent/garden/ui';
import { OrganizationLogo } from '@/components/organization-logo';
import {
  buildMoreMenuTabs,
  shouldShowMoreMenuSectionTabs,
  type MoreMenuTabId,
} from '@/lib/more-menu-tab-ids';
import { useMoreMenuAccountPortalTab } from '@/lib/more-menu-account-portal-tab';
import { prefetchSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';
import { useAuth } from '@/contexts/auth-context';
import { useCanSwitchSchool } from '@/lib/auth/use-can-switch-school';
import { useSchoolAdminFeatures } from '@/contexts/school-admin-features-context';
import { getAccountRoleLabel } from '@/lib/auth/resolve-portal';
import { portalTypeToAccountPortalId } from '@/lib/auth/school-portal-options-types';
import { useSchoolAdminViewerProfile } from '@/lib/school-admin/viewer-profile';

export type MoreMenuItemId =
  | 'transactions'
  | 'schedule'
  | 'staff'
  | 'staff-hours'
  | 'classrooms'
  | 'bulletin'
  | 'attendance'
  | 'committees'
  | 'friday-branch'
  | 'photos';

type MoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: MoreMenuItemId) => void;
};

const MENU_ITEMS: {
  id: MoreMenuItemId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'committees',
    label: 'Committees',
    subtitle: 'Volunteer groups and join requests',
    icon: 'heart-outline',
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
  },
  {
    id: 'friday-branch',
    label: 'Friday Branch',
    subtitle: 'Program schedule and rosters',
    icon: 'calendar-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    subtitle: 'Payment history',
    icon: 'card-outline',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    subtitle: 'Tours, events, and visits',
    icon: 'calendar-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    subtitle: "Today's roster and pickup",
    icon: 'clipboard-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'staff-hours',
    label: 'Staff hours',
    subtitle: 'Who is clocked in and weekly totals',
    icon: 'time-outline',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
  },
  {
    id: 'bulletin',
    label: 'Bulletin',
    subtitle: 'Announcements and flyers',
    icon: 'megaphone-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'photos',
    label: 'Photos',
    subtitle: 'School gallery for families and staff',
    icon: 'images-outline',
    iconBg: '#FCE7F3',
    iconColor: '#EC4899',
  },
  {
    id: 'staff',
    label: 'Staff',
    subtitle: 'Roster and portal access',
    icon: 'people-outline',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
  },
  {
    id: 'classrooms',
    label: 'Classrooms',
    subtitle: 'Rosters and lead teachers',
    icon: 'school-outline',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
  },
];

export function MoreMenuSheet({ visible, onClose, onSelect }: MoreMenuSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    portalType,
    isPlatformAdminSession,
    selectedSchool,
    exitSchoolAdmin,
    signOut,
    switchSchool,
    previewSession,
  } = useAuth();
  const canSwitchSchool = useCanSwitchSchool(user?.id);
  const { fridayBranchEnabled, photosEnabled, staffHoursEnabled } = useSchoolAdminFeatures();
  const viewer = useSchoolAdminViewerProfile();
  const displayName = viewer.displayName;
  const accountEmail = viewer.isPreview ? viewer.email : user?.email?.trim() ?? '';
  const roleLabel = useMemo(
    () => getAccountRoleLabel(portalType, isPlatformAdminSession),
    [portalType, isPlatformAdminSession],
  );
  const visibleMenuItems = useMemo(
    () =>
      MENU_ITEMS.filter((item) => {
        if (item.id === 'friday-branch') return fridayBranchEnabled;
        if (item.id === 'photos') return photosEnabled;
        if (item.id === 'staff-hours') return staffHoursEnabled;
        return true;
      }),
    [fridayBranchEnabled, photosEnabled, staffHoursEnabled],
  );

  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      onClose();
      await signOut();
      router.replace('/login/admin');
    } finally {
      setSigningOut(false);
    }
  };

  const handleBackToOrganizations = async () => {
    onClose();
    await exitSchoolAdmin();
    router.replace('/platform-admin/organizations');
  };

  const handleSwitchSchool = async () => {
    onClose();
    await switchSchool();
    router.push('/login/choose-school?mode=switch');
  };

  const [activeTab, setActiveTab] = useState<MoreMenuTabId>('menu');
  const {
    accountPortalTabLoading,
    showAccountPortalTab,
    showAccountPortalSwitcher,
  } = useMoreMenuAccountPortalTab(selectedSchool?.id, selectedSchool?.slug, visible);
  const tabs = useMemo(
    () => buildMoreMenuTabs({ showAccountPortal: showAccountPortalTab, showProgram: false }),
    [showAccountPortalTab],
  );
  const useSectionTabs = shouldShowMoreMenuSectionTabs(tabs);
  const showSectionTabsSkeleton = accountPortalTabLoading && showAccountPortalTab;

  useEffect(() => {
    if (visible && selectedSchool?.id && selectedSchool.slug) {
      void prefetchSchoolPortalOptions(selectedSchool.id, selectedSchool.slug);
    }
  }, [selectedSchool?.id, selectedSchool?.slug, visible]);

  useEffect(() => {
    if (visible) {
      setActiveTab('menu');
    }
  }, [visible]);

  const showMenuPanel = !useSectionTabs || activeTab === 'menu';
  const showAccountPortalPanel = useSectionTabs && activeTab === 'account_portal';

  const currentItemId = useMemo(
    () => visibleMenuItems.find((item) => isMoreItemPathActive(pathname, item.id))?.id ?? null,
    [pathname, visibleMenuItems],
  );

  return (
    <GardenMoreSheet
      visible={visible}
      onClose={onClose}
      kicker="School workspace"
      subtitle="Finances, scheduling, and school operations">
      {useSectionTabs ? (
        <GardenMoreSectionTabs
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          loading={showSectionTabsSkeleton}
        />
      ) : null}

      <GardenMorePanel visible={showAccountPortalPanel && showAccountPortalTab}>
        {previewSession ? (
          <PreviewAccountPortalSwitcherPanel
            enabled={visible && (showAccountPortalSwitcher || accountPortalTabLoading)}
            onAfterSelect={onClose}
          />
        ) : selectedSchool ? (
          <AccountPortalSwitcherPanel
            organizationId={selectedSchool.id}
            slug={selectedSchool.slug}
            currentPortalId={portalTypeToAccountPortalId(portalType)}
            enabled={visible && (showAccountPortalSwitcher || accountPortalTabLoading)}
            onAfterSelect={onClose}
          />
        ) : null}
      </GardenMorePanel>

      <GardenMorePanel visible={showMenuPanel}>
        <View style={styles.menuPanel}>
          {isPlatformAdminSession && selectedSchool ? (
            <View style={styles.platformBanner}>
              <GPressable
                accessibilityLabel="Back to organizations"
                accessibilityHint="Leaves this school and returns to the platform organization list"
                onPress={() => void handleBackToOrganizations()}
                style={styles.backButton}>
                <Ionicons name="chevron-back" size={18} color={Garden.forest} />
                <Text style={styles.backLabel}>Organizations</Text>
              </GPressable>
              <View accessibilityLabel={selectedSchool.name} style={styles.platformLogo}>
                <OrganizationLogo
                  logoSrc={selectedSchool.branding.logoSrc}
                  logoAlt={selectedSchool.branding.logoAlt}
                  name={selectedSchool.name}
                />
              </View>
            </View>
          ) : null}

          <GardenMoreGrid
            groups={[{ key: 'all', items: visibleMenuItems }]}
            currentId={currentItemId}
            onSelect={onSelect}
          />

          {user ? (
            <GardenProfileCard name={displayName} meta={[roleLabel, accountEmail]}>
              <View style={styles.accountActions}>
                {canSwitchSchool && !previewSession && !isPlatformAdminSession ? (
                  <GOutlineButton
                    label="Switch school"
                    icon="swap-horizontal"
                    accessibilityLabel="Switch school"
                    onPress={() => void handleSwitchSchool()}
                  />
                ) : null}
                <GPressable
                  accessibilityLabel="Sign out"
                  accessibilityState={{ busy: signingOut, disabled: signingOut }}
                  disabled={signingOut}
                  onPress={() => void handleSignOut()}
                  style={styles.signOut}>
                  {signingOut ? (
                    <ActivityIndicator size="small" color={SIGN_OUT_COLOR} />
                  ) : (
                    <Ionicons name="log-out-outline" size={17} color={SIGN_OUT_COLOR} />
                  )}
                  <Text style={styles.signOutLabel}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
                </GPressable>
              </View>
              {selectedSchool?.id ? (
                <AccountDeletionRequest
                  organizationId={selectedSchool.id}
                  portal="admin"
                  sourcePagePath="/school-admin/more"
                />
              ) : null}
              <AccountLegalLinks />
            </GardenProfileCard>
          ) : null}
        </View>
      </GardenMorePanel>
    </GardenMoreSheet>
  );
}

const SIGN_OUT_COLOR = '#7E4533';

const styles = StyleSheet.create({
  menuPanel: {
    gap: 14,
  },
  platformBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: Garden.mint,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    paddingRight: 8,
  },
  backLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.forest,
  },
  platformLogo: {
    flexShrink: 1,
  },
  accountActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Garden.peach,
  },
  signOutLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: SIGN_OUT_COLOR,
  },
});
