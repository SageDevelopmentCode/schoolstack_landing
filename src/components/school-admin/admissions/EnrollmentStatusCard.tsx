"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDot,
  Loader2,
  MinusCircle,
} from "lucide-react";
import EnrollmentChecklistStepDetailModal from "@/components/school-admin/admissions/EnrollmentChecklistStepDetailModal";
import {
  computeChecklistProgress,
  getChecklistForApplication,
  loadEnrollmentChecklistForApplication,
} from "@/lib/admissions/enrollment-checklist-materialization";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import {
  checklistItemStatusIconColor,
  checklistItemStatusLabel,
  getChecklistItemTypeIcon,
} from "@/lib/admissions/enrollment-checklist-item-status-ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type EnrollmentStatusCardProps = {
  C: AdminThemeTokens;
  organizationId: string;
  applicationId: string;
};

type LoadedState = {
  status: string;
  progress: { completed: number; total: number };
  variantLabels: string[];
  items: EnrollmentChecklistItem[];
  instances: EnrollmentChecklistItemInstance[];
  checklistId: string;
};

function StepStatusIcon({
  status,
  C,
}: {
  status: EnrollmentChecklistItemInstance["status"];
  C: AdminThemeTokens;
}) {
  const color = checklistItemStatusIconColor(status, C);

  if (status === "completed") {
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />;
  }

  if (status === "in_progress") {
    return <CircleDot className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />;
  }

  if (status === "waived") {
    return <MinusCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />;
  }

  return <Circle className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />;
}

export default function EnrollmentStatusCard({
  C,
  organizationId,
  applicationId,
}: EnrollmentStatusCardProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const instanceByTemplateId = useMemo(
    () =>
      new Map(
        (loaded?.instances ?? []).map((instance) => [instance.templateItemId, instance]),
      ),
    [loaded?.instances],
  );

  const selectedItem = loaded?.items.find((item) => item.id === selectedItemId) ?? null;
  const selectedInstance = selectedItem
    ? (instanceByTemplateId.get(selectedItem.id) ?? null)
    : null;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const checklist = await getChecklistForApplication(supabase, applicationId);
      if (!checklist) {
        setLoaded(null);
        return;
      }

      const checklistData = await loadEnrollmentChecklistForApplication(
        supabase,
        applicationId,
        organizationId,
      );
      if (!checklistData) {
        setLoaded({
          status: checklist.status,
          progress: { completed: 0, total: 0 },
          variantLabels: [],
          items: [],
          instances: [],
          checklistId: checklist.checklistId,
        });
        return;
      }

      const progress = computeChecklistProgress(
        checklistData.items,
        checklistData.instances,
      );
      const variantLabels = Object.values(
        checklistData.metadata.variantResolutions ?? {},
      ).map((resolution) => {
        const item = checklistData.items.find(
          (row) => row.id === resolution.templateItemId,
        );
        return item?.label ?? resolution.variantKey;
      });

      setLoaded({
        status: checklistData.status,
        progress,
        variantLabels,
        items: checklistData.items,
        instances: checklistData.instances,
        checklistId: checklistData.checklistId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enrollment status.");
      setLoaded(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId, organizationId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const openStepDetail = (itemId: string) => {
    setSelectedItemId(itemId);
    setDetailOpen(true);
  };

  const closeStepDetail = () => {
    setDetailOpen(false);
    setSelectedItemId(null);
  };

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

  if (!loaded) return null;

  return (
    <>
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
            {loaded.status.replace(/_/g, " ")}
          </span>
        </div>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          Progress: {loaded.progress.completed}/{loaded.progress.total} required items
        </p>
        {loaded.variantLabels.length > 0 ? (
          <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
            Selected agreement{loaded.variantLabels.length > 1 ? "s" : ""}:{" "}
            {loaded.variantLabels.join(", ")}
          </p>
        ) : null}

        {loaded.items.length > 0 ? (
          <ul
            className="mt-4 overflow-hidden rounded-lg border"
            style={{ borderColor: C.border, backgroundColor: C.bg }}
          >
            {loaded.items.map((item) => {
              const instance = instanceByTemplateId.get(item.id);
              const status = instance?.status ?? "not_started";
              const TypeIcon = getChecklistItemTypeIcon(item.type);

              return (
                <li key={item.id} className="border-b last:border-b-0" style={{ borderColor: C.border }}>
                  <button
                    type="button"
                    onClick={() => openStepDetail(item.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:opacity-90"
                  >
                    <StepStatusIcon status={status} C={C} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <TypeIcon
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: C.textTertiary }}
                          aria-hidden
                        />
                        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                          {item.label}
                        </p>
                        {!item.required ? (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ backgroundColor: C.surface, color: C.textTertiary }}
                          >
                            Optional
                          </span>
                        ) : null}
                      </div>
                      <p
                        className="mt-1 text-xs"
                        style={{
                          color:
                            status === "completed"
                              ? C.success
                              : status === "in_progress"
                                ? C.info
                                : C.textTertiary,
                        }}
                      >
                        {checklistItemStatusLabel(status)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <EnrollmentChecklistStepDetailModal
        C={C}
        open={detailOpen}
        item={selectedItem}
        instance={selectedInstance}
        onClose={closeStepDetail}
      />
    </>
  );
}
