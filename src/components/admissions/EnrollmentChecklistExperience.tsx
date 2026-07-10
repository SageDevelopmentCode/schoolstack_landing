"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  PenLine,
  Upload,
} from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import EnrollmentChecklistItemPanel from "@/components/admissions/EnrollmentChecklistItemPanel";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import { computeChecklistProgress } from "@/lib/admissions/enrollment-checklist-materialization";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

export type EnrollmentChecklistExperienceProps = {
  branding: OrganizationBranding;
  schoolName: string;
  title: string;
  items: EnrollmentChecklistItem[];
  mode?: "preview" | "live";
  organizationId?: string;
  checklistId?: string;
  initialItemId?: string;
  instances?: EnrollmentChecklistItemInstance[];
  onInstancesChange?: (instances: EnrollmentChecklistItemInstance[]) => void;
};

const panelTransition = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const },
};

function itemIcon(type: EnrollmentChecklistItem["type"]) {
  switch (type) {
    case "document_sign":
      return FileSignature;
    case "document_sign_pdf":
      return FileText;
    case "form":
      return ClipboardList;
    case "file_upload":
      return Upload;
    case "payment":
      return CreditCard;
    case "acknowledgment":
      return PenLine;
  }
}

function resolveInitialItemId(
  items: EnrollmentChecklistItem[],
  initialItemId?: string,
): string | null {
  if (items.length === 0) return null;
  if (initialItemId && items.some((item) => item.id === initialItemId)) {
    return initialItemId;
  }
  return items[0].id;
}

export default function EnrollmentChecklistExperience({
  branding,
  schoolName,
  title,
  items,
  mode = "preview",
  organizationId,
  checklistId,
  initialItemId,
  instances = [],
  onInstancesChange,
}: EnrollmentChecklistExperienceProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;
  const [activeItemId, setActiveItemId] = useState<string | null>(() =>
    resolveInitialItemId(items, initialItemId),
  );
  const [localInstances, setLocalInstances] = useState(instances);

  useEffect(() => {
    setLocalInstances(instances);
  }, [instances]);

  useEffect(() => {
    setActiveItemId(resolveInitialItemId(items, initialItemId));
  }, [items, initialItemId]);

  const instanceByTemplateId = useMemo(
    () => new Map(localInstances.map((instance) => [instance.templateItemId, instance])),
    [localInstances],
  );

  const requiredItems = items.filter((item) => item.required);
  const progress = computeChecklistProgress(items, localInstances);
  const activeItem = items.find((item) => item.id === activeItemId) ?? null;
  const activeInstance = activeItem ? instanceByTemplateId.get(activeItem.id) : undefined;

  const handleComplete = async () => {
    if (!activeItem || !activeInstance) return;
    const nextInstances = localInstances.map((instance) =>
      instance.id === activeInstance.id
        ? { ...instance, status: "completed" as const }
        : instance,
    );
    setLocalInstances(nextInstances);
    onInstancesChange?.(nextInstances);
  };

  if (items.length === 0) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center"
        style={{ backgroundColor: pageBg }}
      >
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          Add at least one checklist item to preview.
        </p>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          Families will see enrollment tasks here once items are added.
        </p>
      </div>
    );
  }

  const progressPct =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <div className="shrink-0 border-b px-4 py-4 sm:px-6" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-4">
          <SchoolDemoWordmark
            logo={{
              src: branding.logo.src,
              alt: branding.logo.alt || schoolName,
              width: branding.logo.width,
              height: branding.logo.height,
              text: branding.logo.src ? undefined : schoolName,
            }}
            className="h-7 w-auto max-w-[min(200px,70vw)] object-contain sm:h-8"
          />
        </div>
        <h1 className="mt-4 text-xl font-semibold sm:text-2xl" style={{ color: C.accentDark }}>
          {title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
          Complete each item below to finish enrollment.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className="flex w-[30%] min-w-[220px] max-w-[320px] shrink-0 flex-col overflow-hidden border-r"
          style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
        >
          <div className="shrink-0 border-b px-4 py-4" style={{ borderColor: C.border }}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
                Progress
              </p>
              <span className="text-xs" style={{ color: C.textTertiary }}>
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: C.border }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ backgroundColor: C.accent, width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {items.map((item) => {
              const Icon = itemIcon(item.type);
              const isActive = item.id === activeItemId;
              const instance = instanceByTemplateId.get(item.id);
              const isComplete = instance?.status === "completed";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItemId(item.id)}
                  className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor: C.border,
                    backgroundColor: isActive ? C.accentLight : "transparent",
                    color: isActive ? C.accent : C.textPrimary,
                  }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isActive ? `${C.accent}22` : C.bg,
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{ color: isActive ? C.accent : C.textTertiary }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium leading-tight">{item.label}</p>
                    {!item.required ? (
                      <p className="mt-0.5 text-[10px]" style={{ color: C.textTertiary }}>
                        Optional
                      </p>
                    ) : null}
                  </div>
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${isComplete ? "opacity-100" : "opacity-0"}`}
                    style={{ color: C.success }}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden" style={{ backgroundColor: pageBg }}>
          <div className="h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <AnimatePresence mode="wait">
              {activeItem ? (
                <motion.div
                  key={activeItem.id}
                  className="mx-auto h-full max-w-3xl"
                  {...panelTransition}
                >
                  <EnrollmentChecklistItemPanel
                    C={C}
                    item={activeItem}
                    mode={mode}
                    organizationId={organizationId}
                    checklistId={checklistId}
                    instanceId={activeInstance?.id}
                    instanceStatus={activeInstance?.status}
                    instancePaymentStatus={activeInstance?.paymentStatus}
                    existingResponses={activeInstance?.responses}
                    onComplete={mode === "live" ? handleComplete : undefined}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
