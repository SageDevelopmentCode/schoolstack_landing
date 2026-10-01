import type { DetailTab } from '@/components/school-admin/detail-tab-bar';
import { SubmissionStoryTabBar } from '@/components/school-admin/admissions/submission-story-tab-bar';

export type ParentHomeSubTabId = 'overview' | 'family' | 'coop' | 'learn';

export const PARENT_HOME_SUB_TAB_OVERVIEW: ParentHomeSubTabId = 'overview';
export const PARENT_HOME_SUB_TAB_FAMILY: ParentHomeSubTabId = 'family';
export const PARENT_HOME_SUB_TAB_COOP: ParentHomeSubTabId = 'coop';
export const PARENT_HOME_SUB_TAB_LEARN: ParentHomeSubTabId = 'learn';

const MAIN_HOME_TABS: DetailTab[] = [
  { id: 'overview', label: 'Overview', icon: 'grid-outline', iconActive: 'grid' },
  { id: 'family', label: 'Family', icon: 'people-outline', iconActive: 'people' },
];

const COOP_HOME_TABS: DetailTab[] = [
  { id: 'overview', label: 'Overview', icon: 'grid-outline', iconActive: 'grid' },
  { id: 'family', label: 'Family', icon: 'people-outline', iconActive: 'people' },
  { id: 'coop', label: 'Co-op', icon: 'people-circle-outline', iconActive: 'people-circle' },
  { id: 'learn', label: 'Learn', icon: 'book-outline', iconActive: 'book' },
];

export function resolveParentHomeSubTabs(coopModeEnabled: boolean): DetailTab[] {
  return coopModeEnabled ? COOP_HOME_TABS : MAIN_HOME_TABS;
}

export function isParentHomeSubTabId(
  value: string,
  coopModeEnabled: boolean,
): value is ParentHomeSubTabId {
  const tabs = resolveParentHomeSubTabs(coopModeEnabled);
  return tabs.some((tab) => tab.id === value);
}

type ParentHomeSubTabBarProps = {
  coopModeEnabled: boolean;
  activeTabId: ParentHomeSubTabId;
  onChange: (tabId: ParentHomeSubTabId) => void;
};

export function ParentHomeSubTabBar({
  coopModeEnabled,
  activeTabId,
  onChange,
}: ParentHomeSubTabBarProps) {
  const tabs = resolveParentHomeSubTabs(coopModeEnabled);

  return (
    <SubmissionStoryTabBar
      tabs={tabs}
      activeTabId={activeTabId}
      onChange={(tabId) => {
        if (isParentHomeSubTabId(tabId, coopModeEnabled)) {
          onChange(tabId);
        }
      }}
    />
  );
}
