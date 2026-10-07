import {
  getMobilePdfDocumentFetchHosts,
  isAllowedAndroidPdfWebViewNavigation,
} from '@/lib/pdf/mobile-pdf-webview-navigation';

describe('getMobilePdfDocumentFetchHosts', () => {
  const originalSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  });

  it('includes supabase hostname from env', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://abcxyz.supabase.co';
    expect(getMobilePdfDocumentFetchHosts()).toContain('abcxyz.supabase.co');
  });

  it('includes local dev hosts', () => {
    expect(getMobilePdfDocumentFetchHosts()).toEqual(
      expect.arrayContaining(['127.0.0.1', '10.0.2.2', 'localhost']),
    );
  });
});

describe('isAllowedAndroidPdfWebViewNavigation', () => {
  const bundled = [
    'file:///data/user/0/app/files/pdf.min.mjs',
    'file:///data/user/0/app/files/pdf.worker.min.mjs',
  ];

  it('allows viewer base url and about:blank', () => {
    expect(isAllowedAndroidPdfWebViewNavigation('about:blank')).toBe(true);
    expect(isAllowedAndroidPdfWebViewNavigation('https://localhost/')).toBe(true);
  });

  it('allows exact supabase storage host', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    expect(
      isAllowedAndroidPdfWebViewNavigation(
        'https://project.supabase.co/storage/v1/object/sign/doc.pdf?token=secret',
      ),
    ).toBe(true);
  });

  it('rejects substring cdn bypass hosts', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    expect(
      isAllowedAndroidPdfWebViewNavigation(
        'https://evil.example/cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      ),
    ).toBe(false);
  });

  it('allows bundled file assets only when listed', () => {
    expect(isAllowedAndroidPdfWebViewNavigation('file:///etc/passwd')).toBe(false);
    expect(
      isAllowedAndroidPdfWebViewNavigation('file:///data/user/0/app/files/pdf.min.mjs', {
        bundledAssetUris: bundled,
      }),
    ).toBe(true);
  });
});
