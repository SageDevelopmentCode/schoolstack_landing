"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type {
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchPageBundle,
} from "@/lib/parent-portal/friday-branch/types";
import { computeSpotsRemaining } from "@/lib/parent-portal/friday-branch/load-parent-friday-branch";
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import {
  findBlockIdForClass,
  resolveValidClassId,
  syncFridayBranchClassUrl,
} from "./friday-branch-parent-utils";
import ParentFridayBranchBlockStrip from "./ParentFridayBranchBlockStrip";
import ParentFridayBranchClassSheet from "./ParentFridayBranchClassSheet";
import ParentFridayBranchSchedule from "./ParentFridayBranchSchedule";
import ParentFridayBranchStoryHeader from "./ParentFridayBranchStoryHeader";

type ParentFridayBranchPageProps = {
  organizationId: string;
  slug: string;
  initialBundle: ParentFridayBranchPageBundle;
  readOnly?: boolean;
  previewFamilyId?: string;
  previewBasePath?: string;
  initialClassId?: string;
  childrenPath?: string;
};

export default function ParentFridayBranchPage({
  organizationId,
  slug,
  initialBundle,
  readOnly = false,
  previewFamilyId,
  initialClassId,
  childrenPath,
}: ParentFridayBranchPageProps) {
  const { theme } = useParentTheme();
  const pathname = usePathname();

  const [bundle, setBundle] = useState(initialBundle);
  const [activeClassId, setActiveClassId] = useState<string | null>(() =>
    resolveValidClassId(initialClassId, initialBundle),
  );

  const initialBlockId = useMemo(() => {
    if (bundle.blocks.length === 0) return null;
    const blockForClass = findBlockIdForClass(bundle, activeClassId);
    if (blockForClass) return blockForClass;
    return bundle.blocks[0]?.block.id ?? null;
  }, [bundle, activeClassId]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(initialBlockId);

  useEffect(() => {
    const onPopState = () => {
      const classId = new URLSearchParams(window.location.search).get("class");
      const resolvedClassId = resolveValidClassId(classId, bundle);
      setActiveClassId(resolvedClassId);
      if (resolvedClassId) {
        const blockId = findBlockIdForClass(bundle, resolvedClassId);
        if (blockId) setSelectedBlockId(blockId);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [bundle]);

  const selectedBlock = useMemo(
    () => bundle.blocks.find((entry) => entry.block.id === selectedBlockId) ?? null,
    [bundle.blocks, selectedBlockId],
  );

  const selectedBlockMeta = useMemo(() => {
    if (!selectedBlock) return null;
    const blockIndex = bundle.blocks.findIndex(
      (entry) => entry.block.id === selectedBlock.block.id,
    );
    return {
      label: getBlockDisplayLabel(selectedBlock.block, blockIndex),
      dateRange: formatBlockTabDateRange(
        selectedBlock.block.startDate,
        selectedBlock.block.endDate,
      ),
    };
  }, [bundle.blocks, selectedBlock]);

  let activeClassContext: {
    summary: ParentFridayBranchPageBundle["blocks"][number]["classes"][number];
    blockLabel: string;
    blockDateRange: string;
  } | null = null;

  if (activeClassId) {
    for (let index = 0; index < bundle.blocks.length; index += 1) {
      const entry = bundle.blocks[index];
      const match = entry.classes.find((c) => c.classId === activeClassId);
      if (match) {
        activeClassContext = {
          summary: match,
          blockLabel: getBlockDisplayLabel(entry.block, index),
          blockDateRange: formatBlockTabDateRange(
            entry.block.startDate,
            entry.block.endDate,
          ),
        };
        break;
      }
    }
  }

  const openClass = useCallback(
    (classId: string) => {
      setActiveClassId(classId);
      const blockId = findBlockIdForClass(bundle, classId);
      if (blockId) setSelectedBlockId(blockId);
      syncFridayBranchClassUrl(pathname, classId);
    },
    [bundle, pathname],
  );

  const closeClass = useCallback(() => {
    setActiveClassId(null);
    syncFridayBranchClassUrl(pathname, null);
  }, [pathname]);

  const handleEnrollmentChange = useCallback(
    (classId: string, detail: ParentFridayBranchClassDetailBundle) => {
      setBundle((current) => ({
        ...current,
        blocks: current.blocks.map((entry) => ({
          ...entry,
          classes: entry.classes.map((classSummary) => {
            if (classSummary.classId !== classId) return classSummary;

            const familyEnrollments = detail.studentStates
              .filter((student) => student.status && student.enrollmentId)
              .map((student) => ({
                enrollmentId: student.enrollmentId!,
                studentId: student.studentId,
                status: student.status!,
              }));

            return {
              ...classSummary,
              confirmedCount: detail.confirmedCount,
              spotsRemaining: computeSpotsRemaining(detail.capacity, detail.confirmedCount),
              familyEnrollments,
            };
          }),
        })),
      }));
    },
    [],
  );

  const myChildrenHref =
    childrenPath ?? `/school/${slug}/parent/children`;

  return (
    <div className="mx-auto max-w-[1250px] px-4 py-6 sm:py-8 md:px-9">
      <ParentFridayBranchStoryHeader />

      {bundle.blocks.length === 0 ? (
        <ParentCard theme={theme} className="py-12 text-center">
          <CalendarDays
            className="mx-auto mb-3 h-10 w-10"
            style={{ color: "#B8C4BC" }}
          />
          <p className="text-sm font-medium" style={{ color: theme.ink }}>
            Schedule coming soon
          </p>
          <p className="mt-1 text-sm" style={{ color: theme.muted }}>
            Friday Branch classes will appear here when your school publishes them.
          </p>
        </ParentCard>
      ) : (
        <>
          <ParentFridayBranchBlockStrip
            theme={theme}
            blocks={bundle.blocks.map((entry) => entry.block)}
            selectedId={selectedBlockId}
            onSelect={(blockId) => {
              setSelectedBlockId(blockId);
              if (activeClassId) {
                const classInBlock = bundle.blocks
                  .find((entry) => entry.block.id === blockId)
                  ?.classes.some((classSummary) => classSummary.classId === activeClassId);
                if (!classInBlock) closeClass();
              }
            }}
          />

          {bundle.studentOptions.length === 0 ? (
            <ParentCard theme={theme} className="mb-5 py-8 text-center">
              <p className="text-sm" style={{ color: theme.muted }}>
                Add a child under My children before signing up for Friday Branch classes.
              </p>
              <ParentButtonLink
                theme={theme}
                href={myChildrenHref}
                className="mt-4 inline-flex"
              >
                Go to My children
              </ParentButtonLink>
            </ParentCard>
          ) : null}

          {selectedBlock && selectedBlock.classes.length > 0 && selectedBlockMeta ? (
            <ParentFridayBranchSchedule
              theme={theme}
              classes={selectedBlock.classes}
              studentOptions={bundle.studentOptions}
              blockLabel={selectedBlockMeta.label}
              blockDateRange={selectedBlockMeta.dateRange}
              readOnly={readOnly}
              onOpenClass={openClass}
            />
          ) : (
            <ParentCard theme={theme} className="py-12 text-center">
              <p className="text-sm" style={{ color: theme.muted }}>
                No classes published yet for this block.
              </p>
            </ParentCard>
          )}
        </>
      )}

      <ParentFridayBranchClassSheet
        theme={theme}
        open={Boolean(activeClassId)}
        organizationId={organizationId}
        classId={activeClassId}
        fallbackSummary={activeClassContext?.summary ?? null}
        blockLabel={activeClassContext?.blockLabel ?? selectedBlockMeta?.label}
        blockDateRange={activeClassContext?.blockDateRange ?? selectedBlockMeta?.dateRange}
        studentOptions={bundle.studentOptions}
        readOnly={readOnly}
        previewFamilyId={previewFamilyId}
        onClose={closeClass}
        onEnrollmentChange={handleEnrollmentChange}
      />
    </div>
  );
}
