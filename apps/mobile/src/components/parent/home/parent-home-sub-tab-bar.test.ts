import { resolveParentHomeSubTabs } from '@/components/parent/home/parent-home-sub-tab-bar';

describe('resolveParentHomeSubTabs', () => {
  it('returns Overview and Family only when co-op mode is disabled', () => {
    const tabs = resolveParentHomeSubTabs(false);
    expect(tabs.map((tab) => tab.id)).toEqual(['overview', 'family']);
  });

  it('includes Co-op and Learn when co-op mode is enabled', () => {
    const tabs = resolveParentHomeSubTabs(true);
    expect(tabs.map((tab) => tab.id)).toEqual(['overview', 'family', 'coop', 'learn']);
  });
});
