"use client";

import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import ParentFridayBranchClassSheet from "@/components/school-parent/friday-branch/ParentFridayBranchClassSheet";
import {
  getFridayBranchSpotsBadge,
  studentNameById,
} from "@/components/school-parent/friday-branch/friday-branch-parent-utils";
import { GCard, GChip, G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { computeSpotsRemaining } from "@/lib/parent-portal/friday-branch/load-parent-friday-branch";
import type {
  ParentFridayBranchBlockSummary,
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchClassSummary,
  ParentFridayBranchPageBundle,
} from "@/lib/parent-portal/friday-branch/types";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";

type HomeFridayBranchCardProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  schoolSlug: string;
  initialBundle: ParentFridayBranchPageBundle;
  previewMode?: boolean;
  previewFamilyId?: string;
  parentNavBasePath?: string;
  index?: number;
};

const MAX_ROWS = 3;

function selectDisplayBlock(bundle: ParentFridayBranchPageBundle): ParentFridayBranchBlockSummary | null {
  if (bundle.blocks.length === 0) return null;
  const current = bundle.blocks.find((entry) => entry.block.status === "current");
  if (current) return current;
  const upcoming = bundle.blocks.find((entry) => entry.block.status === "upcoming");
  if (upcoming) return upcoming;
  return bundle.blocks[0] ?? null;
}

function enrolledClasses(block: ParentFridayBranchBlockSummary): ParentFridayBranchClassSummary[] {
  return block.classes.filter((classSummary) => classSummary.familyEnrollments.length > 0).slice(0, MAX_ROWS);
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
  if (candidates.length > 0) return candidates.slice(0, MAX_ROWS);
  return block.classes.filter((classSummary) => !enrolledIds.has(classSummary.classId)).slice(0, MAX_ROWS);
}

function findActiveClassContext(activeClassId: string, bundle: ParentFridayBranchPageBundle) {
  for (let index = 0; index < bundle.blocks.length; index += 1) {
    const entry = bundle.blocks[index];
    const match = entry.classes.find((classSummary) => classSummary.classId === activeClassId);
    if (match) {
      return {
        summary: match,
        blockLabel: getBlockDisplayLabel(entry.block, index),
        blockDateRange: formatBlockTabDateRange(entry.block.startDate, entry.block.endDate),
      };
    }
  }
  return null;
}

function ClassRow({
  classSummary,
  studentOptions,
  onOpenClass,
}: {
  classSummary: ParentFridayBranchClassSummary;
  studentOptions: ParentFridayBranchPageBundle["studentOptions"];
  onOpenClass: (classId: string) => void;
}) {
  const spotsBadge = getFridayBranchSpotsBadge(classSummary);
  const hasEnrollment = classSummary.familyEnrollments.length > 0;
  const meta = [
    classSummary.location,
    classSummary.ageGroup,
    classSummary.priceCents != null ? formatFeeAmount(classSummary.priceCents) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={() => onOpenClass(classSummary.classId)}
      className={`group flex min-h-[52px] w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-white/70 focus-visible:ring-inset ${G_FOCUS}`}
    >
      <span className="mt-0.5 inline-block shrink-0 whitespace-nowrap rounded-lg bg-[var(--sf-peach)] px-2 py-1 text-[11px] font-extrabold text-[var(--sf-clay-deep)]">
        {classSummary.slotTime || "—"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 break-words text-[15px] font-extrabold text-[var(--sf-ink)]">{classSummary.name}</span>
          {!hasEnrollment ? <GChip tone={spotsBadge.tone}>{spotsBadge.label}</GChip> : null}
        </span>
        {hasEnrollment ? (
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {classSummary.familyEnrollments.map((enrollment) => (
              <GChip key={enrollment.enrollmentId} tone={enrollment.status === "waitlisted" ? "warning" : "success"}>
                {studentNameById(studentOptions, enrollment.studentId)}
                {enrollment.status === "waitlisted" ? " · Waitlist" : ""}
              </GChip>
            ))}
          </span>
        ) : meta ? (
          <span className="mt-0.5 block text-[13px] font-semibold text-[var(--sf-soft)]">{meta}</span>
        ) : null}
      </span>
      <ChevronRight
        className="mt-1 h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

function ClassList({
  heading,
  classes,
  studentOptions,
  onOpenClass,
}: {
  heading: string;
  classes: ParentFridayBranchClassSummary[];
  studentOptions: ParentFridayBranchPageBundle["studentOptions"];
  onOpenClass: (classId: string) => void;
}) {
  return (
    <div className="min-w-0">
      <h3 className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{heading}</h3>
      <ul className="sf-paper -mx-1 flex flex-col rounded-xl px-1">
        {classes.map((classSummary) => (
          <li key={classSummary.classId}>
            <ClassRow classSummary={classSummary} studentOptions={studentOptions} onOpenClass={onOpenClass} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Friday Branch on the Home: current block, the family's sign-ups and open classes; rows open the class sheet. */
export default function HomeFridayBranchCard({
  theme,
  organizationId,
  schoolSlug,
  initialBundle,
  previewMode = false,
  previewFamilyId,
  parentNavBasePath,
  index = 0,
}: HomeFridayBranchCardProps) {
  // The sheet portals to the portal shell (`[data-parent-portal]`: portal fonts + theme vars), outside
  // ParentGardenFrame's type reset and the card's transformed motion box. Falls back to <body>.
  const [sheetHost, setSheetHost] = useState<HTMLElement | null>(null);
  const anchorRef = useCallback((node: HTMLSpanElement | null) => {
    setSheetHost(node ? (node.closest<HTMLElement>("[data-parent-portal]") ?? document.body) : null);
  }, []);
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
      dateRange: formatBlockTabDateRange(displayBlock.block.startDate, displayBlock.block.endDate),
    };
  }, [displayBlock, blockIndex]);

  const enrolled = useMemo(() => (displayBlock ? enrolledClasses(displayBlock) : []), [displayBlock]);
  const open = useMemo(() => (displayBlock ? openClasses(displayBlock, enrolled) : []), [displayBlock, enrolled]);

  const activeClassContext = useMemo(
    () => (activeClassId ? findActiveClassContext(activeClassId, bundle) : null),
    [activeClassId, bundle],
  );

  const fridayBranchHref = parentNavBasePath
    ? `${parentNavBasePath}/friday_branch`
    : schoolParentPath(schoolSlug, "friday_branch");

  const openClass = useCallback((classId: string) => {
    setActiveClassId(classId);
  }, []);

  const closeClass = useCallback(() => {
    setActiveClassId(null);
  }, []);

  const handleEnrollmentChange = useCallback((classId: string, detail: ParentFridayBranchClassDetailBundle) => {
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
  }, []);

  if (!displayBlock || !blockMeta) return null;

  const showOpenClasses = open.length > 0;
  const bothLists = enrolled.length > 0 && showOpenClasses;

  return (
    <>
      <span ref={anchorRef} hidden />
      <GCard
        index={index}
        kicker="Friday Branch"
        title={blockMeta.label}
        data-testid="parent-home-friday-branch"
        action={
          <Link href={fridayBranchHref} className={gLinkSm}>
            View full schedule <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      >
        <p className="m-0 -mt-2 mb-4 text-[13px] font-semibold text-[var(--sf-soft)]">{blockMeta.dateRange}</p>
        {enrolled.length === 0 && !showOpenClasses ? (
          <p className="m-0 text-[15px] leading-relaxed text-[var(--sf-soft)]">
            Browse the Friday Branch schedule to sign up for enrichment classes.
          </p>
        ) : (
          <div className={`grid items-start gap-5 ${bothLists ? "lg:grid-cols-2" : ""}`}>
            {enrolled.length > 0 ? (
              <ClassList
                heading="Your sign-ups"
                classes={enrolled}
                studentOptions={bundle.studentOptions}
                onOpenClass={openClass}
              />
            ) : null}
            {showOpenClasses ? (
              <ClassList
                heading={enrolled.length > 0 ? "More classes" : "Open classes"}
                classes={open}
                studentOptions={bundle.studentOptions}
                onOpenClass={openClass}
              />
            ) : null}
          </div>
        )}
      </GCard>

      {sheetHost
        ? createPortal(
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
            />,
            sheetHost,
          )
        : null}
    </>
  );
}
