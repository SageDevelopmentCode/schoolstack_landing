import type { MobileParentTabDefinition } from '@/lib/parent/mobile-parent-portal-nav';
import {
  getParentActiveTabFromPathname,
  resolveParentWebParentHrefToMobileRoute,
} from '@/lib/parent/parent-nav';

const COOP_TAB_BAR: Pick<MobileParentTabDefinition, 'tabId' | 'pathSegment'>[] = [
  { tabId: 'home', pathSegment: 'home' },
  { tabId: 'messages', pathSegment: 'messages' },
  { tabId: 'calendar', pathSegment: 'calendar' },
  { tabId: 'teaching-schedule', pathSegment: 'teaching-schedule' },
  { tabId: 'more', pathSegment: 'more' },
];

describe('getParentActiveTabFromPathname', () => {
  it('maps program supply-list and curriculum to More tab', () => {
    expect(
      getParentActiveTabFromPathname(
        '/parent/rooted-meadows/p/kindergarten-co-op/supply-list',
        COOP_TAB_BAR,
      ),
    ).toBe('more');
    expect(
      getParentActiveTabFromPathname(
        '/parent/rooted-meadows/p/kindergarten-co-op/curriculum',
        COOP_TAB_BAR,
      ),
    ).toBe('more');
  });

  it('maps primary program tabs normally', () => {
    expect(
      getParentActiveTabFromPathname(
        '/parent/rooted-meadows/p/kindergarten-co-op/teaching-schedule',
        COOP_TAB_BAR,
      ),
    ).toBe('teaching-schedule');
  });

  it('maps program more routes to More tab', () => {
    expect(
      getParentActiveTabFromPathname(
        '/parent/rooted-meadows/p/kindergarten-co-op/more/attendance',
        COOP_TAB_BAR,
      ),
    ).toBe('more');
  });
});

describe('resolveParentWebParentHrefToMobileRoute', () => {
  it('maps children health deep links to child detail with section', () => {
    expect(
      resolveParentWebParentHrefToMobileRoute(
        'rooted-meadows',
        '/school/rooted-meadows/parent/children?applicationId=app-123&section=health',
      ),
    ).toBe('/parent/rooted-meadows/more/children/app-123?section=health');
  });

  it('maps children pickup deep links to child detail with section', () => {
    expect(
      resolveParentWebParentHrefToMobileRoute(
        'rooted-meadows',
        '/school/rooted-meadows/parent/children?applicationId=app-123&section=pickup',
      ),
    ).toBe('/parent/rooted-meadows/more/children/app-123?section=pickup');
  });

  it('maps program-scoped children deep links', () => {
    expect(
      resolveParentWebParentHrefToMobileRoute(
        'rooted-meadows',
        '/school/rooted-meadows/parent/p/kindergarten-co-op/children?applicationId=app-123&section=health',
      ),
    ).toBe('/parent/rooted-meadows/p/kindergarten-co-op/more/children/app-123?section=health');
  });
});
