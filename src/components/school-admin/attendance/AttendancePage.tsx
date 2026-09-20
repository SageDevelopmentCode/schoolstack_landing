"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import { formatEnrolledStudentName } from "@/lib/school-admin/enrolled-students";
import type {
  AttendanceAction,
  AttendancePickupSelection,
  AttendanceRosterResponse,
  AttendanceRosterStatus,
  AttendanceRosterStudent,
} from "@/lib/school-admin/attendance/attendance-types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import AttendancePickupSheet from "./AttendancePickupSheet";
import AttendanceRosterTable from "./AttendanceRosterTable";
import AttendanceStudentDetailSheet from "./AttendanceStudentDetailSheet";

type AttendancePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

type StatusFilter = "all" | AttendanceRosterStatus;

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "not_marked", label: "Not marked" },
  { key: "picked_up", label: "Picked up" },
];

function formatAttendanceDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(date: Date, deltaDays: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + deltaDays);
  return next;
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function AttendanceFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-1.5 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
    </button>
  );
}

export default function AttendancePage({
  organizationId,
  branding,
  slug,
}: AttendancePageProps) {
  void branding;
  void slug;

  const { theme, C } = useSchoolAdminStoryTheme();
  const [activeDate, setActiveDate] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roster, setRoster] = useState<AttendanceRosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [detailStudent, setDetailStudent] = useState<AttendanceRosterStudent | null>(null);
  const [pickupStudent, setPickupStudent] = useState<AttendanceRosterStudent | null>(null);

  const dateKey = useMemo(() => toDateKey(activeDate), [activeDate]);
  const isToday = isSameDay(activeDate, new Date());

  const loadRoster = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/school-admin/attendance?organizationId=${encodeURIComponent(organizationId)}&date=${encodeURIComponent(dateKey)}`,
      );
      const payload = (await response.json().catch(() => null)) as
        | AttendanceRosterResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Failed to load attendance roster.",
        );
      }

      setRoster(payload as AttendanceRosterResponse);
    } catch (err) {
      const message = formatActionError(err, "Failed to load attendance roster.");
      void reportClientOperationalError({
        organizationId,
        operation: "attendance.load_roster",
        error: message,
      });
      adminToast.error(message);
      setRoster(null);
    } finally {
      setLoading(false);
    }
  }, [dateKey, organizationId]);

  useEffect(() => {
    void loadRoster();
  }, [loadRoster]);

  useEffect(() => {
    if (!detailStudent?.id || !roster) return;
    const refreshed = roster.students.find((student) => student.id === detailStudent.id);
    if (!refreshed) return;

    setDetailStudent((current) => {
      if (!current || current.id !== refreshed.id) return current;
      if (
        current.attendanceStatus === refreshed.attendanceStatus &&
        current.pickedUpByName === refreshed.pickedUpByName &&
        current.presentAt === refreshed.presentAt &&
        current.absentAt === refreshed.absentAt &&
        current.pickedUpAt === refreshed.pickedUpAt
      ) {
        return current;
      }
      return refreshed;
    });
  }, [detailStudent?.id, roster]);

  const filteredStudents = useMemo(() => {
    const students = roster?.students ?? [];
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      if (statusFilter !== "all" && student.attendanceStatus !== statusFilter) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        formatEnrolledStudentName(student),
        student.familyName ?? "",
        student.programNames.join(" "),
        student.classroomNames.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [roster?.students, search, statusFilter]);

  const saveAttendanceAction = useCallback(
    async (
      student: AttendanceRosterStudent,
      action: AttendanceAction,
      pickupSelection?: AttendancePickupSelection,
    ) => {
      setSavingStudentId(student.id);
      try {
        const response = await fetch("/api/school-admin/attendance/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            studentId: student.id,
            date: dateKey,
            action,
            pickupSource: pickupSelection?.source,
            pickupContactId: pickupSelection?.contactId,
          }),
        });

        const payload = (await response.json().catch(() => null)) as {
          status?: AttendanceRosterStudent["attendanceStatus"];
          presentAt?: string | null;
          absentAt?: string | null;
          pickedUpAt?: string | null;
          pickedUpByGuardianId?: string | null;
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to save attendance.");
        }

        await loadRoster();

        if (action === "pickup") {
          setPickupStudent(null);
        }

        adminToast.success(
          action === "present"
            ? `${formatEnrolledStudentName(student)} marked present.`
            : action === "absent"
              ? `${formatEnrolledStudentName(student)} marked absent.`
              : `Pickup recorded for ${formatEnrolledStudentName(student)}.`,
        );
      } catch (err) {
        const message = formatActionError(err, "Failed to save attendance.");
        void reportClientOperationalError({
          organizationId,
          operation: "attendance.save_record",
          error: message,
        });
        adminToast.error(message);
      } finally {
        setSavingStudentId(null);
      }
    },
    [dateKey, loadRoster, organizationId],
  );

  const presentOrPickedUpCount =
    (roster?.summary.presentCount ?? 0) + (roster?.summary.pickedUpCount ?? 0);

  const statusCounts: Record<StatusFilter, number> = {
    all: roster?.summary.totalStudents ?? 0,
    present: roster?.summary.presentCount ?? 0,
    absent: roster?.summary.absentCount ?? 0,
    not_marked: roster?.summary.notMarkedCount ?? 0,
    picked_up: roster?.summary.pickedUpCount ?? 0,
  };

  const handleMetricClick = (filter: StatusFilter) => {
    setStatusFilter((current) => (current === filter ? "all" : filter));
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1100px] px-[clamp(16px,3vw,36px)] py-4 pb-6">
          <div className="mb-4">
            <AdminSectionKicker theme={theme}>My School</AdminSectionKicker>
            <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1">
              Attendance
            </AdminDisplayHeading>
            <p className="mt-1 text-sm" style={{ color: theme.muted }}>
              Mark daily attendance and record pickups for enrolled students.
            </p>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdminMetricCard
              theme={theme}
              label="Present"
              value={String(roster?.summary.presentCount ?? 0)}
              accent="forest"
              onClick={() => handleMetricClick("present")}
            />
            <AdminMetricCard
              theme={theme}
              label="Absent"
              value={String(roster?.summary.absentCount ?? 0)}
              accent="gold"
              onClick={() => handleMetricClick("absent")}
            />
            <AdminMetricCard
              theme={theme}
              label="Not marked"
              value={String(roster?.summary.notMarkedCount ?? 0)}
              accent="berry"
              onClick={() => handleMetricClick("not_marked")}
            />
            <AdminMetricCard
              theme={theme}
              label="Picked up"
              value={String(roster?.summary.pickedUpCount ?? 0)}
              accent="sky"
              onClick={() => handleMetricClick("picked_up")}
            />
          </div>

          <div className="overflow-hidden">
            <div
              className="sticky top-0 z-[1] rounded-t-xl border border-b-0 px-3 py-2.5 sm:px-4"
              style={{ borderColor: "#EDF1ED", backgroundColor: C.elevated }}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDate((current) => shiftDate(current, -1))}
                  className="rounded-lg p-1.5 transition-colors hover:bg-black/[0.04]"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: C.textSecondary }} />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-sm font-bold" style={{ color: C.textPrimary }}>
                    {formatAttendanceDateLabel(activeDate)}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                    {presentOrPickedUpCount} of {roster?.summary.totalStudents ?? 0} present
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDate((current) => shiftDate(current, 1))}
                  className="rounded-lg p-1.5 transition-colors hover:bg-black/[0.04]"
                  aria-label="Next day"
                >
                  <ChevronRight className="h-4 w-4" style={{ color: C.textSecondary }} />
                </button>
              </div>

              {!isToday ? (
                <div className="mt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveDate(new Date())}
                    className="text-[11px] font-semibold underline-offset-2 hover:underline"
                    style={{ color: C.accent }}
                  >
                    Jump to today
                  </button>
                </div>
              ) : null}

              <div
                className="mt-2.5 flex items-center gap-2 rounded-xl border px-3 py-1.5"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <Search className="h-3.5 w-3.5 shrink-0" style={{ color: C.textTertiary }} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  style={{ color: C.textPrimary }}
                />
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((filter) => (
                  <AttendanceFilterPill
                    key={filter.key}
                    active={statusFilter === filter.key}
                    label={filter.label}
                    count={statusCounts[filter.key]}
                    onClick={() => setStatusFilter(filter.key)}
                    theme={theme}
                  />
                ))}
              </div>
            </div>

            <AttendanceRosterTable
              students={filteredStudents}
              theme={theme}
              C={C}
              loading={loading}
              savingStudentId={savingStudentId}
              selectedStudentId={detailStudent?.id ?? null}
              emptyMessage={
                roster?.students.length
                  ? "No students match your search or filter."
                  : "No enrolled students have Attendance enabled for their program."
              }
              onRowClick={setDetailStudent}
              onMarkPresent={(student) => void saveAttendanceAction(student, "present")}
              onRecordPickup={setPickupStudent}
            />
          </div>
        </div>
      </div>

      <AttendanceStudentDetailSheet
        open={detailStudent != null}
        student={detailStudent}
        organizationId={organizationId}
        rosterDate={dateKey}
        theme={theme}
        C={C}
        saving={detailStudent ? savingStudentId === detailStudent.id : false}
        onClose={() => setDetailStudent(null)}
        onMarkPresent={() => {
          if (detailStudent) void saveAttendanceAction(detailStudent, "present");
        }}
        onMarkAbsent={() => {
          if (detailStudent) void saveAttendanceAction(detailStudent, "absent");
        }}
        onRecordPickup={() => {
          if (detailStudent) setPickupStudent(detailStudent);
        }}
      />

      <AttendancePickupSheet
        open={pickupStudent != null}
        student={pickupStudent}
        organizationId={organizationId}
        theme={theme}
        C={C}
        saving={pickupStudent ? savingStudentId === pickupStudent.id : false}
        onClose={() => setPickupStudent(null)}
        onConfirm={(selection) => {
          if (pickupStudent) {
            void saveAttendanceAction(pickupStudent, "pickup", selection);
          }
        }}
      />
    </div>
  );
}
