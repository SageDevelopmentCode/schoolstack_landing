import {
  GARDEN_TAB_BAR_HEIGHT,
  GardenTabBar,
  type GardenTabBarTab,
} from '@/components/garden-nav/garden-tab-bar';
import type { PlatformAdminTab } from '@/lib/platform-admin/platform-admin-nav';

export const PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT = GARDEN_TAB_BAR_HEIGHT;

type PlatformAdminFloatingTabBarProps = {
  activeTab: PlatformAdminTab;
  onChange: (tab: PlatformAdminTab) => void;
};

const TABS: GardenTabBarTab<PlatformAdminTab>[] = [
  {
    id: 'organizations',
    label: 'Organizations',
    icon: 'business-outline',
    iconActive: 'business',
    testID: 'platform-admin-tab-organizations',
  },
  {
    id: 'impersonate',
    label: 'Impersonate',
    icon: 'person-outline',
    iconActive: 'person',
    testID: 'platform-admin-tab-impersonate',
  },
];

export function PlatformAdminFloatingTabBar({
  activeTab,
  onChange,
}: PlatformAdminFloatingTabBarProps) {
  return <GardenTabBar tabs={TABS} activeId={activeTab} onChange={onChange} />;
}
