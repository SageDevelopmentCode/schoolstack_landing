"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type HomepageQuestion = {
  id: string;
  name: string;
  email: string;
  message: string;
  source: string;
  created_at: string;
};

export default function HomepageQuestionsPage() {
  const supabase = createClient();
  const [questions, setQuestions] = useState<HomepageQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("demo_feedback")
        .select("id, name, email, message, source, created_at")
        .eq("source", "floating-widget")
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else {
        setQuestions(data as HomepageQuestion[]);
        if (data?.length) setSelectedId(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const selected = questions.find((q) => q.id === selectedId) ?? null;

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
      <div className="w-80 shrink-0 border-r border-border flex flex-col bg-surface">
        <div className="p-3 border-b border-border">
          <p className="text-xs text-text-muted font-secondary">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-sm text-text-faint text-center py-8">
              No questions yet
            </p>
          ) : (
            questions.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedId(q.id)}
                className={`w-full text-left px-3 py-3 border-b border-border hover:bg-bg transition-colors ${
                  selectedId === q.id ? "bg-clay-soft" : ""
                }`}
              >
                <p className="text-sm font-medium text-text truncate">{q.name}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {q.message}
                </p>
                <p className="text-xs text-text-faint mt-1">
                  {new Date(q.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-bg/40">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-sm text-text-faint">
            Select a question
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-text font-display">
                {selected.name}
              </h1>
              <p className="text-sm text-text-muted font-secondary">
                Homepage floating widget
              </p>
            </div>

            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Contact
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-secondary">
                <dt className="text-text-muted">Email</dt>
                <dd>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-clay hover:underline"
                  >
                    {selected.email}
                  </a>
                </dd>
                <dt className="text-text-muted">Submitted</dt>
                <dd>{new Date(selected.created_at).toLocaleString()}</dd>
              </dl>
            </section>

            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Question
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
