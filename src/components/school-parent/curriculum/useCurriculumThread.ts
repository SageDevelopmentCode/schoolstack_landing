"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";

export type CurriculumMessage = ProgramCoopCurriculumDiscussionMessage;

function mergeMessages(existing: CurriculumMessage[], incoming: CurriculumMessage[]): CurriculumMessage[] {
  const map = new Map<string, CurriculumMessage>();
  for (const message of existing) map.set(message.id, message);
  for (const message of incoming) map.set(message.id, message);
  return [...map.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/** Thread key used by the API: a guide id, or "general" for the co-op chat. */
export const threadKey = (curriculumId: string | null) => curriculumId ?? "general";

/**
 * Messages for one curriculum thread (General or one guide): initial load,
 * realtime inserts for THIS thread only, and posting (optionally about a
 * page). Shared by the chat panel and the reader's per-page note counts.
 */
export function useCurriculumThread({
  organizationId,
  programId,
  curriculumId,
  initialMessages,
  previewMode = false,
  enabled = true,
}: {
  organizationId: string;
  programId: string;
  curriculumId: string | null;
  /** Server-loaded messages; when given (even empty), no initial fetch. */
  initialMessages?: CurriculumMessage[];
  previewMode?: boolean;
  enabled?: boolean;
}) {
  const instanceId = useId();
  const [state, setState] = useState<{ key: string; messages: CurriculumMessage[] }>({
    key: threadKey(curriculumId),
    messages: initialMessages ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = threadKey(curriculumId);
  const messages = state.key === key ? state.messages : (initialMessages ?? []);

  const refresh = useCallback(async () => {
    if (!organizationId || !programId) return;
    setLoading(true);
    let response: Response | undefined;
    try {
      const params = new URLSearchParams({ organizationId, programId, curriculumId: key });
      response = await fetch(`/api/parent-portal/curriculum-discussion?${params}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Failed to load discussion.");
      setState({ key, messages: data.messages ?? [] });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discussion.");
      void reportPortalOperationalError(
        "parent_portal",
        { organizationId, operation: "curriculum.discussion_load", error: "" },
        err,
        response?.status,
      );
    } finally {
      setLoading(false);
    }
  }, [key, organizationId, programId]);

  // Switching threads: reset to the server copy (if any), then load.
  useEffect(() => {
    if (!enabled) return;
    queueMicrotask(() => {
      setState({ key, messages: initialMessages ?? [] });
      if (initialMessages === undefined && !previewMode) void refresh();
    });
    // initialMessages is a server prop per thread; key drives the reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);

  // Realtime: only inserts into THIS thread trigger a reload.
  useEffect(() => {
    if (!enabled || !organizationId || !programId || previewMode) return undefined;
    const supabase = createClient();
    const channel = supabase
      .channel(`curriculum-discussion:${programId}:${key}:${instanceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "program_coop_curriculum_discussion_messages",
          filter: `program_id=eq.${programId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const inserted = payload.new as { id?: string; curriculum_id?: string | null };
          if ((inserted.curriculum_id ?? null) !== curriculumId) return;
          if (inserted.id && messages.some((message) => message.id === inserted.id)) return;
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // messages is read for de-duping only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, enabled, instanceId, key, organizationId, previewMode, programId, refresh]);

  const send = useCallback(
    async (body: string, pageNumber: number | null): Promise<boolean> => {
      const trimmed = body.trim();
      if (!trimmed || previewMode || sending) return false;
      setSending(true);
      setError(null);
      let response: Response | undefined;
      try {
        response = await fetch("/api/parent-portal/curriculum-discussion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            programId,
            curriculumId,
            body: trimmed,
            ...(pageNumber ? { pageNumber } : {}),
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Failed to send message.");
        const posted = data.message as CurriculumMessage | undefined;
        if (posted && (posted.curriculumId ?? null) === curriculumId) {
          setState((current) => ({
            key,
            messages: mergeMessages(current.key === key ? current.messages : [], [posted]),
          }));
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message.");
        void reportPortalOperationalError(
          "parent_portal",
          { organizationId, operation: "curriculum.discussion_send", error: "" },
          err,
          response?.status,
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [curriculumId, key, organizationId, previewMode, programId, sending],
  );

  return { curriculumId, messages, loading, sending, error, send, refresh };
}

export type CurriculumThread = ReturnType<typeof useCurriculumThread>;

/** Count of messages pinned to each page. */
export function notesPerPage(messages: CurriculumMessage[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const message of messages) {
    if (message.pageNumber) counts.set(message.pageNumber, (counts.get(message.pageNumber) ?? 0) + 1);
  }
  return counts;
}
