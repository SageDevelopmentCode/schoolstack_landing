import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { useEffect, useState } from 'react';

function loadPdfJsModules(): {
  pdfMinModule: unknown;
  pdfWorkerModule: unknown;
} {
  // Lazy require so pdfjs is not evaluated during app startup (expo-router context load).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfMinModule = require('pdfjs-dist/build/pdf.min.mjs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfWorkerModule = require('pdfjs-dist/build/pdf.worker.min.mjs');
  return { pdfMinModule, pdfWorkerModule };
}

/**
 * pdf.js 6 image decoders: JPEG 2000 (`JPXDecode`, heavy in curriculum books) and JBIG2 / CCITT
 * fax (scanned documents). Each is a `.wasm` (metro `assetExts` has `wasm`) plus the pure-JS
 * build pdf.js imports where the wasm cannot compile (WebKit rejects these modules' relaxed SIMD,
 * so iOS always uses the JS build). The JS builds are verbatim copies in `./vendor` renamed to
 * `.min.mjs` so Metro bundles them as assets (`*.js` is always code); a test keeps them in sync.
 *
 * `require` calls must stay literal for Metro, hence one loader per decoder.
 */
const PDFJS_IMAGE_DECODERS = [
  {
    wasmFilename: 'openjpeg.wasm',
    fallbackFilename: 'openjpeg_nowasm_fallback.js',
    load: () => ({
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      wasm: require('pdfjs-dist/wasm/openjpeg.wasm') as unknown,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      fallback: require('./vendor/openjpeg_nowasm_fallback.min.mjs') as unknown,
    }),
  },
  {
    wasmFilename: 'jbig2.wasm',
    fallbackFilename: 'jbig2_nowasm_fallback.js',
    load: () => ({
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      wasm: require('pdfjs-dist/wasm/jbig2.wasm') as unknown,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      fallback: require('./vendor/jbig2_nowasm_fallback.min.mjs') as unknown,
    }),
  },
] as const;

/** Decoder files keyed by the filename pdf.js asks for (`openjpeg.wasm`, `jbig2_nowasm_fallback.js`, …). */
export type PdfViewerImageDecoders = {
  /** `.wasm` bytes as base64, served through the shell's `BinaryDataFactory`. */
  wasmBase64: Record<string, string>;
  /** Pure-JS module source, served to pdf.js's `import()` from blob URLs. */
  jsFallbacks: Record<string, string>;
};

/** pdf.js source text, inlined into the viewer HTML and loaded there as same-origin blob modules. */
export type PdfViewerSources = {
  pdfModuleSource: string;
  workerModuleSource: string;
  /** Whatever image decoders could be read; a missing one only blanks images of that kind. */
  imageDecoders: PdfViewerImageDecoders;
  /** Why an image decoder is missing (the viewer reports it); null when all loaded. */
  imageDecodersError: unknown;
};

async function downloadAssetUri(moduleId: unknown): Promise<string> {
  const asset = await Asset.fromModule(moduleId as number).downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('Bundled pdf.js asset has no local URI.');
  }
  return uri;
}

async function readAssetText(moduleId: unknown, minLength = MIN_PDFJS_MODULE_LENGTH): Promise<string> {
  const text = await new File(await downloadAssetUri(moduleId)).text();
  assertLooksLikePdfJsModule(text, minLength);
  return text;
}

async function readWasmBase64(moduleId: unknown, filename: string): Promise<string> {
  const base64 = await new File(await downloadAssetUri(moduleId)).base64();
  assertLooksLikeWasmBase64(base64, filename);
  return base64;
}

/** Reads every decoder it can; never throws (a missing decoder must not block the viewer). */
async function readImageDecoders(): Promise<{
  decoders: PdfViewerImageDecoders;
  error: unknown;
}> {
  const decoders: PdfViewerImageDecoders = { wasmBase64: {}, jsFallbacks: {} };
  const errors: unknown[] = [];
  await Promise.all(
    PDFJS_IMAGE_DECODERS.map(async ({ wasmFilename, fallbackFilename, load }) => {
      try {
        const modules = load();
        const [wasm, fallback] = await Promise.allSettled([
          readWasmBase64(modules.wasm, wasmFilename),
          readAssetText(modules.fallback, MIN_DECODER_FALLBACK_LENGTH),
        ]);
        if (wasm.status === 'fulfilled') decoders.wasmBase64[wasmFilename] = wasm.value;
        else errors.push(wasm.reason);
        if (fallback.status === 'fulfilled') decoders.jsFallbacks[fallbackFilename] = fallback.value;
        else errors.push(fallback.reason);
      } catch (error) {
        errors.push(error);
      }
    }),
  );
  return { decoders, error: errors[0] ?? null };
}

/** `\0asm` magic bytes, base64-encoded. */
const WASM_MAGIC_BASE64 = 'AGFzbQ';
/** The decoders are 105–252 KB (140–336 K base64 characters). */
const MIN_DECODER_WASM_BASE64_LENGTH = 100_000;
/** The JS decoder builds are 146–452 KB. */
const MIN_DECODER_FALLBACK_LENGTH = 50_000;

/** Same guard as {@link assertLooksLikePdfJsModule}, for the base64 of a `.wasm` asset. */
export function assertLooksLikeWasmBase64(base64: string, filename = 'wasm asset'): void {
  if (base64.startsWith(WASM_MAGIC_BASE64) && base64.length >= MIN_DECODER_WASM_BASE64_LENGTH) {
    return;
  }
  throw new Error(
    base64
      ? `Bundled ${filename} is not a WebAssembly module (${base64.length} base64 chars).`
      : `Bundled ${filename} is empty.`,
  );
}

/** Smallest plausible pdf.js build (`pdf.min.mjs` is ~400 KB, the worker ~1.3 MB). */
const MIN_PDFJS_MODULE_LENGTH = 100_000;

/**
 * `downloadAsync` saves whatever the asset URL returns, so an HTTP error page (Metro answers
 * "Asset not found" with a 404) would otherwise be inlined as JavaScript and fail later as a
 * confusing `SyntaxError` at `module_load`. Fail here instead, at the `assets` stage.
 */
export function assertLooksLikePdfJsModule(text: string, minLength = MIN_PDFJS_MODULE_LENGTH): void {
  if (text.length >= minLength) return;
  const preview = text.slice(0, 60).replace(/\s+/g, ' ').trim();
  throw new Error(
    text
      ? `Bundled pdf.js asset is not a pdf.js build (${text.length} bytes: "${preview}").`
      : 'Bundled pdf.js asset is empty.',
  );
}

/** One read per app session (~2.5 MB); cleared on failure so "Try again" can retry. */
let sourcesPromise: Promise<PdfViewerSources> | null = null;
let sourcesCache: PdfViewerSources | null = null;

function loadPdfViewerSources(): Promise<PdfViewerSources> {
  if (!sourcesPromise) {
    sourcesPromise = (async () => {
      const { pdfMinModule, pdfWorkerModule } = loadPdfJsModules();
      const [pdfModuleSource, workerModuleSource, imageDecoders] = await Promise.all([
        readAssetText(pdfMinModule),
        readAssetText(pdfWorkerModule),
        readImageDecoders(),
      ]);
      sourcesCache = {
        pdfModuleSource,
        workerModuleSource,
        imageDecoders: imageDecoders.decoders,
        imageDecodersError: imageDecoders.error,
      };
      return sourcesCache;
    })().catch((error: unknown) => {
      sourcesPromise = null;
      throw error;
    });
  }
  return sourcesPromise;
}

/**
 * Starts the one-per-session pdf.js asset read early (for example when a screen that lists
 * documents mounts), so opening a document does not wait for it. Safe to call repeatedly;
 * failures are swallowed here and surface (and are reported) when a viewer mounts.
 */
export function prewarmPdfViewerSources(): void {
  loadPdfViewerSources().catch(() => {
    // The viewer reports `parent_pdf_viewer_assets_failed` when it actually needs the assets.
  });
}

/** Bundled pdf.js sources for the viewer shell (iOS and Android), read once per app session. */
export function usePdfViewerAssets(
  enabled: boolean,
  reloadKey = 0,
): {
  sources: PdfViewerSources | null;
  assetsFailed: boolean;
  /** Why asset loading failed (for operational reporting); null while loading or on success. */
  assetsError: unknown;
  assetsReady: boolean;
} {
  // Start from the cache so a prewarmed viewer renders its WebView on the first frame.
  const [sources, setSources] = useState<PdfViewerSources | null>(() =>
    enabled ? sourcesCache : null,
  );
  const [assetsFailed, setAssetsFailed] = useState(false);
  const [assetsError, setAssetsError] = useState<unknown>(null);

  useEffect(() => {
    if (!enabled) {
      setSources(null);
      setAssetsFailed(false);
      setAssetsError(null);
      return;
    }

    let cancelled = false;
    setAssetsFailed(false);
    setAssetsError(null);

    loadPdfViewerSources().then(
      (loaded) => {
        if (!cancelled) setSources(loaded);
      },
      (assetError: unknown) => {
        if (!cancelled) {
          setSources(null);
          setAssetsError(assetError);
          setAssetsFailed(true);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  return {
    sources,
    assetsFailed,
    assetsError,
    assetsReady: Boolean(sources),
  };
}
