/** Base URL for the Android inline pdf.js viewer HTML document. */
export const ANDROID_PDF_VIEWER_BASE_URL = 'https://localhost';

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

function normalizeFileUri(uri: string): string {
  return uri.split('?')[0] ?? uri;
}

function isLocalBundledPdfAsset(requestUrl: string, bundledAssetUris: string[]): boolean {
  const normalizedRequest = normalizeFileUri(requestUrl);
  return bundledAssetUris.some((assetUri) => {
    const normalizedAsset = normalizeFileUri(assetUri);
    return (
      normalizedRequest === normalizedAsset ||
      normalizedRequest.startsWith(`${normalizedAsset}/`)
    );
  });
}

/**
 * Navigation / subresource policy for the Android pdf.js WebView.
 * Uses exact hostname matching for remote PDFs — no substring CDN allowlists.
 */
export function isAllowedAndroidPdfWebViewNavigation(
  requestUrl: string,
  options: { bundledAssetUris?: string[] } = {},
): boolean {
  if (requestUrl === 'about:blank') {
    return true;
  }

  if (requestUrl.startsWith(`${ANDROID_PDF_VIEWER_BASE_URL}/`) || requestUrl === ANDROID_PDF_VIEWER_BASE_URL) {
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

  if (parsed.protocol === 'file:') {
    const bundled = options.bundledAssetUris ?? [];
    if (bundled.length === 0) {
      return false;
    }
    return isLocalBundledPdfAsset(requestUrl, bundled);
  }

  if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
    return getMobilePdfDocumentFetchHosts().includes(parsed.hostname);
  }

  return false;
}
