import { haveSameIds } from '@/lib/unsaved-changes';

describe('haveSameIds', () => {
  it('returns true for identical arrays regardless of order', () => {
    expect(haveSameIds(['a', 'b'], ['b', 'a'])).toBe(true);
  });

  it('returns false when lengths differ', () => {
    expect(haveSameIds(['a'], ['a', 'b'])).toBe(false);
  });

  it('returns false when ids differ', () => {
    expect(haveSameIds(['a'], ['b'])).toBe(false);
  });

  it('returns true for two empty arrays', () => {
    expect(haveSameIds([], [])).toBe(true);
  });
});
