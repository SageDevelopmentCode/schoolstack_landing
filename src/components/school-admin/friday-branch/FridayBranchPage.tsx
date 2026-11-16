"use client";

import { useMemo, useRef, useState } from "react";
import { CalendarRange, Copy, PauseCircle, Pencil, PlayCircle, Plus } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  AdminGardenPageSkeleton,
  BusyLabel,
  GardenEmptyState,
  GardenLoadError,
  GardenNotice,
  GardenSaveBar,
} from "@/components/school-admin/garden/kit";
import { GCard, GChip, G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { buildParentThemeTokens, parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  countBlockClasses,
  formatBlockTabDateRange,
  getBlockDisplayLabel,
  getScheduleGaps,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import FridayBranchBlockDetailsSheet from "./FridayBranchBlockDetailsSheet";
import FridayBranchRecentActivity from "./FridayBranchRecentActivity";
import FridayBranchScheduleCard from "./FridayBranchScheduleCard";
import { useFridayBranchModel } from "./useFridayBranchModel";

type FridayBranchPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialParentPortalPaused?: boolean;
};

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export default function FridayBranchPage({
  organizationId,
  branding,
  slug,
  initialParentPortalPaused = false,
}: FridayBranchPageProps) {
  void slug;
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const model = useFridayBranchModel({ organizationId, initialParentPortalPaused });
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [highlightClassId, setHighlightClassId] = useState<string | null>(null);
  const [requestedClassId, setRequestedClassId] = useState<string | null>(null);

  const flashClass = (classId: string) => {
    setHighlightClassId(classId);
    scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setHighlightClassId(null), 3000);
  };

  const handleOpenClass = (classId: string, blockId: string) => {
    model.setSelectedBlockId(blockId);
    setRequestedClassId(classId);
    flashClass(classId);
  };

  const handleReviewGaps = () => {
    if (!model.selectedBlock) return;
    const gaps = getScheduleGaps(model.selectedBlock);
    if (gaps.length) flashClass(gaps[0].classId);
  };

  const subtitle = model.loaded
    ? [
        plural(model.blocks.length, "block"),
        plural(model.totalClasses, "class", "classes"),
        model.parentPortalPaused ? "parent signup paused" : "parent signup open",
      ].join(" · ")
    : "Pick a block, then build its Friday classes by time.";

  const busy = !model.loaded || model.saving;

  let content;
  if (model.status === "loading") {
    content = <AdminGardenPageSkeleton label="Loading Friday Branch" layout="table" />;
  } else if (model.status === "error") {
    content = (
      <GardenLoadError
        title="The Friday Branch schedule didn't load"
        description={`${model.loadError ?? "Something went wrong."} Saving is off until it loads, so your real schedule stays safe.`}
        onRetry={() => void model.retryLoad()}
        retrying={model.retrying}
      />
    );
  } else {
    content = (
      <>
        {/* Block picker */}
        <section aria-label="Blocks" className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Blocks</p>
            {model.selectedBlock ? (
              <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">Pick a block, then build its Friday classes by time.</p>
            ) : null}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="radiogroup" aria-label="Choose a block">
            {model.blocks.map((block, index) => {
              const active = block.id === model.selectedBlockId;
              const gaps = getScheduleGaps(block).length;
              return (
                <button
                  key={block.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => model.setSelectedBlockId(block.id)}
                  className={`flex min-w-[150px] shrink-0 flex-col items-start gap-1 rounded-[18px] border-[1.5px] px-4 py-3 text-left transition-all ${
                    active
                      ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_3px_0_0_var(--sf-ink)]"
                      : "border-[var(--sf-ink)]/12 bg-white text-[var(--sf-ink)] hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30"
                  } ${G_FOCUS}`}
                  data-testid={`friday-branch-block-${index}`}
                >
                  <span className="text-[14px] font-extrabold">{getBlockDisplayLabel(block, index)}</span>
                  <span className={`text-[12px] font-semibold ${active ? "text-white/80" : "text-[var(--sf-soft)]"}`}>
                    {formatBlockTabDateRange(block.startDate, block.endDate)}
                  </span>
                  <span className={`text-[12px] font-bold tabular-nums ${active ? "text-white/85" : "text-[var(--sf-ink)]/60"}`}>
                    {plural(countBlockClasses(block), "class", "classes")}
                    {gaps ? ` · ${gaps} to fix` : ""}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={model.addBlock}
              className={`flex min-w-[140px] shrink-0 items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed border-[var(--sf-ink)]/20 px-4 py-3 text-[14px] font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:border-[var(--sf-clay)]/60 hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
              data-testid="friday-branch-add-block"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add block
            </button>
          </div>
        </section>

        {model.selectedBlock ? (
          <div ref={scheduleRef} className="scroll-mt-4">
            <FridayBranchScheduleCard
              C={C}
              theme={theme}
              organizationId={organizationId}
              block={model.selectedBlock}
              onChange={model.updateBlock}
              onLocalChange={model.replaceBlockWithUndo}
              onClassSaved={(nextBlock) => model.saveClass(nextBlock)}
              saving={model.saving}
              highlightClassId={highlightClassId}
              requestedClassId={requestedClassId}
              onRequestedClassHandled={() => setRequestedClassId(null)}
              onReviewGaps={handleReviewGaps}
              headerActions={
                <>
                  <button type="button" className={gBtnOutlineSm} onClick={() => model.setBlockDetailsOpen(true)} disabled={busy} data-testid="friday-branch-edit-block">
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit block details
                  </button>
                  <button type="button" className={gBtnOutlineSm} onClick={model.duplicateSelected} disabled={busy} data-testid="friday-branch-duplicate-block">
                    <Copy className="h-4 w-4" aria-hidden />
                    Duplicate block
                  </button>
                </>
              }
            />
          </div>
        ) : (
          <GCard index={2} kicker="Schedule">
            <GardenEmptyState
              icon={CalendarRange}
              title="No blocks yet"
              description="Add a block to start building your Friday Branch schedule."
              action={
                <button type="button" className={gBtnPopSm} onClick={model.addBlock}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Add block
                </button>
              }
            />
          </GCard>
        )}

        {model.isDirty || model.savedAt ? (
          <GardenSaveBar
            dirty={model.isDirty}
            saving={model.saving}
            savedAt={model.savedAt}
            onSave={() => void model.save()}
            onDiscard={model.discard}
            saveLabel="Save schedule"
            disabled={!model.loaded}
            extra={
              model.isDirty ? (
                <GChip tone="warning">{plural(model.changedBlockCount, "block")} changed</GChip>
              ) : null
            }
            data-testid="friday-branch-save-bar"
          />
        ) : null}

        <FridayBranchRecentActivity organizationId={organizationId} onOpenClass={handleOpenClass} />
      </>
    );
  }

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      data-testid="admin-friday-branch-page"
      overlays={
        <>
          <FridayBranchBlockDetailsSheet
            open={model.blockDetailsOpen}
            onClose={() => model.setBlockDetailsOpen(false)}
            block={model.selectedBlock}
            onChange={model.updateBlock}
            theme={theme}
            C={C}
          />
          <ConfirmDialog
            C={C}
            open={model.pauseDialogOpen}
            title="Pause parent signup?"
            description="Families will not see Friday Branch on the parent portal or mobile app until you resume. Existing enrollments stay on your roster."
            confirmLabel="Pause parent signup"
            cancelLabel="Keep open"
            variant="destructive"
            loading={model.togglingPause}
            onConfirm={() => void model.confirmPause()}
            onClose={model.closePauseDialog}
          />
          <ConfirmDialog
            C={C}
            open={model.leaveDialogOpen}
            title="Unsaved changes"
            description="You have unsaved changes. If you leave now, your changes will be lost."
            confirmLabel="Leave without saving"
            cancelLabel="Keep editing"
            variant="destructive"
            onConfirm={model.confirmLeave}
            onClose={model.cancelLeave}
          />
        </>
      }
    >
      <AdminGardenPageHeader
        kicker="My school · Friday Branch"
        title={
          <>
            Program <span className="text-[var(--sf-clay)]">schedule</span>
          </>
        }
        subtitle={subtitle}
        actions={
          model.loaded && !model.parentPortalPaused ? (
            <button
              type="button"
              className={gBtnOutlineSm}
              onClick={model.openPauseDialog}
              disabled={busy || model.togglingPause}
              data-testid="friday-branch-pause"
            >
              <PauseCircle className="h-4 w-4" aria-hidden />
              Pause parent signup
            </button>
          ) : null
        }
      />

      {model.loaded && model.parentPortalPaused ? (
        <GardenNotice
          tone="warning"
          icon={PauseCircle}
          title="Parent signup is paused"
          role="status"
          action={
            <button
              type="button"
              className={gBtnOutlineSm}
              onClick={() => void model.resume()}
              disabled={model.togglingPause}
              aria-busy={model.togglingPause || undefined}
              data-testid="friday-branch-resume"
            >
              <BusyLabel busy={model.togglingPause} busyLabel="Resuming…" icon={<PlayCircle className="h-4 w-4" aria-hidden />}>
                Resume parent signup
              </BusyLabel>
            </button>
          }
        >
          Parent signup is hidden on the parent portal until you resume.
        </GardenNotice>
      ) : null}

      {content}
    </AdminGardenPage>
  );
}
