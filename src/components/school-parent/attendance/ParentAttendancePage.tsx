"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import ParentAttendanceHistoryPanel from "@/components/school-parent/attendance/ParentAttendanceHistoryPanel";
import ChildrenSwitcher from "@/components/school-parent/children/garden/ChildrenSwitcher";
import { childFirstName } from "@/components/school-parent/children/parent-children-utils";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import type { AttendanceHistoryResponse } from "@/lib/school-admin/attendance/attendance-types";

type ParentAttendancePageProps = {
  organizationId: string;
  eligibleChildren: FamilyChildOverview[];
  previewMode?: boolean;
  initialHistoryByStudentId?: Record<string, AttendanceHistoryResponse>;
};

const SUBTITLE = "Check-in history and absences at a glance.";

function todayKicker(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Parent portal Attendance — Garden dashboard (parent-portal-garden-design).
 *
 * Header → child switcher → [latest day · history | rail: recent weeks]
 * → day drawer.
 *
 * Rendered by the live portal and the admin family preview (read-only:
 * `previewMode` uses `initialHistoryByStudentId` and never fetches).
 */
export default function ParentAttendancePage({
  organizationId,
  eligibleChildren,
  previewMode = false,
  initialHistoryByStudentId,
}: ParentAttendancePageProps) {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
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
  const firstName = selectedChild ? childFirstName(selectedChild.studentName) : "";

  const panelMotion = reduce
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.26, ease: PORTAL_EASE },
      };

  return (
    <ParentGardenFrame theme={theme} className="shrink-0">
      <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="parent-attendance-page">
        <ParentGardenPageHeader
          data-testid="parent-attendance-story-header"
          kicker={`Attendance · ${todayKicker()}`}
          title={
            selectedChild ? (
              <>
                <span className="text-[var(--sf-clay)]">{firstName}</span>&apos;s attendance
              </>
            ) : (
              "Attendance"
            )
          }
          subtitle={SUBTITLE}
          actions={
            previewMode ? (
              <GChip tone="neutral" className="!px-3 !py-1.5 !text-[13px]">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Preview · read-only
              </GChip>
            ) : null
          }
        />

        {eligibleChildren.length === 0 ? (
          <GCard
            index={1}
            kicker="Your family"
            title="Nothing to show yet"
            data-testid="parent-attendance-no-children"
          >
            <p className="m-0 max-w-2xl text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
              No enrolled learners with attendance tracking yet.
            </p>
          </GCard>
        ) : (
          <>
            <ChildrenSwitcher
              learners={eligibleChildren}
              selectedApplicationId={selectedChild?.applicationId ?? ""}
              onSelect={setSelectedApplicationId}
            />

            <p className="sr-only" aria-live="polite">
              {selectedChild ? `Showing ${firstName}'s attendance` : ""}
            </p>

            <AnimatePresence mode="wait" initial={false}>
              {selectedChild?.studentId ? (
                <motion.div key={selectedChild.applicationId} {...panelMotion}>
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
              <p className="m-0 text-[12px] font-semibold text-[var(--sf-soft)]">
                Preview mode — attendance history is read-only.
              </p>
            ) : null}
          </>
        )}
      </div>
    </ParentGardenFrame>
  );
}
