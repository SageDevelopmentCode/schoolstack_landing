"use client";

import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

export type { PDFDocumentProxy, PDFPageProxy };

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

/**
 * pdf.js is ~460 KB + a 1.3 MB worker, so it is loaded on demand (client
 * only) instead of shipping in the Curriculum tab bundle. Call it early
 * (e.g. on mount) so the worker warms up while the signed URL resolves.
 */
export function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

/**
 * Open a PDF by URL with HTTP range requests, so only the bytes for the pages
 * being looked at are downloaded (curriculum books are 20–70 MB). Settings
 * match the Android viewer (`apps/mobile/src/lib/pdf/mobile-pdf-webview-source.ts`).
 */
export async function openRangedPdf(url: string): Promise<{
  task: PDFDocumentLoadingTask;
  doc: PDFDocumentProxy;
}> {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({
    url,
    disableAutoFetch: true,
    disableStream: false,
    rangeChunkSize: 512 * 1024,
  });
  const doc = await task.promise;
  return { task, doc };
}

/** Never paint more than 2 device pixels per CSS pixel (memory on retina + zoom). */
export const MAX_OUTPUT_SCALE = 2;

export function outputScale(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, MAX_OUTPUT_SCALE);
}
