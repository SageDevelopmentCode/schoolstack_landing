"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import type { StaffClassroomOption } from "@/lib/school-admin/classrooms";
import {
  childAccentBg,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";

type TeacherClassroomStoryCardProps = {
  classroom: StaffClassroomOption;
  theme: ParentThemeTokens;
  onViewStudents: () => void;
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

export default function TeacherClassroomStoryCard({
  classroom,
  theme,
  onViewStudents,
  index,
}: TeacherClassroomStoryCardProps) {
  const accentBg = childAccentBg(index);
  const studentLabel = `${classroom.studentCount} student${classroom.studentCount === 1 ? "" : "s"}`;

  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp} className="h-full">
      <ParentCard theme={theme} className="relative flex h-full flex-col !p-6">
        <div className="mb-4 flex items-start gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]"
            style={{ backgroundColor: accentBg }}
          >
            <Users className="h-6 w-6" style={{ color: theme.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="m-0 text-base font-semibold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {classroom.name}
            </h3>
            <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: "#7B878D" }}>
              {studentLabel}
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <ParentButton
            theme={theme}
            variant="outline"
            onClick={onViewStudents}
            className="inline-flex w-full items-center justify-center gap-1.5 border"
          >
            View students
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </ParentButton>
        </div>
      </ParentCard>
    </motion.div>
  );
}
