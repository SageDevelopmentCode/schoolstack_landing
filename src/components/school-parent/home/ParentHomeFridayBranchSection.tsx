"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import ParentFridayBranchClassSheet from "@/components/school-parent/friday-branch/ParentFridayBranchClassSheet";
import {
  getFridayBranchSpotsBadge,
  studentNameById,
} from "@/components/school-parent/friday-branch/friday-branch-parent-utils";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { computeSpotsRemaining } from "@/lib/parent-portal/friday-branch/load-parent-friday-branch";
import type {
  ParentFridayBranchBlockSummary,
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchClassSummary,
  ParentFridayBranchPageBundle,
} from "@/lib/parent-portal/friday-branch/types";
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";

type ParentHomeFridayBranchSectionProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  schoolSlug: string;
  initialBundle: ParentFridayBranchPageBundle;
  previewMode?: boolean;
  previewFamilyId?: string;
  parentNavBasePath?: string;
};

const MAX_ROWS = 3;

function selectDisplayBlock(
  bundle: ParentFridayBranchPageBundle,
): ParentFridayBranchBlockSummary | null {
  if (bundle.blocks.length === 0) return null;

  const current = bundle.blocks.find((entry) => entry.block.status === "current");
  if (current) return current;

  const upcoming = bundle.blocks.find((entry) => entry.block.status === "upcoming");
  if (upcoming) return upcoming;

  return bundle.blocks[0] ?? null;
}

function enrolledClasses(
  block: ParentFridayBranchBlockSummary,
): ParentFridayBranchClassSummary[] {
  return block.classes
    .filter((classSummary) => classSummary.familyEnrollments.length > 0)
    .slice(0, MAX_ROWS);
}

function openClasses(
  block: ParentFridayBranchBlockSummary,
  enrolled: ParentFridayBranchClassSummary[],
): ParentFridayBranchClassSummary[] {
  const enrolledIds = new Set(enrolled.map((classSummary) => classSummary.classId));
  const candidates = block.classes.filter((classSummary) => {
    if (enrolledIds.has(classSummary.classId)) return false;
    if (classSummary.capacity == null) return true;
    return (classSummary.spotsRemaining ?? 0) > 0;
  });

  if (candidates.length > 0) {
    return candidates.slice(0, MAX_ROWS);
  }

  return block.classes
    .filter((classSummary) => !enrolledIds.has(classSummary.classId))
    .slice(0, MAX_ROWS);
}

function ClassRow({
  theme,
  classSummary,
  studentOptions,
  onOpenClass,
}: {
  theme: ParentThemeTokens;
  classSummary: ParentFridayBranchClassSummary;
  studentOptions: ParentFridayBranchPageBundle["studentOptions"];
  onOpenClass: (classId: string) => void;
}) {
  const spotsBadge = getFridayBranchSpotsBadge(classSummary);
  const hasEnrollment = classSummary.familyEnrollments.length > 0;

  return (
    <button
      type="button"
      className="flex w-full items-start gap-3 rounded-[12px] px-1 py-2 text-left transition-colors hover:bg-[#F8FCF8]"
      onClick={() => onOpenClass(classSummary.classId)}
    >
      <span
        className="inline-block shrink-0 rounded-[9px] px-2 py-1.5 text-[11px] font-extrabold whitespace-nowrap"
        style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
      >
        {classSummary.slotTime || "—"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: theme.ink }}>
            {classSummary.name}
          </span>
          {!hasEnrollment ? (
            <ParentChip
              theme={theme}
              tone={spotsBadge.tone}
              className="!shrink-0 !normal-case !tracking-normal"
            >
              {spotsBadge.label}
            </ParentChip>
          ) : null}
        </div>
        {hasEnrollment ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {classSummary.familyEnrollments.map((enrollment) => (
              <ParentChip
                key={enrollment.enrollmentId}
                theme={theme}
                tone={enrollment.status === "waitlisted" ? "warning" : "success"}
                className="!shrink-0 !normal-case !tracking-normal"
              >
                {studentNameById(studentOptions, enrollment.studentId)}
                {enrollment.status === "waitlisted" ? " · Waitlist" : ""}
              </ParentChip>
            ))}
          </div>
        ) : (
          <p className="m-0 mt-0.5 text-xs" style={{ color: theme.muted }}>
            {classSummary.location}
            {classSummary.ageGroup ? ` · ${classSummary.ageGroup}` : ""}
          </p>
        )}
      </div>
    </button>
  );
}

export default function ParentHomeFridayBranchSection({
  theme,
  organizationId,
  schoolSlug,
  initialBundle,
  previewMode = false,
  previewFamilyId,
  parentNavBasePath,
}: ParentHomeFridayBranchSectionProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);

  const displayBlock = useMemo(() => selectDisplayBlock(bundle), [bundle]);
  const blockIndex = useMemo(() => {
    if (!displayBlock) return 0;
    return bundle.blocks.findIndex((entry) => entry.block.id === displayBlock.block.id);
  }, [bundle.blocks, displayBlock]);

  const blockMeta = useMemo(() => {
    if (!displayBlock) return null;
    return {
      label: getBlockDisplayLabel(displayBlock.block, blockIndex),
      dateRange: formatBlockTabDateRange(
        displayBlock.block.startDate,
        displayBlock.block.endDate,
      ),
    };
  }, [displayBlock, blockIndex]);

  const enrolled = useMemo(
    () => (displayBlock ? enrolledClasses(displayBlock) : []),
    [displayBlock],
  );
  const open = useMemo(
    () => (displayBlock ? openClasses(displayBlock, enrolled) : []),
    [displayBlock, enrolled],
  );

  const activeClassContext = useMemo(() => {
    if (!activeClassId) return null;
    for (let index = 0; index < bundle.blocks.length; index += 1) {
      const entry = bundle.blocks[index];
      const match = entry.classes.find((classSummary) => classSummary.classId === activeClassId);
      if (match) {
        return {
          summary: match,
          blockLabel: getBlockDisplayLabel(entry.block, index),
          blockDateRange: formatBlockTabDateRange(
            entry.block.startDate,
            entry.block.endDate,
          ),
        };
      }
    }
    return null;
  }, [activeClassId, bundle.blocks]);

  const fridayBranchHref = parentNavBasePath
    ? `${parentNavBasePath}/friday_branch`
    : schoolParentPath(schoolSlug, "friday_branch");

  const openClass = useCallback((classId: string) => {
    setActiveClassId(classId);
  }, []);

  const closeClass = useCallback(() => {
    setActiveClassId(null);
  }, []);

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

  if (!displayBlock || !blockMeta) {
    return null;
  }

  const showOpenClasses = open.length > 0;

  return (
    <>
      <ParentCard theme={theme} variant="announcement" className="flex flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <ParentSectionKicker theme={theme}>Friday Branch</ParentSectionKicker>
            <h3
              className="text-base font-semibold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {blockMeta.label}
            </h3>
            <p className="m-0 mt-1 text-xs" style={{ color: theme.muted }}>
              {blockMeta.dateRange}
            </p>
          </div>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.primarySoft }}
          >
            <CalendarDays className="h-4 w-4" style={{ color: theme.primary }} />
          </div>
        </div>

        {enrolled.length > 0 ? (
          <div className="mb-4">
            <p
              className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em]"
              style={{ color: theme.muted }}
            >
              Your sign-ups
            </p>
            <div className="space-y-1">
              {enrolled.map((classSummary) => (
                <ClassRow
                  key={classSummary.classId}
                  theme={theme}
                  classSummary={classSummary}
                  studentOptions={bundle.studentOptions}
                  onOpenClass={openClass}
                />
              ))}
            </div>
          </div>
        ) : null}

        {showOpenClasses ? (
          <div className={enrolled.length > 0 ? "border-t border-[#E7ECE7] pt-4" : ""}>
            <p
              className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em]"
              style={{ color: theme.muted }}
            >
              {enrolled.length > 0 ? "More classes" : "Open classes"}
            </p>
            <div className="space-y-1">
              {open.map((classSummary) => (
                <ClassRow
                  key={classSummary.classId}
                  theme={theme}
                  classSummary={classSummary}
                  studentOptions={bundle.studentOptions}
                  onOpenClass={openClass}
                />
              ))}
            </div>
          </div>
        ) : enrolled.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            Browse the Friday Branch schedule to sign up for enrichment classes.
          </p>
        ) : null}

        <div className="mt-4 border-t border-[#E7ECE7] pt-4">
          <ParentButtonLink theme={theme} href={fridayBranchHref} variant="outline" showArrow>
            View full schedule
          </ParentButtonLink>
        </div>
      </ParentCard>

      <ParentFridayBranchClassSheet
        theme={theme}
        open={Boolean(activeClassId)}
        organizationId={organizationId}
        classId={activeClassId}
        fallbackSummary={activeClassContext?.summary ?? null}
        blockLabel={activeClassContext?.blockLabel ?? blockMeta.label}
        blockDateRange={activeClassContext?.blockDateRange ?? blockMeta.dateRange}
        studentOptions={bundle.studentOptions}
        readOnly={previewMode}
        previewFamilyId={previewFamilyId}
        onClose={closeClass}
        onEnrollmentChange={handleEnrollmentChange}
      />
    </>
  );
}
