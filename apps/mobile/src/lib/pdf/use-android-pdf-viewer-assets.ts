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

/** pdf.js source text, inlined into the viewer HTML and loaded there as same-origin blob modules. */
export type AndroidPdfViewerSources = {
  pdfModuleSource: string;
  workerModuleSource: string;
};

async function readAssetText(moduleId: unknown): Promise<string> {
  const asset = await Asset.fromModule(moduleId as number).downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('Bundled pdf.js asset has no local URI.');
  }
  const text = await new File(uri).text();
  if (!text) {
    throw new Error('Bundled pdf.js asset is empty.');
  }
  return text;
}

/** One read per app session (~1.7 MB); cleared on failure so "Try again" can retry. */
let sourcesPromise: Promise<AndroidPdfViewerSources> | null = null;

function loadAndroidPdfViewerSources(): Promise<AndroidPdfViewerSources> {
  if (!sourcesPromise) {
    sourcesPromise = (async () => {
      const { pdfMinModule, pdfWorkerModule } = loadPdfJsModules();
      const [pdfModuleSource, workerModuleSource] = await Promise.all([
        readAssetText(pdfMinModule),
        readAssetText(pdfWorkerModule),
      ]);
      return { pdfModuleSource, workerModuleSource };
    })().catch((error: unknown) => {
      sourcesPromise = null;
      throw error;
    });
  }
  return sourcesPromise;
}

export function useAndroidPdfViewerAssets(
  enabled: boolean,
  reloadKey = 0,
): {
  sources: AndroidPdfViewerSources | null;
  assetsFailed: boolean;
  /** Why asset loading failed (for operational reporting); null while loading or on success. */
  assetsError: unknown;
  assetsReady: boolean;
} {
  const [sources, setSources] = useState<AndroidPdfViewerSources | null>(null);
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

    loadAndroidPdfViewerSources().then(
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
