"use client";

import { motion } from "framer-motion";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentCoopFamilyMessageButton from "@/components/school-parent/ParentCoopFamilyMessageButton";
import {
  formatProgramCoopLearnerLine,
  type ProgramCoopFamily,
} from "@/lib/admissions/program-coop-directory";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { childAccentBg } from "@/lib/organization-settings/parent-theme";

type ParentCoopFamiliesSectionProps = {
  programLabel: string;
  families: ProgramCoopFamily[];
  organizationId?: string;
  programId?: string;
  schoolName?: string;
  messagesHref?: string;
  messagesEnabled?: boolean;
  previewMode?: boolean;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.04, duration: 0.28 },
  }),
};

export default function ParentCoopFamiliesSection({
  programLabel,
  families,
  organizationId,
  programId,
  messagesHref,
  messagesEnabled = false,
  previewMode = false,
}: ParentCoopFamiliesSectionProps) {
  const { theme, adminCompat } = useParentTheme();
  const canMessageFamilies = Boolean(
    messagesEnabled &&
      organizationId &&
      programId &&
      messagesHref,
  );

  return (
    <motion.section
      custom={4}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <div className="mb-3.5">
        <h3
          className="font-heading text-2xl font-semibold tracking-[-0.03em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          See who else is in your co-op
        </h3>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
          Families enrolled in {programLabel}.
        </p>
      </div>

      {families.length === 0 ? (
        <ParentCard theme={theme}>
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            You&apos;re the first family we see in this co-op so far.
          </p>
        </ParentCard>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {families.map((family) => (
            <ParentCard key={family.familyId} theme={theme}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <ParentSectionKicker theme={theme}>Family</ParentSectionKicker>
                  <p
                    className="mt-1 text-base font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  >
                    {family.familyName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {family.isCurrentFamily ? (
                    <ParentChip theme={theme} tone="info">
                      Your family
                    </ParentChip>
                  ) : null}
                  {!family.isCurrentFamily &&
                  canMessageFamilies &&
                  family.contactGuardianId ? (
                    <ParentCoopFamilyMessageButton
                      theme={theme}
                      organizationId={organizationId!}
                      programId={programId!}
                      familyId={family.familyId}
                      familyName={family.familyName}
                      contactGuardianId={family.contactGuardianId}
                      messagesHref={messagesHref!}
                      previewMode={previewMode}
                    />
                  ) : null}
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {family.learners.map((learner, learnerIndex) => (
                  <li
                    key={learner.studentId}
                    className="flex items-center gap-2.5"
                  >
                    <div
                      className="shrink-0 overflow-hidden rounded-xl"
                      style={{ backgroundColor: childAccentBg(learnerIndex) }}
                    >
                      <StudentPhoto
                        name={learner.firstName}
                        photoUrl={learner.profilePhotoUrl}
                        size="md"
                        shape="square"
                        theme={adminCompat}
                      />
                    </div>
                    <span
                      className="min-w-0 text-sm leading-relaxed"
                      style={{ color: theme.muted }}
                    >
                      {formatProgramCoopLearnerLine(learner)}
                    </span>
                  </li>
                ))}
              </ul>
            </ParentCard>
          ))}
        </div>
      )}
    </motion.section>
  );
}
