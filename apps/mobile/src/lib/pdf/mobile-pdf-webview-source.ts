import { Platform } from 'react-native';
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes';

import {
  ANDROID_PDF_VIEWER_BASE_URL,
  PDF_VIEWER_BASE_URL,
} from '@/lib/pdf/mobile-pdf-webview-navigation';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';

export { ANDROID_PDF_VIEWER_BASE_URL, PDF_VIEWER_BASE_URL };

export type PdfViewerShellOptions = {
  /** Source text of `pdfjs-dist/build/pdf.min.mjs`. */
  pdfModuleSource: string;
  /** Source text of `pdfjs-dist/build/pdf.worker.min.mjs`. */
  workerModuleSource: string;
  /**
   * pdf.js image decoders keyed by the filename pdf.js asks for (JPEG 2000: `openjpeg.wasm` +
   * `openjpeg_nowasm_fallback.js`; JBIG2 / CCITT: `jbig2.*`). Missing ones render those images blank.
   */
  imageDecoders?: {
    /** `.wasm` as base64, served through the shell's `BinaryDataFactory`. */
    wasmBase64: Record<string, string>;
    /** Pure-JS builds pdf.js `import()`s where the wasm cannot compile (always on WebKit). */
    jsFallbacks: Record<string, string>;
  } | null;
};

/**
 * `wasmUrl` for pdf.js when no JS decoder fallbacks are bundled (it must end in `/`). Nothing is
 * fetched from it: with `useWorkerFetch: false` the worker asks the page's `BinaryDataFactory`
 * for `.wasm` files. With fallbacks, the shell swaps in a blob "router" URL instead (see the HTML).
 */
export const PDFJS_BUNDLED_WASM_URL = `${PDF_VIEWER_BASE_URL}/pdfjs-wasm/`;

/**
 * Built-ins that pdf.js 6 calls without feature checks, defined only where missing. Prepended to
 * both the main and the worker module so they exist in each realm before pdf.js evaluates.
 *
 * Without them pdf.js parses fine on iOS 16.4–18.1 but then fails at runtime (`Promise.try` runs
 * on every worker message). Older engines that cannot even parse pdf.js (iOS < 16.4 lacks class
 * static blocks) fail at `module_load`, and the host falls back to the native viewer.
 *
 * ES5-style with no template literals so it can sit in this file and inside the inline JSON.
 */
export const PDFJS_RUNTIME_PRELUDE = `(function () {
  function define(target, name, value) {
    if (!target || typeof target[name] === 'function') return;
    Object.defineProperty(target, name, { value: value, configurable: true, writable: true, enumerable: false });
  }
  define(Promise, 'withResolvers', function () {
    var resolve, reject;
    var promise = new this(function (res, rej) { resolve = res; reject = rej; });
    return { promise: promise, resolve: resolve, reject: reject };
  });
  define(Promise, 'try', function (fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return new this(function (resolve) { resolve(fn.apply(undefined, args)); });
  });
  [typeof Map === 'function' ? Map : null, typeof WeakMap === 'function' ? WeakMap : null].forEach(function (Ctor) {
    if (!Ctor) return;
    define(Ctor.prototype, 'getOrInsert', function (key, value) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key);
    });
    define(Ctor.prototype, 'getOrInsertComputed', function (key, compute) {
      if (!this.has(key)) this.set(key, compute(key));
      return this.get(key);
    });
  });
  define(Math, 'sumPrecise', function (items) {
    var sum = 0;
    var compensation = 0;
    for (var value of items) {
      var next = sum + value;
      compensation += Math.abs(sum) >= Math.abs(value) ? (sum - next) + value : (value - next) + sum;
      sum = next;
    }
    return sum + compensation;
  });
  if (typeof Uint8Array === 'function' && typeof atob === 'function') {
    define(Uint8Array, 'fromBase64', function (text) {
      var binary = atob(String(text).replace(/\\s/g, ''));
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    });
    define(Uint8Array.prototype, 'toBase64', function () {
      var binary = '';
      for (var i = 0; i < this.length; i += 32768) {
        binary += String.fromCharCode.apply(null, Array.prototype.slice.call(this.subarray(i, i + 32768)));
      }
      return btoa(binary);
    });
  }
  if (typeof Response === 'function') {
    define(Response.prototype, 'bytes', function () {
      return this.arrayBuffer().then(function (buffer) { return new Uint8Array(buffer); });
    });
  }
  if (typeof Uint8Array === 'function') {
    define(Uint8Array.prototype, 'toHex', function () {
      var hex = '';
      for (var i = 0; i < this.length; i++) hex += (this[i] < 16 ? '0' : '') + this[i].toString(16);
      return hex;
    });
  }
})();
`;

/**
 * JSON for an inline classic `<script>`: escapes `<` (so `</script>` in the source cannot close the
 * tag) and the JS-only line terminators U+2028 / U+2029.
 */
function toInlineScriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Removes iframe-style viewer fragments added by {@link buildEmbeddedPdfViewerUrl}. */
export function stripViewerFragment(url: string): string {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return url;
  return url.slice(0, hashIndex);
}

/** URL suitable for opening in the system browser (signed https or data URI). */
export function getMobilePdfExternalOpenUrl(pdfUrl: string): string {
  return stripViewerFragment(pdfUrl);
}

export type PdfViewerLoadOptions = {
  /** Render only page 1 (non-interactive inline previews). */
  firstPageOnly?: boolean;
};

/** Message posted from React Native to start loading a document (keeps signed URLs out of static HTML). */
export function buildPdfViewerLoadMessage(
  pdfUrl: string,
  options: PdfViewerLoadOptions = {},
): string {
  return JSON.stringify({
    type: 'load-pdf',
    url: pdfUrl,
    ...(options.firstPageOnly ? { firstPageOnly: true } : {}),
  });
}

/** Messages the pdf.js shell posts back to React Native. */
export type PdfViewerMessage =
  | { type: 'ready' }
  | { type: 'loaded' }
  | {
      type: 'error';
      stage: string;
      name: string;
      message: string;
      /** Fatal errors replace the viewer with the fallback; others are reported only. */
      fatal: boolean;
    }
  | { type: 'unknown'; raw: string };

export function parsePdfViewerMessage(data: string): PdfViewerMessage {
  if (data === 'pdf-viewer-ready') return { type: 'ready' };
  if (data === 'pdf-loaded') return { type: 'loaded' };
  if (data === 'pdf-error') {
    return {
      type: 'error',
      stage: 'unknown',
      name: 'PdfViewerError',
      message: 'PDF viewer reported an error.',
      fatal: true,
    };
  }

  if (data.startsWith('{')) {
    try {
      const parsed = JSON.parse(data) as Record<string, unknown>;
      if (parsed.type === 'pdf-error') {
        return {
          type: 'error',
          stage: typeof parsed.stage === 'string' ? parsed.stage : 'unknown',
          name: typeof parsed.name === 'string' ? parsed.name : 'PdfViewerError',
          message:
            typeof parsed.message === 'string' && parsed.message.trim()
              ? parsed.message.trim().slice(0, 500)
              : 'PDF viewer reported an error.',
          fatal: parsed.fatal !== false,
        };
      }
    } catch {
      // fall through to unknown
    }
  }

  return { type: 'unknown', raw: data.slice(0, 200) };
}

/**
 * Static pdf.js viewer shell (iOS and Android): bundled pdf.js only (no CDN). Document URL is
 * supplied later via postMessage.
 *
 * pdf.js is inlined as text and imported from same-origin `blob:` URLs. The page's origin is
 * {@link PDF_VIEWER_BASE_URL}, so a module import or module worker from a `file://` asset URI
 * is a cross-origin CORS request that Chromium refuses (`ModuleLoadError` at stage `module_load`).
 * {@link PDFJS_RUNTIME_PRELUDE} is prepended to both modules.
 *
 * Large books (60+ MB) must not be rendered eagerly: page 1 is rendered first (and `pdf-loaded` is
 * posted right away), the remaining pages render on demand near the viewport, and canvases far
 * from the viewport are released so memory stays bounded. `disableAutoFetch` + `disableStream`
 * keep pdf.js from downloading the whole file in the background: without `disableStream` the first
 * (full) request keeps streaming the entire book into memory even though ranges are supported.
 * With it, that request is cancelled once headers confirm range support and only the 512 KB
 * ranges that the visible pages need are fetched. Servers without range support still get one
 * full download.
 *
 * The inline script avoids template literals so it can live inside this TS template string.
 */
export function buildPdfViewerHtml(options: PdfViewerShellOptions): string {
  const sourcesJson = toInlineScriptJson({
    main: PDFJS_RUNTIME_PRELUDE + options.pdfModuleSource,
    worker: PDFJS_RUNTIME_PRELUDE + options.workerModuleSource,
    wasm: options.imageDecoders?.wasmBase64 ?? {},
    wasmFallbacks: options.imageDecoders?.jsFallbacks ?? {},
  });
  const wasmUrlJson = toInlineScriptJson(PDFJS_BUNDLED_WASM_URL);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
<style>
  html, body { margin: 0; padding: 0; background: #F7F1E7; }
  #pages { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px; }
  .page { position: relative; background: #fff; box-shadow: 0 1px 3px rgba(43,36,29,0.14); overflow: hidden; }
  .page canvas { display: block; }
  .page-failed { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; font-size: 13px; color: #6D6257; }
  #status { padding: 24px 16px; font-family: system-ui, sans-serif; font-size: 14px; color: #6D6257; text-align: center; }
  #error { display: none; padding: 16px; font-family: system-ui, sans-serif; font-size: 14px; color: #b91c1c; text-align: center; }
</style>
</head>
<body>
<div id="status">Loading document…</div>
<div id="pages"></div>
<div id="error"></div>
<script>
  window.__pdfjsSources = ${sourcesJson};
</script>
<script id="pdfjs-module" type="module">
  var pdfjsSources = window.__pdfjsSources;
  window.__pdfjsSources = null;
  // Image decoders (JPEG 2000, JBIG2/CCITT). Wasm is decoded lazily: only documents with those
  // images ever ask for it.
  var bundledWasmBase64 = pdfjsSources.wasm || {};
  var bundledWasmBytes = {};
  var bundledWasmFallbacks = pdfjsSources.wasmFallbacks || {};
  var pdfjsLib;
  try {
    var pdfModuleUrl = URL.createObjectURL(new Blob([pdfjsSources.main], { type: 'text/javascript' }));
    var workerModuleUrl = URL.createObjectURL(new Blob([pdfjsSources.worker], { type: 'text/javascript' }));
    pdfjsLib = await import(pdfModuleUrl);
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModuleUrl;
  } catch (err) {
    pdfjsLib = null;
    showFatalError('module_load', err);
  } finally {
    pdfjsSources = null;
  }

  var PAGE_RENDER_MARGIN = '150% 0px';
  var KEEP_PAGES_AROUND_VIEWPORT = 4;
  var MAX_OUTPUT_SCALE = 2;
  var RANGE_CHUNK_SIZE = 524288;
  var BUNDLED_WASM_URL = createBundledWasmUrl(${wasmUrlJson});

  /**
   * pdf.js imports a decoder's JS build from wasmUrl + filename when its wasm will not compile
   * (WebKit rejects relaxed SIMD). One prefix has to serve several files, so wasmUrl is a blob
   * "router" module plus '#/': loading a blob URL ignores the fragment, but every fragment is its
   * own module with its own import.meta.url, so the router re-exports the file that was asked for.
   */
  function createBundledWasmUrl(defaultUrl) {
    var urls = {};
    var count = 0;
    Object.keys(bundledWasmFallbacks).forEach(function (name) {
      if (typeof bundledWasmFallbacks[name] !== 'string') return;
      urls[name] = URL.createObjectURL(new Blob([bundledWasmFallbacks[name]], { type: 'text/javascript' }));
      count++;
    });
    bundledWasmFallbacks = null;
    if (count === 0) return defaultUrl;
    var router =
      'const urls = ' + JSON.stringify(urls) + ';' +
      'const name = import.meta.url.slice(import.meta.url.lastIndexOf("/") + 1);' +
      'if (!urls[name]) throw new Error("No bundled pdf.js decoder for " + name);' +
      'const mod = await import(urls[name]);' +
      'export default mod.default;';
    return URL.createObjectURL(new Blob([router], { type: 'text/javascript' })) + '#/';
  }

  function decodeBase64(text) {
    var binary = atob(text);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  // Serves pdf.js's binary data requests (useWorkerFetch: false) from what the app bundled.
  // Only the decoder .wasm files are bundled; anything else (standard fonts, cmaps) rejects, which
  // pdf.js already handles by falling back as it did before this factory existed.
  function BundledBinaryDataFactory() {}
  BundledBinaryDataFactory.prototype.fetch = function (request) {
    var kind = request && request.kind;
    var filename = request && request.filename;
    if (kind === 'wasmUrl' && typeof bundledWasmBase64[filename] === 'string') {
      try {
        if (!bundledWasmBytes[filename]) bundledWasmBytes[filename] = decodeBase64(bundledWasmBase64[filename]);
        // A copy: pdf.js may transfer (detach) the buffer it receives.
        return Promise.resolve(bundledWasmBytes[filename].slice());
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(new Error('Not bundled in the viewer: ' + kind + ' ' + filename));
  };

  var loadToken = 0;
  var current = null;

  function post(payload) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }
  }

  function postError(stage, err, fatal) {
    var name = err && err.name ? String(err.name) : 'Error';
    var message = err && err.message ? String(err.message) : String(err || 'Unknown error');
    post({ type: 'pdf-error', stage: stage, name: name, message: message.slice(0, 500), fatal: fatal });
  }

  function showFatalError(stage, err) {
    document.getElementById('status').style.display = 'none';
    var errorEl = document.getElementById('error');
    errorEl.style.display = 'block';
    errorEl.textContent = 'Could not display this PDF.';
    postError(stage, err, true);
  }

  function teardown() {
    if (!current) return;
    var previous = current;
    current = null;
    try { previous.observer && previous.observer.disconnect(); } catch (e) {}
    try { previous.loadingTask && previous.loadingTask.destroy(); } catch (e) {}
    document.getElementById('pages').replaceChildren();
  }

  function releasePage(entry) {
    if (entry.canvas) {
      entry.canvas.width = 0;
      entry.canvas.height = 0;
      entry.canvas.remove();
      entry.canvas = null;
    }
    entry.rendered = false;
  }

  async function renderEntry(state, entry) {
    entry.rendering = true;
    try {
      var page = await state.pdf.getPage(entry.number);
      if (state !== current) return;
      var baseViewport = page.getViewport({ scale: 1 });
      var cssScale = state.cssWidth / baseViewport.width;
      var outputScale = Math.min(window.devicePixelRatio || 1, MAX_OUTPUT_SCALE);
      var viewport = page.getViewport({ scale: cssScale * outputScale });
      var canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = state.cssWidth + 'px';
      canvas.style.height = Math.floor(baseViewport.height * cssScale) + 'px';
      var context = canvas.getContext('2d');
      await page.render({ canvasContext: context, canvas: canvas, viewport: viewport }).promise;
      if (state !== current) {
        canvas.width = 0;
        canvas.height = 0;
        return;
      }
      entry.div.style.height = Math.floor(baseViewport.height * cssScale) + 'px';
      entry.div.appendChild(canvas);
      entry.canvas = canvas;
      entry.rendered = true;
      page.cleanup();
    } catch (err) {
      if (state !== current) return;
      entry.failed = true;
      var failedEl = document.createElement('div');
      failedEl.className = 'page-failed';
      failedEl.textContent = 'Page ' + entry.number + ' could not be displayed';
      entry.div.appendChild(failedEl);
      throw err;
    } finally {
      entry.rendering = false;
    }
  }

  function pickNextEntry(state) {
    var best = null;
    state.visible.forEach(function (number) {
      var entry = state.entries[number - 1];
      if (!entry || entry.rendered || entry.rendering || entry.failed) return;
      if (best === null || entry.number < best.number) best = entry;
    });
    return best;
  }

  function evictFarPages(state) {
    if (state.visible.size === 0) return;
    var min = Infinity;
    var max = -Infinity;
    state.visible.forEach(function (number) {
      if (number < min) min = number;
      if (number > max) max = number;
    });
    state.entries.forEach(function (entry) {
      if (!entry.rendered) return;
      if (entry.number < min - KEEP_PAGES_AROUND_VIEWPORT || entry.number > max + KEEP_PAGES_AROUND_VIEWPORT) {
        releasePage(entry);
      }
    });
  }

  async function pump(state) {
    if (state.pumping) return;
    state.pumping = true;
    try {
      while (state === current) {
        var next = pickNextEntry(state);
        if (!next) break;
        try {
          await renderEntry(state, next);
        } catch (err) {
          if (!state.reportedPageFailure) {
            state.reportedPageFailure = true;
            postError('render_page_' + next.number, err, false);
          }
        }
        evictFarPages(state);
      }
    } finally {
      state.pumping = false;
    }
  }

  async function renderPdf(pdfUrl, firstPageOnly) {
    var token = ++loadToken;
    teardown();

    var container = document.getElementById('pages');
    var status = document.getElementById('status');
    status.style.display = 'block';
    status.textContent = 'Loading document…';
    document.getElementById('error').style.display = 'none';

    var stage = 'load';
    try {
      var loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        isEvalSupported: false,
        disableAutoFetch: true,
        disableStream: true,
        rangeChunkSize: RANGE_CHUNK_SIZE,
        wasmUrl: BUNDLED_WASM_URL,
        useWorkerFetch: false,
        BinaryDataFactory: BundledBinaryDataFactory
      });
      var state = {
        pdf: null,
        loadingTask: loadingTask,
        observer: null,
        entries: [],
        visible: new Set(),
        cssWidth: Math.max(window.innerWidth - 16, 100),
        pumping: false,
        reportedPageFailure: false
      };
      current = state;

      var pdf = await loadingTask.promise;
      if (token !== loadToken || state !== current) return;
      state.pdf = pdf;

      var totalPages = firstPageOnly ? 1 : pdf.numPages;
      var firstPage = await pdf.getPage(1);
      var firstViewport = firstPage.getViewport({ scale: 1 });
      var placeholderHeight = Math.floor(firstViewport.height * (state.cssWidth / firstViewport.width));

      for (var pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        var div = document.createElement('div');
        div.className = 'page';
        div.dataset.page = String(pageNumber);
        div.style.width = state.cssWidth + 'px';
        div.style.height = placeholderHeight + 'px';
        container.appendChild(div);
        state.entries.push({
          number: pageNumber,
          div: div,
          canvas: null,
          rendered: false,
          rendering: false,
          failed: false
        });
      }

      stage = 'render_first_page';
      await renderEntry(state, state.entries[0]);
      if (token !== loadToken || state !== current) return;
      status.style.display = 'none';
      post('pdf-loaded');

      if (totalPages > 1) {
        state.observer = new IntersectionObserver(
          function (observed) {
            observed.forEach(function (item) {
              var number = Number(item.target.dataset.page);
              if (item.isIntersecting) {
                state.visible.add(number);
              } else {
                state.visible.delete(number);
              }
            });
            void pump(state);
          },
          { rootMargin: PAGE_RENDER_MARGIN }
        );
        state.entries.forEach(function (entry) {
          state.observer.observe(entry.div);
        });
      }
    } catch (err) {
      if (token !== loadToken) return;
      showFatalError(stage, err);
    }
  }

  function handleHostMessage(event) {
    var payload;
    try {
      payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }
    if (!payload || payload.type !== 'load-pdf' || typeof payload.url !== 'string') {
      return;
    }
    void renderPdf(payload.url, payload.firstPageOnly === true);
  }

  if (pdfjsLib) {
    document.addEventListener('message', handleHostMessage);
    window.addEventListener('message', handleHostMessage);
    post('pdf-viewer-ready');
  }
</script>
<script>
  // Classic script: a module script that fails to load or parse never runs its own catch,
  // so surface that immediately instead of waiting for the host load timeout.
  (function () {
    function postRaw(payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }
    var moduleScript = document.getElementById('pdfjs-module');
    if (moduleScript) {
      moduleScript.addEventListener('error', function () {
        postRaw({ type: 'pdf-error', stage: 'module_load', name: 'ModuleLoadError', message: 'Bundled pdf.js module failed to load.', fatal: true });
      });
    }
    window.addEventListener('error', function (event) {
      postRaw({ type: 'pdf-error', stage: 'script', name: 'ScriptError', message: String(event && event.message ? event.message : 'Script error').slice(0, 500), fatal: false });
    });
    window.addEventListener('unhandledrejection', function (event) {
      var reason = event && event.reason;
      postRaw({ type: 'pdf-error', stage: 'unhandled_rejection', name: reason && reason.name ? String(reason.name) : 'UnhandledRejection', message: String(reason && reason.message ? reason.message : reason).slice(0, 500), fatal: false });
    });
  })();
</script>
</body>
</html>`;
}

export function getPdfJsWebViewSource(shell: PdfViewerShellOptions): WebViewSource {
  return {
    html: buildPdfViewerHtml(shell),
    baseUrl: PDF_VIEWER_BASE_URL,
  };
}

/**
 * The bundled pdf.js shell renders page 1 after a few range requests instead of waiting for the
 * whole file (WKWebView's native PDF view downloads 20–70 MB books before showing anything).
 */
export function usesPdfJsViewer(pdfUrl: string): boolean {
  return (Platform.OS === 'ios' || Platform.OS === 'android') && Boolean(pdfUrl);
}

/** pdf.js shell stages whose failure means the engine itself cannot run pdf.js. */
const PDFJS_ENGINE_STAGES = new Set(['module_load', 'script']);

/**
 * iOS only: whether a shell error means pdf.js cannot run in this WebKit, so the host should
 * switch (once) to the native WKWebView viewer instead of showing the error.
 *
 * A fatal `module_load` / `script` error qualifies. So does a `script` error before the shell
 * posted `pdf-viewer-ready`: a module that fails to parse is reported by the classic script's
 * `window.onerror` as non-fatal, but nothing else will ever run.
 */
export function shouldFallBackToNativePdfViewer(
  message: PdfViewerMessage,
  context: { platform: string; viewerReady: boolean },
): boolean {
  if (context.platform !== 'ios' || message.type !== 'error') return false;
  if (!PDFJS_ENGINE_STAGES.has(message.stage)) return false;
  return message.fatal || (message.stage === 'script' && !context.viewerReady);
}

/** Native WKWebView PDF via signed URL: the iOS fallback when pdf.js cannot run (and tests). */
export function getMobilePdfWebViewSource(pdfUrl: string): WebViewSource {
  const baseUrl = stripViewerFragment(pdfUrl);
  return { uri: buildEmbeddedPdfViewerUrl(baseUrl) };
}
