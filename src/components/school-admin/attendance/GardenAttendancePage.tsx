"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { AdminGardenPage, AdminGardenPageHeader, GardenStatTiles } from "@/components/school-admin/garden/kit";
import { GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import {
  GardenAttendanceBoard,
  GardenAttendanceSheets,
  type AttendanceFilterKey,
} from "@/components/school-admin/dashboard/garden/GardenAttendanceBoard";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import { useDashboardAttendanceModel } from "./useDashboardAttendanceModel";
import { buildParentThemeTokens, parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { formatAttendanceDateLabel, toDateKey } from "@/lib/school-admin/attendance/attendance-date-utils";
import type { AttendanceRosterStudent, AttendanceRosterSummary } from "@/lib/school-admin/attendance/attendance-types";

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

/**
 * Admin Attendance (Garden). Same data and saves as the story page, through
 * the shared `useDashboardAttendanceModel`; `?date=` is read and kept in
 * sync. The teacher portal and demos keep `AttendancePage`.
 */
export default function GardenAttendancePage({
  organizationId,
  branding,
  slug,
}: {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
}) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [startDate] = useState(() => validDateKey(searchParams.get("date")) ?? toDateKey(new Date()));
  const [filter, setFilter] = useState<AttendanceFilterKey>("all");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());

  const att = useDashboardAttendanceModel({
    organizationId,
    date: startDate,
    students: EMPTY_STUDENTS,
    summary: EMPTY_SUMMARY,
    attendanceHref: schoolAdminPath(slug, "my_school", "attendance"),
    operationalErrorSurface: "school_admin",
    initialLoad: true,
    silentLoadErrors: true,
    onRecordSaved: () => setLastUpdatedAt(Date.now()),
  });

  // Keep ?date= in step with the date stepper (today drops the param).
  const todayKey = toDateKey(new Date());
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("date");
    const wanted = att.activeDateKey === todayKey ? null : att.activeDateKey;
    if (current === wanted) return;
    if (wanted) params.set("date", wanted);
    else params.delete("date");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [att.activeDateKey, pathname, router, searchParams, todayKey]);

  const { summary } = att;
  const allMarked = summary.totalStudents > 0 && summary.notMarkedCount === 0 && !att.loading;
  useCelebrate(allMarked && att.viewingToday, theme, `admin-attendance-${att.activeDateKey}`);

  const toggle = (key: AttendanceFilterKey) => setFilter((current) => (current === key ? "all" : key));
  const dateLabel = formatAttendanceDateLabel(att.activeDate);
  const subtitle = att.loading
    ? `${dateLabel} · Loading roster…`
    : summary.totalStudents === 0
      ? `${dateLabel} · Mark daily attendance and record pickups for enrolled students.`
      : `${dateLabel} · ${att.subcopy}${summary.notMarkedCount > 0 ? ` · ${summary.notMarkedCount} left to mark` : " · everyone is marked"}`;

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      data-testid="admin-attendance-page"
      overlays={<GardenAttendanceSheets att={att} organizationId={organizationId} theme={theme} C={C} />}
    >
      <AdminGardenPageHeader
        kicker="My school"
        title={
          <>
            <span className="text-[var(--sf-clay)]">Attendance</span>
          </>
        }
        subtitle={subtitle}
        refresh={{
          onRefresh: () => {
            void att.refreshRoster().then((roster) => {
              if (roster) setLastUpdatedAt(Date.now());
            });
          },
          refreshing: att.loading,
          lastUpdatedAt,
          label: "Refresh attendance",
        }}
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
          onClick={() => setFilter("not_marked")}
          data-testid="attendance-show-unmarked"
        />
      ) : null}

      <GardenStatTiles
        ariaLabel="Attendance for this day"
        stats={[
          { id: "present", label: "Present", value: summary.presentCount, accent: "forest", onClick: () => toggle("present"), active: filter === "present" },
          { id: "absent", label: "Absent", value: summary.absentCount, accent: "gold", onClick: () => toggle("absent"), active: filter === "absent" },
          {
            id: "not_marked",
            label: "Not marked",
            value: summary.notMarkedCount,
            accent: "berry",
            onClick: () => toggle("not_marked"),
            active: filter === "not_marked",
          },
          { id: "picked_up", label: "Picked up", value: summary.pickedUpCount, accent: "sky", onClick: () => toggle("picked_up"), active: filter === "picked_up" },
        ]}
      />

      <GardenAttendanceBoard
        att={att}
        layout="table"
        index={2}
        variant="page"
        title={att.viewingToday ? "Today's roster" : "Roster"}
        filter={filter}
        onFilterChange={setFilter}
      />
    </AdminGardenPage>
  );
}
