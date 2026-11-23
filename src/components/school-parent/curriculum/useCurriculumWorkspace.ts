"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import {
  getProgramCoopCurriculumTabLabel,
  type ProgramCoopCurriculumRecord,
} from "@/lib/admissions/program-coop-curriculum-storage";
import type { CurriculumScrollHandle } from "./reader/CurriculumScroll";
import { rememberPage, useOutline, useRememberedPages, useZoomSteps } from "./reader/hooks";
import {
  prefetchCurriculumDocument,
  useCurriculumDocument,
  type CurriculumSignedUrls,
} from "./reader/useCurriculumDocument";
import { notesPerPage, useCurriculumThread } from "./useCurriculumThread";

export type CurriculumWorkspaceInput = {
  organizationId: string;
  programId: string;
  curricula: ProgramCoopCurriculumRecord[];
  signedUrls?: CurriculumSignedUrls;
  initialThreadMessages?: Record<string, ProgramCoopCurriculumDiscussionMessage[]>;
  currentGuardianId?: string | null;
  previewMode?: boolean;
};

const LAST_GUIDE_KEY = (programId: string) => `mk-curriculum-guide:${programId}`;

/**
 * Everything the curriculum layouts share: which guide is open, the PDF
 * (range-loaded + cached), the page in view (remembered per guide), zoom,
 * bookmarks, the open guide's discussion thread + per-page note counts, the
 * discussion drawer and Present. Each layout variant is just presentation.
 */
export function useCurriculumWorkspace(input: CurriculumWorkspaceInput) {
  const { organizationId, programId, curricula, signedUrls, previewMode = false } = input;
  const initialThreadMessages = input.initialThreadMessages ?? {};

  const [activeGuideId, setActiveGuideIdState] = useState<string | null>(() => curricula[0]?.id ?? null);
  const guide = useMemo(
    () => curricula.find((record) => record.id === activeGuideId) ?? curricula[0] ?? null,
    [activeGuideId, curricula],
  );
  const guideLabel = guide ? getProgramCoopCurriculumTabLabel(guide) : "";

  // Reopen the guide the parent used last (after mount: no SSR mismatch).
  useEffect(() => {
    try {
      const last = window.localStorage.getItem(LAST_GUIDE_KEY(programId));
      if (last && curricula.some((record) => record.id === last)) {
        queueMicrotask(() => setActiveGuideIdState(last));
      }
    } catch {
      // storage blocked
    }
  }, [curricula, programId]);

  const remembered = useRememberedPages(
    programId,
    useMemo(() => curricula.map((record) => record.id), [curricula]),
  );

  const pdf = useCurriculumDocument({
    organizationId,
    programId,
    guideId: guide?.id ?? null,
    signedUrls,
    previewMode,
  });
  const outline = useOutline(pdf.doc);
  const zoom = useZoomSteps("fit-width");

  const [pageByGuide, setPageByGuide] = useState<Record<string, number>>({});
  const page = guide ? (pageByGuide[guide.id] ?? remembered[guide.id] ?? 1) : 1;
  // The mounted scroll reader (if the layout uses one). Kept private: layouts
  // talk to it through goToPage / scrollReaderTo.
  const readerRef = useRef<CurriculumScrollHandle | null>(null);
  const registerReader = useCallback((handle: CurriculumScrollHandle | null) => {
    readerRef.current = handle;
  }, []);
  const scrollReaderTo = useCallback((next: number) => {
    readerRef.current?.scrollToPage(next);
  }, []);

  /** The reader reports the page in view (scroll) or sets it (single page). */
  const setPage = useCallback(
    (next: number) => {
      if (!guide) return;
      const max = Math.max(1, pdf.numPages || next);
      const clamped = Math.min(Math.max(1, Math.round(next)), max);
      setPageByGuide((prev) => (prev[guide.id] === clamped ? prev : { ...prev, [guide.id]: clamped }));
      rememberPage(programId, guide.id, clamped);
    },
    [pdf.numPages, guide, programId],
  );

  /** Move the reader to a page (scroll layouts scroll; single page flips). */
  const goToPage = useCallback(
    (next: number) => {
      if (readerRef.current) readerRef.current.scrollToPage(next, "smooth");
      else setPage(next);
    },
    [setPage],
  );

  const selectGuide = useCallback(
    (guideId: string) => {
      setActiveGuideIdState(guideId);
      try {
        window.localStorage.setItem(LAST_GUIDE_KEY(programId), guideId);
      } catch {
        // storage blocked
      }
    },
    [programId],
  );

  const prefetchGuide = useCallback(
    (guideId: string) => prefetchCurriculumDocument({ organizationId, programId, guideId, signedUrls, previewMode }),
    [organizationId, previewMode, programId, signedUrls],
  );

  const thread = useCurriculumThread({
    organizationId,
    programId,
    curriculumId: guide?.id ?? null,
    initialMessages: guide ? initialThreadMessages[guide.id] : undefined,
    previewMode,
    enabled: Boolean(guide),
  });
  const noteCounts = useMemo(() => notesPerPage(thread.messages), [thread.messages]);

  // Discussion drawer: which thread (null = General).
  const [discussion, setDiscussion] = useState<{ open: boolean; threadId: string | null }>({
    open: false,
    threadId: null,
  });
  const openDiscussion = useCallback((threadId: string | null) => setDiscussion({ open: true, threadId }), []);
  const closeDiscussion = useCallback(() => setDiscussion((prev) => ({ ...prev, open: false })), []);
  const setDiscussionThread = useCallback(
    (threadId: string | null) => setDiscussion((prev) => ({ ...prev, threadId })),
    [],
  );

  const [presenting, setPresenting] = useState(false);

  return {
    ...input,
    previewMode,
    initialThreadMessages,
    guide,
    guideLabel,
    selectGuide,
    prefetchGuide,
    remembered,
    pdf,
    outline,
    zoom,
    page,
    setPage,
    goToPage,
    registerReader,
    scrollReaderTo,
    thread,
    noteCounts,
    discussion,
    openDiscussion,
    closeDiscussion,
    setDiscussionThread,
    presenting,
    startPresenting: useCallback(() => setPresenting(true), []),
    stopPresenting: useCallback(() => setPresenting(false), []),
  };
}

export type CurriculumWorkspace = ReturnType<typeof useCurriculumWorkspace>;
