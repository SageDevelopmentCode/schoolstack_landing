"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  cloneDemoBlocks,
  createEmptyBlock,
  DEMO_FRIDAY_BRANCH_BLOCKS,
  duplicateBlock,
  getScheduleGaps,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";
import FridayBranchBlockHero from "./FridayBranchBlockHero";
import FridayBranchBlockStrip from "./FridayBranchBlockStrip";
import FridayBranchFocusStrip from "./FridayBranchFocusStrip";
import FridayBranchMetrics from "./FridayBranchMetrics";
import FridayBranchPlanningPanels from "./FridayBranchPlanningPanels";
import FridayBranchScheduleCard from "./FridayBranchScheduleCard";

type FridayBranchPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

export default function FridayBranchPage({
  organizationId,
  branding,
  slug,
}: FridayBranchPageProps) {
  void organizationId;
  void branding;
  void slug;

  const { theme, C } = useSchoolAdminStoryTheme();
  const reduceMotion = useReducedMotion();
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<FridayBranchBlock[]>(cloneDemoBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    DEMO_FRIDAY_BRANCH_BLOCKS[0]?.id ?? null,
  );
  const [highlightClassId, setHighlightClassId] = useState<string | null>(null);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const handleAddBlock = () => {
    const nextBlock = createEmptyBlock(blocks.length + 3);
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

  const handleReviewGaps = () => {
    if (!selectedBlock) return;
    const gaps = getScheduleGaps(selectedBlock);
    if (gaps.length === 0) return;
    setHighlightClassId(gaps[0].classId);
    scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setHighlightClassId(null), 3000);
  };

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: "easeOut" as const };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-[21px] flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <AdminSectionKicker theme={theme}>Friday Branch · program schedule</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1.5">
            Make Fridays feel thoughtfully held.
          </AdminDisplayHeading>
          <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
            Build each date-range block, then shape a clear rhythm of classes, places, and age groups.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton theme={theme} variant="primary" type="button" onClick={handleAddBlock}>
            + Add program block
          </AdminButton>
          <AdminButton theme={theme} variant="outline" type="button" onClick={handleDuplicateBlock} disabled={!selectedBlock}>
            Duplicate block
          </AdminButton>
          <AdminButton theme={theme} variant="primary" type="button" disabled title="Saving coming soon">
            Save schedule
          </AdminButton>
        </div>
      </div>

      <FridayBranchMetrics theme={theme} blocks={blocks} selectedBlock={selectedBlock} />

      {selectedBlock ? (
        <div className="mt-[19px]">
          <FridayBranchFocusStrip
            theme={theme}
            block={selectedBlock}
            onReviewGaps={handleReviewGaps}
          />
        </div>
      ) : null}

      <div className="mt-[18px]">
        <FridayBranchBlockStrip
          theme={theme}
          blocks={blocks}
          selectedId={selectedBlockId}
          onSelect={setSelectedBlockId}
          onAddBlock={handleAddBlock}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedBlock ? (
          <motion.div
            key={selectedBlock.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={transition}
          >
            <div className="mt-[17px]">
              <FridayBranchBlockHero
                C={C}
                theme={theme}
                block={selectedBlock}
                onChange={handleUpdateBlock}
              />
            </div>

            <div ref={scheduleRef}>
              <FridayBranchScheduleCard
                C={C}
                theme={theme}
                block={selectedBlock}
                onChange={handleUpdateBlock}
                highlightClassId={highlightClassId}
              />
            </div>

            <FridayBranchPlanningPanels
              theme={theme}
              block={selectedBlock}
              onReviewGaps={handleReviewGaps}
            />
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

      <p className="mt-6 text-[11px]" style={{ color: theme.muted }}>
        Preview mode — changes reset on refresh. Saving coming soon.
      </p>
    </div>
  );
}
