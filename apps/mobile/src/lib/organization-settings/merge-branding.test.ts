import { mergeBrandingFromRaw } from '@/lib/organization-settings/merge-branding';

describe('mergeBrandingFromRaw', () => {
  it('returns defaults for invalid input', () => {
    const branding = mergeBrandingFromRaw(null);

    expect(branding.colors.accent).toBe('#827096');
    expect(branding.logo.src).toBe('');
  });

  it('merges stored accent colors', () => {
    const branding = mergeBrandingFromRaw({
      colors: {
        accent: '#123456',
      },
    });

    expect(branding.colors.accent).toBe('#123456');
    expect(branding.colors.textPrimary).toBe('#0F172A');
  });
});
