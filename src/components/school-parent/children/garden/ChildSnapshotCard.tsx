"use client";

import Link from "next/link";
import { useRef, type ChangeEvent } from "react";
import { ArrowRight, Camera, Loader2 } from "lucide-react";
import {
  childApplicationHref,
  childIsolatedPortalHref,
  childIsolatedPortalLabel,
} from "@/components/school-parent/children/parent-children-utils";
import {
  ChildPhoto,
  GCard,
  GChip,
  GProgress,
  GSkeleton,
  StatusChip,
  G_FOCUS,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import type { ParentChildrenModel } from "../useParentChildrenModel";
import { applicationStudentFacts } from "./child-record-format";

/** "{First} at a glance": photo (with upload), status, grade, programs, birthday, checklist bar. */
export default function ChildSnapshotCard({
  model,
  schoolSlug,
  previewBasePath,
}: {
  model: ParentChildrenModel;
  schoolSlug: string;
  previewBasePath?: string;
}) {
  const { selectedChild: child, selectedProfile, firstName, checklistProgress, canUploadPhoto, photoUploading, uploadPhoto, isRecordLoading, children } = model;
  const inputRef = useRef<HTMLInputElement>(null);
  if (!child) return null;

  const index = Math.max(0, children.findIndex((c) => c.applicationId === child.applicationId));
  const facts = applicationStudentFacts(selectedProfile?.application);
  const complete = checklistProgress ? checklistProgress.completed >= checklistProgress.total : false;
  const isolatedHref = childIsolatedPortalHref(
    schoolSlug,
    child,
    previewBasePath ? `${previewBasePath}/parent` : undefined,
  );
  const isolatedLabel = childIsolatedPortalLabel(child);
  const showEnrollmentLink = child.isEnrolled || child.status === "enrolling";
  const grade = child.grade ?? facts.student?.grade ?? null;

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadPhoto(file);
  };

  return (
    <GCard index={2} kicker="Profile" title={`${firstName} at a glance`} data-testid="parent-children-snapshot">
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <span className="sf-polaroid relative block w-24 !p-1.5 !pb-2" style={{ rotate: index % 2 === 0 ? "-2deg" : "2deg" }}>
            <span className="relative block aspect-square overflow-hidden rounded-[3px]">
              <ChildPhoto child={child} index={index} textClass="text-3xl" />
              {photoUploading ? (
                <span className="absolute inset-0 flex items-center justify-center bg-[var(--sf-ink)]/45" aria-hidden="true">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </span>
              ) : null}
            </span>
          </span>
          {canUploadPhoto ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={photoUploading}
                aria-busy={photoUploading || undefined}
                aria-label={`Change photo for ${facts.student ? facts.fullName : child.studentName}`}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-extrabold text-[var(--sf-clay-deep)] hover:bg-[var(--sf-accent-wash)] disabled:cursor-wait disabled:opacity-60 ${G_FOCUS}`}
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                {photoUploading ? "Uploading…" : child.profilePhotoUrl ? "Change photo" : "Add photo"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={onFileChange}
              />
            </>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="sf-display m-0 text-xl leading-tight text-[var(--sf-ink)]">{child.studentName}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusChip child={child} />
            {grade ? <GChip tone="neutral">Grade {grade}</GChip> : null}
            {child.enrolledPrograms.map((program) => (
              <GChip key={program.programId} tone="info">
                {program.portalLabel || program.programName}
              </GChip>
            ))}
          </div>
          {isRecordLoading ? (
            <GSkeleton className="mt-3 h-4 w-40 !rounded-full" />
          ) : facts.birthDate ? (
            <p className="m-0 mt-3 text-[13px] font-semibold text-[var(--sf-soft)]">
              Born {facts.birthDate}
              {facts.age !== null ? ` · Age ${facts.age}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {checklistProgress && checklistProgress.total > 0 ? (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between gap-2 text-xs font-extrabold text-[var(--sf-ink)]/70">
            <span>Enrollment checklist</span>
            <span className={complete ? "text-[var(--sf-forest)]" : ""}>
              {checklistProgress.completed} of {checklistProgress.total} complete
            </span>
          </div>
          <GProgress
            value={checklistProgress.completed}
            total={checklistProgress.total}
            done={complete}
            label={`${firstName}'s enrollment checklist`}
          />
        </div>
      ) : null}

      {showEnrollmentLink || (isolatedHref && isolatedLabel) ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
          {showEnrollmentLink ? (
            <Link href={childApplicationHref(schoolSlug, child, previewBasePath)} className={gLinkSm}>
              Enrollment page <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null}
          {isolatedHref && isolatedLabel ? (
            <Link href={isolatedHref} className={gLinkSm}>
              Open {isolatedLabel} portal <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </GCard>
  );
}
