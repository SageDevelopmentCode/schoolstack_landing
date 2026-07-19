"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminFilterChip } from "@/components/admin/ui/AdminFilterChip";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { TICKET_STATUS, type TicketStatus } from "@/lib/admin-ui/admin-status-styles";
import {
  type AdminSupportRequestRow,
  type SupportRequestStatus,
  SUPPORT_REQUEST_STATUSES,
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

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <AdminMasterDetail
      listWidth="md"
      list={
        <>
          <AdminListPanelHeader>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORT_REQUEST_STATUSES.map((status) => (
                <AdminFilterChip
                  key={status}
                  label={TICKET_STATUS[status as TicketStatus].label}
                  count={counts[status]}
                  active={statusFilter === status}
                  onClick={() =>
                    setStatusFilter(statusFilter === status ? "" : status)
                  }
                />
              ))}
            </div>
          </AdminListPanelHeader>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <AdminEmptyState message="No tickets" />
            ) : (
              filtered.map((ticket) => (
                <AdminListItem
                  key={ticket.id}
                  selected={selectedId === ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  title={ticket.organization_name}
                  subtitle={formatSupportRequestTopic(ticket.topic)}
                  badge={
                    <AdminStatusBadge
                      label={TICKET_STATUS[ticket.status as TicketStatus].label}
                      variant={TICKET_STATUS[ticket.status as TicketStatus].variant}
                    />
                  }
                  footer={`${ticket.submitter_email} · ${new Date(ticket.created_at).toLocaleDateString()}`}
                />
              ))
            )}
          </div>
        </>
      }
      detail={
        !selected ? (
          <AdminDetailEmpty message="Select a ticket" />
        ) : (
          <AdminDetailLayout>
            <AdminDetailHeader
              title={selected.submitter_email}
              subtitle={selected.organization_name}
              actions={
                <AdminSelect
                  value={selected.status}
                  onChange={(event) => {
                    const nextStatus = parseSupportRequestStatus(
                      event.target.value,
                    );
                    if (!nextStatus) return;
                    void handleStatusChange(selected.id, nextStatus);
                  }}
                >
                  {SUPPORT_REQUEST_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {TICKET_STATUS[status as TicketStatus].label}
                    </option>
                  ))}
                </AdminSelect>
              }
            />

            <AdminDetailSection title="Request">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
                <dt className="text-admin-muted">Topic</dt>
                <dd>{formatSupportRequestTopic(selected.topic)}</dd>
              </dl>
              <p className="whitespace-pre-wrap text-sm text-admin-text">
                {selected.description}
              </p>
            </AdminDetailSection>

            <AdminDetailSection title="Context">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
                <dt className="text-admin-muted">School</dt>
                <dd>{selected.organization_name}</dd>
                <dt className="text-admin-muted">Slug</dt>
                <dd>{selected.organization_slug}</dd>
                {selected.source_page_path ? (
                  <>
                    <dt className="text-admin-muted">Page</dt>
                    <dd className="break-all">
                      <Link
                        href={selected.source_page_path}
                        className="text-admin-accent hover:underline"
                      >
                        {selected.source_page_path}
                      </Link>
                    </dd>
                  </>
                ) : null}
              </dl>
            </AdminDetailSection>

            {selected.attachments.length > 0 ? (
              <AdminDetailSection title="Attachments">
                {attachmentsLoading ? (
                  <p className="text-sm text-admin-faint">Loading attachments…</p>
                ) : attachmentsError ? (
                  <p className="text-sm text-admin-error">{attachmentsError}</p>
                ) : (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div
                        key={`${attachment.fileName}-${attachment.url}`}
                        className="rounded-admin-md border border-admin-border bg-admin-bg p-3"
                      >
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-admin-accent hover:underline"
                        >
                          {attachment.fileName}
                        </a>
                        {isImageMimeType(attachment.mimeType) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={attachment.url}
                            alt={attachment.fileName}
                            className="mt-3 max-h-80 w-full rounded-admin-sm border border-admin-border object-contain"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </AdminDetailSection>
            ) : null}

            <AdminDetailSection title="Metadata">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
                <dt className="text-admin-muted">Request ID</dt>
                <dd className="break-all">{selected.id}</dd>
                <dt className="text-admin-muted">Created</dt>
                <dd>{formatTimestamp(selected.created_at)}</dd>
                <dt className="text-admin-muted">Updated</dt>
                <dd>{formatTimestamp(selected.updated_at)}</dd>
              </dl>
            </AdminDetailSection>
          </AdminDetailLayout>
        )
      }
    />
  );
}
