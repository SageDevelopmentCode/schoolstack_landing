"use client";

import { Camera, Pencil } from "lucide-react";
import { childFirstName } from "@/components/school-parent/children/parent-children-utils";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import { photoMediaConsentLabel } from "@/lib/students/photo-media-consent";
import type { PhotoMediaConsentState } from "@/lib/students/load-student-photo-media-consents";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  consentChipTone,
  type PhotoPermissionLearner,
} from "@/components/school-parent/photos/photo-permissions-ui";

type ParentPhotoPermissionsBannerProps = {
  theme: ParentThemeTokens;
  learners: PhotoPermissionLearner[];
  consentsByStudentId: Record<string, PhotoMediaConsentState>;
  previewMode?: boolean;
  onEdit: () => void;
};

export default function ParentPhotoPermissionsBanner({
  theme,
  learners,
  consentsByStudentId,
  previewMode = false,
  onEdit,
}: ParentPhotoPermissionsBannerProps) {
  const hasAnyUnset = learners.some(
    (learner) => !consentsByStudentId[learner.studentId]?.consent,
  );
  const ctaLabel = hasAnyUnset ? "Set permissions" : "Edit permissions";

  return (
    <ParentCard
      theme={theme}
      className="mt-4 !p-0"
      data-testid="parent-photo-permissions-card"
    >
      <div className="flex flex-row items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8"
          style={{ backgroundColor: theme.primarySoft }}
        >
          <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: theme.primary }} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.06em] sm:text-[11px]"
            style={{ color: theme.muted }}
          >
            Photo permissions
          </p>
          <ul
            className="mt-0.5 flex items-center gap-x-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Learner photo permission status"
          >
            {learners.map((learner, index) => {
              const consent = consentsByStudentId[learner.studentId]?.consent ?? null;
              const firstName = childFirstName(learner.studentName);
              return (
                <li key={learner.studentId} className="flex shrink-0 items-center gap-1.5">
                  {index > 0 ? (
                    <span className="shrink-0 text-[11px]" style={{ color: theme.muted }} aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span
                    className="truncate text-[12px] font-semibold sm:text-[13px]"
                    style={{ color: theme.ink }}
                    title={learner.studentName}
                  >
                    {firstName}
                  </span>
                  <ParentChip
                    theme={theme}
                    tone={consentChipTone(consent)}
                    className="!shrink-0 !py-0.5 !text-[10px]"
                  >
                    {photoMediaConsentLabel(consent)}
                  </ParentChip>
                </li>
              );
            })}
          </ul>
        </div>

        {!previewMode ? (
          <ParentButton
            theme={theme}
            variant="outline"
            className="shrink-0 whitespace-nowrap !py-1.5 !text-[12px]"
            onClick={onEdit}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {ctaLabel}
          </ParentButton>
        ) : null}
      </div>
    </ParentCard>
  );
}
