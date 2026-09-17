"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { BuilderSectionIntro } from "@/components/school-admin/admissions/builder-question-card";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  createEmptyBlock,
  DEMO_FRIDAY_BRANCH_BLOCKS,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";
import FridayBranchBlockHeader from "./FridayBranchBlockHeader";
import FridayBranchBlockTabs from "./FridayBranchBlockTabs";
import FridayBranchScheduleTimeline from "./FridayBranchScheduleTimeline";

type FridayBranchPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

function cloneDemoBlocks(): FridayBranchBlock[] {
  return DEMO_FRIDAY_BRANCH_BLOCKS.map((block) => ({
    ...block,
    slots: block.slots.map((slot) => ({
      ...slot,
      classes: slot.classes.map((classEntry) => ({ ...classEntry })),
    })),
  }));
}

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
  const [blocks, setBlocks] = useState<FridayBranchBlock[]>(cloneDemoBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    DEMO_FRIDAY_BRANCH_BLOCKS[0]?.id ?? null,
  );

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const handleAddBlock = () => {
    const nextBlock = createEmptyBlock(blocks.length + 1);
    setBlocks((current) => [...current, nextBlock]);
    setSelectedBlockId(nextBlock.id);
  };

  const handleUpdateBlock = (nextBlock: FridayBranchBlock) => {
    setBlocks((current) =>
      current.map((block) => (block.id === nextBlock.id ? nextBlock : block)),
    );
  };

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: "easeOut" as const };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
      <div className="mb-6">
        <BuilderSectionIntro
          C={C}
          theme={theme}
          eyebrow="Friday Branch"
          title="Program blocks & schedule"
          subtitle="Set a date-range block, then lay out each Friday's classes by time."
        />
      </div>

      <AdminCard theme={theme} padding="canvas" className="!p-0">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6 lg:px-7 lg:pt-7">
          <FridayBranchBlockTabs
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
                className="mt-6"
              >
                <FridayBranchBlockHeader
                  C={C}
                  theme={theme}
                  block={selectedBlock}
                  onChange={handleUpdateBlock}
                />

                <div className="mt-6">
                  <FridayBranchScheduleTimeline
                    C={C}
                    theme={theme}
                    block={selectedBlock}
                    onChange={handleUpdateBlock}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <p className="text-sm" style={{ color: theme.muted }}>
                  Add a block to start building your Friday Branch schedule.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-6 lg:px-7"
          style={{ borderColor: "#EEF2EE" }}
        >
          <p className="text-xs" style={{ color: theme.muted }}>
            Preview mode — saving coming soon. Changes reset on refresh.
          </p>
          <AdminButton theme={theme} variant="primary" type="button" disabled>
            Save schedule
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}
