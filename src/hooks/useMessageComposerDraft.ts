"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearComposerDraft,
  readComposerDraft,
  writeComposerDraft,
  type MessageComposerViewer,
} from "@/lib/messages/message-composer-draft-storage";

const DRAFT_DEBOUNCE_MS = 400;

type UseMessageComposerDraftOptions = {
  organizationId: string;
  viewer: MessageComposerViewer;
  threadId: string | null;
  input: string;
  setInput: (value: string) => void;
  stagedFiles: File[];
  setStagedFiles: (files: File[]) => void;
  readOnly?: boolean;
};

export function useMessageComposerDraft({
  organizationId,
  viewer,
  threadId,
  input,
  setInput,
  stagedFiles,
  setStagedFiles,
  readOnly = false,
}: UseMessageComposerDraftOptions) {
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const prevThreadIdRef = useRef<string | null>(null);
  const threadIdRef = useRef(threadId);
  const inputRef = useRef(input);
  const draftFlushPendingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    threadIdRef.current = threadId;
    inputRef.current = input;
  });

  const flushDraftForThread = useCallback(
    (targetThreadId: string | null, text: string) => {
      if (readOnly || !targetThreadId) return;
      writeComposerDraft(organizationId, viewer, targetThreadId, text);
      draftFlushPendingRef.current = false;
    },
    [organizationId, readOnly, viewer],
  );

  const clearDraftForThread = useCallback(
    (targetThreadId: string | null) => {
      if (!targetThreadId) return;
      clearComposerDraft(organizationId, viewer, targetThreadId);
      draftFlushPendingRef.current = false;
    },
    [organizationId, viewer],
  );

  useEffect(() => {
    if (readOnly) return;

    const prevThreadId = prevThreadIdRef.current;
    if (prevThreadId !== threadId) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (prevThreadId) {
        flushDraftForThread(prevThreadId, inputRef.current);
      }
      if (threadId) {
        const draft = readComposerDraft(organizationId, viewer, threadId);
        setInput(draft);
      } else {
        setInput("");
      }
      prevThreadIdRef.current = threadId;
    }
  }, [
    flushDraftForThread,
    organizationId,
    readOnly,
    setInput,
    threadId,
    viewer,
  ]);

  useEffect(() => {
    return () => {
      if (readOnly) return;
      if (draftFlushPendingRef.current && threadIdRef.current) {
        flushDraftForThread(threadIdRef.current, inputRef.current);
      }
    };
  }, [flushDraftForThread, readOnly]);

  useEffect(() => {
    if (readOnly || !threadIdRef.current) return;

    draftFlushPendingRef.current = true;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const activeThreadId = threadIdRef.current;
      if (activeThreadId) {
        writeComposerDraft(organizationId, viewer, activeThreadId, inputRef.current);
      }
      draftFlushPendingRef.current = false;
      debounceTimerRef.current = null;
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [input, organizationId, readOnly, viewer]);

  useEffect(() => {
    if (readOnly) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (stagedFiles.length === 0 && !draftFlushPendingRef.current) return;
      if (threadId) {
        flushDraftForThread(threadId, inputRef.current);
      }
      if (stagedFiles.length > 0) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flushDraftForThread, readOnly, stagedFiles.length, threadId]);

  const requestComposerNavigation = useCallback(
    (action: () => void) => {
      if (readOnly) {
        action();
        return;
      }
      if (stagedFiles.length > 0) {
        pendingNavigationRef.current = action;
        setDiscardDialogOpen(true);
        return;
      }
      if (threadId) {
        flushDraftForThread(threadId, inputRef.current);
      }
      action();
    },
    [flushDraftForThread, readOnly, stagedFiles.length, threadId],
  );

  const confirmDiscardAttachments = useCallback(() => {
    const action = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    setDiscardDialogOpen(false);
    setStagedFiles([]);
    if (threadId) {
      flushDraftForThread(threadId, inputRef.current);
    }
    action?.();
  }, [flushDraftForThread, setStagedFiles, threadId]);

  const cancelDiscardAttachments = useCallback(() => {
    pendingNavigationRef.current = null;
    setDiscardDialogOpen(false);
  }, []);

  return {
    discardDialogOpen,
    requestComposerNavigation,
    confirmDiscardAttachments,
    cancelDiscardAttachments,
    clearDraftForThread,
    hasStagedAttachments: stagedFiles.length > 0,
  };
}
