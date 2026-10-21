import {
  describeMobilePublicEnv,
  isLikelyLocalSupabaseHost,
  isLikelyProductionMobileBackend,
} from '@/lib/env/mobile-public-env';

describe('mobile-public-env', () => {
  it('detects local Supabase hosts', () => {
    expect(isLikelyLocalSupabaseHost('127.0.0.1')).toBe(true);
    expect(isLikelyLocalSupabaseHost('10.0.2.2')).toBe(true);
    expect(isLikelyLocalSupabaseHost('abcdef.supabase.co')).toBe(false);
  });

  it('describes env from process variables', () => {
    const description = describeMobilePublicEnv();
    expect(
      typeof description.supabaseHost === 'string' || description.supabaseHost === null,
    ).toBe(true);
    expect(typeof description.likelyLocalSupabase).toBe('boolean');
  });

  it('recognizes production site host', () => {
    const previous = process.env.EXPO_PUBLIC_SITE_URL;
    process.env.EXPO_PUBLIC_SITE_URL = 'https://trymudkitchen.com';
    expect(isLikelyProductionMobileBackend()).toBe(true);
    process.env.EXPO_PUBLIC_SITE_URL = previous;
  });
});
