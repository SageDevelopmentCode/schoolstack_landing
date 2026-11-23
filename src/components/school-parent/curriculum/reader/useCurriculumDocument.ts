"use client";

import { useCallback, useEffect, useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { loadPdfjs, openRangedPdf, type PDFDocumentProxy } from "./pdfjs";

export type CurriculumSignedUrl = { url: string; expiresAt: number };
/** Signed Storage URLs per guide id, created during the server render. */
export type CurriculumSignedUrls = Record<string, CurriculumSignedUrl>;

export type CurriculumPageSize = { width: number; height: number };

type LoadedDoc = {
  task: PDFDocumentLoadingTask;
  doc: PDFDocumentProxy;
  firstPage: CurriculumPageSize;
};

type CacheEntry = { promise: Promise<LoadedDoc>; lastUsed: number };

/** Opened documents survive guide switches (a program has at most 5 guides). */
const DOC_CACHE = new Map<string, CacheEntry>();
const DOC_CACHE_SIZE = 6;
/** Fresh URLs fetched on the client (refresh before the 1h expiry). */
const URL_CACHE = new Map<string, CurriculumSignedUrl>();
const URL_REFRESH_MARGIN_MS = 5 * 60 * 1000;

function evictOldest() {
  while (DOC_CACHE.size > DOC_CACHE_SIZE) {
    let oldestKey: string | null = null;
    let oldest = Infinity;
    for (const [key, entry] of DOC_CACHE) {
      if (entry.lastUsed < oldest) {
        oldest = entry.lastUsed;
        oldestKey = key;
      }
    }
    if (!oldestKey) return;
    const entry = DOC_CACHE.get(oldestKey);
    DOC_CACHE.delete(oldestKey);
    void entry?.promise.then(({ task }) => task.destroy()).catch(() => {});
  }
}

async function fetchSignedUrl(input: {
  organizationId: string;
  programId: string;
  guideId: string;
}): Promise<CurriculumSignedUrl> {
  const params = new URLSearchParams({
    organizationId: input.organizationId,
    programId: input.programId,
    curriculumId: input.guideId,
  });
  const response = await fetch(`/api/parent-portal/curriculum/pdf-url?${params}`);
  const data = (await response.json().catch(() => ({}))) as {
    url?: string;
    expiresInSeconds?: number;
    error?: string;
  };
  if (!response.ok || !data.url) {
    throw Object.assign(new Error(data.error ?? "We couldn't open this guide."), {
      status: response.status,
    });
  }
  return { url: data.url, expiresAt: Date.now() + (data.expiresInSeconds ?? 3600) * 1000 };
}

function cacheKey(programId: string, guideId: string) {
  return `${programId}:${guideId}`;
}

/** Start opening a guide without rendering it (hover / focus prefetch). */
export function prefetchCurriculumDocument(input: {
  organizationId: string;
  programId: string;
  guideId: string;
  signedUrls?: CurriculumSignedUrls;
  previewMode?: boolean;
}): void {
  void openCurriculumDocument(input).catch(() => {});
}

function openCurriculumDocument(input: {
  organizationId: string;
  programId: string;
  guideId: string;
  signedUrls?: CurriculumSignedUrls;
  previewMode?: boolean;
  forceFreshUrl?: boolean;
}): Promise<LoadedDoc> {
  const key = cacheKey(input.programId, input.guideId);
  const cached = DOC_CACHE.get(key);
  if (cached && !input.forceFreshUrl) {
    cached.lastUsed = Date.now();
    return cached.promise;
  }

  const promise = (async () => {
    const now = Date.now();
    const fromServer = input.signedUrls?.[input.guideId];
    const fromClient = URL_CACHE.get(key);
    let signed =
      !input.forceFreshUrl && fromClient && fromClient.expiresAt - now > URL_REFRESH_MARGIN_MS
        ? fromClient
        : !input.forceFreshUrl && fromServer && fromServer.expiresAt - now > URL_REFRESH_MARGIN_MS
          ? fromServer
          : null;
    if (!signed) {
      // Admin preview can't call parent APIs: use whatever the server signed.
      if (input.previewMode && fromServer) {
        signed = fromServer;
      } else {
        signed = await fetchSignedUrl(input);
        URL_CACHE.set(key, signed);
      }
    }
    const { task, doc } = await openRangedPdf(signed.url);
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    return { task, doc, firstPage: { width: viewport.width, height: viewport.height } };
  })();

  DOC_CACHE.set(key, { promise, lastUsed: Date.now() });
  // A failed open must not stay cached.
  promise.catch(() => {
    if (DOC_CACHE.get(key)?.promise === promise) DOC_CACHE.delete(key);
  });
  evictOldest();
  return promise;
}

export type CurriculumDocumentState = {
  status: "loading" | "ready" | "error";
  doc: PDFDocumentProxy | null;
  numPages: number;
  firstPage: CurriculumPageSize | null;
  error: string | null;
  retry: () => void;
};

/**
 * Opens one curriculum guide with range requests from a signed Storage URL
 * (never the whole file through our server). Documents are cached across
 * guide switches; expired URLs are refreshed through `/pdf-url`.
 */
export function useCurriculumDocument({
  organizationId,
  programId,
  guideId,
  signedUrls,
  previewMode = false,
}: {
  organizationId: string;
  programId: string;
  guideId: string | null;
  signedUrls?: CurriculumSignedUrls;
  previewMode?: boolean;
}): CurriculumDocumentState {
  const [loaded, setLoaded] = useState<{ guideId: string; value: LoadedDoc } | null>(null);
  const [failed, setFailed] = useState<{ guideId: string; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    void loadPdfjs();
  }, []);

  useEffect(() => {
    if (!guideId) return;
    let cancelled = false;
    openCurriculumDocument({
      organizationId,
      programId,
      guideId,
      signedUrls,
      previewMode,
      forceFreshUrl: attempt > 0,
    })
      .then((value) => {
        if (cancelled) return;
        setFailed(null);
        setLoaded({ guideId, value });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFailed({
          guideId,
          message: "We couldn't open this guide. Check your connection and try again.",
        });
        void reportPortalOperationalError(
          "parent_portal",
          { organizationId, operation: "curriculum.pdf_open", error: "" },
          error,
          (error as { status?: number })?.status,
        );
      });
    return () => {
      cancelled = true;
    };
    // signedUrls is a server prop: stable for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, guideId, organizationId, previewMode, programId]);

  const retry = useCallback(() => {
    setFailed(null);
    setAttempt((value) => value + 1);
  }, []);

  const current = loaded && loaded.guideId === guideId ? loaded.value : null;
  const currentError = failed && failed.guideId === guideId ? failed.message : null;

  return {
    status: current ? "ready" : currentError ? "error" : "loading",
    doc: current?.doc ?? null,
    numPages: current?.doc.numPages ?? 0,
    firstPage: current?.firstPage ?? null,
    error: currentError,
    retry,
  };
}
