"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

type DemoRequestStatus = "scheduled" | "cancelled" | "completed";

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

const STATUS: Record<
  DemoRequestStatus,
  { label: string; pill: string }
> = {
  scheduled: {
    label: "Scheduled",
    pill: "bg-violet-50 text-violet-700 border-violet-200",
  },
  completed: {
    label: "Completed",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-red-50 text-red-600 border-red-200",
  },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-3rem)] flex overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
    >
      {/* List panel */}
      <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-200 space-y-2">
          <div className="flex gap-1 flex-wrap">
            {(["scheduled", "completed", "cancelled"] as DemoRequestStatus[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() =>
                    setStatusFilter(statusFilter === s ? "" : s)
                  }
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    statusFilter === s
                      ? STATUS[s].pill
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {STATUS[s].label}
                  {counts[s] ? ` (${counts[s]})` : ""}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No requests</p>
          ) : (
            filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedId === r.id ? "bg-violet-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {r.school_name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${STATUS[r.status].pill}`}
                  >
                    {STATUS[r.status].label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto bg-gray-50/40">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Select a request
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {selected.name}
                </h1>
                <p className="text-sm text-gray-500">{selected.school_name}</p>
              </div>
              <select
                value={selected.status}
                onChange={(e) =>
                  handleStatusChange(
                    selected.id,
                    e.target.value as DemoRequestStatus
                  )
                }
                className={`text-sm border rounded-lg px-2 py-1 ${STATUS[selected.status].pill}`}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Contact
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Email</dt>
                <dd>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-violet-600 hover:underline"
                  >
                    {selected.email}
                  </a>
                </dd>
                <dt className="text-gray-500">Role</dt>
                <dd>{ROLE_LABELS[selected.role] ?? selected.role}</dd>
                {selected.website_url && (
                  <>
                    <dt className="text-gray-500">Website</dt>
                    <dd>
                      <a
                        href={selected.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:underline truncate"
                      >
                        {selected.website_url}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Scheduled
              </h2>
              <p className="text-sm text-gray-900">
                {formatDate(
                  selected.scheduled_date,
                  selected.scheduled_time,
                  selected.timezone
                )}
              </p>
            </section>

            {(selected.launch_timeline ||
              selected.student_count ||
              selected.current_systems ||
              selected.priorities.length > 0) && (
              <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Qualification
                </h2>
                <dl className="space-y-2 text-sm">
                  {selected.launch_timeline && (
                    <div>
                      <dt className="text-gray-500">Launch timeline</dt>
                      <dd>{selected.launch_timeline}</dd>
                    </div>
                  )}
                  {selected.student_count && (
                    <div>
                      <dt className="text-gray-500">Student count</dt>
                      <dd>{selected.student_count}</dd>
                    </div>
                  )}
                  {selected.current_systems && (
                    <div>
                      <dt className="text-gray-500">Current systems</dt>
                      <dd>{selected.current_systems}</dd>
                    </div>
                  )}
                  {selected.priorities.length > 0 && (
                    <div>
                      <dt className="text-gray-500">Priorities</dt>
                      <dd>{selected.priorities.join(", ")}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {(selected.current_tools || selected.prep_notes) && (
              <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Notes
                </h2>
                {selected.current_tools && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    <span className="font-medium text-gray-500">
                      Current tools:{" "}
                    </span>
                    {selected.current_tools}
                  </p>
                )}
                {selected.prep_notes && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selected.prep_notes}
                  </p>
                )}
              </section>
            )}

            <p className="text-xs text-gray-400">
              Submitted {new Date(selected.created_at).toLocaleString()} via{" "}
              {selected.source}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
