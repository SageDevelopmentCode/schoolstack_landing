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

/** Message posted from React Native to start loading a document (keeps signed URLs out of static HTML). */
export function buildAndroidPdfViewerLoadMessage(pdfUrl: string): string {
  return JSON.stringify({ type: 'load-pdf', url: pdfUrl });
}

/**
 * Static Android viewer shell: bundled pdf.js only (no CDN). Document URL is supplied later via postMessage.
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
  canvas { max-width: 100%; height: auto !important; box-shadow: 0 1px 3px rgba(0,0,0,0.12); background: #fff; }
  #status { padding: 24px 16px; font-family: system-ui, sans-serif; font-size: 14px; color: #64748b; text-align: center; }
  #error { display: none; padding: 16px; font-family: system-ui, sans-serif; font-size: 14px; color: #b91c1c; text-align: center; }
</style>
</head>
<body>
<div id="status">Loading document…</div>
<div id="pages"></div>
<div id="error"></div>
<script type="module">
  import * as pdfjsLib from ${pdfModuleUri};

  pdfjsLib.GlobalWorkerOptions.workerSrc = ${workerModuleUri};

  function post(type) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(type);
    }
  }

  function showError() {
    document.getElementById('status').style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.style.display = 'block';
    errorEl.textContent = 'Could not display this PDF.';
    post('pdf-error');
  }

  async function renderPdf(pdfUrl) {
    const container = document.getElementById('pages');
    const status = document.getElementById('status');
    container.replaceChildren();
    status.style.display = 'block';
    status.textContent = 'Loading document…';
    document.getElementById('error').style.display = 'none';

    try {
      const loadingTask = pdfjsLib.getDocument({ url: pdfUrl, isEvalSupported: false });
      const pdf = await loadingTask.promise;
      status.style.display = 'none';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2, (window.innerWidth - 16) / baseViewport.width);
        const viewport = page.getViewport({ scale: Math.max(scale, 0.5) });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        container.appendChild(canvas);
        await page.render({
          canvasContext: canvas.getContext('2d'),
          viewport,
        }).promise;
      }
      post('pdf-loaded');
    } catch (err) {
      showError();
    }
  }

  function handleHostMessage(event) {
    let payload;
    try {
      payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }
    if (!payload || payload.type !== 'load-pdf' || typeof payload.url !== 'string') {
      return;
    }
    void renderPdf(payload.url);
  }

  document.addEventListener('message', handleHostMessage);
  window.addEventListener('message', handleHostMessage);
  post('pdf-viewer-ready');
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
