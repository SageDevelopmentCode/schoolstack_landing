"use client";

import { motion } from "framer-motion";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import {
  childAccentBg,
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";

type TeacherStudentStoryCardProps = {
  student: AdminEnrolledStudentSummary;
  theme: ParentThemeTokens;
  myStudentsHref: string;
  index: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function studentSubtitle(student: AdminEnrolledStudentSummary): string {
  const gradePart = formatStudentGrade(student.grade) ?? "Grade not listed";
  const programPart =
    student.programNames.length > 0 ? student.programNames.join(", ") : null;
  return programPart ? `${gradePart} · ${programPart}` : gradePart;
}

export default function TeacherStudentStoryCard({
  student,
  theme,
  myStudentsHref,
  index,
}: TeacherStudentStoryCardProps) {
  const adminCompat = parentThemeToAdminCompat(theme);
  const studentFirstName = student.firstName.trim() || formatEnrolledStudentName(student);
  const accentBg = childAccentBg(index);

  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
      <ParentCard theme={theme} className="relative flex flex-col !p-6">
        <div className="mb-4 flex items-start gap-3">
          <div
            className="shrink-0 overflow-hidden rounded-[18px]"
            style={{ backgroundColor: accentBg }}
          >
            <StudentPhoto
              name={formatEnrolledStudentName(student)}
              photoUrl={student.profilePhotoUrl}
              size="xl"
              shape="square"
              theme={adminCompat}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="m-0 text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {studentFirstName}
              </h3>
              <ParentChip
                theme={theme}
                tone="success"
                className="!shrink-0 !normal-case !tracking-normal"
              >
                ● Enrolled
              </ParentChip>
            </div>
            <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: "#7B878D" }}>
              {studentSubtitle(student)}
            </p>
            {student.familyName ? (
              <p className="m-0 mt-1 text-xs" style={{ color: theme.muted }}>
                {student.familyName} family
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <ParentButtonLink
            theme={theme}
            href={myStudentsHref}
            variant="outline"
            showArrow
          >
            View {studentFirstName}&apos;s profile
          </ParentButtonLink>
        </div>
      </ParentCard>
    </motion.div>
  );
}
