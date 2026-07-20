"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SchoolAdminEnrollmentStatusSkeleton } from "@/components/school-admin/skeletons";
import EnrollmentChecklistStepDetailModal from "@/components/school-admin/admissions/EnrollmentChecklistStepDetailModal";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelStepTimeline, {
  type DetailPanelStepTimelineItem,
} from "@/components/school-admin/admissions/DetailPanelStepTimeline";
import {
  getAgreementSectionProgressLabel,
  parseAgreementSectionSignatures,
} from "@/lib/admissions/enrollment-agreement-progress";
import {
  computeChecklistProgress,
  getChecklistForApplication,
  loadEnrollmentChecklistForApplication,
} from "@/lib/admissions/enrollment-checklist-materialization";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import { isInlineAgreementItem } from "@/lib/admissions/enrollment-checklist-schema";
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

function checklistItemTypeLabel(type: EnrollmentChecklistItem["type"]): string {
  switch (type) {
    case "form":
      return "Form";
    case "payment":
      return "Payment";
    case "document_sign":
      return "Signature";
    case "document_sign_pdf":
      return "PDF";
    case "file_upload":
      return "Upload";
    case "acknowledgment":
      return "Acknowledgment";
  }
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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const openStepDetail = (itemId: string) => {
    setSelectedItemId(itemId);
    setDetailOpen(true);
  };

  const closeStepDetail = () => {
    setDetailOpen(false);
    setSelectedItemId(null);
  };

  const timelineItems: DetailPanelStepTimelineItem[] = useMemo(() => {
    if (!loaded) return [];

    return loaded.items.map((item) => {
      const instance = instanceByTemplateId.get(item.id);
      const status = instance?.status ?? "not_started";
      const sectionSignatures = parseAgreementSectionSignatures(instance?.responses);
      const sectionMeta =
        status === "in_progress" && isInlineAgreementItem(item) && item.document?.kind === "inline_sections"
          ? getAgreementSectionProgressLabel(item.document.sections, sectionSignatures)
          : undefined;

      return {
        id: item.id,
        title: item.label,
        status,
        kindLabel: checklistItemTypeLabel(item.type),
        optional: !item.required,
        meta: sectionMeta,
        onClick: () => openStepDetail(item.id),
      };
    });
  }, [instanceByTemplateId, loaded]);

  const showStatusText =
    loaded ? loaded.progress.completed < loaded.progress.total : true;

  if (loading) {
    return <SchoolAdminEnrollmentStatusSkeleton C={C} />;
  }

  if (error) {
    return (
      <section className="text-sm" style={{ color: C.error }}>
        {error}
      </section>
    );
  }

  if (!loaded) return null;

  return (
    <>
      <DetailPanelSection
        C={C}
        title="Enrollment checklist"
        badge={
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
            style={{ backgroundColor: C.infoBg, color: C.info }}
          >
            {loaded.status.replace(/_/g, " ")}
          </span>
        }
      >
        <DetailPanelProgressBar
          C={C}
          completed={loaded.progress.completed}
          total={loaded.progress.total}
          label="Required items"
        />
        {loaded.variantLabels.length > 0 ? (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium" style={{ color: C.textSecondary }}>
              Selected agreement{loaded.variantLabels.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {loaded.variantLabels.map((variantLabel) => (
                <span
                  key={variantLabel}
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: C.accentLight, color: C.accentDark }}
                >
                  {variantLabel}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <DetailPanelStepTimeline
          C={C}
          items={timelineItems}
          activeItemId={selectedItemId}
          showStatusText={showStatusText}
        />
      </DetailPanelSection>

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
