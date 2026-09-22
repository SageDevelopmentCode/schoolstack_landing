"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ParentAttendanceHistoryPanel from "@/components/school-parent/attendance/ParentAttendanceHistoryPanel";
import ParentAttendanceStoryHeader from "@/components/school-parent/attendance/ParentAttendanceStoryHeader";
import ParentChildrenLearnerStrip from "@/components/school-parent/children/ParentChildrenLearnerStrip";
import { parentChildrenFadeUp } from "@/components/school-parent/children/parent-children-view-transition";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import type { AttendanceHistoryResponse } from "@/lib/school-admin/attendance/attendance-types";

type ParentAttendancePageProps = {
  organizationId: string;
  eligibleChildren: FamilyChildOverview[];
  previewMode?: boolean;
  initialHistoryByStudentId?: Record<string, AttendanceHistoryResponse>;
};

export default function ParentAttendancePage({
  organizationId,
  eligibleChildren,
  previewMode = false,
  initialHistoryByStudentId,
}: ParentAttendancePageProps) {
  const { theme, adminCompat } = useParentTheme();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    eligibleChildren[0]?.applicationId ?? null,
  );

  const selectedChild = useMemo(
    () =>
      eligibleChildren.find((child) => child.applicationId === selectedApplicationId) ??
      eligibleChildren[0] ??
      null,
    [eligibleChildren, selectedApplicationId],
  );

  return (
    <div
      className="mx-auto max-w-[1250px] px-4 py-6 sm:py-8 md:px-9"
      data-testid="parent-attendance-page"
    >
      <ParentAttendanceStoryHeader theme={theme} />

      {eligibleChildren.length === 0 ? (
        <ParentCard theme={theme} className="mt-6" data-testid="parent-attendance-no-children">
          <p className="text-[13px]" style={{ color: theme.muted }}>
            No enrolled learners with attendance tracking yet.
          </p>
        </ParentCard>
      ) : (
        <div className="mt-6 space-y-4">
          <ParentChildrenLearnerStrip
            theme={theme}
            adminCompat={adminCompat}
            learners={eligibleChildren}
            selectedApplicationId={selectedChild?.applicationId ?? ""}
            onSelect={setSelectedApplicationId}
          />

          <AnimatePresence mode="wait">
            {selectedChild?.studentId ? (
              <motion.div
                key={selectedChild.applicationId}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={parentChildrenFadeUp}
                custom={0}
              >
                <ParentAttendanceHistoryPanel
                  organizationId={organizationId}
                  studentId={selectedChild.studentId}
                  studentName={selectedChild.studentName}
                  previewMode={previewMode}
                  initialHistory={initialHistoryByStudentId?.[selectedChild.studentId]}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {previewMode ? (
            <p className="text-[11px]" style={{ color: theme.muted }}>
              Preview mode — attendance history is read-only.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
