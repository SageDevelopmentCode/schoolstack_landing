import { resolveParentHomeSubTabs } from '@/components/parent/home/parent-home-sub-tab-bar';

describe('resolveParentHomeSubTabs', () => {
  it('returns Overview, Family, and Help when co-op mode is disabled', () => {
    const tabs = resolveParentHomeSubTabs(false);
    expect(tabs.map((tab) => tab.id)).toEqual(['overview', 'family', 'help']);
  });

  it('includes Co-op and Help when co-op mode is enabled', () => {
    const tabs = resolveParentHomeSubTabs(true);
    expect(tabs.map((tab) => tab.id)).toEqual(['overview', 'family', 'coop', 'help']);
  });
});
