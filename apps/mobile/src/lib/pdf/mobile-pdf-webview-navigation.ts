/** Base URL (page origin) for the inline pdf.js viewer HTML document on iOS and Android. */
export const PDF_VIEWER_BASE_URL = 'https://localhost';

/** @deprecated Use {@link PDF_VIEWER_BASE_URL} (the shell runs on iOS too). */
export const ANDROID_PDF_VIEWER_BASE_URL = PDF_VIEWER_BASE_URL;

const LOCAL_DEV_PDF_HOSTS = ['127.0.0.1', '10.0.2.2', 'localhost'];

/** Hostnames allowed for HTTPS fetches of signed PDF URLs (Supabase storage, local dev). */
export function getMobilePdfDocumentFetchHosts(): string[] {
  const hosts = new Set<string>(LOCAL_DEV_PDF_HOSTS);
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      hosts.add(new URL(supabaseUrl).hostname);
    } catch {
      // ignore invalid env
    }
  }
  return [...hosts];
}

/**
 * Navigation policy for the pdf.js viewer WebView (iOS and Android).
 * Uses exact hostname matching for remote PDFs — no substring CDN allowlists. `file://` is never
 * allowed: pdf.js is inlined into the viewer HTML.
 */
export function isAllowedPdfJsWebViewNavigation(requestUrl: string): boolean {
  if (requestUrl === 'about:blank') {
    return true;
  }

  if (requestUrl.startsWith(`${PDF_VIEWER_BASE_URL}/`) || requestUrl === PDF_VIEWER_BASE_URL) {
    return true;
  }

  if (requestUrl.startsWith('data:')) {
    return true;
  }

  let parsed: URL;
  try {
    parsed = new URL(requestUrl);
  } catch {
    return false;
  }

  if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
    return getMobilePdfDocumentFetchHosts().includes(parsed.hostname);
  }

  return false;
}
