describe('schoolApplyUrl', () => {
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
    return require('@/lib/admissions/school-apply-url') as typeof import('@/lib/admissions/school-apply-url');
  }

  it('builds the school apply path', () => {
    const { schoolApplyPath } = loadModule('http://127.0.0.1:3100');

    expect(schoolApplyPath('rooted-meadows')).toBe('/school/rooted-meadows/apply');
  });

  it('builds the full apply URL from site URL', () => {
    const { schoolApplyUrl } = loadModule('http://127.0.0.1:3100');

    expect(schoolApplyUrl('rooted-meadows')).toBe('http://127.0.0.1:3100/school/rooted-meadows/apply');
  });
});
