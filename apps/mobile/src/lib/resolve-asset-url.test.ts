describe('resolveOrganizationAssetUrl', () => {
  const originalSiteUrl = process.env.EXPO_PUBLIC_SITE_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.EXPO_PUBLIC_SITE_URL;
    } else {
      process.env.EXPO_PUBLIC_SITE_URL = originalSiteUrl;
    }
    jest.resetModules();
  });

  function loadModule(siteUrl: string) {
    jest.resetModules();
    process.env.EXPO_PUBLIC_SITE_URL = siteUrl;
    return require('@/lib/resolve-asset-url') as typeof import('@/lib/resolve-asset-url');
  }

  it('returns absolute URLs unchanged', () => {
    const { resolveOrganizationAssetUrl } = loadModule('http://127.0.0.1:3100');

    expect(resolveOrganizationAssetUrl('https://cdn.example.com/logo.png')).toBe(
      'https://cdn.example.com/logo.png',
    );
  });

  it('prefixes site URL for relative asset paths', () => {
    const { resolveOrganizationAssetUrl } = loadModule('http://127.0.0.1:3100');

    expect(resolveOrganizationAssetUrl('/uploads/logo.png')).toBe(
      'http://127.0.0.1:3100/uploads/logo.png',
    );
  });

  it('returns empty string for blank input', () => {
    const { resolveOrganizationAssetUrl } = loadModule('http://127.0.0.1:3100');

    expect(resolveOrganizationAssetUrl('   ')).toBe('');
  });
});
