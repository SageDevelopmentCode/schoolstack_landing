import { Platform } from 'react-native';
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes';

import { ANDROID_PDF_VIEWER_BASE_URL } from '@/lib/pdf/mobile-pdf-webview-navigation';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';

export { ANDROID_PDF_VIEWER_BASE_URL };

export type AndroidPdfViewerShellOptions = {
  pdfModuleUri: string;
  workerModuleUri: string;
};

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

export type AndroidPdfViewerLoadOptions = {
  /** Render only page 1 (non-interactive inline previews). */
  firstPageOnly?: boolean;
};

/** Message posted from React Native to start loading a document (keeps signed URLs out of static HTML). */
export function buildAndroidPdfViewerLoadMessage(
  pdfUrl: string,
  options: AndroidPdfViewerLoadOptions = {},
): string {
  return JSON.stringify({
    type: 'load-pdf',
    url: pdfUrl,
    ...(options.firstPageOnly ? { firstPageOnly: true } : {}),
  });
}

/** Messages the Android pdf.js shell posts back to React Native. */
export type AndroidPdfViewerMessage =
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

export function parseAndroidPdfViewerMessage(data: string): AndroidPdfViewerMessage {
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
 * Static Android viewer shell: bundled pdf.js only (no CDN). Document URL is supplied later via postMessage.
 *
 * Large books (60+ MB) must not be rendered eagerly: page 1 is rendered first (and `pdf-loaded` is
 * posted right away), the remaining pages render on demand near the viewport, and canvases far
 * from the viewport are released so memory stays bounded. `disableAutoFetch` keeps pdf.js from
 * downloading the whole file in the background (HTTP range requests fetch only needed pages).
 *
 * The inline script avoids template literals so it can live inside this TS template string.
 */
export function buildAndroidPdfViewerHtml(options: AndroidPdfViewerShellOptions): string {
  const pdfModuleUri = JSON.stringify(options.pdfModuleUri);
  const workerModuleUri = JSON.stringify(options.workerModuleUri);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
<style>
  html, body { margin: 0; padding: 0; background: #f8fafc; }
  #pages { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px; }
  .page { position: relative; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.12); overflow: hidden; }
  .page canvas { display: block; }
  .page-failed { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; font-size: 13px; color: #94a3b8; }
  #status { padding: 24px 16px; font-family: system-ui, sans-serif; font-size: 14px; color: #64748b; text-align: center; }
  #error { display: none; padding: 16px; font-family: system-ui, sans-serif; font-size: 14px; color: #b91c1c; text-align: center; }
</style>
</head>
<body>
<div id="status">Loading document…</div>
<div id="pages"></div>
<div id="error"></div>
<script id="pdfjs-module" type="module">
  import * as pdfjsLib from ${pdfModuleUri};

  pdfjsLib.GlobalWorkerOptions.workerSrc = ${workerModuleUri};

  var PAGE_RENDER_MARGIN = '150% 0px';
  var KEEP_PAGES_AROUND_VIEWPORT = 4;
  var MAX_OUTPUT_SCALE = 2;
  var RANGE_CHUNK_SIZE = 524288;

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
        rangeChunkSize: RANGE_CHUNK_SIZE
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

  document.addEventListener('message', handleHostMessage);
  window.addEventListener('message', handleHostMessage);
  post('pdf-viewer-ready');
</script>
<script>
  // Classic script: a module that fails to import (blocked file:// asset, missing file) never runs,
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

export function getAndroidPdfWebViewSource(shell: AndroidPdfViewerShellOptions): WebViewSource {
  return {
    html: buildAndroidPdfViewerHtml(shell),
    baseUrl: ANDROID_PDF_VIEWER_BASE_URL,
  };
}

export function usesAndroidPdfJsHtml(pdfUrl: string): boolean {
  return Platform.OS === 'android' && Boolean(pdfUrl);
}

/** iOS (and tests): native WebView PDF via signed URL. Android uses {@link getAndroidPdfWebViewSource}. */
export function getMobilePdfWebViewSource(pdfUrl: string): WebViewSource {
  const baseUrl = stripViewerFragment(pdfUrl);
  return { uri: buildEmbeddedPdfViewerUrl(baseUrl) };
}
