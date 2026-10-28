import {
  isParentFridayBranchScheduleLoadEnabled,
  isParentNavFridayBranchEnabled,
  resolveFridayBranchSettingsFromHome,
} from '@/lib/parent/parent-features';

describe('resolveFridayBranchSettingsFromHome', () => {
  it('treats missing home as paused so nav stays hidden', () => {
    expect(resolveFridayBranchSettingsFromHome(null)).toEqual({ parent_portal_paused: true });
    expect(resolveFridayBranchSettingsFromHome(undefined)).toEqual({ parent_portal_paused: true });
  });

  it('reflects fridayBranchParentPortalPaused from home payload', () => {
    expect(
      resolveFridayBranchSettingsFromHome({ fridayBranchParentPortalPaused: true }),
    ).toEqual({ parent_portal_paused: true });
    expect(
      resolveFridayBranchSettingsFromHome({ fridayBranchParentPortalPaused: false }),
    ).toEqual({ parent_portal_paused: false });
  });
});

describe('isParentFridayBranchScheduleLoadEnabled', () => {
  const homeWithFeature = {
    features: { parent: { friday_branch: true } },
    fridayBranchParentPortalPaused: false,
  };

  it('does not load until home has loaded', () => {
    expect(isParentFridayBranchScheduleLoadEnabled(homeWithFeature, false)).toBe(false);
    expect(isParentFridayBranchScheduleLoadEnabled(null, false)).toBe(false);
  });

  it('does not load when paused', () => {
    expect(
      isParentFridayBranchScheduleLoadEnabled(
        { ...homeWithFeature, fridayBranchParentPortalPaused: true },
        true,
      ),
    ).toBe(false);
  });

  it('loads when feature on and not paused', () => {
    expect(isParentFridayBranchScheduleLoadEnabled(homeWithFeature, true)).toBe(true);
    expect(
      isParentNavFridayBranchEnabled(
        homeWithFeature.features,
        resolveFridayBranchSettingsFromHome(homeWithFeature),
      ),
    ).toBe(true);
  });
});
