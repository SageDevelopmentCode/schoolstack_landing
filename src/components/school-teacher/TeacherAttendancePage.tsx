"use client";

import { ClipboardCheck, Zap } from "lucide-react";
import { AttendanceApiProvider } from "@/components/school-admin/attendance/AttendanceApiContext";
import {
  GardenAttendanceBoard,
  GardenAttendanceSheets,
} from "@/components/school-admin/dashboard/garden/GardenAttendanceBoard";
import { GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import { GardenRefreshControl, GardenStatTiles } from "@/components/school-admin/garden/kit";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import { gBtnPopSm } from "@/components/school-parent/garden/ui";
import TeacherRollCallDialog from "@/components/school-teacher/home/garden/TeacherRollCallDialog";
import {
  useTeacherAttendanceModel,
  type TeacherAttendanceModel,
  type TeacherAttendancePageProps,
} from "@/components/school-teacher/attendance/useTeacherAttendanceModel";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { formatAttendanceDateLabel } from "@/lib/school-admin/attendance/attendance-date-utils";

/**
 * Staff Attendance (Garden): the day's roster on the shared
 * `GardenAttendanceBoard`, filter tiles, a "who's left" strip and guided roll
 * call. Same data and saves as before through the shared attendance model on
 * the teacher API. Rules: `.agents/skills/teacher-portal-garden-design/SKILL.md`.
 */
export default function TeacherAttendancePage(props: TeacherAttendancePageProps) {
  return (
    <AttendanceApiProvider apiBasePath="/api/teacher-portal/attendance" previewMode={props.previewMode ?? false}>
      <TeacherAttendanceView {...props} />
    </AttendanceApiProvider>
  );
}

function TeacherAttendanceView(props: TeacherAttendancePageProps) {
  const model = useTeacherAttendanceModel(props);
  const { theme, adminCompat, att } = model;
  const { summary } = att;

  const allMarked = summary.totalStudents > 0 && summary.notMarkedCount === 0 && !att.loading;
  // Same key as the Dashboard rhythm, so roll call celebrates once per day.
  useCelebrate(allMarked && att.viewingToday, theme, `teacher-roll-call-done-${att.activeDateKey}`);

  const dateLabel = formatAttendanceDateLabel(att.activeDate);
  const subtitle = att.loading
    ? `${dateLabel} · Loading roster…`
    : summary.totalStudents === 0
      ? `${dateLabel} · Mark daily attendance and record pickups for your students.`
      : `${dateLabel} · ${att.subcopy}${summary.notMarkedCount > 0 ? ` · ${summary.notMarkedCount} left to mark` : " · everyone is marked"}`;

  return (
    <div data-testid="teacher-attendance-page" className="flex min-h-0 flex-1 flex-col">
      <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <ParentGardenPageHeader
            title={<span className="text-[var(--sf-clay)]">Attendance</span>}
            subtitle={subtitle}
            actions={
              <>
                <GardenRefreshControl
                  onRefresh={model.refresh}
                  refreshing={att.loading}
                  lastUpdatedAt={model.lastUpdatedAt}
                  label="Refresh attendance"
                />
                <RollCallButton model={model} />
              </>
            }
          />

          {summary.notMarkedCount > 0 && att.viewingToday && !att.loading && !att.loadError ? (
            <GardenLeadStrip
              icon={ClipboardCheck}
              kicker={`Today · ${summary.notMarkedCount} left to mark`}
              title={
                summary.notMarkedCount === summary.totalStudents
                  ? "No one is marked yet today"
                  : `${summary.notMarkedCount} of ${summary.totalStudents} students still need a mark`
              }
              cta="Show who's left"
              onClick={() => model.setAttendanceFilter("not_marked")}
              data-testid="teacher-attendance-show-unmarked"
            />
          ) : null}

          <GardenStatTiles
            ariaLabel="Attendance for this day"
            stats={[
              {
                id: "present",
                label: "Present",
                value: summary.presentCount,
                accent: "forest",
                onClick: () => model.toggleFilter("present"),
                active: model.attendanceFilter === "present",
              },
              {
                id: "absent",
                label: "Absent",
                value: summary.absentCount,
                accent: "gold",
                onClick: () => model.toggleFilter("absent"),
                active: model.attendanceFilter === "absent",
              },
              {
                id: "not_marked",
                label: "Not marked",
                value: summary.notMarkedCount,
                accent: "berry",
                onClick: () => model.toggleFilter("not_marked"),
                active: model.attendanceFilter === "not_marked",
              },
              {
                id: "picked_up",
                label: "Picked up",
                value: summary.pickedUpCount,
                accent: "sky",
                onClick: () => model.toggleFilter("picked_up"),
                active: model.attendanceFilter === "picked_up",
              },
            ]}
          />

          <GardenAttendanceBoard
            att={att}
            layout="table"
            index={2}
            variant="page"
            title={att.viewingToday ? "Today's roster" : "Roster"}
            filter={model.attendanceFilter}
            onFilterChange={model.setAttendanceFilter}
          />
        </div>
      </ParentGardenFrame>

      {/* Sheets and the roll call dialog stay outside the Garden frame. */}
      <GardenAttendanceSheets att={att} organizationId={props.organizationId} theme={theme} C={adminCompat} />
      <TeacherRollCallDialog model={model} />
    </div>
  );
}

/** The page's one toy button: guided roll call while students are unmarked. */
function RollCallButton({ model }: { model: TeacherAttendanceModel }) {
  const { att } = model;
  if (att.summary.notMarkedCount === 0 || att.loading || att.loadError) return null;
  return (
    <button
      type="button"
      onClick={model.openRollCall}
      disabled={att.readOnly}
      title={att.readOnly ? "Roll call is off in preview" : undefined}
      className={gBtnPopSm}
      data-testid="teacher-attendance-roll-call"
    >
      <Zap className="h-4 w-4" aria-hidden />
      {att.viewingToday ? "Take roll call" : "Mark this day"}
      <span className="rounded-full bg-white/20 px-1.5 text-[12px] tabular-nums">{att.summary.notMarkedCount}</span>
    </button>
  );
}
