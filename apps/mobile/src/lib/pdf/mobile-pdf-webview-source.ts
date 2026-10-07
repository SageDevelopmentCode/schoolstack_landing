import { Platform } from 'react-native';
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes';

import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';

const PDF_JS_VERSION = '3.11.174';
const PDF_JS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}`;

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

export function buildAndroidPdfJsHtml(pdfUrl: string): string {
  const safeUrlLiteral = JSON.stringify(pdfUrl);

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
<script src="${PDF_JS_CDN}/pdf.min.js"></script>
</head>
<body>
<div id="status">Loading document…</div>
<div id="pages"></div>
<div id="error"></div>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDF_JS_CDN}/pdf.worker.min.js';
  const pdfUrl = ${safeUrlLiteral};

  function post(type) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(type);
    }
  }

  (async function () {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const container = document.getElementById('pages');
      const status = document.getElementById('status');
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
      document.getElementById('status').style.display = 'none';
      const errorEl = document.getElementById('error');
      errorEl.style.display = 'block';
      errorEl.textContent = 'Could not display this PDF.';
      post('pdf-error');
    }
  })();
</script>
</body>
</html>`;
}

export function usesAndroidPdfJsHtml(pdfUrl: string): boolean {
  return Platform.OS === 'android' && Boolean(pdfUrl);
}

export function getMobilePdfWebViewSource(pdfUrl: string): WebViewSource {
  const baseUrl = stripViewerFragment(pdfUrl);

  if (Platform.OS !== 'android') {
    return { uri: buildEmbeddedPdfViewerUrl(baseUrl) };
  }

  return {
    html: buildAndroidPdfJsHtml(baseUrl),
    baseUrl: 'https://localhost',
  };
}
