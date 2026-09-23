jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { createPortalCache } from '@/lib/portal-cache';

type FridayBranchBlock = {
  id: string;
  label: string;
};

describe('school admin friday branch cache refresh on save', () => {
  it('updates memory cache when refresh is true after a prior fetch', async () => {
    const cache = createPortalCache<FridayBranchBlock[]>('test_friday_branch:');
    const key = 'org-1';

    await cache.fetchAndCache(key, async () => [{ id: 'block-1', label: 'Before save' }]);
    expect(cache.get(key)).toEqual([{ id: 'block-1', label: 'Before save' }]);

    const saved = [{ id: 'block-1', label: 'After save' }];
    await cache.fetchAndCache(key, async () => saved, { refresh: true });

    expect(cache.get(key)).toEqual(saved);
  });
});
