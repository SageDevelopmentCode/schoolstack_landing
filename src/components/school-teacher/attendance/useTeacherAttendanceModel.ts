"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AttendanceFilterKey } from "@/components/school-admin/dashboard/garden/GardenAttendanceBoard";
import { useDashboardAttendanceModel } from "@/components/school-admin/attendance/useDashboardAttendanceModel";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { toDateKey } from "@/lib/school-admin/attendance/attendance-date-utils";
import type {
  AttendanceRosterResponse,
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

const EMPTY_SUMMARY: AttendanceRosterSummary = {
  totalStudents: 0,
  presentCount: 0,
  absentCount: 0,
  pickedUpCount: 0,
  notMarkedCount: 0,
};
const EMPTY_STUDENTS: AttendanceRosterStudent[] = [];

function validDateKey(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export type TeacherAttendancePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  previewMode?: boolean;
  /** Roster to start from (marketing demo); nothing is fetched until the date changes. */
  initialRoster?: AttendanceRosterResponse;
  /**
   * Keep `?date=` in step with the date stepper. The marketing demo turns this
   * off so it never writes the walkthrough's URL.
   */
  syncDateToUrl?: boolean;
};

/**
 * Staff Attendance page state: the shared attendance model on the teacher
 * API (`AttendanceApiProvider` comes from the page), the roster filter, guided
 * roll call and the `?date=` sync. Rules:
 * `.agents/skills/teacher-portal-garden-design/SKILL.md`.
 */
export function useTeacherAttendanceModel({
  organizationId,
  slug,
  previewMode = false,
  initialRoster,
  syncDateToUrl = true,
}: TeacherAttendancePageProps) {
  const { theme, adminCompat } = useParentTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [startDate] = useState(
    () =>
      initialRoster?.date ??
      (syncDateToUrl ? validDateKey(searchParams.get("date")) : null) ??
      toDateKey(new Date()),
  );
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilterKey>("all");
  const [rollCallOpen, setRollCallOpen] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());

  const att = useDashboardAttendanceModel({
    organizationId,
    date: startDate,
    students: initialRoster?.students ?? EMPTY_STUDENTS,
    summary: initialRoster?.summary ?? EMPTY_SUMMARY,
    attendanceHref: schoolTeacherPath(slug, "attendance"),
    previewMode,
    operationalErrorSurface: "teacher_portal",
    initialLoad: !initialRoster,
    silentLoadErrors: true,
    onRecordSaved: () => setLastUpdatedAt(Date.now()),
  });

  // Keep ?date= in step with the date stepper (today drops the param).
  const todayKey = toDateKey(new Date());
  useEffect(() => {
    if (!syncDateToUrl) return;
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("date");
    const wanted = att.activeDateKey === todayKey ? null : att.activeDateKey;
    if (current === wanted) return;
    if (wanted) params.set("date", wanted);
    else params.delete("date");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [att.activeDateKey, pathname, router, searchParams, syncDateToUrl, todayKey]);

  const toggleFilter = (key: AttendanceFilterKey) =>
    setAttendanceFilter((current) => (current === key ? "all" : key));

  const refresh = () => {
    void att.refreshRoster().then((roster) => {
      if (roster) setLastUpdatedAt(Date.now());
    });
  };

  return {
    theme,
    adminCompat,
    previewMode,
    att,
    attendanceFilter,
    setAttendanceFilter,
    toggleFilter,
    rollCallOpen,
    openRollCall: () => setRollCallOpen(true),
    closeRollCall: () => setRollCallOpen(false),
    lastUpdatedAt,
    refresh,
  };
}

export type TeacherAttendanceModel = ReturnType<typeof useTeacherAttendanceModel>;
