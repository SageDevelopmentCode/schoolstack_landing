"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminReadOnlyMessageBubble from "@/components/admin/messages/AdminReadOnlyMessageBubble";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type { OrganizationCommitteeMessageSummary } from "@/lib/admin/organization-committee-messages";
import type { CommitteeMessage } from "@/lib/committees/types";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

type OrganizationCommitteeMessagesPanelProps = {
  organizationId: string;
};

type CommitteeDetail = {
  committee: {
    id: string;
    name: string;
    memberCount: number;
  };
  messages: CommitteeMessage[];
};

function CommitteeDetailPanel({
  detail,
  loading,
  error,
}: {
  detail: CommitteeDetail | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <AdminDetailLayout>
        <div className="flex items-center gap-2 py-12 text-sm text-admin-faint">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading committee messages…
        </div>
      </AdminDetailLayout>
    );
  }

  if (error) {
    return (
      <AdminDetailLayout>
        <p className="text-sm text-admin-error">{error}</p>
      </AdminDetailLayout>
    );
  }

  if (!detail) {
    return (
      <AdminDetailEmpty message="Select a committee to review messages." />
    );
  }

  return (
    <AdminDetailLayout>
      <AdminDetailHeader
        title={detail.committee.name}
        subtitle={`${detail.committee.memberCount} active member${detail.committee.memberCount === 1 ? "" : "s"}`}
        badges={<AdminStatusBadge label="Committee chat" variant="neutral" />}
      />

      <AdminDetailSection title="Messages">
        {detail.messages.length === 0 ? (
          <p className="text-sm text-admin-muted">No messages in this committee yet.</p>
        ) : (
          <div className="space-y-3">
            {detail.messages.map((message) => (
              <AdminReadOnlyMessageBubble
                key={message.id}
                senderName={message.senderName}
                roleLabel="Committee member"
                timestamp={message.time}
                body={message.text}
              />
            ))}
          </div>
        )}
      </AdminDetailSection>
    </AdminDetailLayout>
  );
}

export default function OrganizationCommitteeMessagesPanel({
  organizationId,
}: OrganizationCommitteeMessagesPanelProps) {
  const [committees, setCommittees] = useState<OrganizationCommitteeMessageSummary[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CommitteeDetail | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadCommittees = useCallback(async () => {
    setListLoading(true);
    setListError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/messages/committees`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load committees.");
      }

      const rows = (payload.committees as OrganizationCommitteeMessageSummary[]) ?? [];
      setCommittees(rows);
      setSelectedCommitteeId(rows[0]?.id ?? null);
      if (!rows[0]?.id) {
        setDetail(null);
      }
    } catch (loadError) {
      setListError(
        loadError instanceof Error ? loadError.message : "Failed to load committees.",
      );
      setCommittees([]);
      setSelectedCommitteeId(null);
      setDetail(null);
    } finally {
      setListLoading(false);
    }
  }, [organizationId]);

  const loadDetail = useCallback(
    async (committeeId: string) => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const response = await fetch(
          `/api/admin/organizations/${organizationId}/messages/committees/${committeeId}`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load committee messages.");
        }

        setDetail(payload as CommitteeDetail);
      } catch (loadError) {
        setDetailError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load committee messages.",
        );
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [organizationId],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setCommittees([]);
      setSelectedCommitteeId(null);
      setDetail(null);
      void loadCommittees();
    });
  }, [loadCommittees]);

  useEffect(() => {
    if (!selectedCommitteeId) {
      queueMicrotask(() => {
        setDetail(null);
      });
      return;
    }

    queueMicrotask(() => {
      void loadDetail(selectedCommitteeId);
    });
  }, [loadDetail, selectedCommitteeId]);

  return (
    <div className="min-h-[560px] h-[calc(100vh-14rem)] overflow-hidden rounded-admin-md border border-admin-border">
      <AdminMasterDetail
        className="h-full"
        list={
          <>
            <AdminListPanelHeader>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-admin-text">Committees</h2>
                <p className="text-xs text-admin-muted">
                  Committee workspace chat across all committees.
                </p>
              </div>
            </AdminListPanelHeader>

            <div className="flex-1 overflow-y-auto">
              {listLoading ? (
                <div className="flex items-center gap-2 px-4 py-8 text-sm text-admin-faint">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Loading committees…
                </div>
              ) : listError ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-admin-error">{listError}</p>
                  <button
                    type="button"
                    onClick={() => void loadCommittees()}
                    className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
                  >
                    Try again
                  </button>
                </div>
              ) : committees.length === 0 ? (
                <AdminEmptyState message="This school does not have any committee messages yet." />
              ) : (
                committees.map((committee) => (
                  <AdminListItem
                    key={committee.id}
                    selected={selectedCommitteeId === committee.id}
                    onClick={() => setSelectedCommitteeId(committee.id)}
                    title={committee.name}
                    subtitle={
                      committee.lastMessagePreview ??
                      `${committee.messageCount} message${committee.messageCount === 1 ? "" : "s"}`
                    }
                    badge={
                      <AdminStatusBadge
                        label={`${committee.memberCount} members`}
                        variant="neutral"
                      />
                    }
                    footer={
                      committee.lastMessageAt
                        ? formatRelativeTime(committee.lastMessageAt)
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </>
        }
        detail={
          <CommitteeDetailPanel
            detail={detail}
            loading={detailLoading}
            error={detailError}
          />
        }
      />
    </div>
  );
}
