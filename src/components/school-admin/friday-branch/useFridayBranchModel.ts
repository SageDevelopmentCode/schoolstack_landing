"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  countFridayBranchClasses,
  createEmptyBlock,
  duplicateBlock,
  getBlockDisplayLabel,
  getScheduleGaps,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import { diffRemovedFridayBranchFlyerPaths } from "@/lib/school-admin/friday-branch/friday-branch-flyer-paths";
import { removeFridayBranchClassFlyer } from "@/lib/school-admin/friday-branch/friday-branch-class-flyer-storage";
import { putFridayBranchSchedule } from "@/lib/school-admin/friday-branch/friday-branch-schedule-api";
import { patchFridayBranchSettings } from "@/lib/school-admin/friday-branch/friday-branch-settings-api";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";
import { createClient } from "@/utils/supabase/client";

/*
 * Friday Branch view-model (admin Garden). Two save modes, as before:
 *  - class edits (add slot, add/edit class) save the whole schedule at once;
 *  - block edits (add / duplicate / details / delete rows) stay local until
 *    "Save schedule".
 * A failed load shows an error and keeps Save disabled, so an empty screen can
 * never overwrite the real schedule.
 */

function cloneBlocks(blocks: FridayBranchBlock[]): FridayBranchBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as FridayBranchBlock[];
}

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export function useFridayBranchModel({
  organizationId,
  initialParentPortalPaused,
}: {
  organizationId: string;
  initialParentPortalPaused: boolean;
}) {
  const router = useRouter();
  const action = useAdminAction();
  const [blocks, setBlocks] = useState<FridayBranchBlock[]>([]);
  const [savedBlocks, setSavedBlocks] = useState<FridayBranchBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [parentPortalPaused, setParentPortalPaused] = useState(initialParentPortalPaused);
  const [prevInitialPaused, setPrevInitialPaused] = useState(initialParentPortalPaused);
  if (initialParentPortalPaused !== prevInitialPaused) {
    setPrevInitialPaused(initialParentPortalPaused);
    setParentPortalPaused(initialParentPortalPaused);
  }
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [blockDetailsOpen, setBlockDetailsOpen] = useState(false);
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const loaded = status === "ready";
  const selectedBlock = useMemo(() => blocks.find((b) => b.id === selectedBlockId) ?? null, [blocks, selectedBlockId]);
  const selectedIndex = selectedBlock ? blocks.indexOf(selectedBlock) : -1;
  const isDirty = useMemo(() => loaded && JSON.stringify(blocks) !== JSON.stringify(savedBlocks), [blocks, loaded, savedBlocks]);
  const changedBlockCount = useMemo(() => {
    if (!isDirty) return 0;
    const savedById = new Map(savedBlocks.map((b) => [b.id, JSON.stringify(b)]));
    let count = 0;
    for (const block of blocks) if (savedById.get(block.id) !== JSON.stringify(block)) count += 1;
    const ids = new Set(blocks.map((b) => b.id));
    for (const block of savedBlocks) if (!ids.has(block.id)) count += 1;
    return count;
  }, [blocks, isDirty, savedBlocks]);

  const guard = useUnsavedChangesGuard({ isDirty, enabled: loaded });

  const loadSchedule = useCallback(async () => {
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
      setLoadError(null);
      setStatus("ready");
    } catch (err) {
      const message = formatActionError(err, "Failed to load Friday Branch schedule.");
      setLoadError(message);
      setStatus("error");
      void reportClientOperationalError({ organizationId, operation: "friday_branch.schedule.load", error: message });
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSchedule();
    });
  }, [loadSchedule]);

  const retryLoad = useCallback(async () => {
    setRetrying(true);
    await loadSchedule();
    setRetrying(false);
  }, [loadSchedule]);

  /* ---- local block edits ---- */
  const addBlock = useCallback(() => {
    const nextBlock = createEmptyBlock(blocksRef.current.length + 1);
    setBlocks((current) => [...current, nextBlock]);
    setSelectedBlockId(nextBlock.id);
    adminToast.info(`${getBlockDisplayLabel(nextBlock, blocksRef.current.length)} added.`, {
      id: "friday-branch-block-added",
      description: "Set its dates and add time slots, then Save schedule.",
      action: { label: "Edit details", onClick: () => setBlockDetailsOpen(true) },
    });
  }, []);

  const duplicateSelected = useCallback(() => {
    if (!selectedBlock) return;
    const copy = duplicateBlock(selectedBlock);
    setBlocks((current) => [...current, copy]);
    setSelectedBlockId(copy.id);
    adminToast.info("Block duplicated.", {
      id: "friday-branch-block-duplicated",
      description: "Classes were copied. Update the dates, then Save schedule.",
      action: { label: "Edit details", onClick: () => setBlockDetailsOpen(true) },
    });
  }, [selectedBlock]);

  const updateBlock = useCallback((nextBlock: FridayBranchBlock) => {
    setBlocks((current) => current.map((block) => (block.id === nextBlock.id ? nextBlock : block)));
  }, []);

  /** Local removal (class or slot) with Undo; saved with "Save schedule". */
  const replaceBlockWithUndo = useCallback(
    (nextBlock: FridayBranchBlock, title: string) => {
      const previous = blocksRef.current.find((b) => b.id === nextBlock.id);
      updateBlock(nextBlock);
      adminToast.info(title, {
        id: "friday-branch-local-change",
        description: "Not saved yet. Use Save schedule to keep it.",
        duration: 8000,
        action: previous ? { label: "Undo", onClick: () => updateBlock(previous) } : undefined,
      });
    },
    [updateBlock],
  );

  const discard = useCallback(() => {
    setBlocks(cloneBlocks(savedBlocks));
    setSelectedBlockId((current) => (current && savedBlocks.some((b) => b.id === current) ? current : savedBlocks[0]?.id ?? null));
  }, [savedBlocks]);

  /* ---- persistence ---- */
  const persistSchedule = useCallback(
    async (blocksToSave: FridayBranchBlock[], copy: { title: string; description?: string }) => {
      if (!loaded) return false;
      const pathsToDelete = diffRemovedFridayBranchFlyerPaths(savedBlocks, blocksToSave);
      const result = await action.run(
        async () => {
          try {
            const nextBlocks = await putFridayBranchSchedule(organizationId, blocksToSave);
            setBlocks(cloneBlocks(nextBlocks));
            setSavedBlocks(cloneBlocks(nextBlocks));
            setSelectedBlockId((current) =>
              current && nextBlocks.some((b) => b.id === current) ? current : nextBlocks[0]?.id ?? null,
            );
            setSavedAt(Date.now());
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
            return nextBlocks;
          } catch (err) {
            void reportClientOperationalError({
              organizationId,
              operation: "friday_branch.schedule.save",
              error: formatActionError(err, "Failed to save Friday Branch schedule."),
            });
            throw err;
          }
        },
        {
          key: "friday-branch-save",
          id: "friday-branch-save",
          success: (nextBlocks) => ({
            title: copy.title,
            description:
              copy.description ??
              `${plural(nextBlocks.length, "block")} and ${plural(countFridayBranchClasses(nextBlocks), "class", "classes")} saved.`,
          }),
          error: {
            title: "Couldn't save the Friday Branch schedule.",
            description: "Your changes are still on screen. Nothing was saved.",
            fallback: "Failed to save Friday Branch schedule.",
          },
        },
      );
      return result.ok;
    },
    [action, loaded, organizationId, savedBlocks],
  );

  const save = useCallback(() => persistSchedule(blocksRef.current, { title: "Friday Branch schedule saved." }), [persistSchedule]);

  const saveClass = useCallback(
    async (nextBlock: FridayBranchBlock, title = "Class saved.") => {
      const blocksToSave = blocksRef.current.map((b) => (b.id === nextBlock.id ? nextBlock : b));
      setBlocks(cloneBlocks(blocksToSave));
      const ok = await persistSchedule(blocksToSave, {
        title,
        description: "Saved to the schedule right away.",
      });
      if (!ok) throw new Error("not saved");
    },
    [persistSchedule],
  );

  /* ---- parent signup pause ---- */
  const resume = useCallback(async () => {
    const result = await action.run(
      async () => {
        try {
          const settings = await patchFridayBranchSettings(organizationId, { parent_portal_paused: false });
          setParentPortalPaused(settings.parent_portal_paused);
          router.refresh();
        } catch (err) {
          void reportClientOperationalError({
            organizationId,
            operation: "friday_branch.settings.resume",
            error: formatActionError(err, "Failed to resume parent signup."),
          });
          throw err;
        }
      },
      {
        key: "friday-branch-pause",
        id: "friday-branch-pause",
        success: { title: "Parent signup resumed.", description: "Families can see Friday Branch and sign up again." },
        error: { title: "Couldn't resume parent signup.", description: "Signup is still paused.", fallback: "Failed to resume parent signup." },
      },
    );
    return result.ok;
  }, [action, organizationId, router]);

  const confirmPause = useCallback(async () => {
    const result = await action.run(
      async () => {
        try {
          const settings = await patchFridayBranchSettings(organizationId, { parent_portal_paused: true });
          setParentPortalPaused(settings.parent_portal_paused);
          router.refresh();
        } catch (err) {
          void reportClientOperationalError({
            organizationId,
            operation: "friday_branch.settings.pause",
            error: formatActionError(err, "Failed to pause parent signup."),
          });
          throw err;
        }
      },
      {
        key: "friday-branch-pause",
        id: "friday-branch-pause",
        success: {
          title: "Parent signup paused.",
          description: "Families won't see Friday Branch until you resume. Existing enrollments stay on your roster.",
        },
        error: { title: "Couldn't pause parent signup.", description: "Signup is still open.", fallback: "Failed to pause parent signup." },
      },
    );
    if (result.ok) setPauseDialogOpen(false);
  }, [action, organizationId, router]);

  const totalClasses = useMemo(() => countFridayBranchClasses(blocks), [blocks]);
  const gaps = useMemo(() => (selectedBlock ? getScheduleGaps(selectedBlock) : []), [selectedBlock]);

  return {
    status,
    loaded,
    loadError,
    retrying,
    retryLoad,
    blocks,
    selectedBlock,
    selectedIndex,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    duplicateSelected,
    updateBlock,
    replaceBlockWithUndo,
    isDirty,
    changedBlockCount,
    discard,
    save,
    saveClass,
    saving: action.pendingKey === "friday-branch-save",
    savedAt,
    parentPortalPaused,
    togglingPause: action.pendingKey === "friday-branch-pause",
    resume,
    pauseDialogOpen,
    openPauseDialog: () => setPauseDialogOpen(true),
    closePauseDialog: () => setPauseDialogOpen(false),
    confirmPause,
    blockDetailsOpen,
    setBlockDetailsOpen,
    totalClasses,
    gaps,
    leaveDialogOpen: guard.dialogOpen,
    confirmLeave: guard.confirmLeave,
    cancelLeave: guard.cancelLeave,
  };
}

export type FridayBranchModel = ReturnType<typeof useFridayBranchModel>;
