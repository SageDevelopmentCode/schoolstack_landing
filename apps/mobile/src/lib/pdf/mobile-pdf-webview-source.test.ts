import { Platform } from 'react-native';

import {
  buildAndroidPdfViewerHtml,
  buildAndroidPdfViewerLoadMessage,
  getAndroidPdfWebViewSource,
  getMobilePdfWebViewSource,
  stripViewerFragment,
} from '@/lib/pdf/mobile-pdf-webview-source';

const signedUrl = 'https://example.supabase.co/storage/v1/object/sign/forms/doc.pdf?token=abc';

const shellOptions = {
  pdfModuleUri: 'file:///bundled/pdf.min.mjs',
  workerModuleUri: 'file:///bundled/pdf.worker.min.mjs',
};

describe('stripViewerFragment', () => {
  it('removes viewer hash parameters', () => {
    expect(stripViewerFragment(`${signedUrl}#navpanes=0&view=FitH`)).toBe(signedUrl);
  });

  it('returns url unchanged when there is no hash', () => {
    expect(stripViewerFragment(signedUrl)).toBe(signedUrl);
  });
});

describe('buildAndroidPdfViewerHtml', () => {
  it('uses bundled pdf.js modules and disables eval in getDocument', () => {
    const html = buildAndroidPdfViewerHtml(shellOptions);
    expect(html).not.toContain('cdnjs.cloudflare.com');
    expect(html).toContain('file:///bundled/pdf.min.mjs');
    expect(html).toContain('file:///bundled/pdf.worker.min.mjs');
    expect(html).toContain('isEvalSupported: false');
    expect(html).not.toContain(signedUrl);
  });

  it('loads document via host postMessage', () => {
    const html = buildAndroidPdfViewerHtml(shellOptions);
    expect(html).toContain("payload.type !== 'load-pdf'");
  });
});

describe('buildAndroidPdfViewerLoadMessage', () => {
  it('serializes load payload', () => {
    expect(buildAndroidPdfViewerLoadMessage(signedUrl)).toBe(
      JSON.stringify({ type: 'load-pdf', url: signedUrl }),
    );
  });

  it('supports data uris', () => {
    const dataUri = 'data:application/pdf;base64,QUJD';
    expect(buildAndroidPdfViewerLoadMessage(dataUri)).toContain(dataUri);
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
});

describe('getAndroidPdfWebViewSource', () => {
  it('returns local html shell without embedding the document url', () => {
    const source = getAndroidPdfWebViewSource(shellOptions);
    expect(source).toMatchObject({
      baseUrl: 'https://localhost',
    });
    expect('html' in source && source.html).not.toContain(signedUrl);
    expect('html' in source && source.html).toContain('isEvalSupported: false');
  });
});
