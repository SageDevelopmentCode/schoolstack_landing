"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  PenLine,
  Upload,
  X,
} from "lucide-react";
import EnrollmentChecklistItemPanel from "@/components/admissions/EnrollmentChecklistItemPanel";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import { computeChecklistProgress } from "@/lib/admissions/enrollment-checklist-materialization";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
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
  onAllRequiredComplete?: () => void;
  backLink?: { href: string; label: string };
  tuitionSelectionSlot?: React.ReactNode;
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

function findNextIncompleteItemId(
  items: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
  currentItemId: string,
): string | null {
  const statusByTemplateId = new Map(
    instances.map((instance) => [instance.templateItemId, instance.status]),
  );
  const currentIndex = items.findIndex((item) => item.id === currentItemId);
  if (currentIndex === -1) return null;

  for (let index = currentIndex + 1; index < items.length; index += 1) {
    const item = items[index];
    if (statusByTemplateId.get(item.id) !== "completed") {
      return item.id;
    }
  }
  return null;
}

function ChecklistProgressHeader({
  C,
  progress,
  progressPct,
}: {
  C: AdminThemeTokens;
  progress: { completed: number; total: number };
  progressPct: number;
}) {
  return (
    <div className="shrink-0 border-b border-gray-100 px-4 py-4">
      {progress.completed === progress.total && progress.total > 0 ? (
        <div className="mb-3 flex items-center gap-1.5" style={{ color: C.success }}>
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">Enrollment Confirmed!</span>
        </div>
      ) : null}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
          Progress
        </p>
        <span className="text-xs" style={{ color: C.textTertiary }}>
          {progress.completed}/{progress.total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full transition-all"
          style={{ backgroundColor: C.accent, width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

function ChecklistItemList({
  C,
  items,
  activeItemId,
  instanceByTemplateId,
  onSelect,
}: {
  C: AdminThemeTokens;
  items: EnrollmentChecklistItem[];
  activeItemId: string | null;
  instanceByTemplateId: Map<string, EnrollmentChecklistItemInstance>;
  onSelect: (itemId: string) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const Icon = itemIcon(item.type);
        const isActive = item.id === activeItemId;
        const instance = instanceByTemplateId.get(item.id);
        const isComplete = instance?.status === "completed";
        const isInProgress = instance?.status === "in_progress";
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
              isActive ? "" : "hover:bg-black/[0.03]"
            }`}
            style={{
              backgroundColor: isActive ? C.accentLight : "transparent",
              color: isActive ? C.accent : C.textPrimary,
            }}
          >
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: isComplete
                  ? C.successBg
                  : isInProgress
                    ? C.accentLight
                    : isActive
                      ? `${C.accent}26`
                      : C.bg,
                ...(isInProgress && !isComplete
                  ? { border: `2px solid ${C.accent}` }
                  : {}),
              }}
            >
              {isComplete ? (
                <Check className="h-3 w-3" style={{ color: C.success }} />
              ) : isInProgress ? (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: C.accent }}
                />
              ) : (
                <Icon
                  className="h-3 w-3"
                  style={{ color: isActive ? C.accent : C.textTertiary }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium leading-tight">{item.label}</p>
              {!item.required ? (
                <p className="mt-0.5 text-[10px]" style={{ color: C.textTertiary }}>
                  Optional
                </p>
              ) : null}
            </div>
          </button>
        );
      })}
    </>
  );
}

export default function EnrollmentChecklistExperience({
  branding,
  schoolName: _schoolName,
  title,
  items,
  mode = "preview",
  organizationId,
  checklistId,
  initialItemId,
  instances = [],
  onInstancesChange,
  onAllRequiredComplete,
  backLink,
  tuitionSelectionSlot,
}: EnrollmentChecklistExperienceProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [activeItemId, setActiveItemId] = useState<string | null>(() =>
    resolveInitialItemId(items, initialItemId),
  );
  const [localInstances, setLocalInstances] = useState(instances);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setLocalInstances(instances));
  }, [instances]);

  useEffect(() => {
    queueMicrotask(() =>
      setActiveItemId(resolveInitialItemId(items, initialItemId)),
    );
  }, [items, initialItemId]);

  const instanceByTemplateId = useMemo(
    () => new Map(localInstances.map((instance) => [instance.templateItemId, instance])),
    [localInstances],
  );

  const progress = computeChecklistProgress(items, localInstances);
  const activeItem = items.find((item) => item.id === activeItemId) ?? null;
  const activeInstance = activeItem ? instanceByTemplateId.get(activeItem.id) : undefined;

  const handleSelectItem = (itemId: string) => {
    setActiveItemId(itemId);
    setTaskPickerOpen(false);
  };

  const handlePartialProgress = async (responses: Record<string, unknown>) => {
    if (!activeInstance) return;
    const nextInstances = localInstances.map((instance) =>
      instance.id === activeInstance.id
        ? {
            ...instance,
            status: "in_progress" as const,
            responses,
          }
        : instance,
    );
    setLocalInstances(nextInstances);
    onInstancesChange?.(nextInstances);
  };

  const handleComplete = async (responses?: Record<string, unknown>) => {
    if (!activeItem || !activeInstance) return;
    const nextInstances = localInstances.map((instance) =>
      instance.id === activeInstance.id
        ? {
            ...instance,
            status: "completed" as const,
            ...(responses ? { responses } : {}),
          }
        : instance,
    );
    setLocalInstances(nextInstances);
    onInstancesChange?.(nextInstances);

    const nextItemId = findNextIncompleteItemId(items, nextInstances, activeItem.id);
    if (nextItemId) {
      setActiveItemId(nextItemId);
    }

    const nextProgress = computeChecklistProgress(items, nextInstances);
    if (
      nextProgress.total > 0 &&
      nextProgress.completed === nextProgress.total
    ) {
      onAllRequiredComplete?.();
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center"
        style={{ backgroundColor: C.surface }}
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

  const detailPanel = activeItem ? (
    <AnimatePresence mode="wait">
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
          onPartialProgress={mode === "live" ? handlePartialProgress : undefined}
        />
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ backgroundColor: C.surface, color: C.textPrimary }}
    >
      <div className="shrink-0 border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {backLink ? (
            <Link
              href={backLink.href}
              className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: C.border,
                color: C.textSecondary,
                backgroundColor: C.bg,
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLink.label}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
        <h1 className="mt-4 text-xl font-semibold sm:text-2xl" style={{ color: C.accentDark }}>
          {title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
          Complete each item below to finish enrollment.
        </p>
      </div>

      {/* Mobile progress + current task */}
      <div className="shrink-0 border-b border-gray-100 lg:hidden" style={{ backgroundColor: "#FFFFFF" }}>
        <ChecklistProgressHeader C={C} progress={progress} progressPct={progressPct} />
        {activeItem ? (
          <div
            className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
                Current task
              </p>
              <p className="truncate text-sm font-medium" style={{ color: C.textPrimary }}>
                {activeItem.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTaskPickerOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium"
              style={{
                borderColor: C.border,
                color: C.textSecondary,
                backgroundColor: C.bg,
              }}
            >
              Change
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className="hidden w-[30%] min-w-[220px] max-w-[320px] shrink-0 flex-col overflow-hidden border-r border-gray-100 lg:flex"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <ChecklistProgressHeader C={C} progress={progress} progressPct={progressPct} />
          <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
            <ChecklistItemList
              C={C}
              items={items}
              activeItemId={activeItemId}
              instanceByTemplateId={instanceByTemplateId}
              onSelect={handleSelectItem}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden" style={{ backgroundColor: C.surface }}>
          <div className="h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            {tuitionSelectionSlot ?? detailPanel}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {taskPickerOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-4 pb-safe lg:hidden"
            onClick={() => setTaskPickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="max-h-[70dvh] w-full max-w-lg overflow-hidden rounded-xl border shadow-xl"
              style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Select enrollment task"
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: C.border }}
              >
                <p className="text-sm font-semibold" style={{ color: C.accentDark }}>
                  Enrollment tasks
                </p>
                <button
                  type="button"
                  onClick={() => setTaskPickerOpen(false)}
                  className="rounded-sm p-1"
                  style={{ color: C.textTertiary }}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[calc(70dvh-52px)] divide-y divide-gray-100 overflow-y-auto">
                <ChecklistItemList
                  C={C}
                  items={items}
                  activeItemId={activeItemId}
                  instanceByTemplateId={instanceByTemplateId}
                  onSelect={handleSelectItem}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
