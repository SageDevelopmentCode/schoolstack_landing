"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  PenLine,
  Upload,
  X,
} from "lucide-react";
import EnrollmentChecklistItemPanel from "@/components/admissions/EnrollmentChecklistItemPanel";
import { ApplicationFieldAppearanceProvider } from "@/components/admissions/application-field-appearance";
import { Tick } from "@/components/garden/ui";
import ParentGardenFrame, {
  GARDEN_SCOPE_CLASS,
  gardenScopeStyle,
} from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  G_FOCUS,
  GCard,
  GChip,
  GKicker,
  GProgress,
  gBtnOutlineSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { CombinedEnrollmentPaymentCandidate } from "@/lib/admissions/combined-enrollment-payment";
import { computeChecklistProgress } from "@/lib/admissions/enrollment-checklist-materialization";
import { resolveEnrollmentChecklistInitialItemId } from "@/lib/admissions/enrollment-checklist-progress";
import { buildChecklistPreviewSidebarItems } from "@/lib/admissions/enrollment-checklist-variants";
import {
  buildParentThemeTokens,
  parentThemeToGardenCompat,
} from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

const EMPTY_CHECKLIST_INSTANCES: EnrollmentChecklistItemInstance[] = [];

/** Same gutters as `PORTAL_HOME_CONTAINER_CLASS`, without its vertical rhythm (this page fills the height). */
const CHECKLIST_GUTTER_CLASS = "mx-auto w-full max-w-[1250px] px-5 sm:px-10 md:px-12";

export type EnrollmentChecklistHelpButton = {
  organizationId: string;
  userEmail?: string | null;
  currentPath?: string;
  submitEndpoint: string;
  readOnly?: boolean;
};

export type EnrollmentChecklistExperienceProps = {
  branding: OrganizationBranding;
  schoolName: string;
  title: string;
  items: EnrollmentChecklistItem[];
  allItems?: EnrollmentChecklistItem[];
  mode?: "preview" | "live";
  organizationId?: string;
  checklistId?: string;
  applicationId?: string;
  combinedPaymentCandidates?: CombinedEnrollmentPaymentCandidate[];
  initialItemId?: string;
  initialSectionId?: string;
  initialPreviewSignerName?: string;
  instances?: EnrollmentChecklistItemInstance[];
  onInstancesChange?: (instances: EnrollmentChecklistItemInstance[]) => void;
  onActiveItemChange?: (templateItemId: string) => void;
  onAllRequiredComplete?: () => void;
  backLink?: { href: string; label: string };
  helpButton?: EnrollmentChecklistHelpButton;
};

function ItemTypeIcon({
  type,
  className,
}: {
  type: EnrollmentChecklistItem["type"];
  className?: string;
}) {
  const props = { className, strokeWidth: 2.2, "aria-hidden": true } as const;
  switch (type) {
    case "document_sign":
      return <FileSignature {...props} />;
    case "document_sign_pdf":
      return <FileText {...props} />;
    case "form":
      return <ClipboardList {...props} />;
    case "file_upload":
      return <Upload {...props} />;
    case "payment":
      return <CreditCard {...props} />;
    case "acknowledgment":
      return <PenLine {...props} />;
  }
}

function resolveInitialItemId(
  items: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
  explicitItemId?: string,
): string | null {
  return resolveEnrollmentChecklistInitialItemId(items, instances, {
    explicitItemId,
  });
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

/** Progress strip: "N of M required done" + Garden progress bar; a mint confirmed line when all done. */
function ChecklistProgress({
  progress,
}: {
  progress: { completed: number; total: number };
}) {
  const allDone = progress.total > 0 && progress.completed === progress.total;
  return (
    <div>
      {allDone ? (
        <div className="mb-3 flex items-center gap-2 rounded-[14px] bg-[var(--sf-mint)] px-3 py-2">
          <Tick className="h-5 w-5" />
          <span className="text-[13px] font-extrabold text-[var(--sf-forest)]">
            Enrollment Confirmed!
          </span>
        </div>
      ) : null}
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <GKicker>Progress</GKicker>
        <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]">
          {progress.completed}/{progress.total}
        </span>
      </div>
      <GProgress
        value={progress.completed}
        total={progress.total}
        done={allDone}
        label={`${progress.completed} of ${progress.total} required items complete`}
      />
    </div>
  );
}

/** Notebook-style status mark: ticked (done), accent ring + dot (in progress), type icon ring (to do). */
function ChecklistStatusMark({
  item,
  isActive,
  isComplete,
  isInProgress,
}: {
  item: EnrollmentChecklistItem;
  isActive: boolean;
  isComplete: boolean;
  isInProgress: boolean;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center" aria-hidden="true">
      <AnimatePresence initial={false} mode="wait">
        {isComplete ? (
          <motion.span
            key="done"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sf-mint)] ring-[1.5px] ring-[var(--sf-forest)]/30"
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35, ease: PORTAL_EASE }}
          >
            <Tick className="h-6 w-6" fill="transparent" />
          </motion.span>
        ) : isInProgress ? (
          <motion.span
            key="progress"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--sf-clay)]" />
          </motion.span>
        ) : (
          <motion.span
            key="todo"
            className={`flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] bg-white ${
              isActive
                ? "border-[var(--sf-clay)] text-[var(--sf-clay-deep)]"
                : "border-[var(--sf-ink)]/20 text-[var(--sf-ink)]/45"
            }`}
            initial={false}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ItemTypeIcon type={item.type} className="h-3.5 w-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function ChecklistItemList({
  items,
  activeItemId,
  instanceByTemplateId,
  alternateItemIds,
  onSelect,
}: {
  items: EnrollmentChecklistItem[];
  activeItemId: string | null;
  instanceByTemplateId: Map<string, EnrollmentChecklistItemInstance>;
  alternateItemIds?: Set<string>;
  onSelect: (itemId: string) => void;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {items.map((item) => {
        const isActive = item.id === activeItemId;
        const isAlternate = alternateItemIds?.has(item.id) ?? false;
        const instance = instanceByTemplateId.get(item.id);
        const isComplete = instance?.status === "completed";
        const isInProgress = instance?.status === "in_progress";
        const isWaived = instance?.status === "waived";

        if (isAlternate) {
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? "step" : undefined}
                className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] border-dashed px-3 py-2.5 text-left transition-colors ${G_FOCUS} ${
                  isActive
                    ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
                    : "border-[var(--sf-ink)]/20 hover:bg-[var(--sf-ink)]/[0.03]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-7 w-7 shrink-0 rounded-full border-[1.5px] border-dashed ${
                    isActive ? "border-[var(--sf-clay)]" : "border-[var(--sf-ink)]/30"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold leading-tight text-[var(--sf-ink)]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] font-semibold text-[var(--sf-soft)]">
                    Staff may select instead
                  </span>
                </span>
              </button>
            </li>
          );
        }

        const meta = [
          CHECKLIST_ITEM_TYPE_LABELS[item.type],
          !item.required ? "Optional" : null,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "step" : undefined}
              data-status={instance?.status ?? "not_started"}
              className={`group relative flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors ${G_FOCUS} ${
                isActive
                  ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/40"
                  : "hover:bg-[var(--sf-ink)]/[0.035]"
              }`}
            >
              <ChecklistStatusMark
                item={item}
                isActive={isActive}
                isComplete={isComplete}
                isInProgress={isInProgress}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[14px] font-extrabold leading-tight ${
                    isComplete ? "text-[var(--sf-ink)]/60" : "text-[var(--sf-ink)]"
                  }`}
                >
                  {item.label}
                </span>
                <span className="mt-0.5 block truncate text-[12px] font-semibold text-[var(--sf-soft)]">
                  {meta}
                </span>
              </span>
              {isComplete || isInProgress ? (
                <span className="sr-only">{isComplete ? "Done" : "In progress"}</span>
              ) : null}
              {isComplete ? (
                <span aria-hidden="true" className="hidden shrink-0 xl:inline-flex">
                  <GChip tone="success">Done</GChip>
                </span>
              ) : isWaived ? (
                <GChip tone="neutral">Waived</GChip>
              ) : isInProgress ? (
                <span aria-hidden="true" className="hidden shrink-0 xl:inline-flex">
                  <GChip tone="warning">In progress</GChip>
                </span>
              ) : (
                <ChevronRight
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]/30"}`}
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function EnrollmentChecklistExperience({
  branding,
  schoolName: _schoolName,
  title,
  items,
  allItems,
  mode = "preview",
  organizationId,
  checklistId,
  applicationId,
  combinedPaymentCandidates = [],
  initialItemId,
  initialSectionId,
  initialPreviewSignerName,
  instances = EMPTY_CHECKLIST_INSTANCES,
  onInstancesChange,
  onActiveItemChange,
  onAllRequiredComplete,
  backLink,
  helpButton,
}: EnrollmentChecklistExperienceProps) {
  const reduce = useReducedMotion() === true;
  const gardenTheme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToGardenCompat(gardenTheme), [gardenTheme]);
  const previewLayout = useMemo(() => {
    if (mode === "preview" && allItems && allItems.length > 0) {
      return buildChecklistPreviewSidebarItems(allItems, initialItemId);
    }
    return null;
  }, [allItems, initialItemId, mode]);

  const sidebarItems = previewLayout?.sidebarItems ?? items;
  const progressItems = previewLayout?.primaryItems ?? items;
  const alternateItemIds = useMemo(
    () => new Set(previewLayout?.alternateItems.map((item) => item.id) ?? []),
    [previewLayout],
  );

  const [activeItemId, setActiveItemId] = useState<string | null>(() =>
    resolveInitialItemId(sidebarItems, instances, initialItemId),
  );
  const [localInstances, setLocalInstances] = useState(instances);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setLocalInstances(instances));
  }, [instances]);

  useEffect(() => {
    queueMicrotask(() =>
      setActiveItemId(resolveInitialItemId(sidebarItems, instances, initialItemId)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-resolve only when the item list or explicit item changes (unchanged behaviour)
  }, [sidebarItems, initialItemId]);

  const persistActiveItem = (itemId: string) => {
    setActiveItemId(itemId);
    onActiveItemChange?.(itemId);
  };

  const instanceByTemplateId = useMemo(
    () => new Map(localInstances.map((instance) => [instance.templateItemId, instance])),
    [localInstances],
  );

  const progress = computeChecklistProgress(progressItems, localInstances);
  const activeItem = sidebarItems.find((item) => item.id === activeItemId) ?? null;
  const activeIndex = activeItem ? sidebarItems.findIndex((item) => item.id === activeItem.id) : -1;
  const activeIsPreviewAlternate = activeItem ? alternateItemIds.has(activeItem.id) : false;
  const activeInstance = activeItem ? instanceByTemplateId.get(activeItem.id) : undefined;
  const nextIncompleteItemId = activeItem
    ? findNextIncompleteItemId(progressItems, localInstances, activeItem.id)
    : null;

  const handleSelectItem = (itemId: string) => {
    persistActiveItem(itemId);
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

    const nextProgress = computeChecklistProgress(progressItems, nextInstances);
    if (
      nextProgress.total > 0 &&
      nextProgress.completed === nextProgress.total
    ) {
      onAllRequiredComplete?.();
    }
  };

  if (items.length === 0) {
    return (
      <ParentGardenFrame theme={gardenTheme} className="flex min-h-0 flex-1 flex-col bg-[var(--sf-cream)]">
        <div className={`${CHECKLIST_GUTTER_CLASS} flex flex-1 items-center justify-center py-12`}>
          <GCard className="max-w-md text-center">
            <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
              Add at least one checklist item to preview.
            </p>
            <p className="m-0 mt-2 text-[13px] font-semibold text-[var(--sf-soft)]">
              Families will see enrollment tasks here once items are added.
            </p>
          </GCard>
        </div>
      </ParentGardenFrame>
    );
  }

  const detailPanel = activeItem ? (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeItem.id}
        className="mx-auto h-full max-w-3xl"
        initial={reduce ? false : { opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduce ? undefined : { opacity: 0, x: -8 }}
        transition={{ duration: 0.22, ease: PORTAL_EASE }}
      >
        <ApplicationFieldAppearanceProvider value="garden">
        <EnrollmentChecklistItemPanel
          C={C}
          item={activeItem}
          isPreviewAlternate={activeIsPreviewAlternate}
          mode={mode}
          organizationId={organizationId}
          checklistId={checklistId}
          applicationId={applicationId}
          instanceId={activeInstance?.id}
          instanceStatus={activeInstance?.status}
          instancePaymentStatus={activeInstance?.paymentStatus}
          combinedPaymentCandidates={combinedPaymentCandidates}
          existingResponses={activeInstance?.responses}
          hasNextIncompleteItem={Boolean(nextIncompleteItemId)}
          onGoToNextItem={
            nextIncompleteItemId
              ? () => handleSelectItem(nextIncompleteItemId)
              : undefined
          }
          onComplete={mode === "live" ? handleComplete : undefined}
          onPartialProgress={mode === "live" ? handlePartialProgress : undefined}
          initialSectionId={
            initialItemId && activeItem?.id === initialItemId ? initialSectionId : undefined
          }
          initialPreviewSignerName={initialPreviewSignerName}
        />
        </ApplicationFieldAppearanceProvider>
      </motion.div>
    </AnimatePresence>
  ) : null;

  const activeKicker = activeItem
    ? [
        `Item ${activeIndex + 1} of ${sidebarItems.length}`,
        activeIsPreviewAlternate ? "Alternate" : activeItem.required ? "Required" : "Optional",
      ].join(" · ")
    : null;

  return (
    <>
      <ParentGardenFrame
        theme={gardenTheme}
        className="flex min-h-0 flex-1 flex-col bg-[var(--sf-cream)]"
      >
        <div className={`${CHECKLIST_GUTTER_CLASS} shrink-0 pt-5 sm:pt-7`}>
          <div className="mb-4 flex items-center justify-between gap-4">
            {backLink ? (
              <Link href={backLink.href} className={gLinkSm}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span className="max-sm:sr-only">{backLink.label}</span>
              </Link>
            ) : (
              <span />
            )}
            {helpButton ? (
              <PortalHelpFab
                C={C}
                theme={gardenTheme}
                organizationId={helpButton.organizationId}
                userEmail={helpButton.userEmail}
                currentPath={helpButton.currentPath}
                submitEndpoint={helpButton.submitEndpoint}
                readOnly={helpButton.readOnly}
                variant="inline"
                className="shrink-0 sm:hidden"
              />
            ) : null}
          </div>
          <ParentGardenPageHeader
            kicker="Enrollment checklist"
            title={title}
            subtitle="Complete each item below to finish enrollment."
          />
        </div>

        {/* Phones: progress + current task, with a picker for the full list. */}
        <div className={`${CHECKLIST_GUTTER_CLASS} shrink-0 pt-4 lg:hidden showcase:hidden`}>
          <GCard index={1} className="!p-4">
            <ChecklistProgress progress={progress} />
            {activeItem ? (
              <div className="mt-4 flex items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-3">
                <div className="min-w-0 flex-1">
                  <GKicker>Current task</GKicker>
                  <p className="m-0 mt-0.5 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
                    {activeItem.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTaskPickerOpen(true)}
                  className={`${gBtnOutlineSm} !px-3 !py-2 !text-[13px]`}
                >
                  Change
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ) : null}
          </GCard>
        </div>

        <div className={`${CHECKLIST_GUTTER_CLASS} flex min-h-0 flex-1 gap-5 pb-5 pt-5 sm:pb-7`}>
          <aside className="hidden w-[30%] min-w-[240px] max-w-[340px] shrink-0 flex-col showcase:flex lg:flex">
            <GCard
              index={1}
              kicker="Your checklist"
              title="Enrollment tasks"
              className="h-full min-h-0"
              bodyClassName="min-h-0"
            >
              <ChecklistProgress progress={progress} />
              <div className="-mx-2 mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-1">
                <ChecklistItemList
                  items={sidebarItems}
                  activeItemId={activeItemId}
                  instanceByTemplateId={instanceByTemplateId}
                  alternateItemIds={alternateItemIds}
                  onSelect={handleSelectItem}
                />
              </div>
            </GCard>
          </aside>

          <GCard
            index={2}
            className="h-full min-h-0 min-w-0 flex-1 !p-0"
            bodyClassName="min-h-0"
            data-testid="enrollment-checklist-item-card"
          >
            {activeKicker ? (
              <div className="shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 px-5 py-3 sm:px-6">
                <GKicker>{activeKicker}</GKicker>
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {detailPanel}
            </div>
          </GCard>
        </div>
      </ParentGardenFrame>

      <AnimatePresence>
        {taskPickerOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end justify-center p-4 pb-safe showcase:hidden lg:hidden"
            style={{ backgroundColor: "rgba(43, 36, 29, 0.45)" }}
            onClick={() => setTaskPickerOpen(false)}
          >
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: 24 }}
                transition={{ duration: 0.25, ease: PORTAL_EASE }}
                className={`${GARDEN_SCOPE_CLASS} max-h-[70dvh] w-full max-w-lg overflow-hidden rounded-[24px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_5px_0_0_var(--sf-ink)]`}
                style={gardenScopeStyle(gardenTheme)}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Select enrollment task"
              >
                <div className="flex items-center justify-between border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3">
                  <p className="sf-display m-0 text-[1.2rem] text-[var(--sf-ink)]">
                    Enrollment tasks
                  </p>
                  <button
                    type="button"
                    onClick={() => setTaskPickerOpen(false)}
                    className={`rounded-full p-1.5 text-[var(--sf-ink)]/60 hover:bg-[var(--sf-ink)]/5 ${G_FOCUS}`}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="max-h-[calc(70dvh-56px)] overflow-y-auto p-2">
                  <ChecklistItemList
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
    </>
  );
}
