import type { Ionicons } from '@expo/vector-icons';
import type { User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, usePathname } from 'expo-router';

import { AccountPortalSwitcherPanel } from '@/components/account-portal-switcher-panel';
import {
  GardenMoreEmpty,
  GardenMoreGrid,
  GardenMorePanel,
  GardenMoreSectionTabs,
  GardenMoreSheet,
  GardenProfileCard,
  isMoreItemPathActive,
} from '@/components/garden-nav/garden-more';
import { PreviewAccountPortalSwitcherPanel } from '@/components/platform-admin/preview-account-portal-switcher-panel';
import { useAuth } from '@/contexts/auth-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { portalTypeToAccountPortalId } from '@/lib/auth/school-portal-options-types';
import { prefetchSchoolPortalOptions } from '@/lib/auth/use-school-portal-options';
import { useMoreMenuAccountPortalTab } from '@/lib/more-menu-account-portal-tab';
import {
  buildMoreMenuTabs,
  shouldShowMoreMenuSectionTabs,
  type MoreMenuTabId,
} from '@/lib/more-menu-tab-ids';
import { isSchoolGalleryEnabled } from '@/lib/school-gallery/gallery-enabled';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import type { TeacherMoreMenuItemId } from '@/lib/teacher/teacher-nav';

type TeacherMoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: TeacherMoreMenuItemId) => void;
  onSelectAccount: () => void;
};

const MENU_ITEMS: {
  id: TeacherMoreMenuItemId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'committees',
    label: 'Committees',
    subtitle: 'Volunteer participation',
    icon: 'heart-outline',
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
  },
  {
    id: 'classroom-signups',
    label: 'Classroom signups',
    subtitle: 'Volunteer and event signups',
    icon: 'clipboard-outline',
    iconBg: '#E9F2EA',
    iconColor: '#3D6B4F',
  },
  {
    id: 'my-hours',
    label: 'My Hours',
    subtitle: 'Track your work hours',
    icon: 'time-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    subtitle: 'Student attendance records',
    icon: 'clipboard-outline',
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
];

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

export function TeacherMoreMenuSheet({
  visible,
  onClose,
  onSelect,
  onSelectAccount,
}: TeacherMoreMenuSheetProps) {
  const pathname = usePathname();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, portalType, selectedSchool, previewSession } = useAuth();
  const { data } = useTeacherHome();
  const displayName = useMemo(() => (user ? getDisplayName(user) : ''), [user]);
  const attendanceEnabled = isTeacherFeatureEnabled(data?.features, 'attendance');
  const myHoursEnabled = isTeacherFeatureEnabled(data?.features, 'my_hours');
  const committeesEnabled = isTeacherFeatureEnabled(data?.features, 'committees');
  const photosEnabled = isSchoolGalleryEnabled(data?.features);
  const visibleMenuItems = useMemo(
    () =>
      MENU_ITEMS.filter((item) => {
        if (item.id === 'attendance') return attendanceEnabled;
        if (item.id === 'my-hours') return myHoursEnabled;
        if (item.id === 'committees') return committeesEnabled;
        if (item.id === 'photos') return photosEnabled;
        return true;
      }),
    [attendanceEnabled, myHoursEnabled, committeesEnabled, photosEnabled],
  );

  const [activeTab, setActiveTab] = useState<MoreMenuTabId>('menu');
  const organizationId = selectedSchool?.id;
  const {
    accountPortalTabLoading,
    showAccountPortalTab,
    showAccountPortalSwitcher,
  } = useMoreMenuAccountPortalTab(organizationId, slug, visible);
  const tabs = useMemo(
    () => buildMoreMenuTabs({ showAccountPortal: showAccountPortalTab, showProgram: false }),
    [showAccountPortalTab],
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
      subtitle="Classroom tools and account">
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
        ) : organizationId && slug ? (
          <AccountPortalSwitcherPanel
            organizationId={organizationId}
            slug={slug}
            currentPortalId={portalTypeToAccountPortalId(portalType)}
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
              meta={['Account settings']}
              accessibilityLabel={`Account for ${displayName}`}
              onPress={onSelectAccount}
            />
          ) : null}
          {visibleMenuItems.length > 0 ? (
            <GardenMoreGrid
              groups={[{ key: 'all', items: visibleMenuItems }]}
              currentId={currentItemId}
              onSelect={onSelect}
            />
          ) : (
            <GardenMoreEmpty message="Nothing extra to show here yet. Your school can turn on more tools." />
          )}
        </View>
      </GardenMorePanel>
    </GardenMoreSheet>
  );
}

const styles = StyleSheet.create({
  menuPanel: {
    gap: 14,
  },
});
