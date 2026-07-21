"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";

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

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <AdminMasterDetail
      list={
        <>
          <AdminListPanelHeader>
            <p className="text-xs text-admin-muted">
              {questions.length} question{questions.length === 1 ? "" : "s"}
            </p>
          </AdminListPanelHeader>

          <div className="flex-1 overflow-y-auto">
            {questions.length === 0 ? (
              <AdminEmptyState message="No questions yet" />
            ) : (
              questions.map((q) => (
                <AdminListItem
                  key={q.id}
                  selected={selectedId === q.id}
                  onClick={() => setSelectedId(q.id)}
                  title={q.name}
                  subtitle={q.message}
                  footer={new Date(q.created_at).toLocaleDateString()}
                />
              ))
            )}
          </div>
        </>
      }
      detail={
        !selected ? (
          <AdminDetailEmpty message="Select a question" />
        ) : (
          <AdminDetailLayout>
            <AdminDetailHeader
              title={selected.name}
              subtitle="Homepage floating widget"
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
                <dt className="text-admin-muted">Submitted</dt>
                <dd>{new Date(selected.created_at).toLocaleString()}</dd>
              </dl>
            </AdminDetailSection>

            <AdminDetailSection title="Question">
              <p className="text-sm text-admin-text whitespace-pre-wrap">
                {selected.message}
              </p>
            </AdminDetailSection>

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
