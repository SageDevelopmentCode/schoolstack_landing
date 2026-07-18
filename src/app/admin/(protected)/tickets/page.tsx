"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  type AdminSupportRequestRow,
  type SupportRequestStatus,
  SUPPORT_REQUEST_STATUSES,
  SUPPORT_REQUEST_STATUS_META,
  formatSupportRequestTopic,
  parseSupportRequestStatus,
} from "@/lib/school-admin/support-request-types";

type SignedAttachment = {
  fileName: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function isImageMimeType(mimeType: string | null): boolean {
  return Boolean(mimeType?.startsWith("image/"));
}

export default function AdminTicketsPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<AdminSupportRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SupportRequestStatus | "">(
    "",
  );
  const [attachments, setAttachments] = useState<SignedAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await supabase
        .from("admin_support_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (loadError) {
        setError(loadError.message);
      } else {
        const rows = (data ?? []).map((row) => ({
          ...row,
          status: parseSupportRequestStatus(row.status) ?? "open",
          attachments: Array.isArray(row.attachments) ? row.attachments : [],
          updated_at: row.updated_at ?? row.created_at,
        })) as AdminSupportRequestRow[];

        setTickets(rows);
        if (rows.length) setSelectedId(rows[0].id);
      }

      setLoading(false);
    }

    void load();
  }, [supabase]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected?.id || selected.attachments.length === 0) {
      queueMicrotask(() => {
        setAttachments([]);
        setAttachmentsError(null);
        setAttachmentsLoading(false);
      });
      return;
    }

    const requestId = selected.id;
    let cancelled = false;

    async function loadAttachments() {
      setAttachmentsLoading(true);
      setAttachmentsError(null);

      try {
        const response = await fetch(
          `/api/admin/support-requests/${requestId}/attachments`,
        );

        if (!response.ok) {
          let message = "Failed to load attachments.";
          try {
            const payload = (await response.json()) as { error?: string };
            if (payload.error?.trim()) message = payload.error.trim();
          } catch {
            // ignore JSON parse errors
          }
          if (!cancelled) setAttachmentsError(message);
          return;
        }

        const payload = (await response.json()) as {
          attachments?: SignedAttachment[];
        };

        if (!cancelled) {
          setAttachments(payload.attachments ?? []);
        }
      } catch {
        if (!cancelled) {
          setAttachmentsError("Failed to load attachments.");
        }
      } finally {
        if (!cancelled) {
          setAttachmentsLoading(false);
        }
      }
    }

    void loadAttachments();

    return () => {
      cancelled = true;
    };
  }, [selected?.id, selected?.attachments.length]);

  const handleStatusChange = useCallback(
    async (id: string, status: SupportRequestStatus) => {
      const { data, error: updateError } = await supabase
        .from("admin_support_requests")
        .update({ status })
        .eq("id", id)
        .select("updated_at")
        .single();

      if (updateError) {
        alert("Update failed: " + updateError.message);
        return;
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === id
            ? {
                ...ticket,
                status,
                updated_at: String(data.updated_at),
              }
            : ticket,
        ),
      );
    },
    [supabase],
  );

  const filtered = tickets.filter(
    (ticket) => !statusFilter || ticket.status === statusFilter,
  );

  const counts = tickets.reduce(
    (acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<SupportRequestStatus, number>,
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center text-sm font-secondary text-text-faint">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center text-sm font-secondary text-clay">
        {error}
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-3rem)] overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
    >
      <div className="flex w-96 shrink-0 flex-col border-r border-border bg-surface">
        <div className="space-y-2 border-b border-border p-3">
          <div className="flex flex-wrap gap-1">
            {SUPPORT_REQUEST_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(statusFilter === status ? "" : status)
                }
                className={`rounded-full border px-2 py-1 text-xs transition-colors ${
                  statusFilter === status
                    ? SUPPORT_REQUEST_STATUS_META[status].pill
                    : "border-border bg-bg text-text-muted hover:bg-surface-soft"
                }`}
              >
                {SUPPORT_REQUEST_STATUS_META[status].label}
                {counts[status] ? ` (${counts[status]})` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-faint">No tickets</p>
          ) : (
            filtered.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={`w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-bg ${
                  selectedId === ticket.id ? "bg-clay-soft" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">
                      {ticket.organization_name}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {formatSupportRequestTopic(ticket.topic)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-xs ${SUPPORT_REQUEST_STATUS_META[ticket.status].pill}`}
                  >
                    {SUPPORT_REQUEST_STATUS_META[ticket.status].label}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-text-faint">
                  {ticket.submitter_email}
                </p>
                <p className="mt-1 text-xs text-text-faint">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-bg/40">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-sm text-text-faint">
            Select a ticket
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-lg font-semibold text-text">
                  {selected.submitter_email}
                </h1>
                <p className="font-secondary text-sm text-text-muted">
                  {selected.organization_name}
                </p>
              </div>
              <select
                value={selected.status}
                onChange={(event) => {
                  const nextStatus = parseSupportRequestStatus(
                    event.target.value,
                  );
                  if (!nextStatus) return;
                  void handleStatusChange(selected.id, nextStatus);
                }}
                className={`rounded-lg border px-2 py-1 text-sm ${SUPPORT_REQUEST_STATUS_META[selected.status].pill}`}
              >
                {SUPPORT_REQUEST_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {SUPPORT_REQUEST_STATUS_META[status].label}
                  </option>
                ))}
              </select>
            </div>

            <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
                Request
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm font-secondary sm:grid-cols-[120px_1fr]">
                <dt className="text-text-muted">Topic</dt>
                <dd>{formatSupportRequestTopic(selected.topic)}</dd>
              </dl>
              <p className="whitespace-pre-wrap text-sm font-secondary text-text">
                {selected.description}
              </p>
            </section>

            <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
                Context
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm font-secondary sm:grid-cols-[120px_1fr]">
                <dt className="text-text-muted">School</dt>
                <dd>{selected.organization_name}</dd>
                <dt className="text-text-muted">Slug</dt>
                <dd>{selected.organization_slug}</dd>
                {selected.source_page_path ? (
                  <>
                    <dt className="text-text-muted">Page</dt>
                    <dd className="break-all">
                      <Link
                        href={selected.source_page_path}
                        className="text-clay hover:underline"
                      >
                        {selected.source_page_path}
                      </Link>
                    </dd>
                  </>
                ) : null}
              </dl>
            </section>

            {selected.attachments.length > 0 ? (
              <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
                <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
                  Attachments
                </h2>

                {attachmentsLoading ? (
                  <p className="text-sm text-text-faint">Loading attachments…</p>
                ) : attachmentsError ? (
                  <p className="text-sm text-clay">{attachmentsError}</p>
                ) : (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div
                        key={`${attachment.fileName}-${attachment.url}`}
                        className="rounded-lg border border-border bg-bg p-3"
                      >
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-clay hover:underline"
                        >
                          {attachment.fileName}
                        </a>
                        {isImageMimeType(attachment.mimeType) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={attachment.url}
                            alt={attachment.fileName}
                            className="mt-3 max-h-80 w-full rounded-md border border-border object-contain"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
                Metadata
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm font-secondary sm:grid-cols-[120px_1fr]">
                <dt className="text-text-muted">Request ID</dt>
                <dd className="break-all">{selected.id}</dd>
                <dt className="text-text-muted">Created</dt>
                <dd>{formatTimestamp(selected.created_at)}</dd>
                <dt className="text-text-muted">Updated</dt>
                <dd>{formatTimestamp(selected.updated_at)}</dd>
              </dl>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
