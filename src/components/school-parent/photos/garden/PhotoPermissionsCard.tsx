"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Camera, Pencil } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { childFirstName } from "@/components/school-parent/children/parent-children-utils";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  ChildThumb,
  GCard,
  GChip,
  GIcon,
  GProgress,
  G_FOCUS,
  gBtnOnAccent,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import {
  consentChipTone,
  formatConsentUpdated,
  joinNames,
  type PhotoPermissionLearner,
} from "@/components/school-parent/photos/photo-permissions-ui";
import type { PhotoMediaConsentState } from "@/lib/students/load-student-photo-media-consents";
import {
  photoMediaConsentDescription,
  photoMediaConsentLabel,
} from "@/lib/students/photo-media-consent";

type PhotoPermissionsCardProps = {
  learners: PhotoPermissionLearner[];
  consentsByStudentId: Record<string, PhotoMediaConsentState>;
  unsetLearners: PhotoPermissionLearner[];
  total: number;
  setCount: number;
  allSet: boolean;
  previewMode: boolean;
  recentlyUpdatedIds: string[];
  onEdit: () => void;
  index?: number;
};

/** Rail card: each child's photo permission, what it means, and the way to change it. */
export default function PhotoPermissionsCard({
  learners,
  consentsByStudentId,
  unsetLearners,
  total,
  setCount,
  allSet,
  previewMode,
  recentlyUpdatedIds,
  onEdit,
  index = 1,
}: PhotoPermissionsCardProps) {
  const reduce = useReducedMotion() === true;

  if (learners.length === 0) {
    return (
      <GCard
        index={index}
        kicker="Photo permissions"
        title="Your choices"
        data-testid="parent-photo-permissions-card"
      >
        <div className="flex items-start gap-3 rounded-[18px] bg-[var(--sf-paper)] p-4">
          <GIcon size="sm">
            <Camera />
          </GIcon>
          <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
            Photo permissions are available once a learner is enrolled.
          </p>
        </div>
      </GCard>
    );
  }

  const unsetNames = unsetLearners.map((learner) => childFirstName(learner.studentName));
  const editLabel = allSet ? "Edit permissions" : "Set permissions";

  return (
    <GCard
      index={index}
      kicker="Photo permissions"
      title="Your choices"
      data-testid="parent-photo-permissions-card"
      action={
        allSet ? (
          <button
            type="button"
            onClick={onEdit}
            disabled={previewMode}
            className={`${gLinkSm} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline`}
            data-testid="parent-photo-permissions-edit"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            {editLabel}
          </button>
        ) : null
      }
    >
      {!allSet ? (
        <button
          type="button"
          onClick={onEdit}
          disabled={previewMode}
          data-testid="parent-photo-permissions-start"
          className={`group mb-4 flex w-full flex-col items-start gap-3 rounded-[18px] sm:flex-row sm:items-center lg:flex-col lg:items-start xl:flex-row xl:items-center border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] p-4 text-left text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${G_FOCUS}`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">
              Needs your choice
            </span>
            <span className="mt-1 block text-[15px] font-extrabold leading-snug">
              Choose photo permissions for {joinNames(unsetNames)}
            </span>
          </span>
          <span className={gBtnOnAccent} aria-hidden="true">
            {editLabel}
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-label="Photo permission for each child">
        {learners.map((learner, i) => {
          const state = consentsByStudentId[learner.studentId];
          const consent = state?.consent ?? null;
          const firstName = childFirstName(learner.studentName);
          const description = photoMediaConsentDescription(consent);
          const updated = formatConsentUpdated(state?.updatedAt);
          const flash = recentlyUpdatedIds.includes(learner.studentId);
          return (
            <motion.li
              key={learner.studentId}
              data-testid={`parent-photo-permission-row-${learner.studentId}`}
              className="flex items-start gap-3 rounded-[18px] border-[1.5px] p-3"
              initial={false}
              animate={{
                backgroundColor: flash ? "var(--sf-accent-wash)" : "var(--sf-paper)",
                borderColor: flash ? "var(--sf-clay)" : "rgba(43,36,29,0.08)",
              }}
              transition={{ duration: reduce ? 0 : 0.35, ease: PORTAL_EASE }}
            >
              <ChildThumb child={learner.child} index={i} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="m-0 text-[15px] font-extrabold leading-tight text-[var(--sf-ink)]" title={learner.studentName}>
                    {firstName}
                  </h3>
                  <GChip tone={consentChipTone(consent)}>{photoMediaConsentLabel(consent)}</GChip>
                  {flash ? (
                    <GChip tone="neutral">
                      <Tick className="h-3.5 w-3.5" /> Saved
                    </GChip>
                  ) : null}
                </div>
                <p className="m-0 mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                  {description ?? `Choose how the school may use photos of ${firstName}.`}
                </p>
                {updated ? (
                  <p className="m-0 mt-1 text-[12px] font-bold text-[var(--sf-ink)]/45">{updated}</p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-4 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
        {allSet ? (
          <div className="flex items-center gap-2.5 rounded-[14px] bg-[var(--sf-mint)] px-3 py-2.5">
            <Tick className="h-6 w-6" />
            <p className="m-0 text-[13px] font-extrabold text-[var(--sf-forest)]">
              Every child has a photo permission on file.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <GProgress
              value={setCount}
              total={total}
              label="Children with a photo permission"
              className="flex-1"
            />
            <span className="shrink-0 text-[13px] font-extrabold text-[var(--sf-ink)]/70">
              {setCount} of {total} set
            </span>
          </div>
        )}
        {previewMode ? (
          <p className="m-0 mt-3 rounded-[12px] bg-[var(--sf-sky)] px-3 py-2 text-[12px] font-extrabold text-[#24507a]">
            Preview mode — photo permissions cannot be changed here.
          </p>
        ) : null}
      </div>
    </GCard>
  );
}
