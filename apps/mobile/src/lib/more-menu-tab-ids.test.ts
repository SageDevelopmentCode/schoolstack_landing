import {
  buildMoreMenuTabs,
  shouldShowMoreMenuSectionTabs,
} from '@/lib/more-menu-tab-ids';

describe('buildMoreMenuTabs', () => {
  it('returns only menu when no extra sections', () => {
    expect(buildMoreMenuTabs({ showAccountPortal: false, showProgram: false })).toEqual([
      { id: 'menu', label: 'Menu', icon: 'grid-outline' },
    ]);
    expect(shouldShowMoreMenuSectionTabs(buildMoreMenuTabs({ showAccountPortal: false, showProgram: false }))).toBe(
      false,
    );
  });

  it('orders program before account and includes icons', () => {
    const tabs = buildMoreMenuTabs({ showAccountPortal: true, showProgram: true });
    expect(tabs.map((t) => t.id)).toEqual(['menu', 'program', 'account_portal']);
    expect(tabs[2]?.label).toBe('Account');
    expect(tabs[1]?.icon).toBe('school-outline');
    expect(shouldShowMoreMenuSectionTabs(tabs)).toBe(true);
  });
});
