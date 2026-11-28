import vm from 'node:vm';

import { Platform } from 'react-native';

import {
  buildPdfViewerHtml,
  buildPdfViewerLoadMessage,
  getPdfJsWebViewSource,
  getMobilePdfWebViewSource,
  parsePdfViewerMessage,
  PDFJS_BUNDLED_WASM_URL,
  PDFJS_RUNTIME_PRELUDE,
  shouldFallBackToNativePdfViewer,
  stripViewerFragment,
  usesPdfJsViewer,
  type PdfViewerMessage,
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

describe('buildPdfViewerHtml', () => {
  it('inlines bundled pdf.js as blob modules and disables eval in getDocument', () => {
    const html = buildPdfViewerHtml(shellOptions);
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
    const html = buildPdfViewerHtml(shellOptions);
    expect(html).not.toContain('</script><b>');
    expect(html).not.toContain('\u2028');
    expect(html).toContain('\\u003c/script>');

    const match = html.match(/window\.__pdfjsSources = (.*);\n/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toEqual({
      main: PDFJS_RUNTIME_PRELUDE + shellOptions.pdfModuleSource,
      worker: PDFJS_RUNTIME_PRELUDE + shellOptions.workerModuleSource,
      wasm: {},
      wasmFallbacks: {},
    });
  });

  it('loads document via host postMessage', () => {
    const html = buildPdfViewerHtml(shellOptions);
    expect(html).toContain("payload.type !== 'load-pdf'");
  });

  it('renders lazily instead of rendering every page before reporting loaded', () => {
    const html = buildPdfViewerHtml(shellOptions);
    expect(html).toContain('IntersectionObserver');
    expect(html).toContain('disableAutoFetch: true');
    // Without disableStream the first request streams the whole book even with range support.
    expect(html).toContain('disableStream: true');
    expect(html).toContain('releasePage');
    expect(html).toContain("post('pdf-loaded')");
    // `pdf-loaded` must be posted before the observer renders later pages.
    expect(html.indexOf("post('pdf-loaded')")).toBeLessThan(html.indexOf('new IntersectionObserver'));
  });

  it('hands pdf.js the bundled image decoders (wasm + JS fallbacks)', () => {
    const imageDecoders = {
      wasmBase64: { 'openjpeg.wasm': 'AGFzbQEAAAA=' },
      jsFallbacks: { 'openjpeg_nowasm_fallback.js': 'export default function () {}' },
    };
    const html = buildPdfViewerHtml({ ...shellOptions, imageDecoders });
    const match = html.match(/window\.__pdfjsSources = (.*);\n/);
    const sources = JSON.parse(match![1]);
    expect(sources.wasm).toEqual(imageDecoders.wasmBase64);
    expect(sources.wasmFallbacks).toEqual(imageDecoders.jsFallbacks);
    // The worker must ask the page for .wasm (it cannot fetch a bundled asset itself).
    expect(html).toContain('useWorkerFetch: false');
    expect(html).toContain('BinaryDataFactory: BundledBinaryDataFactory');
    expect(html).toContain('wasmUrl: BUNDLED_WASM_URL');
    // JS fallbacks come from a blob router module whose fragment names the file.
    expect(html).toContain(`createBundledWasmUrl("${PDFJS_BUNDLED_WASM_URL}")`);
    expect(html).toContain("+ '#/'");
    expect(html).toContain('import.meta.url.slice(import.meta.url.lastIndexOf("/") + 1)');
    expect(PDFJS_BUNDLED_WASM_URL.endsWith('/')).toBe(true);
  });

  it('surfaces module load failures from a classic script', () => {
    const html = buildPdfViewerHtml(shellOptions);
    expect(html).toContain("stage: 'module_load'");
    expect(html).toContain("showFatalError('module_load', err)");
  });
});

describe('parsePdfViewerMessage', () => {
  it('parses plain lifecycle messages', () => {
    expect(parsePdfViewerMessage('pdf-viewer-ready')).toEqual({ type: 'ready' });
    expect(parsePdfViewerMessage('pdf-loaded')).toEqual({ type: 'loaded' });
  });

  it('treats the legacy bare pdf-error string as fatal', () => {
    expect(parsePdfViewerMessage('pdf-error')).toMatchObject({ type: 'error', fatal: true });
  });

  it('parses structured errors', () => {
    expect(
      parsePdfViewerMessage(
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
      parsePdfViewerMessage(
        JSON.stringify({ type: 'pdf-error', stage: 'render_page_5', fatal: false }),
      ),
    ).toMatchObject({ type: 'error', fatal: false, stage: 'render_page_5' });
  });

  it('ignores unknown payloads', () => {
    expect(parsePdfViewerMessage('something-else')).toEqual({
      type: 'unknown',
      raw: 'something-else',
    });
    expect(parsePdfViewerMessage('{not json')).toMatchObject({ type: 'unknown' });
  });
});

describe('buildPdfViewerLoadMessage', () => {
  it('serializes load payload', () => {
    expect(buildPdfViewerLoadMessage(signedUrl)).toBe(
      JSON.stringify({ type: 'load-pdf', url: signedUrl }),
    );
  });

  it('adds firstPageOnly only when requested', () => {
    expect(buildPdfViewerLoadMessage(signedUrl, { firstPageOnly: true })).toBe(
      JSON.stringify({ type: 'load-pdf', url: signedUrl, firstPageOnly: true }),
    );
    expect(buildPdfViewerLoadMessage(signedUrl, { firstPageOnly: false })).toBe(
      JSON.stringify({ type: 'load-pdf', url: signedUrl }),
    );
  });

  it('supports data uris', () => {
    const dataUri = 'data:application/pdf;base64,QUJD';
    expect(buildPdfViewerLoadMessage(dataUri)).toContain(dataUri);
  });
});

describe('PDFJS_RUNTIME_PRELUDE', () => {
  function runInBareRealm(after: string): unknown {
    const context = vm.createContext({
      atob: (text: string) => Buffer.from(text, 'base64').toString('binary'),
      btoa: (text: string) => Buffer.from(text, 'binary').toString('base64'),
    });
    vm.runInContext(
      [
        'delete Promise.withResolvers;',
        'delete Promise.try;',
        'delete Map.prototype.getOrInsert;',
        'delete Map.prototype.getOrInsertComputed;',
        'delete WeakMap.prototype.getOrInsertComputed;',
        'delete Math.sumPrecise;',
        'delete Uint8Array.fromBase64;',
        'delete Uint8Array.prototype.toBase64;',
        'delete Uint8Array.prototype.toHex;',
        'class Response { constructor(b) { this.b = b; } arrayBuffer() { return Promise.resolve(this.b); } }',
        'globalThis.Response = Response;',
      ].join('\n'),
      context,
    );
    vm.runInContext(PDFJS_RUNTIME_PRELUDE, context);
    return vm.runInContext(after, context);
  }

  it('defines the built-ins pdf.js 6 calls without feature checks', async () => {
    const result = runInBareRealm(`({
      withResolvers: typeof Promise.withResolvers,
      tryResult: Promise.try((a, b) => a + b, 2, 3),
      tryRejects: Promise.try(() => { throw new Error('boom'); }).then(() => 'resolved', (e) => e.message),
      computed: (() => { const m = new Map(); m.getOrInsertComputed('k', () => []).push(1); m.getOrInsertComputed('k', () => []).push(2); return m.get('k').join(','); })(),
      inserted: new Map([['a', 1]]).getOrInsert('a', 9),
      weak: typeof WeakMap.prototype.getOrInsertComputed,
      sum: Math.sumPrecise([0.1, 0.2, 0.3]),
      hex: new Uint8Array([0, 15, 255]).toHex(),
      base64: Uint8Array.fromBase64('AQ ID').join(','),
      roundTrip: new Uint8Array([104, 105]).toBase64(),
      bytes: new Response(new Uint8Array([7, 8]).buffer).bytes().then((b) => Array.from(b).join(',')),
    })`) as Record<string, unknown>;

    expect(result.withResolvers).toBe('function');
    await expect(result.tryResult).resolves.toBe(5);
    await expect(result.tryRejects).resolves.toBe('boom');
    expect(result.computed).toBe('1,2');
    expect(result.inserted).toBe(1);
    expect(result.weak).toBe('function');
    expect(result.sum).toBeCloseTo(0.6, 12);
    expect(result.hex).toBe('000fff');
    expect(result.base64).toBe('1,2,3');
    expect(result.roundTrip).toBe('aGk=');
    await expect(result.bytes).resolves.toBe('7,8');
  });

  it('never replaces a built-in that already exists', () => {
    const context = vm.createContext({});
    const same = vm.runInContext(
      'const fake = function fake() {}; Promise.try = fake; Math.sumPrecise = fake;' +
        PDFJS_RUNTIME_PRELUDE +
        '; Promise.try === fake && Math.sumPrecise === fake',
      context,
    );
    expect(same).toBe(true);
  });

  it('has no template literals or closing script tags', () => {
    expect(PDFJS_RUNTIME_PRELUDE).not.toContain('`');
    expect(PDFJS_RUNTIME_PRELUDE).not.toContain('</script');
  });
});

describe('usesPdfJsViewer', () => {
  const originalOs = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOs });
  });

  it.each(['ios', 'android'])('is true on %s when a url is set', (os) => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
    expect(usesPdfJsViewer(signedUrl)).toBe(true);
    expect(usesPdfJsViewer('')).toBe(false);
  });

  it('is false on web', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    expect(usesPdfJsViewer(signedUrl)).toBe(false);
  });
});

describe('shouldFallBackToNativePdfViewer', () => {
  const error = (stage: string, fatal: boolean): PdfViewerMessage => ({
    type: 'error',
    stage,
    name: 'Error',
    message: 'x',
    fatal,
  });

  it('falls back on iOS for fatal module_load and script errors', () => {
    const context = { platform: 'ios', viewerReady: false };
    expect(shouldFallBackToNativePdfViewer(error('module_load', true), context)).toBe(true);
    expect(shouldFallBackToNativePdfViewer(error('script', true), context)).toBe(true);
  });

  it('treats a script error before the shell is ready as an engine failure', () => {
    expect(
      shouldFallBackToNativePdfViewer(error('script', false), { platform: 'ios', viewerReady: false }),
    ).toBe(true);
    expect(
      shouldFallBackToNativePdfViewer(error('script', false), { platform: 'ios', viewerReady: true }),
    ).toBe(false);
  });

  it('never falls back for document errors or on android', () => {
    expect(
      shouldFallBackToNativePdfViewer(error('load', true), { platform: 'ios', viewerReady: true }),
    ).toBe(false);
    expect(
      shouldFallBackToNativePdfViewer(error('render_first_page', true), {
        platform: 'ios',
        viewerReady: true,
      }),
    ).toBe(false);
    expect(
      shouldFallBackToNativePdfViewer(error('module_load', true), {
        platform: 'android',
        viewerReady: false,
      }),
    ).toBe(false);
    expect(
      shouldFallBackToNativePdfViewer({ type: 'loaded' }, { platform: 'ios', viewerReady: true }),
    ).toBe(false);
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

describe('getPdfJsWebViewSource', () => {
  it('returns local html shell without embedding the document url', () => {
    const source = getPdfJsWebViewSource(shellOptions);
    expect(source).toMatchObject({
      baseUrl: 'https://localhost',
    });
    expect('html' in source && source.html).not.toContain(signedUrl);
    expect('html' in source && source.html).toContain('isEvalSupported: false');
  });
});
