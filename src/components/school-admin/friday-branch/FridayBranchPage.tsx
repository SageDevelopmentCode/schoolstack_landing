"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { FridayBranchPageSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  createEmptyBlock,
  duplicateBlock,
  getScheduleGaps,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import { diffRemovedFridayBranchFlyerPaths } from "@/lib/school-admin/friday-branch/friday-branch-flyer-paths";
import { removeFridayBranchClassFlyer } from "@/lib/school-admin/friday-branch/friday-branch-class-flyer-storage";
import { putFridayBranchSchedule } from "@/lib/school-admin/friday-branch/friday-branch-schedule-api";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";
import { createClient } from "@/utils/supabase/client";
import FridayBranchBlockDetailsSheet from "./FridayBranchBlockDetailsSheet";
import FridayBranchBlockStrip from "./FridayBranchBlockStrip";
import FridayBranchRecentActivity from "./FridayBranchRecentActivity";
import FridayBranchScheduleCard from "./FridayBranchScheduleCard";

type FridayBranchPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

function cloneBlocks(blocks: FridayBranchBlock[]): FridayBranchBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as FridayBranchBlock[];
}

export default function FridayBranchPage({
  organizationId,
  branding,
  slug,
}: FridayBranchPageProps) {
  void branding;
  void slug;

  const { theme, C } = useSchoolAdminStoryTheme();
  const reduceMotion = useReducedMotion();
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<FridayBranchBlock[]>([]);
  const [savedBlocks, setSavedBlocks] = useState<FridayBranchBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [highlightClassId, setHighlightClassId] = useState<string | null>(null);
  const [requestedClassId, setRequestedClassId] = useState<string | null>(null);
  const [blockDetailsOpen, setBlockDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const isDirty = useMemo(
    () => JSON.stringify(blocks) !== JSON.stringify(savedBlocks),
    [blocks, savedBlocks],
  );

  const { dialogOpen: leaveDialogOpen, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard({ isDirty, enabled: !loading });

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/school-admin/friday-branch/schedule?organizationId=${encodeURIComponent(organizationId)}`,
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Failed to load Friday Branch schedule.");
      }

      const payload = (await response.json()) as { blocks: FridayBranchBlock[] };
      const nextBlocks = payload.blocks ?? [];
      setBlocks(cloneBlocks(nextBlocks));
      setSavedBlocks(cloneBlocks(nextBlocks));
      setSelectedBlockId(nextBlocks[0]?.id ?? null);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load Friday Branch schedule."));
      void reportClientOperationalError({
        organizationId,
        operation: "friday_branch.schedule.load",
        error: formatActionError(err, "Failed to load Friday Branch schedule."),
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSchedule();
    });
  }, [loadSchedule]);

  const handleAddBlock = () => {
    const nextBlock = createEmptyBlock(blocks.length + 1);
    setBlocks((current) => [...current, nextBlock]);
    setSelectedBlockId(nextBlock.id);
  };

  const handleDuplicateBlock = () => {
    if (!selectedBlock) return;
    const copy = duplicateBlock(selectedBlock);
    setBlocks((current) => [...current, copy]);
    setSelectedBlockId(copy.id);
  };

  const handleUpdateBlock = (nextBlock: FridayBranchBlock) => {
    setBlocks((current) =>
      current.map((block) => (block.id === nextBlock.id ? nextBlock : block)),
    );
  };

  const handleOpenClass = (classId: string, blockId: string) => {
    setSelectedBlockId(blockId);
    setRequestedClassId(classId);
    setHighlightClassId(classId);
    scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setHighlightClassId(null), 3000);
  };

  const handleReviewGaps = () => {
    if (!selectedBlock) return;
    const gaps = getScheduleGaps(selectedBlock);
    if (gaps.length === 0) return;
    setHighlightClassId(gaps[0].classId);
    scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setHighlightClassId(null), 3000);
  };

  const persistSchedule = useCallback(
    async (blocksToSave: FridayBranchBlock[], successMessage: string) => {
      const pathsToDelete = diffRemovedFridayBranchFlyerPaths(savedBlocks, blocksToSave);
      setSaving(true);
      try {
        const nextBlocks = await putFridayBranchSchedule(organizationId, blocksToSave);
        setBlocks(cloneBlocks(nextBlocks));
        setSavedBlocks(cloneBlocks(nextBlocks));
        setSelectedBlockId((current) => {
          if (current && nextBlocks.some((block) => block.id === current)) {
            return current;
          }
          return nextBlocks[0]?.id ?? null;
        });

        if (pathsToDelete.length > 0) {
          const supabase = createClient();
          for (const path of pathsToDelete) {
            try {
              await removeFridayBranchClassFlyer(supabase, path);
            } catch {
              // Best-effort cleanup of orphaned flyer files.
            }
          }
        }

        adminToast.success(successMessage);
      } catch (err) {
        adminToast.error(formatActionError(err, "Failed to save Friday Branch schedule."));
        void reportClientOperationalError({
          organizationId,
          operation: "friday_branch.schedule.save",
          error: formatActionError(err, "Failed to save Friday Branch schedule."),
        });
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, savedBlocks],
  );

  const handleSave = async () => {
    await persistSchedule(blocks, "Friday Branch schedule saved");
  };

  const handleClassSaved = useCallback(
    async (nextBlock: FridayBranchBlock) => {
      let blocksToSave: FridayBranchBlock[] = [];
      setBlocks((current) => {
        blocksToSave = current.map((block) =>
          block.id === nextBlock.id ? nextBlock : block,
        );
        return cloneBlocks(blocksToSave);
      });
      await persistSchedule(blocksToSave, "Class saved");
    },
    [persistSchedule],
  );

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: "easeOut" as const };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <AdminSectionKicker theme={theme}>Friday Branch</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1.5">
            Program schedule
          </AdminDisplayHeading>
          <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
            Pick a block, then build its Friday classes by time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isDirty && !saving ? (
            <span className="text-xs" style={{ color: theme.muted }}>
              Unsaved changes
            </span>
          ) : null}
          <AdminButton
            theme={theme}
            variant="outline"
            type="button"
            onClick={handleDuplicateBlock}
            disabled={loading || !selectedBlock || saving}
          >
            Duplicate block
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="outline"
            type="button"
            onClick={() => setBlockDetailsOpen(true)}
            disabled={loading || !selectedBlock || saving}
          >
            Edit block details
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            type="button"
            onClick={handleSave}
            disabled={loading || !isDirty || saving}
          >
            {saving ? "Saving…" : "Save schedule"}
          </AdminButton>
        </div>
      </div>

      {loading ? (
        <FridayBranchPageSkeleton C={C} />
      ) : (
        <>
          <FridayBranchBlockStrip
            theme={theme}
            blocks={blocks}
            selectedId={selectedBlockId}
            onSelect={setSelectedBlockId}
            onAddBlock={handleAddBlock}
          />

          <AnimatePresence mode="wait">
            {selectedBlock ? (
              <motion.div
                key={selectedBlock.id}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={transition}
              >
                <div ref={scheduleRef} className="mt-4">
                  <FridayBranchScheduleCard
                    C={C}
                    theme={theme}
                    organizationId={organizationId}
                    block={selectedBlock}
                    onChange={handleUpdateBlock}
                    onClassSaved={handleClassSaved}
                    saving={saving}
                    highlightClassId={highlightClassId}
                    requestedClassId={requestedClassId}
                    onRequestedClassHandled={() => setRequestedClassId(null)}
                    onReviewGaps={handleReviewGaps}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 py-16 text-center"
              >
                <p className="text-sm" style={{ color: theme.muted }}>
                  Add a block to start building your Friday Branch schedule.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading ? (
            <FridayBranchRecentActivity
              C={C}
              theme={theme}
              organizationId={organizationId}
              onOpenClass={handleOpenClass}
            />
          ) : null}
        </>
      )}

      <FridayBranchBlockDetailsSheet
        open={blockDetailsOpen}
        onClose={() => setBlockDetailsOpen(false)}
        block={selectedBlock}
        onChange={handleUpdateBlock}
        theme={theme}
        C={C}
      />

      <ConfirmDialog
        C={C}
        open={leaveDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={confirmLeave}
        onClose={cancelLeave}
      />
    </div>
  );
}
