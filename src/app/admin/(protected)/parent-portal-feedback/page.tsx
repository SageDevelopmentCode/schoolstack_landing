"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatParentPortalFeedbackType } from "@/lib/parent-portal/coming-soon-content";
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

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <AdminMasterDetail
      list={
        <>
          <AdminListPanelHeader>
            {schools.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {schools.map(({ slug, name }) => (
                  <AdminFilterChip
                    key={slug}
                    label={name}
                    count={counts[slug]}
                    active={schoolFilter === slug}
                    onClick={() =>
                      setSchoolFilter(schoolFilter === slug ? "" : slug)
                    }
                    title={name}
                  />
                ))}
              </div>
            ) : null}
          </AdminListPanelHeader>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <AdminEmptyState message="No parent portal feedback yet" />
            ) : (
              filtered.map((entry) => (
                <AdminListItem
                  key={entry.id}
                  selected={selectedId === entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  title={displayName(entry)}
                  subtitle={`${entry.feature_label} · ${entry.school_name}`}
                  footer={`${new Date(entry.created_at).toLocaleDateString()} · ${formatParentPortalFeedbackType(entry.feedback_type)}`}
                />
              ))
            )}
          </div>
        </>
      }
      detail={
        !selected ? (
          <AdminDetailEmpty message="Select feedback" />
        ) : (
          <AdminDetailLayout>
            <AdminDetailHeader
              title={displayName(selected)}
              subtitle={selected.school_name}
              badges={
                <AdminStatusBadge
                  label={formatParentPortalFeedbackType(selected.feedback_type)}
                  variant="neutral"
                />
              }
            />

            <AdminDetailSection title="Contact">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {selected.submitter_email ? (
                  <>
                    <dt className="text-admin-muted">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${selected.submitter_email}`}
                        className="text-admin-accent hover:underline"
                      >
                        {selected.submitter_email}
                      </a>
                    </dd>
                  </>
                ) : null}
                <dt className="text-admin-muted">Submitted</dt>
                <dd>{new Date(selected.created_at).toLocaleString()}</dd>
              </dl>
            </AdminDetailSection>

            <AdminDetailSection title="Feature">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <AdminStatusBadge
                  label={selected.feature_key}
                  variant="neutral"
                />
                <span className="text-admin-text">{selected.feature_label}</span>
              </div>
              {selected.page_path ? (
                <p className="text-xs text-admin-muted">
                  Page: {selected.page_path}
                </p>
              ) : null}
            </AdminDetailSection>

            <AdminDetailSection title="Message">
              <p className="whitespace-pre-wrap text-sm text-admin-text">
                {selected.message}
              </p>
            </AdminDetailSection>
          </AdminDetailLayout>
        )
      }
    />
  );
}
