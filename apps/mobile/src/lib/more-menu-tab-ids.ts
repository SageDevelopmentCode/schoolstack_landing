import type { Ionicons } from '@expo/vector-icons';

export type MoreMenuTabId = 'menu' | 'account_portal' | 'program';

export type MoreMenuTab = {
  id: MoreMenuTabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TAB_META: Record<MoreMenuTabId, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  menu: { label: 'Menu', icon: 'grid-outline' },
  program: { label: 'Program', icon: 'school-outline' },
  account_portal: { label: 'Account', icon: 'people-outline' },
};

export function buildMoreMenuTabs(input: {
  showAccountPortal: boolean;
  showProgram: boolean;
}): MoreMenuTab[] {
  const tabs: MoreMenuTab[] = [{ id: 'menu', ...TAB_META.menu }];

  if (input.showProgram) {
    tabs.push({ id: 'program', ...TAB_META.program });
  }

  if (input.showAccountPortal) {
    tabs.push({ id: 'account_portal', ...TAB_META.account_portal });
  }

  return tabs;
}

export function shouldShowMoreMenuSectionTabs(tabs: MoreMenuTab[]): boolean {
  return tabs.length > 1;
}
