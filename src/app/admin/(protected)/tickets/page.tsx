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
import {
  type PublicSupportRequestRow,
  formatPublicSupportRequestTopic,
} from "@/lib/public-support/public-support-types";

type TicketSource = "portal" | "public";

type SignedAttachment = {
  fileName: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

const TICKET_SOURCE_TABS: Array<{ id: TicketSource; label: string }> = [
  { id: "portal", label: "Portal" },
  { id: "public", label: "Public" },
];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function isImageMimeType(mimeType: string | null): boolean {
  return Boolean(mimeType?.startsWith("image/"));
}

function parsePortalRows(data: AdminSupportRequestRow[] | null): AdminSupportRequestRow[] {
  return ((data ?? []) as AdminSupportRequestRow[]).map((row) => ({
    ...row,
    status: parseSupportRequestStatus(row.status) ?? "open",
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    updated_at: row.updated_at ?? row.created_at,
  }));
}

function parsePublicRows(data: PublicSupportRequestRow[] | null): PublicSupportRequestRow[] {
  return ((data ?? []) as PublicSupportRequestRow[]).map((row) => ({
    ...row,
    status: parseSupportRequestStatus(row.status) ?? "open",
    updated_at: row.updated_at ?? row.created_at,
  }));
}

export default function AdminTicketsPage() {
  const supabase = createClient();
  const [ticketSource, setTicketSource] = useState<TicketSource>("portal");
  const [portalTickets, setPortalTickets] = useState<AdminSupportRequestRow[]>([]);
  const [publicTickets, setPublicTickets] = useState<PublicSupportRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPortalId, setSelectedPortalId] = useState<string | null>(null);
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SupportRequestStatus | "">(
    "",
  );
  const [attachments, setAttachments] = useState<SignedAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [portalResult, publicResult] = await Promise.all([
        supabase
          .from("admin_support_requests")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("public_support_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (portalResult.error) {
        setError(portalResult.error.message);
      } else {
        const rows = parsePortalRows(portalResult.data as AdminSupportRequestRow[]);
        setPortalTickets(rows);
        if (rows.length) setSelectedPortalId(rows[0].id);
      }

      if (publicResult.error) {
        setError((current) => current ?? publicResult.error!.message);
      } else {
        const rows = parsePublicRows(publicResult.data as PublicSupportRequestRow[]);
        setPublicTickets(rows);
        if (rows.length) setSelectedPublicId(rows[0].id);
      }

      setLoading(false);
    }

    void load();
  }, [supabase]);

  const activeTickets =
    ticketSource === "portal" ? portalTickets : publicTickets;
  const selectedPortal =
    portalTickets.find((ticket) => ticket.id === selectedPortalId) ?? null;
  const selectedPublic =
    publicTickets.find((ticket) => ticket.id === selectedPublicId) ?? null;

  useEffect(() => {
    if (ticketSource !== "portal" || !selectedPortal?.id || selectedPortal.attachments.length === 0) {
      queueMicrotask(() => {
        setAttachments([]);
        setAttachmentsError(null);
        setAttachmentsLoading(false);
      });
      return;
    }

    const requestId = selectedPortal.id;
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
  }, [ticketSource, selectedPortal?.id, selectedPortal?.attachments.length]);

  const handlePortalStatusChange = useCallback(
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

      setPortalTickets((prev) =>
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

  const handlePublicStatusChange = useCallback(
    async (id: string, status: SupportRequestStatus) => {
      const { data, error: updateError } = await supabase
        .from("public_support_requests")
        .update({ status })
        .eq("id", id)
        .select("updated_at")
        .single();

      if (updateError) {
        alert("Update failed: " + updateError.message);
        return;
      }

      setPublicTickets((prev) =>
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

  const filtered = activeTickets.filter(
    (ticket) => !statusFilter || ticket.status === statusFilter,
  );

  const counts = activeTickets.reduce(
    (acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<SupportRequestStatus, number>,
  );

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-admin-border bg-admin-surface px-4 py-3">
        <div
          className="inline-flex rounded-admin-md border border-admin-border bg-admin-bg p-1"
          role="tablist"
          aria-label="Ticket source"
        >
          {TICKET_SOURCE_TABS.map((tab) => {
            const isActive = ticketSource === tab.id;
            const count =
              tab.id === "portal" ? portalTickets.length : publicTickets.length;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTicketSource(tab.id)}
                className={`rounded-admin-sm px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-admin-surface text-admin-text shadow-sm"
                    : "text-admin-muted hover:text-admin-text"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-admin-faint">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1">
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
                ) : ticketSource === "portal" ? (
                  filtered.map((ticket) => {
                    const portalTicket = ticket as AdminSupportRequestRow;
                    return (
                      <AdminListItem
                        key={portalTicket.id}
                        selected={selectedPortalId === portalTicket.id}
                        onClick={() => setSelectedPortalId(portalTicket.id)}
                        title={portalTicket.organization_name}
                        subtitle={formatSupportRequestTopic(portalTicket.topic)}
                        badge={
                          <AdminStatusBadge
                            label={
                              TICKET_STATUS[portalTicket.status as TicketStatus].label
                            }
                            variant={
                              TICKET_STATUS[portalTicket.status as TicketStatus].variant
                            }
                          />
                        }
                        footer={`${portalTicket.submitter_email} · ${new Date(portalTicket.created_at).toLocaleDateString()}`}
                      />
                    );
                  })
                ) : (
                  filtered.map((ticket) => {
                    const publicTicket = ticket as PublicSupportRequestRow;
                    return (
                      <AdminListItem
                        key={publicTicket.id}
                        selected={selectedPublicId === publicTicket.id}
                        onClick={() => setSelectedPublicId(publicTicket.id)}
                        title={publicTicket.submitter_name}
                        subtitle={formatPublicSupportRequestTopic(publicTicket.topic)}
                        badge={
                          <AdminStatusBadge
                            label={
                              TICKET_STATUS[publicTicket.status as TicketStatus].label
                            }
                            variant={
                              TICKET_STATUS[publicTicket.status as TicketStatus].variant
                            }
                          />
                        }
                        footer={`${publicTicket.submitter_email} · ${new Date(publicTicket.created_at).toLocaleDateString()}`}
                      />
                    );
                  })
                )}
              </div>
            </>
          }
          detail={
            ticketSource === "portal" ? (
              !selectedPortal ? (
                <AdminDetailEmpty message="Select a ticket" />
              ) : (
                <AdminDetailLayout>
                  <AdminDetailHeader
                    title={selectedPortal.submitter_email}
                    subtitle={selectedPortal.organization_name}
                    actions={
                      <AdminSelect
                        value={selectedPortal.status}
                        onChange={(event) => {
                          const nextStatus = parseSupportRequestStatus(
                            event.target.value,
                          );
                          if (!nextStatus) return;
                          void handlePortalStatusChange(selectedPortal.id, nextStatus);
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
                      <dd>{formatSupportRequestTopic(selectedPortal.topic)}</dd>
                    </dl>
                    <p className="whitespace-pre-wrap text-sm text-admin-text">
                      {selectedPortal.description}
                    </p>
                  </AdminDetailSection>

                  <AdminDetailSection title="Context">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
                      <dt className="text-admin-muted">School</dt>
                      <dd>{selectedPortal.organization_name}</dd>
                      <dt className="text-admin-muted">Slug</dt>
                      <dd>{selectedPortal.organization_slug}</dd>
                      {selectedPortal.source_page_path ? (
                        <>
                          <dt className="text-admin-muted">Page</dt>
                          <dd className="break-all">
                            <Link
                              href={selectedPortal.source_page_path}
                              className="text-admin-accent hover:underline"
                            >
                              {selectedPortal.source_page_path}
                            </Link>
                          </dd>
                        </>
                      ) : null}
                    </dl>
                  </AdminDetailSection>

                  {selectedPortal.attachments.length > 0 ? (
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
                      <dd className="break-all">{selectedPortal.id}</dd>
                      <dt className="text-admin-muted">Created</dt>
                      <dd>{formatTimestamp(selectedPortal.created_at)}</dd>
                      <dt className="text-admin-muted">Updated</dt>
                      <dd>{formatTimestamp(selectedPortal.updated_at)}</dd>
                    </dl>
                  </AdminDetailSection>
                </AdminDetailLayout>
              )
            ) : !selectedPublic ? (
              <AdminDetailEmpty message="Select a ticket" />
            ) : (
              <AdminDetailLayout>
                <AdminDetailHeader
                  title={selectedPublic.submitter_name}
                  subtitle={selectedPublic.submitter_email}
                  actions={
                    <AdminSelect
                      value={selectedPublic.status}
                      onChange={(event) => {
                        const nextStatus = parseSupportRequestStatus(
                          event.target.value,
                        );
                        if (!nextStatus) return;
                        void handlePublicStatusChange(selectedPublic.id, nextStatus);
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
                    <dd>{formatPublicSupportRequestTopic(selectedPublic.topic)}</dd>
                    <dt className="text-admin-muted">Email</dt>
                    <dd>{selectedPublic.submitter_email}</dd>
                  </dl>
                  <p className="whitespace-pre-wrap text-sm text-admin-text">
                    {selectedPublic.description}
                  </p>
                </AdminDetailSection>

                {selectedPublic.source_page_path ? (
                  <AdminDetailSection title="Context">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
                      <dt className="text-admin-muted">Page</dt>
                      <dd className="break-all">
                        <Link
                          href={selectedPublic.source_page_path}
                          className="text-admin-accent hover:underline"
                        >
                          {selectedPublic.source_page_path}
                        </Link>
                      </dd>
                    </dl>
                  </AdminDetailSection>
                ) : null}

                <AdminDetailSection title="Metadata">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
                    <dt className="text-admin-muted">Request ID</dt>
                    <dd className="break-all">{selectedPublic.id}</dd>
                    <dt className="text-admin-muted">Created</dt>
                    <dd>{formatTimestamp(selectedPublic.created_at)}</dd>
                    <dt className="text-admin-muted">Updated</dt>
                    <dd>{formatTimestamp(selectedPublic.updated_at)}</dd>
                  </dl>
                </AdminDetailSection>
              </AdminDetailLayout>
            )
          }
        />
      </div>
    </div>
  );
}
