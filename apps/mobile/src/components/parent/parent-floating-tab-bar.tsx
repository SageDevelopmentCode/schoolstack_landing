import type { Ionicons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';

import {
  GARDEN_TAB_BAR_HEIGHT,
  GardenTabBar,
  type GardenTabBarTab,
} from '@/components/garden-nav/garden-tab-bar';
import type { MobileParentTabDefinition } from '@/lib/parent/mobile-parent-portal-nav';
import type { ParentTab } from '@/lib/parent/parent-nav';

export const PARENT_FLOATING_TAB_BAR_HEIGHT = GARDEN_TAB_BAR_HEIGHT;

type ParentFloatingTabBarProps = {
  tabs: MobileParentTabDefinition[];
  activeTab: ParentTab;
  onChange: (tab: ParentTab) => void;
  messagesUnreadCount?: number;
  /** True while the More sheet is open (the More tab shows a close chevron). */
  moreSheetOpen?: boolean;
  /** When true, omit absolute positioning (parent supplies bottom chrome stack). */
  embedded?: boolean;
  /** Row inside the bar above the tabs (the co-op program chip). */
  header?: ReactNode;
};

export function ParentFloatingTabBar({
  tabs,
  activeTab,
  onChange,
  messagesUnreadCount = 0,
  moreSheetOpen = false,
  embedded = false,
  header,
}: ParentFloatingTabBarProps) {
  const gardenTabs = useMemo<GardenTabBarTab<string>[]>(
    () =>
      tabs.map((tab) => ({
        id: tab.tabId,
        label: tab.label,
        icon: tab.iconOutline as keyof typeof Ionicons.glyphMap,
        iconActive: tab.iconFilled as keyof typeof Ionicons.glyphMap,
        badge: tab.tabId === 'messages' ? messagesUnreadCount : undefined,
        sheetToggle: tab.tabId === 'more',
        testID: `parent-tab-${tab.tabId}`,
      })),
    [messagesUnreadCount, tabs],
  );

  return (
    <GardenTabBar
      embedded={embedded}
      header={header}
      sheetOpen={moreSheetOpen}
      tabs={gardenTabs}
      activeId={activeTab}
      onChange={(id) => onChange(id as ParentTab)}
    />
  );
}
