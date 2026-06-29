"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { schoolDemoRegistry } from "@/data/school-demos";

type DemoFeedback = {
  id: string;
  school_slug: string;
  school_name: string;
  name: string | null;
  email: string | null;
  message: string;
  source: string;
  created_at: string;
};

function displayName(feedback: DemoFeedback) {
  return feedback.name?.trim() || "Anonymous";
}

function formatSourceLabel(source: string) {
  switch (source) {
    case "prototype-walkthrough":
      return "Prototype walkthrough";
    case "floating-widget":
      return "Homepage widget";
    case "demo-walkthrough":
      return "Demo walkthrough";
    default:
      return source;
  }
}

export default function DemoFeedbackPage() {
  const supabase = createClient();
  const [feedback, setFeedback] = useState<DemoFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string>("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("demo_feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else {
        setFeedback(data as DemoFeedback[]);
        if (data?.length) setSelectedId(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const schools = useMemo(() => {
    const map = new Map<string, string>();
    feedback.forEach((f) => {
      if (!map.has(f.school_slug)) {
        map.set(f.school_slug, f.school_name);
      }
    });
    return [...map.entries()].map(([slug, name]) => ({ slug, name }));
  }, [feedback]);

  const filtered = feedback.filter(
    (f) => !schoolFilter || f.school_slug === schoolFilter
  );

  const selected = feedback.find((f) => f.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    feedback.forEach((f) => {
      acc[f.school_slug] = (acc[f.school_slug] ?? 0) + 1;
    });
    return acc;
  }, [feedback]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-text-faint font-secondary">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-clay font-secondary">
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
      <div className="w-80 shrink-0 border-r border-border flex flex-col bg-surface">
        <div className="p-3 border-b border-border space-y-2">
          {schools.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {schools.map(({ slug, name }) => (
                <button
                  key={slug}
                  onClick={() =>
                    setSchoolFilter(schoolFilter === slug ? "" : slug)
                  }
                  className={`text-xs px-2 py-1 rounded-full border transition-colors max-w-full truncate ${
                    schoolFilter === slug
                      ? "bg-clay-soft text-clay border-clay/20"
                      : "bg-bg text-text-muted border-border hover:bg-surface-soft"
                  }`}
                  title={name}
                >
                  {name}
                  {counts[slug] ? ` (${counts[slug]})` : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-faint text-center py-8">
              No feedback
            </p>
          ) : (
            filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`w-full text-left px-3 py-3 border-b border-border hover:bg-bg transition-colors ${
                  selectedId === f.id ? "bg-clay-soft" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {displayName(f)}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {f.school_name}
                  </p>
                </div>
                <p className="text-xs text-text-faint mt-1">
                  {new Date(f.created_at).toLocaleDateString()}
                  {f.source ? ` · ${formatSourceLabel(f.source)}` : ""}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto bg-bg/40">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-sm text-text-faint">
            Select feedback
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-text font-display">
                {displayName(selected)}
              </h1>
              <p className="text-sm text-text-muted font-secondary">
                {selected.school_name}
              </p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded border bg-bg text-text-muted border-border font-secondary">
                {formatSourceLabel(selected.source)}
              </span>
            </div>

            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Contact
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-secondary">
                {selected.email ? (
                  <>
                    <dt className="text-text-muted">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-clay hover:underline"
                      >
                        {selected.email}
                      </a>
                    </dd>
                  </>
                ) : null}
                <dt className="text-text-muted">Submitted</dt>
                <dd>{new Date(selected.created_at).toLocaleString()}</dd>
              </dl>
            </section>

            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Demo
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm font-secondary">
                <span className="text-xs px-2 py-0.5 rounded border bg-bg text-text-muted border-border">
                  {selected.school_slug}
                </span>
                {schoolDemoRegistry[selected.school_slug] && (
                  <Link
                    href={`/demo/${selected.school_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay hover:underline"
                  >
                    Open demo →
                  </Link>
                )}
              </div>
            </section>

            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Message
              </h2>
              <p className="text-sm text-text font-secondary whitespace-pre-wrap">
                {selected.message}
              </p>
            </section>

            <p className="text-xs text-text-faint font-secondary">
              Submitted {new Date(selected.created_at).toLocaleString()} via{" "}
              {selected.source}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
