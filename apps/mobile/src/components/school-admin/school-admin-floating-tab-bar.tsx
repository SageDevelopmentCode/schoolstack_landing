import { useMemo } from 'react';

import {
  GARDEN_TAB_BAR_HEIGHT,
  GardenTabBar,
  type GardenTabBarTab,
} from '@/components/garden-nav/garden-tab-bar';

export type SchoolAdminTab = 'dashboard' | 'admissions' | 'students' | 'messages' | 'more';

export const FLOATING_TAB_BAR_HEIGHT = GARDEN_TAB_BAR_HEIGHT;

type SchoolAdminFloatingTabBarProps = {
  activeTab: SchoolAdminTab;
  onChange: (tab: SchoolAdminTab) => void;
  messagesUnreadCount?: number;
  /** True while the More sheet is open (the More tab shows a close chevron). */
  moreSheetOpen?: boolean;
};

const TABS: GardenTabBarTab<SchoolAdminTab>[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', iconActive: 'grid' },
  {
    id: 'admissions',
    label: 'Admissions',
    icon: 'document-text-outline',
    iconActive: 'document-text',
  },
  { id: 'students', label: 'Students', icon: 'people-outline', iconActive: 'people' },
  { id: 'messages', label: 'Messages', icon: 'chatbubble-outline', iconActive: 'chatbubble' },
  {
    id: 'more',
    label: 'More',
    icon: 'ellipsis-horizontal-outline',
    iconActive: 'ellipsis-horizontal',
    sheetToggle: true,
  },
];

export function SchoolAdminFloatingTabBar({
  activeTab,
  onChange,
  messagesUnreadCount = 0,
  moreSheetOpen = false,
}: SchoolAdminFloatingTabBarProps) {
  const tabs = useMemo(
    () =>
      TABS.map((tab) => ({
        ...tab,
        badge: tab.id === 'messages' ? messagesUnreadCount : undefined,
        testID: `school-admin-tab-${tab.id}`,
      })),
    [messagesUnreadCount],
  );

  return <GardenTabBar tabs={tabs} activeId={activeTab} onChange={onChange} sheetOpen={moreSheetOpen} />;
}
