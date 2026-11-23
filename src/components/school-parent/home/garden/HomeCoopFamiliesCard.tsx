"use client";

import ParentCoopFamilyMessageButton from "@/components/school-parent/ParentCoopFamilyMessageButton";
import { ChildThumb, GCard, GChip, GSkeleton, SPRINGY } from "@/components/school-parent/garden/ui";
import {
  formatProgramCoopLearnerLine,
  type ProgramCoopFamily,
} from "@/lib/admissions/program-coop-directory";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type HomeCoopFamiliesCardProps = {
  theme: ParentThemeTokens;
  programLabel: string;
  families: ProgramCoopFamily[];
  organizationId?: string;
  programId?: string;
  messagesHref?: string;
  messagesEnabled?: boolean;
  previewMode?: boolean;
  contentDeferred?: boolean;
  index?: number;
};

/** "See who else is in your co-op": one paper mini-card per enrolled family. */
export default function HomeCoopFamiliesCard({
  theme,
  programLabel,
  families,
  organizationId,
  programId,
  messagesHref,
  messagesEnabled = false,
  previewMode = false,
  contentDeferred = false,
  index = 0,
}: HomeCoopFamiliesCardProps) {
  const canMessageFamilies = Boolean(messagesEnabled && organizationId && programId && messagesHref);

  return (
    <GCard index={index} kicker="Your co-op" title="See who else is in your co-op" data-testid="parent-home-coop-families">
      <p className="m-0 -mt-2 mb-4 text-[13px] font-semibold text-[var(--sf-soft)]">Families enrolled in {programLabel}.</p>
      {contentDeferred ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading co-op families">
          <GSkeleton className="h-36 rounded-[18px]" />
          <GSkeleton className="h-36 rounded-[18px]" />
        </div>
      ) : families.length === 0 ? (
        <p className="m-0 text-[15px] leading-relaxed text-[var(--sf-soft)]">
          You&apos;re the first family we see in this co-op so far.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {families.map((family) => {
            const showMessage = !family.isCurrentFamily && canMessageFamilies && family.contactGuardianId;
            return (
              <li
                key={family.familyId}
                className={`flex min-w-0 flex-col rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/25 ${SPRINGY}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="sf-display m-0 min-w-0 break-words text-xl leading-tight text-[var(--sf-ink)]">{family.familyName}</h3>
                  {family.isCurrentFamily ? <GChip tone="info">Your family</GChip> : null}
                </div>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {family.learners.map((learner, learnerIndex) => (
                    <li key={learner.studentId} className="flex min-w-0 items-center gap-3">
                      <ChildThumb
                        child={{ studentName: learner.firstName, profilePhotoUrl: learner.profilePhotoUrl }}
                        index={learnerIndex}
                        size="sm"
                        tilt={learnerIndex % 2 === 0 ? -3 : 3}
                      />
                      <span className="min-w-0 break-words text-[15px] font-extrabold text-[var(--sf-ink)]">
                        {formatProgramCoopLearnerLine(learner)}
                      </span>
                    </li>
                  ))}
                </ul>
                {showMessage ? (
                  <div className="mt-auto pt-4">
                    <ParentCoopFamilyMessageButton
                      appearance="garden"
                      theme={theme}
                      organizationId={organizationId!}
                      programId={programId!}
                      familyId={family.familyId}
                      familyName={family.familyName}
                      contactGuardianId={family.contactGuardianId!}
                      messagesHref={messagesHref!}
                      previewMode={previewMode}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </GCard>
  );
}
