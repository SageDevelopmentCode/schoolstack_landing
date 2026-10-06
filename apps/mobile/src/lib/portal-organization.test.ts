import { toLiveOrganization } from '@/lib/portal-organization';

describe('toLiveOrganization', () => {
  it('passes through branding from the server fetch', () => {
    const live = toLiveOrganization({
      id: 'org-1',
      slug: 'mud-school',
      name: 'Mud School',
      branding: {
        colors: {
          accent: '#769a61',
          accentBright: '#5f824f',
          accentMid: '#644268',
          accentDark: '#1e141f',
          accentLight: 'rgba(118, 154, 97, 0.10)',
          accentGlow: 'rgba(118, 154, 97, 0.12)',
          bg: '#f7fafc',
          border: '#eeeeee',
          borderStrong: '#769a61',
          textPrimary: '#1e141f',
          textSecondary: '#718096',
          clay: '#efad1f',
          clayBg: 'rgba(239, 173, 31, 0.12)',
          clayBorder: 'rgba(239, 173, 31, 0.35)',
          secondaryBtnBorder: 'rgba(118, 154, 97, 0.22)',
        },
        logoSrc: '/logo.png',
        logoAlt: 'Mud School',
      },
    });

    expect(live.branding.colors.accent).toBe('#769a61');
    expect(live.slug).toBe('mud-school');
  });
});
