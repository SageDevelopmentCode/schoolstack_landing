"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatParentPortalFeedbackType } from "@/lib/parent-portal/coming-soon-content";

type ParentPortalFeedback = {
  id: string;
  organization_id: string;
  school_slug: string;
  school_name: string;
  user_id: string;
  submitter_name: string | null;
  submitter_email: string | null;
  feature_key: string;
  feature_label: string;
  feedback_type: string;
  message: string;
  page_path: string | null;
  created_at: string;
};

function displayName(feedback: ParentPortalFeedback) {
  return feedback.submitter_name?.trim() || "Unknown parent";
}

export default function ParentPortalFeedbackPage() {
  const supabase = createClient();
  const [feedback, setFeedback] = useState<ParentPortalFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string>("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("parent_portal_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else {
        setFeedback(data as ParentPortalFeedback[]);
        if (data?.length) setSelectedId(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const schools = useMemo(() => {
    const map = new Map<string, string>();
    feedback.forEach((entry) => {
      if (!map.has(entry.school_slug)) {
        map.set(entry.school_slug, entry.school_name);
      }
    });
    return [...map.entries()].map(([slug, name]) => ({ slug, name }));
  }, [feedback]);

  const filtered = feedback.filter(
    (entry) => !schoolFilter || entry.school_slug === schoolFilter,
  );

  const selected = feedback.find((entry) => entry.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    feedback.forEach((entry) => {
      acc[entry.school_slug] = (acc[entry.school_slug] ?? 0) + 1;
    });
    return acc;
  }, [feedback]);

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
      <div className="flex w-80 shrink-0 flex-col border-r border-border bg-surface">
        <div className="space-y-2 border-b border-border p-3">
          {schools.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {schools.map(({ slug, name }) => (
                <button
                  key={slug}
                  onClick={() =>
                    setSchoolFilter(schoolFilter === slug ? "" : slug)
                  }
                  className={`max-w-full truncate rounded-full border px-2 py-1 text-xs transition-colors ${
                    schoolFilter === slug
                      ? "border-clay/20 bg-clay-soft text-clay"
                      : "border-border bg-bg text-text-muted hover:bg-surface-soft"
                  }`}
                  title={name}
                >
                  {name}
                  {counts[slug] ? ` (${counts[slug]})` : ""}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-faint">
              No parent portal feedback yet
            </p>
          ) : (
            filtered.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
                className={`w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-bg ${
                  selectedId === entry.id ? "bg-clay-soft" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {displayName(entry)}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {entry.feature_label} · {entry.school_name}
                  </p>
                </div>
                <p className="mt-1 text-xs text-text-faint">
                  {new Date(entry.created_at).toLocaleDateString()} ·{" "}
                  {formatParentPortalFeedbackType(entry.feedback_type)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-bg/40">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-sm text-text-faint">
            Select feedback
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6 p-6">
            <div>
              <h1 className="font-display text-lg font-semibold text-text">
                {displayName(selected)}
              </h1>
              <p className="font-secondary text-sm text-text-muted">
                {selected.school_name}
              </p>
              <span className="mt-2 inline-block rounded border border-border bg-bg px-2 py-0.5 font-secondary text-xs text-text-muted">
                {formatParentPortalFeedbackType(selected.feedback_type)}
              </span>
            </div>

            <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
                Contact
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-secondary text-sm">
                {selected.submitter_email ? (
                  <>
                    <dt className="text-text-muted">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${selected.submitter_email}`}
                        className="text-clay hover:underline"
                      >
                        {selected.submitter_email}
                      </a>
                    </dd>
                  </>
                ) : null}
                <dt className="text-text-muted">Submitted</dt>
                <dd>{new Date(selected.created_at).toLocaleString()}</dd>
              </dl>
            </section>

            <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
                Feature
              </h2>
              <div className="flex flex-wrap items-center gap-2 font-secondary text-sm">
                <span className="rounded border border-border bg-bg px-2 py-0.5 text-xs text-text-muted">
                  {selected.feature_key}
                </span>
                <span className="text-text">{selected.feature_label}</span>
              </div>
              {selected.page_path ? (
                <p className="font-secondary text-xs text-text-muted">
                  Page: {selected.page_path}
                </p>
              ) : null}
            </section>

            <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-secondary text-xs font-semibold uppercase tracking-wide text-text-faint">
                Message
              </h2>
              <p className="whitespace-pre-wrap font-secondary text-sm text-text">
                {selected.message}
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
