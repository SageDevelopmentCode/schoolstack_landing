"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Loader2,
  LogOut,
  Search,
  UserCheck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { attendancePrimaryActionType } from "@/components/school-admin/attendance/AttendanceActionLabel";
import AttendancePickupSheet from "@/components/school-admin/attendance/AttendancePickupSheet";
import AttendanceStudentDetailSheet from "@/components/school-admin/attendance/AttendanceStudentDetailSheet";
import {
  useDashboardAttendanceModel,
  type DashboardAttendanceModel,
} from "@/components/school-admin/attendance/useDashboardAttendanceModel";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GProgress,
  GSkeleton,
  G_FOCUS,
  G_INPUT,
  G_TOGGLE,
  G_TOGGLE_OFF,
  G_TOGGLE_ON,
  PANEL_TINTS,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
  type GChipTone,
} from "@/components/school-parent/garden/ui";
import type { AdminDashboardModel } from "@/components/school-admin/dashboard/useAdminDashboardModel";
import { formatAttendanceDateLabel } from "@/lib/school-admin/attendance/attendance-date-utils";
import type {
  AttendanceRosterStatus,
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
} from "@/lib/school-admin/enrolled-students";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { GardenLoadError } from "./shared";

const EMPTY_SUMMARY: AttendanceRosterSummary = {
  totalStudents: 0,
  presentCount: 0,
  absentCount: 0,
  pickedUpCount: 0,
  notMarkedCount: 0,
};
const EMPTY_STUDENTS: AttendanceRosterStudent[] = [];

/** True when the Today tab should show attendance (same rule as the story dashboard). */
export function showsAttendance(
  features: OrganizationFeatures,
  model: AdminDashboardModel,
): boolean {
  return Boolean(features.admin?.my_school && model.today.attendanceToday);
}

/**
 * Attendance model for the Garden dashboard, wired to the dashboard model:
 * summary changes flow back into `today`, and a saved record refreshes the
 * focus queue. Call unconditionally; render the board only when
 * `showsAttendance(...)`.
 */
export function useGardenAttendance({
  organizationId,
  slug,
  model,
}: {
  organizationId: string;
  slug: string;
  model: AdminDashboardModel;
}) {
  const attendanceToday = model.today.attendanceToday;
  const { setToday, refreshToday } = model;
  return useDashboardAttendanceModel({
    organizationId,
    date: attendanceToday?.date ?? "",
    students: attendanceToday?.students ?? EMPTY_STUDENTS,
    summary: attendanceToday?.summary ?? EMPTY_SUMMARY,
    attendanceHref: schoolAdminPath(slug, "my_school", "attendance"),
    operationalErrorSurface: "school_admin",
    enabled: attendanceToday != null,
    onSummaryChange: (nextSummary) => {
      setToday((current) =>
        current.attendanceToday
          ? { ...current, attendanceToday: { ...current.attendanceToday, summary: nextSummary } }
          : current,
      );
    },
    onRecordSaved: () => {
      void refreshToday();
    },
  });
}

type FilterKey = "all" | AttendanceRosterStatus;

const FILTERS: Array<{ key: FilterKey; label: string; count: (s: AttendanceRosterSummary) => number }> = [
  { key: "all", label: "All", count: (s) => s.totalStudents },
  { key: "not_marked", label: "Not marked", count: (s) => s.notMarkedCount },
  { key: "present", label: "Present", count: (s) => s.presentCount },
  { key: "absent", label: "Absent", count: (s) => s.absentCount },
  { key: "picked_up", label: "Picked up", count: (s) => s.pickedUpCount },
];

const STATUS_CHIP: Record<AttendanceRosterStatus, { tone: GChipTone; label: string }> = {
  not_marked: { tone: "neutral", label: "Not marked" },
  present: { tone: "success", label: "Present" },
  absent: { tone: "warning", label: "Absent" },
  picked_up: { tone: "info", label: "Picked up" },
};

function studentMeta(student: AttendanceRosterStudent): string {
  const grade = formatStudentGrade(student.grade) ?? "Grade not listed";
  return student.programNames.length > 0 ? `${grade} · ${student.programNames.join(", ")}` : grade;
}

function initialsOf(student: AttendanceRosterStudent): string {
  return `${student.firstName.trim()[0] ?? ""}${student.lastName.trim()[0] ?? ""}`.toUpperCase() || "?";
}

function StudentAvatar({ student, index, size = "md" }: { student: AttendanceRosterStudent; index: number; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 text-[13px]" : "h-12 w-12 text-[15px]";
  if (student.profilePhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={student.profilePhotoUrl}
        alt=""
        className={`${box} shrink-0 rounded-[12px] object-cover ring-[1.5px] ring-[var(--sf-ink)]/10`}
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${box} flex shrink-0 items-center justify-center rounded-[12px] font-extrabold text-[var(--sf-ink)]/70 ${PANEL_TINTS[index % PANEL_TINTS.length]}`}
    >
      {initialsOf(student)}
    </span>
  );
}

/** The one action per student, matching the story card (Mark Present / Record Pickup / Picked up). */
function StudentAction({
  student,
  saving,
  onMarkPresent,
  onRecordPickup,
  size = "md",
}: {
  student: AttendanceRosterStudent;
  saving: boolean;
  onMarkPresent: () => void;
  onRecordPickup: () => void;
  size?: "sm" | "md";
}) {
  const type = attendancePrimaryActionType(student.attendanceStatus);
  const name = formatEnrolledStudentName(student);
  const pad = size === "sm" ? "!px-3 !py-1.5 !text-[13px]" : "";
  if (saving) {
    return (
      <button type="button" disabled aria-busy="true" className={`${gBtnOutlineSm} ${pad}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Saving…
      </button>
    );
  }
  if (type === "picked_up") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[var(--sf-forest)] ${size === "sm" ? "px-1" : ""}`}>
        <CircleCheck className="h-4 w-4" aria-hidden />
        Picked up
      </span>
    );
  }
  if (type === "record_pickup") {
    return (
      <button
        type="button"
        onClick={onRecordPickup}
        className={`${gBtnOutlineSm} ${pad}`}
        aria-label={`Record pickup for ${name}`}
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden />
        Record Pickup
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onMarkPresent}
      className={`${gBtnOutlineSm} ${pad} !border-[var(--sf-clay)]/45 !text-[var(--sf-clay-deep)] hover:!bg-[var(--sf-accent-wash)]`}
      aria-label={`Mark ${name} present`}
    >
      <UserCheck className="h-3.5 w-3.5" aria-hidden />
      Mark Present
    </button>
  );
}

/**
 * Garden attendance board: date stepper, status filters with counts, search,
 * and a roster as cards (`grid`) or dense rows (`table`). Saving shows on the
 * row, a saved row flashes mint, and toasts come from the shared model.
 */
export function GardenAttendanceBoard({
  att,
  layout = "grid",
  index = 4,
  title,
  embedded = false,
}: {
  att: DashboardAttendanceModel;
  layout?: "grid" | "table";
  index?: number;
  title?: string;
  /** Render without its own card (inside another card or pane). */
  embedded?: boolean;
}) {
  const reduce = useReducedMotion() === true;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const { summary, students } = att;
  const presentish = summary.presentCount + summary.pickedUpCount;
  const allMarked = summary.totalStudents > 0 && summary.notMarkedCount === 0;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((student) => {
      if (filter !== "all" && student.attendanceStatus !== filter) return false;
      if (!q) return true;
      return `${student.firstName} ${student.lastName} ${student.familyName ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [filter, query, students]);

  const sectionTitle = title ?? (att.viewingToday ? "Today's attendance" : "Attendance");

  const header = (
    <div className="flex flex-col gap-3">
      {/* Date stepper */}
      <div className="flex items-center gap-2 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-1.5">
        <button
          type="button"
          onClick={att.goToPreviousDay}
          disabled={att.loading}
          aria-label="Previous day"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--sf-ink)] ring-[1.5px] ring-[var(--sf-ink)]/12 transition-colors hover:bg-[var(--sf-accent-wash)] disabled:opacity-50 ${G_FOCUS}`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <div className="min-w-0 flex-1 text-center" aria-live="polite">
          <p className="m-0 flex items-center justify-center gap-1.5 truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--sf-soft)]" aria-hidden />
            {formatAttendanceDateLabel(att.activeDate)}
            {att.viewingToday ? <GChip tone="info" className="!py-0 !text-[10px]">Today</GChip> : null}
          </p>
          <p className="m-0 mt-0.5 text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
            {att.loading ? "Loading…" : att.subcopy}
          </p>
        </div>
        {!att.viewingToday ? (
          <button
            type="button"
            onClick={att.jumpToToday}
            className={`${gLinkSm} hidden shrink-0 px-2 sm:inline-flex`}
          >
            Jump to today
          </button>
        ) : null}
        <button
          type="button"
          onClick={att.goToNextDay}
          disabled={att.loading}
          aria-label="Next day"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--sf-ink)] ring-[1.5px] ring-[var(--sf-ink)]/12 transition-colors hover:bg-[var(--sf-accent-wash)] disabled:opacity-50 ${G_FOCUS}`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {!att.viewingToday ? (
        <button type="button" onClick={att.jumpToToday} className={`${gLinkSm} self-center sm:hidden`}>
          Jump to today
        </button>
      ) : null}

      {summary.totalStudents > 0 ? (
        <div className="flex items-center gap-3">
          <GProgress
            value={presentish}
            total={summary.totalStudents}
            label={`${presentish} of ${summary.totalStudents} students present`}
            done={allMarked}
          />
          <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-[var(--sf-ink)]/65">
            {summary.notMarkedCount > 0 ? `${summary.notMarkedCount} left to mark` : "All marked"}
          </span>
        </div>
      ) : null}

      {/* Filters + search */}
      {summary.totalStudents > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="radiogroup"
            aria-label="Filter roster by status"
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:pb-0"
          >
            {FILTERS.map((f) => {
              const count = f.count(summary);
              const on = filter === f.key;
              if (f.key !== "all" && count === 0 && !on) return null;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFilter(f.key)}
                  className={`${G_TOGGLE} !min-h-[32px] shrink-0 gap-1.5 !px-3 !py-1 ${on ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
                >
                  {f.label}
                  <span className={`tabular-nums ${on ? "text-white/85" : "text-[var(--sf-ink)]/45"}`}>{count}</span>
                </button>
              );
            })}
          </div>
          {summary.totalStudents > 6 ? (
            <label className="relative block sm:w-[220px]">
              <span className="sr-only">Search students</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/40" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students"
                className={`${G_INPUT} !rounded-full !py-1.5 !pl-9`}
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  let body: React.ReactNode;
  if (att.loading && !att.loadError) {
    body = (
      <div className={layout === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4" : "flex flex-col gap-2"} role="status">
        <span className="sr-only">Loading attendance…</span>
        {Array.from({ length: layout === "grid" ? 4 : 5 }).map((_, i) => (
          <GSkeleton key={i} className={layout === "grid" ? "h-[132px] !rounded-[18px]" : "h-[56px] !rounded-[14px]"} />
        ))}
      </div>
    );
  } else if (att.loadError) {
    body = (
      <GardenLoadError
        title="Couldn't load this day's roster"
        description={att.loadError}
        onRetry={att.retryLoad}
        retrying={att.loading}
      />
    );
  } else if (students.length === 0) {
    body = (
      <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
        No students have Attendance enabled for their program yet.
      </p>
    );
  } else if (visible.length === 0) {
    body = (
      <div className="flex flex-col items-start gap-2 rounded-[16px] bg-[var(--sf-paper)] p-4">
        <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">No students match this filter.</p>
        <button
          type="button"
          className={gLinkSm}
          onClick={() => {
            setFilter("all");
            setQuery("");
          }}
        >
          Show everyone
        </button>
      </div>
    );
  } else if (layout === "table") {
    body = (
      <ul className={`m-0 grid list-none gap-2 p-0 ${embedded ? "2xl:grid-cols-2" : "xl:grid-cols-2"}`} aria-label="Roster">
        <AnimatePresence initial={false}>
          {visible.map((student, i) => (
            <motion.li
              key={student.id}
              layout={reduce ? false : "position"}
              initial={reduce ? false : { opacity: 0 }}
              animate={{
                opacity: 1,
                backgroundColor:
                  att.lastSavedStudentId === student.id ? "var(--sf-mint)" : "rgba(255,255,255,1)",
              }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: PORTAL_EASE }}
              className="overflow-hidden rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10"
            >
              <StudentRow att={att} student={student} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
  } else {
    body = (
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4" aria-label="Roster">
        <AnimatePresence initial={false}>
          {visible.map((student, i) => (
            <motion.li
              key={student.id}
              layout={reduce ? false : "position"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: PORTAL_EASE }}
            >
              <StudentCard att={att} student={student} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
  }

  const footer = (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3">
      <span className="text-[12px] font-semibold text-[var(--sf-soft)]">
        Tip: open a student to mark absent or see their history.
      </span>
      <Link href={att.fullAttendanceHref} className={gLinkSm}>
        Open full attendance <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );

  if (embedded) {
    return (
      <div className="flex flex-col gap-4" data-testid="dashboard-attendance">
        {header}
        {body}
        {footer}
      </div>
    );
  }

  return (
    <GCard
      index={index}
      kicker="Attendance"
      title={sectionTitle}
      action={
        <Link href={att.fullAttendanceHref} className={gBtnPopSm}>
          View attendance <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      }
      data-testid="dashboard-attendance"
    >
      <div className="flex flex-col gap-4">
        {header}
        {body}
      </div>
      {footer}
    </GCard>
  );
}

function StudentCard({
  att,
  student,
  index,
}: {
  att: DashboardAttendanceModel;
  student: AttendanceRosterStudent;
  index: number;
}) {
  const chip = STATUS_CHIP[student.attendanceStatus];
  const name = formatEnrolledStudentName(student);
  const justSaved = att.lastSavedStudentId === student.id;
  return (
    <div
      className={`flex h-full flex-col gap-3 rounded-[18px] border-[1.5px] p-4 transition-colors duration-500 ${
        justSaved ? "border-[var(--sf-forest)]/40 bg-[var(--sf-mint)]" : "border-[var(--sf-ink)]/10 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => att.setDetailStudent(student)}
        className={`-m-1 flex items-start gap-3 rounded-[14px] p-1 text-left ${G_FOCUS}`}
        aria-label={`Open ${name}'s attendance details`}
      >
        <StudentAvatar student={student} index={index} />
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
              {student.firstName.trim() || name}
            </span>
            <GChip tone={chip.tone}>{chip.label}</GChip>
          </span>
          <span className="mt-0.5 line-clamp-2 block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
            {studentMeta(student)}
          </span>
          {student.pickedUpByName ? (
            <span className="mt-0.5 block text-[12px] font-semibold text-[var(--sf-soft)]">
              Picked up by {student.pickedUpByName}
            </span>
          ) : null}
        </span>
      </button>
      {!att.readOnly ? (
        <div className="mt-auto [&>*]:w-full">
          <StudentAction
            student={student}
            saving={att.savingStudentId === student.id}
            onMarkPresent={() => void att.saveAttendanceAction(student, "present")}
            onRecordPickup={() => att.setPickupStudent(student)}
          />
        </div>
      ) : null}
    </div>
  );
}

function StudentRow({
  att,
  student,
  index,
}: {
  att: DashboardAttendanceModel;
  student: AttendanceRosterStudent;
  index: number;
}) {
  const chip = STATUS_CHIP[student.attendanceStatus];
  const name = formatEnrolledStudentName(student);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
      <button
        type="button"
        onClick={() => att.setDetailStudent(student)}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-[12px] text-left ${G_FOCUS}`}
        aria-label={`Open ${name}'s attendance details`}
      >
        <StudentAvatar student={student} index={index} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-extrabold text-[var(--sf-ink)]">{name}</span>
          <span className="block truncate text-[12px] font-semibold text-[var(--sf-soft)]">
            {student.pickedUpByName ? `Picked up by ${student.pickedUpByName}` : studentMeta(student)}
          </span>
        </span>
        <GChip tone={chip.tone} className="hidden sm:inline-flex">{chip.label}</GChip>
      </button>
      {!att.readOnly ? (
        <div className="shrink-0">
          <StudentAction
            size="sm"
            student={student}
            saving={att.savingStudentId === student.id}
            onMarkPresent={() => void att.saveAttendanceAction(student, "present")}
            onRecordPickup={() => att.setPickupStudent(student)}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Detail + pickup sheets. Render OUTSIDE ParentGardenFrame. */
export function GardenAttendanceSheets({
  att,
  organizationId,
  theme,
  C,
}: {
  att: DashboardAttendanceModel;
  organizationId: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
}) {
  const { detailStudent, pickupStudent, savingStudentId } = att;
  return (
    <>
      <AttendanceStudentDetailSheet
        open={detailStudent != null}
        student={detailStudent}
        organizationId={organizationId}
        rosterDate={att.activeDateKey}
        theme={theme}
        C={C}
        saving={detailStudent ? savingStudentId === detailStudent.id : false}
        onClose={() => att.setDetailStudent(null)}
        onMarkPresent={() => {
          if (detailStudent) void att.saveAttendanceAction(detailStudent, "present");
        }}
        onMarkAbsent={() => {
          if (detailStudent) void att.saveAttendanceAction(detailStudent, "absent");
        }}
        onRecordPickup={() => {
          if (detailStudent) att.setPickupStudent(detailStudent);
        }}
      />
      <AttendancePickupSheet
        open={pickupStudent != null}
        student={pickupStudent}
        organizationId={organizationId}
        theme={theme}
        C={C}
        saving={pickupStudent ? savingStudentId === pickupStudent.id : false}
        onClose={() => att.setPickupStudent(null)}
        onConfirm={(selection) => {
          if (pickupStudent) void att.saveAttendanceAction(pickupStudent, "pickup", selection);
        }}
      />
    </>
  );
}
