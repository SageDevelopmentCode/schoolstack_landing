import { buildMobileAdminTheme, buildPlatformAdminTheme } from '@/lib/organization-settings/build-admin-theme';
import { DEFAULT_BRANDING } from '@/lib/organization-settings/merge-branding';

describe('buildMobileAdminTheme', () => {
  it('maps branding accent colors into the admin theme', () => {
    const theme = buildMobileAdminTheme(DEFAULT_BRANDING);

    expect(theme.accent).toBe(DEFAULT_BRANDING.colors.accent);
    expect(theme.textPrimary).toBeTruthy();
    expect(theme.shadowOpacity).toBeGreaterThan(0);
  });
});

describe('buildPlatformAdminTheme', () => {
  it('returns a complete theme for platform admin screens', () => {
    const theme = buildPlatformAdminTheme();

    expect(theme.bg).toBeTruthy();
    expect(theme.accent).toBeTruthy();
    expect(theme.error).toBe('#DC2626');
  });
});
