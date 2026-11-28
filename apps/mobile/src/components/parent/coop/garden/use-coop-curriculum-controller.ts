import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getCachedCurriculumPdfUrl,
  setCachedCurriculumPdfUrl,
} from '@/lib/parent/coop/curriculum-pdf-url-cache';
import {
  fetchParentCoopCurriculumDiscussion,
  fetchParentCoopCurriculumPageData,
  fetchParentCoopCurriculumPdfUrl,
  postParentCoopCurriculumDiscussionMessage,
  type ParentCoopCurriculumDiscussionMessage,
  type ParentCoopCurriculumRecord,
} from '@/lib/parent/parent-portal-api';
import { prewarmPdfViewerSources } from '@/lib/pdf/use-pdf-viewer-assets';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type CoopCurriculumController = {
  status: 'loading' | 'error' | 'ready';
  error: string | null;
  curricula: ParentCoopCurriculumRecord[];
  activeCurriculum: ParentCoopCurriculumRecord | null;
  selectCurriculum: (id: string) => void;
  pdf: {
    url: string | null;
    loading: boolean;
    failed: boolean;
    fileSizeBytes: number | null;
  };
  retryPdf: () => void;
  discussionOpen: boolean;
  setDiscussionOpen: (open: boolean) => void;
  messages: ParentCoopCurriculumDiscussionMessage[];
  messagesLoading: boolean;
  currentGuardianId: string | null;
  readOnly: boolean;
  refresh: () => Promise<void>;
  /** Posts to the active guide's thread; resolves false (already reported) on failure. */
  sendMessage: (body: string) => Promise<boolean>;
};

/**
 * Data + actions for co-op Curriculum. Same endpoints as before Garden, plus a
 * session cache of signed PDF URLs and an early start on the pdf.js assets.
 */
export function useCoopCurriculumController({
  organizationId,
  programId,
}: {
  organizationId: string;
  programId: string;
}): CoopCurriculumController {
  const readOnly = usePortalReadOnly();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [curricula, setCurricula] = useState<ParentCoopCurriculumRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentGuardianId, setCurrentGuardianId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [messages, setMessages] = useState<ParentCoopCurriculumDiscussionMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Read the ~1.7 MB pdf.js bundle while the page data loads, not after the URL arrives.
  useEffect(() => {
    prewarmPdfViewerSources();
  }, []);

  const activeCurriculum = useMemo(
    () => curricula.find((record) => record.id === activeId) ?? curricula[0] ?? null,
    [activeId, curricula],
  );
  const activeCurriculumId = activeCurriculum?.id ?? null;
  const activeCurriculumIdRef = useRef<string | null>(null);
  activeCurriculumIdRef.current = activeCurriculumId;

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchParentCoopCurriculumPageData(organizationId, programId);
      setCurricula(data.curricula);
      setCurrentGuardianId(data.currentGuardianId);
      setActiveId((current) =>
        current && data.curricula.some((record) => record.id === current)
          ? current
          : (data.curricula[0]?.id ?? null),
      );
      hasLoadedRef.current = true;
      setStatus('ready');
    } catch (loadError) {
      reportError('parent_coop_curriculum_load', loadError, {
        entityType: 'program',
        entityId: programId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load curriculum.');
      if (!hasLoadedRef.current) setStatus('error');
    }
  }, [organizationId, programId, reportError]);

  useEffect(() => {
    hasLoadedRef.current = false;
    setStatus('loading');
    void load();
  }, [load]);

  // Curriculum books can be 60+ MB. Resolve a short-lived signed URL and let the viewer stream
  // it (HTTP range requests) instead of downloading the whole file to cache first.
  const loadPdfUrl = useCallback(
    (curriculumId: string, isCancelled: () => boolean) => {
      const cached = getCachedCurriculumPdfUrl(programId, curriculumId);
      if (cached) {
        setPdfUrl(cached.url);
        setPdfSize(cached.fileSizeBytes);
        setPdfFailed(false);
        setPdfLoading(false);
        return;
      }
      setPdfLoading(true);
      setPdfFailed(false);
      setPdfUrl(null);
      setPdfSize(null);

      void fetchParentCoopCurriculumPdfUrl(organizationId, programId, curriculumId)
        .then((payload) => {
          setCachedCurriculumPdfUrl(programId, curriculumId, payload);
          if (!isCancelled()) {
            setPdfUrl(payload.url);
            setPdfSize(payload.fileSizeBytes);
          }
        })
        .catch((urlError) => {
          if (!isCancelled()) {
            reportError('parent_coop_curriculum_pdf_url', urlError, {
              entityType: 'curriculum',
              entityId: curriculumId,
              metadata: { programId },
            });
            setPdfFailed(true);
          }
        })
        .finally(() => {
          if (!isCancelled()) setPdfLoading(false);
        });
    },
    [organizationId, programId, reportError],
  );

  useEffect(() => {
    if (!activeCurriculumId) {
      setPdfUrl(null);
      setPdfFailed(false);
      return;
    }
    let cancelled = false;
    loadPdfUrl(activeCurriculumId, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [activeCurriculumId, loadPdfUrl]);

  const retryPdf = useCallback(() => {
    if (!activeCurriculumId) return;
    loadPdfUrl(activeCurriculumId, () => false);
  }, [activeCurriculumId, loadPdfUrl]);

  // The guide's thread loads when Discussion is open (as before), and again on guide change.
  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    if (!discussionOpen || !activeCurriculumId) {
      setMessagesLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setMessagesLoading(true);
    void fetchParentCoopCurriculumDiscussion(organizationId, programId, activeCurriculumId)
      .then((payload) => {
        if (cancelled || activeCurriculumIdRef.current !== activeCurriculumId) return;
        setMessages(payload.messages);
      })
      .catch((discussionError) => {
        if (cancelled) return;
        reportError('parent_coop_curriculum_discussion_load', discussionError, {
          entityType: 'program',
          entityId: programId,
        });
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCurriculumId, discussionOpen, organizationId, programId, reportError]);

  const sendMessage = useCallback(
    async (body: string): Promise<boolean> => {
      const trimmed = body.trim();
      if (!trimmed || readOnly) return false;
      const curriculumId = activeCurriculumIdRef.current;
      try {
        await postParentCoopCurriculumDiscussionMessage({
          organizationId,
          programId,
          body: trimmed,
          curriculumId,
        });
      } catch (sendError) {
        reportError('parent_coop_curriculum_discussion_send', sendError, {
          entityType: 'program',
          entityId: programId,
        });
        return false;
      }
      try {
        const payload = await fetchParentCoopCurriculumDiscussion(organizationId, programId, curriculumId);
        if (activeCurriculumIdRef.current === curriculumId) setMessages(payload.messages);
      } catch (refreshError) {
        // The message was sent; only the refreshed thread failed to load.
        reportError('parent_coop_curriculum_discussion_load', refreshError, {
          entityType: 'program',
          entityId: programId,
        });
      }
      return true;
    },
    [organizationId, programId, readOnly, reportError],
  );

  return {
    status,
    error,
    curricula,
    activeCurriculum,
    selectCurriculum: setActiveId,
    pdf: { url: pdfUrl, loading: pdfLoading, failed: pdfFailed, fileSizeBytes: pdfSize },
    retryPdf,
    discussionOpen,
    setDiscussionOpen,
    messages,
    messagesLoading,
    currentGuardianId,
    readOnly,
    refresh: load,
    sendMessage,
  };
}
