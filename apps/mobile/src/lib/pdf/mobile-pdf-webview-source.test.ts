import { Platform } from 'react-native';

import {
  buildAndroidPdfJsHtml,
  getMobilePdfWebViewSource,
  stripViewerFragment,
} from '@/lib/pdf/mobile-pdf-webview-source';

const signedUrl = 'https://example.supabase.co/storage/v1/object/sign/forms/doc.pdf?token=abc';

describe('stripViewerFragment', () => {
  it('removes viewer hash parameters', () => {
    expect(stripViewerFragment(`${signedUrl}#navpanes=0&view=FitH`)).toBe(signedUrl);
  });

  it('returns url unchanged when there is no hash', () => {
    expect(stripViewerFragment(signedUrl)).toBe(signedUrl);
  });
});

describe('buildAndroidPdfJsHtml', () => {
  it('embeds pdf.js and escapes the document url', () => {
    const html = buildAndroidPdfJsHtml(signedUrl);
    expect(html).toContain('pdf.min.js');
    expect(html).toContain('pdf.worker.min.js');
    expect(html).toContain(JSON.stringify(signedUrl));
  });

  it('supports data uris', () => {
    const dataUri = 'data:application/pdf;base64,QUJD';
    const html = buildAndroidPdfJsHtml(dataUri);
    expect(html).toContain(JSON.stringify(dataUri));
  });
});

describe('getMobilePdfWebViewSource', () => {
  const originalOs = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOs });
  });

  it('returns uri with FitH fragment on ios', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    const source = getMobilePdfWebViewSource(`${signedUrl}#navpanes=0&view=FitH`);
    expect(source).toEqual({
      uri: `${signedUrl}#navpanes=0&view=FitH`,
    });
  });

  it('returns pdf.js html on android', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    const source = getMobilePdfWebViewSource(signedUrl);
    expect(source).toMatchObject({
      baseUrl: 'https://localhost',
    });
    expect('html' in source && source.html).toContain('pdf.min.js');
    expect('html' in source && source.html).toContain(JSON.stringify(signedUrl));
  });
});
