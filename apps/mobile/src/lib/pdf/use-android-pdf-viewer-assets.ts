import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

// Bundled via Metro (see apps/mobile/metro.config.js — `.mjs` in assetExts).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfMinModule = require('pdfjs-dist/build/pdf.min.mjs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfWorkerModule = require('pdfjs-dist/build/pdf.worker.min.mjs');

export type AndroidPdfViewerAssetUris = {
  pdfModuleUri: string;
  workerModuleUri: string;
};

export function useAndroidPdfViewerAssets(enabled: boolean): {
  assetUris: AndroidPdfViewerAssetUris | null;
  assetsFailed: boolean;
  assetsReady: boolean;
} {
  const [assetUris, setAssetUris] = useState<AndroidPdfViewerAssetUris | null>(null);
  const [assetsFailed, setAssetsFailed] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setAssetUris(null);
      setAssetsFailed(false);
      return;
    }

    let cancelled = false;
    setAssetUris(null);
    setAssetsFailed(false);

    void (async () => {
      try {
        const [pdfAsset, workerAsset] = await Promise.all([
          Asset.fromModule(pdfMinModule).downloadAsync(),
          Asset.fromModule(pdfWorkerModule).downloadAsync(),
        ]);
        if (cancelled) return;

        const pdfModuleUri = pdfAsset.localUri ?? pdfAsset.uri;
        const workerModuleUri = workerAsset.localUri ?? workerAsset.uri;
        if (!pdfModuleUri || !workerModuleUri) {
          setAssetsFailed(true);
          return;
        }

        setAssetUris({ pdfModuleUri, workerModuleUri });
      } catch {
        if (!cancelled) {
          setAssetsFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    assetUris,
    assetsFailed,
    assetsReady: Boolean(assetUris),
  };
}
