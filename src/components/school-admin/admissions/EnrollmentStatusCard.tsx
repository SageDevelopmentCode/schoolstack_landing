"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  computeChecklistProgress,
  getChecklistForApplication,
  loadEnrollmentChecklistForApplication,
} from "@/lib/admissions/enrollment-checklist-materialization";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type EnrollmentStatusCardProps = {
  C: AdminThemeTokens;
  organizationId: string;
  applicationId: string;
};

export default function EnrollmentStatusCard({
  C,
  organizationId,
  applicationId,
}: EnrollmentStatusCardProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    status: string;
    progress: { completed: number; total: number };
    variantLabels: string[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const checklist = await getChecklistForApplication(supabase, applicationId);
      if (!checklist) {
        setSummary(null);
        return;
      }

      const loaded = await loadEnrollmentChecklistForApplication(
        supabase,
        applicationId,
        organizationId,
      );
      if (!loaded) {
        setSummary({
          status: checklist.status,
          progress: { completed: 0, total: 0 },
          variantLabels: [],
        });
        return;
      }

      const progress = computeChecklistProgress(loaded.items, loaded.instances);
      const variantLabels = Object.values(loaded.metadata.variantResolutions ?? {}).map(
        (resolution) => {
          const item = loaded.items.find((row) => row.id === resolution.templateItemId);
          return item?.label ?? resolution.variantKey;
        },
      );

      setSummary({
        status: loaded.status,
        progress,
        variantLabels,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enrollment status.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId, organizationId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: C.textTertiary }}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading enrollment status…
      </div>
    );
  }

  if (error) {
    return (
      <p className="mb-5 text-sm" style={{ color: C.error }}>
        {error}
      </p>
    );
  }

  if (!summary) return null;

  return (
    <div
      className="mb-5 rounded-lg border p-4"
      style={{ borderColor: C.border, backgroundColor: C.elevated }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Enrollment checklist
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
          style={{ backgroundColor: C.infoBg, color: C.info }}
        >
          {summary.status.replace(/_/g, " ")}
        </span>
      </div>
      <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
        Progress: {summary.progress.completed}/{summary.progress.total} required items
      </p>
      {summary.variantLabels.length > 0 ? (
        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
          Selected agreement{summary.variantLabels.length > 1 ? "s" : ""}:{" "}
          {summary.variantLabels.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
