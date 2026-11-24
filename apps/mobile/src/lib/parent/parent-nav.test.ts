import type { MobileParentTabDefinition } from '@/lib/parent/mobile-parent-portal-nav';
import {
  getParentActiveTabFromPathname,
  resolveParentWebParentHrefToMobileRoute,
  shouldHoldParentMainPortal,
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

describe('shouldHoldParentMainPortal', () => {
  const base = {
    contextsLoading: false,
    activeProgramSlug: null,
    redirectAwayFromMainPortal: false,
    pathname: '/parent/rooted-meadows/home',
  };

  it('holds the main Home while portal contexts load', () => {
    expect(shouldHoldParentMainPortal({ ...base, contextsLoading: true })).toBe(true);
  });

  it('keeps holding once loaded for a co-op-only family until the redirect lands', () => {
    expect(shouldHoldParentMainPortal({ ...base, redirectAwayFromMainPortal: true })).toBe(true);
  });

  it('shows the main portal once loaded for a main-school family', () => {
    expect(shouldHoldParentMainPortal(base)).toBe(false);
  });

  it('shows the main portal when the contexts load failed (no redirect flag)', () => {
    expect(
      shouldHoldParentMainPortal({ ...base, contextsLoading: false, redirectAwayFromMainPortal: false }),
    ).toBe(false);
  });

  it('never holds program routes', () => {
    expect(
      shouldHoldParentMainPortal({
        ...base,
        contextsLoading: true,
        activeProgramSlug: 'kindergarten-co-op',
        pathname: '/parent/rooted-meadows/p/kindergarten-co-op/home',
      }),
    ).toBe(false);
    expect(
      shouldHoldParentMainPortal({
        ...base,
        contextsLoading: true,
        pathname: '/parent/rooted-meadows/p/kindergarten-co-op/home',
      }),
    ).toBe(false);
  });

  it('never holds bulletin deep links', () => {
    expect(
      shouldHoldParentMainPortal({
        ...base,
        contextsLoading: true,
        redirectAwayFromMainPortal: true,
        pathname: '/parent/rooted-meadows/bulletin/post-1',
      }),
    ).toBe(false);
  });
});
