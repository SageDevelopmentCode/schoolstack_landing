import { Platform } from 'react-native';

import {
  buildAndroidPdfViewerHtml,
  buildAndroidPdfViewerLoadMessage,
  getAndroidPdfWebViewSource,
  getMobilePdfWebViewSource,
  parseAndroidPdfViewerMessage,
  stripViewerFragment,
} from '@/lib/pdf/mobile-pdf-webview-source';

const signedUrl = 'https://example.supabase.co/storage/v1/object/sign/forms/doc.pdf?token=abc';

const shellOptions = {
  pdfModuleSource: 'export const marker = "MAIN_SOURCE</script><b>\u2028";',
  workerModuleSource: 'export const marker = "WORKER_SOURCE";',
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
  it('inlines bundled pdf.js as blob modules and disables eval in getDocument', () => {
    const html = buildAndroidPdfViewerHtml(shellOptions);
    expect(html).not.toContain('cdnjs.cloudflare.com');
    // file:// modules are cross-origin to https://localhost and fail to import on Android.
    expect(html).not.toContain('file://');
    expect(html).toContain('MAIN_SOURCE');
    expect(html).toContain('WORKER_SOURCE');
    expect(html).toContain('URL.createObjectURL');
    expect(html).toContain('await import(pdfModuleUrl)');
    expect(html).toContain('isEvalSupported: false');
    expect(html).not.toContain(signedUrl);
  });

  it('escapes inlined sources so they cannot close the script tag', () => {
    const html = buildAndroidPdfViewerHtml(shellOptions);
    expect(html).not.toContain('</script><b>');
    expect(html).not.toContain('\u2028');
    expect(html).toContain('\\u003c/script>');

    const match = html.match(/window\.__pdfjsSources = (.*);\n/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toEqual({
      main: shellOptions.pdfModuleSource,
      worker: shellOptions.workerModuleSource,
    });
  });

  it('loads document via host postMessage', () => {
    const html = buildAndroidPdfViewerHtml(shellOptions);
    expect(html).toContain("payload.type !== 'load-pdf'");
  });

  it('renders lazily instead of rendering every page before reporting loaded', () => {
    const html = buildAndroidPdfViewerHtml(shellOptions);
    expect(html).toContain('IntersectionObserver');
    expect(html).toContain('disableAutoFetch: true');
    expect(html).toContain('releasePage');
    expect(html).toContain("post('pdf-loaded')");
    // `pdf-loaded` must be posted before the observer renders later pages.
    expect(html.indexOf("post('pdf-loaded')")).toBeLessThan(html.indexOf('new IntersectionObserver'));
  });

  it('surfaces module load failures from a classic script', () => {
    const html = buildAndroidPdfViewerHtml(shellOptions);
    expect(html).toContain("stage: 'module_load'");
    expect(html).toContain("showFatalError('module_load', err)");
  });
});

describe('parseAndroidPdfViewerMessage', () => {
  it('parses plain lifecycle messages', () => {
    expect(parseAndroidPdfViewerMessage('pdf-viewer-ready')).toEqual({ type: 'ready' });
    expect(parseAndroidPdfViewerMessage('pdf-loaded')).toEqual({ type: 'loaded' });
  });

  it('treats the legacy bare pdf-error string as fatal', () => {
    expect(parseAndroidPdfViewerMessage('pdf-error')).toMatchObject({ type: 'error', fatal: true });
  });

  it('parses structured errors', () => {
    expect(
      parseAndroidPdfViewerMessage(
        JSON.stringify({
          type: 'pdf-error',
          stage: 'load',
          name: 'MissingPDFException',
          message: 'Missing PDF',
          fatal: true,
        }),
      ),
    ).toEqual({
      type: 'error',
      stage: 'load',
      name: 'MissingPDFException',
      message: 'Missing PDF',
      fatal: true,
    });
  });

  it('keeps non-fatal errors non-fatal', () => {
    expect(
      parseAndroidPdfViewerMessage(
        JSON.stringify({ type: 'pdf-error', stage: 'render_page_5', fatal: false }),
      ),
    ).toMatchObject({ type: 'error', fatal: false, stage: 'render_page_5' });
  });

  it('ignores unknown payloads', () => {
    expect(parseAndroidPdfViewerMessage('something-else')).toEqual({
      type: 'unknown',
      raw: 'something-else',
    });
    expect(parseAndroidPdfViewerMessage('{not json')).toMatchObject({ type: 'unknown' });
  });
});

describe('buildAndroidPdfViewerLoadMessage', () => {
  it('serializes load payload', () => {
    expect(buildAndroidPdfViewerLoadMessage(signedUrl)).toBe(
      JSON.stringify({ type: 'load-pdf', url: signedUrl }),
    );
  });

  it('adds firstPageOnly only when requested', () => {
    expect(buildAndroidPdfViewerLoadMessage(signedUrl, { firstPageOnly: true })).toBe(
      JSON.stringify({ type: 'load-pdf', url: signedUrl, firstPageOnly: true }),
    );
    expect(buildAndroidPdfViewerLoadMessage(signedUrl, { firstPageOnly: false })).toBe(
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
