import {
  brandingToView,
  normalizeStoredOrganization,
  parseOrganizationBranding,
} from '@/lib/organizations';

describe('brandingToView', () => {
  it('maps branding fields to the mobile view shape', () => {
    const view = brandingToView({
      colors: {
        accent: '#123456',
        accentHover: '#654321',
        textPrimary: '#111111',
        textSecondary: '#222222',
        bg: '#ffffff',
        bgSecondary: '#f5f5f5',
        border: '#dddddd',
      },
      logo: { src: '/logo.png', alt: 'School logo', width: 100, height: 40 },
      typography: { headingFont: 'Poppins', bodyFont: 'Lora' },
    });

    expect(view).toEqual({
      colors: view.colors,
      logoSrc: '/logo.png',
      logoAlt: 'School logo',
    });
  });
});

describe('parseOrganizationBranding', () => {
  it('returns defaults for invalid stored branding', () => {
    const branding = parseOrganizationBranding(null);

    expect(branding.logoSrc).toBe('');
    expect(branding.colors.accent).toBe('#827096');
  });
});

describe('normalizeStoredOrganization', () => {
  it('fills missing branding fields from defaults', () => {
    const normalized = normalizeStoredOrganization({
      id: 'org-1',
      slug: 'rooted-meadows',
      name: 'Rooted Meadows Waldorf School',
      branding: {
        colors: {
          accent: '#123456',
        },
      },
    });

    expect(normalized.slug).toBe('rooted-meadows');
    expect(normalized.branding.logoSrc).toBe('');
    expect(normalized.branding.colors.accent).toBe('#123456');
  });
});
