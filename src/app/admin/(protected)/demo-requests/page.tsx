"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  DEMO_REQUEST_STATUS,
  type DemoRequestStatus,
} from "@/lib/admin-ui/admin-status-styles";

type DemoRequest = {
  id: string;
  name: string;
  email: string;
  school_name: string;
  role: string;
  launch_timeline: string | null;
  student_count: string | null;
  current_systems: string;
  priorities: string[];
  website_url: string;
  current_tools: string;
  prep_notes: string;
  scheduled_date: string;
  scheduled_time: string;
  timezone: string;
  status: DemoRequestStatus;
  source: string;
  created_at: string;
  updated_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  starting: "Starting a school",
  running: "Running a school",
  private: "Private / homeschool",
  program: "Program / microschool",
  other: "Other",
};

function formatDate(date: string, time: string, timezone: string) {
  return `${date} at ${time} (${timezone})`;
}

export default function DemoRequestsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DemoRequestStatus | "">("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("demo_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else {
        setRequests(data as DemoRequest[]);
        if (data?.length) setSelectedId(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleStatusChange = useCallback(
    async (id: string, status: DemoRequestStatus) => {
      const { error } = await supabase
        .from("demo_requests")
        .update({ status })
        .eq("id", id);
      if (error) {
        alert("Update failed: " + error.message);
        return;
      }
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    },
    [supabase]
  );

  const filtered = requests.filter(
    (r) => !statusFilter || r.status === statusFilter
  );

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const counts = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<DemoRequestStatus, number>
  );

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <AdminMasterDetail
      list={
        <>
          <AdminListPanelHeader>
            <div className="flex gap-1.5 flex-wrap">
              {(["scheduled", "completed", "cancelled"] as DemoRequestStatus[]).map(
                (s) => (
                  <AdminFilterChip
                    key={s}
                    label={DEMO_REQUEST_STATUS[s].label}
                    count={counts[s]}
                    active={statusFilter === s}
                    onClick={() =>
                      setStatusFilter(statusFilter === s ? "" : s)
                    }
                  />
                )
              )}
            </div>
          </AdminListPanelHeader>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <AdminEmptyState message="No requests" />
            ) : (
              filtered.map((r) => (
                <AdminListItem
                  key={r.id}
                  selected={selectedId === r.id}
                  onClick={() => setSelectedId(r.id)}
                  title={r.name}
                  subtitle={r.school_name}
                  badge={
                    <AdminStatusBadge
                      label={DEMO_REQUEST_STATUS[r.status].label}
                      variant={DEMO_REQUEST_STATUS[r.status].variant}
                    />
                  }
                  footer={new Date(r.created_at).toLocaleDateString()}
                />
              ))
            )}
          </div>
        </>
      }
      detail={
        !selected ? (
          <AdminDetailEmpty message="Select a request" />
        ) : (
          <AdminDetailLayout>
            <AdminDetailHeader
              title={selected.name}
              subtitle={selected.school_name}
              actions={
                <AdminSelect
                  value={selected.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selected.id,
                      e.target.value as DemoRequestStatus
                    )
                  }
                  className="text-sm border border-admin-border rounded-admin-md px-2.5 py-1.5 bg-admin-surface text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
                  aria-label="Demo request status"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </AdminSelect>
              }
            />

            <AdminDetailSection title="Contact">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-admin-muted">Email</dt>
                <dd>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-admin-accent hover:underline"
                  >
                    {selected.email}
                  </a>
                </dd>
                <dt className="text-admin-muted">Role</dt>
                <dd>{ROLE_LABELS[selected.role] ?? selected.role}</dd>
                {selected.website_url ? (
                  <>
                    <dt className="text-admin-muted">Website</dt>
                    <dd>
                      <a
                        href={selected.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-admin-accent hover:underline truncate"
                      >
                        {selected.website_url}
                      </a>
                    </dd>
                  </>
                ) : null}
              </dl>
            </AdminDetailSection>

            <AdminDetailSection title="Scheduled">
              <p className="text-sm text-admin-text">
                {formatDate(
                  selected.scheduled_date,
                  selected.scheduled_time,
                  selected.timezone
                )}
              </p>
            </AdminDetailSection>

            {selected.launch_timeline ||
            selected.student_count ||
            selected.current_systems ||
            selected.priorities.length > 0 ? (
              <AdminDetailSection title="Qualification">
                <dl className="space-y-2 text-sm">
                  {selected.launch_timeline ? (
                    <div>
                      <dt className="text-admin-muted">Launch timeline</dt>
                      <dd>{selected.launch_timeline}</dd>
                    </div>
                  ) : null}
                  {selected.student_count ? (
                    <div>
                      <dt className="text-admin-muted">Student count</dt>
                      <dd>{selected.student_count}</dd>
                    </div>
                  ) : null}
                  {selected.current_systems ? (
                    <div>
                      <dt className="text-admin-muted">Current systems</dt>
                      <dd>{selected.current_systems}</dd>
                    </div>
                  ) : null}
                  {selected.priorities.length > 0 ? (
                    <div>
                      <dt className="text-admin-muted">Priorities</dt>
                      <dd>{selected.priorities.join(", ")}</dd>
                    </div>
                  ) : null}
                </dl>
              </AdminDetailSection>
            ) : null}

            {selected.current_tools || selected.prep_notes ? (
              <AdminDetailSection title="Notes">
                {selected.current_tools ? (
                  <p className="text-sm text-admin-text whitespace-pre-wrap">
                    <span className="font-medium text-admin-muted">
                      Current tools:{" "}
                    </span>
                    {selected.current_tools}
                  </p>
                ) : null}
                {selected.prep_notes ? (
                  <p className="text-sm text-admin-text whitespace-pre-wrap">
                    {selected.prep_notes}
                  </p>
                ) : null}
              </AdminDetailSection>
            ) : null}

            <p className="text-xs text-admin-faint">
              Submitted {new Date(selected.created_at).toLocaleString()} via{" "}
              {selected.source}
            </p>
          </AdminDetailLayout>
        )
      }
    />
  );
}
