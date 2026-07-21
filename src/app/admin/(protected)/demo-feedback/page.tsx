"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { schoolDemoRegistry } from "@/data/school-demos";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminFilterChip } from "@/components/admin/ui/AdminFilterChip";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

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

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <AdminMasterDetail
      list={
        <>
          <AdminListPanelHeader>
            {schools.length > 0 ? (
              <div className="flex gap-1.5 flex-wrap">
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
              <AdminEmptyState message="No feedback" />
            ) : (
              filtered.map((f) => (
                <AdminListItem
                  key={f.id}
                  selected={selectedId === f.id}
                  onClick={() => setSelectedId(f.id)}
                  title={displayName(f)}
                  subtitle={f.school_name}
                  footer={`${new Date(f.created_at).toLocaleDateString()}${
                    f.source ? ` · ${formatSourceLabel(f.source)}` : ""
                  }`}
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
                  label={formatSourceLabel(selected.source)}
                  variant="neutral"
                />
              }
            />

            <AdminDetailSection title="Contact">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {selected.email ? (
                  <>
                    <dt className="text-admin-muted">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-admin-accent hover:underline"
                      >
                        {selected.email}
                      </a>
                    </dd>
                  </>
                ) : null}
                <dt className="text-admin-muted">Submitted</dt>
                <dd>{new Date(selected.created_at).toLocaleString()}</dd>
              </dl>
            </AdminDetailSection>

            <AdminDetailSection title="Demo">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <AdminStatusBadge
                  label={selected.school_slug}
                  variant="neutral"
                />
                {schoolDemoRegistry[selected.school_slug] ? (
                  <Link
                    href={`/demo/${selected.school_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-admin-accent hover:underline"
                  >
                    Open demo →
                  </Link>
                ) : null}
              </div>
            </AdminDetailSection>

            <AdminDetailSection title="Message">
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
