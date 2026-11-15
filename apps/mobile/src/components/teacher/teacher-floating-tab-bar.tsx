import { useMemo } from 'react';

import {
  GARDEN_TAB_BAR_HEIGHT,
  GardenTabBar,
  type GardenTabBarTab,
} from '@/components/garden-nav/garden-tab-bar';
import type { TeacherTab } from '@/lib/teacher/teacher-nav';

export const TEACHER_FLOATING_TAB_BAR_HEIGHT = GARDEN_TAB_BAR_HEIGHT;

type TeacherFloatingTabBarProps = {
  activeTab: TeacherTab;
  onChange: (tab: TeacherTab) => void;
  messagesUnreadCount?: number;
  /** True while the More sheet is open (the More tab shows a close chevron). */
  moreSheetOpen?: boolean;
};

const TABS: GardenTabBarTab<TeacherTab>[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { id: 'my-students', label: 'My Students', icon: 'people-outline', iconActive: 'people' },
  { id: 'messages', label: 'Messages', icon: 'chatbubble-outline', iconActive: 'chatbubble' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-outline', iconActive: 'calendar' },
  {
    id: 'more',
    label: 'More',
    icon: 'ellipsis-horizontal-outline',
    iconActive: 'ellipsis-horizontal',
    sheetToggle: true,
  },
];

export function TeacherFloatingTabBar({
  activeTab,
  onChange,
  messagesUnreadCount = 0,
  moreSheetOpen = false,
}: TeacherFloatingTabBarProps) {
  const tabs = useMemo(
    () =>
      TABS.map((tab) => ({
        ...tab,
        badge: tab.id === 'messages' ? messagesUnreadCount : undefined,
        testID: `teacher-tab-${tab.id}`,
      })),
    [messagesUnreadCount],
  );

  return <GardenTabBar tabs={tabs} activeId={activeTab} onChange={onChange} sheetOpen={moreSheetOpen} />;
}
