"use client";

import { Fragment, useCallback, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BarChart3, ClipboardList, Clock, Settings } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import {
  StaffHoursLiveLoadingSkeleton,
  StaffHoursSummaryTableLoadingSkeleton,
} from "@/components/school-admin/staff-hours/StaffHoursLoadingSkeleton";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  parseOperationalError,
  reportClientOperationalError,
  shouldReportPortalClientError,
} from "@/lib/operational-errors-client";
import { isBenignPortalErrorCode } from "@/lib/portal-operational-errors";
import {
  portalJsonApiErrorCode,
  portalJsonApiErrorStatus,
} from "@/lib/portal-json-api-error";
import { fetchAdminStaffHoursPageData } from "@/lib/school-admin/staff-hours/fetch-admin-staff-hours";
import {
  staffHoursExpandRowMotion,
  staffHoursMetricCardMotion,
  staffHoursViewPanelMotion,
} from "@/lib/school-admin/staff-hours/staff-hours-motion";
import type {
  AdminStaffHoursPageData,
  AdminStaffHoursSessionRow,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import {
  formatHoursMinutes,
} from "@/lib/school-teacher/my-hours/format-duration";
import { StaffHoursLiveElapsed } from "@/components/school-admin/staff-hours/StaffHoursLiveElapsed";
import StaffHoursRequestsPanel from "@/components/school-admin/staff-hours/StaffHoursRequestsPanel";
import StaffHoursSettingsPanel from "@/components/school-admin/staff-hours/StaffHoursSettingsPanel";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const TABLE_LINE = "#EDF1ED";

type StaffHoursPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  initialData: AdminStaffHoursPageData;
};

type ViewMode = "live" | "summary" | "requests" | "settings";

function viewFromQuery(value: string | null): ViewMode {
  if (value === "summary" || value === "requests" || value === "settings") return value;
  return "live";
}

function viewAriaLabel(view: ViewMode): string {
  if (view === "summary") return "Staff hours summary";
  if (view === "requests") return "Hour adjustment requests";
  if (view === "settings") return "Staff hours settings";
  return "Live staff hours";
}

function FilterLabel({ theme, children }: { theme: ParentThemeTokens; children: string }) {
  return (
    <span
      className="text-[11px] font-bold uppercase tracking-wider"
      style={{ color: theme.muted }}
    >
      {children}
    </span>
  );
}

function StaffHoursSectionCard({
  theme,
  title,
  children,
}: {
  theme: ParentThemeTokens;
  title: string;
  children: ReactNode;
}) {
  return (
    <AdminCard theme={theme} padding="none" className="overflow-hidden">
      <div className="border-b px-5 py-4" style={{ borderColor: TABLE_LINE }}>
        <h2 className="font-display text-lg font-semibold" style={{ color: theme.ink }}>
          {title}
        </h2>
      </div>
      {children}
    </AdminCard>
  );
}

function SessionsTable({
  sessions,
  theme,
  emptyMessage,
}: {
  sessions: AdminStaffHoursSessionRow[];
  theme: ParentThemeTokens;
  emptyMessage: string;
}) {
  if (sessions.length === 0) {
    return (
      <p className="px-5 py-4 text-sm" style={{ color: theme.muted }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr
            className="border-b text-[11px] font-bold uppercase tracking-wider"
            style={{ borderColor: TABLE_LINE, color: theme.muted }}
          >
            <th className="px-5 py-2.5">Staff</th>
            <th className="px-5 py-2.5">In</th>
            <th className="px-5 py-2.5">Out</th>
            <th className="px-5 py-2.5 text-right">Duration</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="border-b last:border-b-0"
              style={{ borderColor: TABLE_LINE, color: theme.ink }}
            >
              <td className="px-5 py-3">{session.staffName}</td>
              <td className="px-5 py-3 tabular-nums">{session.clockInLabel}</td>
              <td className="px-5 py-3 tabular-nums">{session.clockOutLabel}</td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums">
                {formatHoursMinutes(session.minutes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StaffHoursPage({
  organizationId,
  slug,
  branding,
  initialData,
}: StaffHoursPageProps) {
  void slug;
  void branding;
  const { theme, C } = useSchoolAdminStoryTheme();
  const reducedMotion = useReducedMotion() ?? false;
  const {
    variants: viewPanelVariants,
    transition: viewPanelTransition,
  } = staffHoursViewPanelMotion(reducedMotion);
  const rowMotion = staffHoursExpandRowMotion(reducedMotion);
  const dateBounds = schoolAdminDateRangeBounds();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewFromUrl = viewFromQuery(searchParams.get("view"));
  const [view, setView] = useState<ViewMode>(viewFromUrl);
  const [urlView, setUrlView] = useState(viewFromUrl);
  if (viewFromUrl !== urlView) {
    setUrlView(viewFromUrl);
    setView(viewFromUrl);
  }
  const focusRequestId = searchParams.get("request");
  const [pageData, setPageData] = useState(initialData);
  const [summaryFrom, setSummaryFrom] = useState(initialData.summaryFrom);
  const [summaryTo, setSummaryTo] = useState(initialData.summaryTo);
  const [staffFilter, setStaffFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);

  const staffSelectOptions = useMemo(
    () => [
      { value: "", label: "All staff" },
      ...pageData.staffOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    ],
    [pageData.staffOptions],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchAdminStaffHoursPageData(organizationId, {
        from: summaryFrom,
        to: summaryTo,
        staffMemberId: staffFilter || null,
        view: "all",
      });
      setPageData(next);
    } catch (err) {
      const message = formatActionError(err, "Failed to load staff hours.");
      adminToast.error(message);
      if (shouldReportPortalClientError(err, portalJsonApiErrorStatus(err))) {
        const parsed = parseOperationalError(err);
        const code = portalJsonApiErrorCode(err) ?? parsed.code;
        if (!isBenignPortalErrorCode(code)) {
          void reportClientOperationalError({
            organizationId,
            operation: "staff_hours.load",
            error: message,
            code,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [organizationId, summaryFrom, summaryTo, staffFilter]);

  const selectView = useCallback(
    (nextView: ViewMode) => {
      setView(nextView);
      const params = new URLSearchParams(searchParams.toString());
      if (nextView === "live") {
        params.delete("view");
        params.delete("request");
      } else {
        params.set("view", nextView);
        if (nextView !== "requests") params.delete("request");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      if (nextView === "live") void reload();
    },
    [pathname, reload, router, searchParams],
  );

  const applySummary = useCallback(async () => {
    await reload();
    selectView("summary");
  }, [reload, selectView]);

  const sessionsForStaff = useCallback(
    (staffMemberId: string) =>
      pageData.sessions.filter((session) => session.staffMemberId === staffMemberId),
    [pageData.sessions],
  );

  const useLiveRowMotion =
    !reducedMotion && pageData.liveRows.length > 0 && pageData.liveRows.length <= 20;

  const liveMetrics = useMemo(
    () =>
      [
        {
          key: "clocked-in",
          label: "Clocked in now",
          value: String(pageData.liveRows.length),
          accent: "sky" as const,
        },
        {
          key: "sessions-today",
          label: "Sessions today",
          value: String(pageData.todayClosedSessions.length),
          accent: "forest" as const,
        },
      ] as const,
    [pageData.liveRows.length, pageData.todayClosedSessions.length],
  );

  return (
    <div
      className="mx-auto max-w-[1100px] px-[clamp(16px,3vw,36px)] py-4 pb-6"
      data-testid="admin-staff-hours-page"
    >
      <AdminSectionKicker theme={theme}>My School</AdminSectionKicker>
      <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1">
        Staff hours
      </AdminDisplayHeading>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: theme.muted }}>
        Review who is clocked in and totals for a date range. Teachers clock in from My Hours in
        the teacher portal.
      </p>

      <div className="mt-5">
        <ParentStoryPillNav
          theme={theme}
          items={[
            {
              key: "live",
              label: "Live",
              icon: <Clock className="h-3.5 w-3.5" aria-hidden />,
              testId: "staff-hours-tab-live",
            },
            {
              key: "summary",
              label: "Summary",
              icon: <BarChart3 className="h-3.5 w-3.5" aria-hidden />,
              testId: "staff-hours-tab-summary",
            },
            {
              key: "requests",
              label: "Requests",
              icon: <ClipboardList className="h-3.5 w-3.5" aria-hidden />,
              testId: "staff-hours-tab-requests",
            },
            {
              key: "settings",
              label: "Settings",
              icon: <Settings className="h-3.5 w-3.5" aria-hidden />,
              testId: "staff-hours-tab-settings",
            },
          ]}
          activeKey={view}
          onChange={(key) => selectView(key as ViewMode)}
          ariaLabel="Staff hours views"
          data-testid="staff-hours-tab-nav"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          role="tabpanel"
          aria-label={viewAriaLabel(view)}
          aria-busy={loading}
          className="mt-6 w-full min-w-0"
          variants={viewPanelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={viewPanelTransition}
        >
          {view === "requests" ? (
            <StaffHoursRequestsPanel
              theme={theme}
              organizationId={organizationId}
              requests={pageData.adjustmentRequests ?? []}
              focusRequestId={focusRequestId}
              onPageData={setPageData}
            />
          ) : view === "settings" ? (
            <StaffHoursSettingsPanel
              theme={theme}
              organizationId={organizationId}
              adjustmentsRequireApproval={pageData.adjustmentsRequireApproval !== false}
              onChange={(requireApproval) =>
                setPageData((current) => ({
                  ...current,
                  adjustmentsRequireApproval: requireApproval,
                }))
              }
            />
          ) : view === "live" ? (
        loading ? (
          <StaffHoursLiveLoadingSkeleton theme={theme} C={C} />
        ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveMetrics.map((metric, index) => (
              <motion.div
                key={metric.key}
                {...staffHoursMetricCardMotion(reducedMotion, index)}
              >
                <AdminMetricCard
                  theme={theme}
                  label={metric.label}
                  value={metric.value}
                  accent={metric.accent}
                />
              </motion.div>
            ))}
          </div>

          <StaffHoursSectionCard theme={theme} title="Active sessions">
            {pageData.liveRows.length === 0 ? (
              <p className="px-5 py-4 text-sm" style={{ color: theme.muted }}>
                No one is clocked in right now.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr
                      className="border-b text-[11px] font-bold uppercase tracking-wider"
                      style={{ borderColor: TABLE_LINE, color: theme.muted }}
                    >
                      <th className="px-5 py-2.5">Staff</th>
                      <th className="px-5 py-2.5">Role</th>
                      <th className="px-5 py-2.5">Clock in</th>
                      <th className="px-5 py-2.5 text-right">Elapsed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {pageData.liveRows.map((row) =>
                        useLiveRowMotion ? (
                          <motion.tr
                            key={row.entryId}
                            className="border-b last:border-b-0"
                            style={{ borderColor: TABLE_LINE, color: theme.ink }}
                            {...rowMotion}
                          >
                            <td className="px-5 py-3 font-medium">{row.staffName}</td>
                            <td className="px-5 py-3" style={{ color: theme.muted }}>
                              {row.roleTitle ?? "—"}
                            </td>
                            <td className="px-5 py-3 tabular-nums">{row.clockInLabel}</td>
                            <td className="px-5 py-3 text-right" style={{ color: theme.primary }}>
                              <StaffHoursLiveElapsed clockInAt={row.clockInAt} />
                            </td>
                          </motion.tr>
                        ) : (
                          <tr
                            key={row.entryId}
                            className="border-b last:border-b-0"
                            style={{ borderColor: TABLE_LINE, color: theme.ink }}
                          >
                            <td className="px-5 py-3 font-medium">{row.staffName}</td>
                            <td className="px-5 py-3" style={{ color: theme.muted }}>
                              {row.roleTitle ?? "—"}
                            </td>
                            <td className="px-5 py-3 tabular-nums">{row.clockInLabel}</td>
                            <td className="px-5 py-3 text-right" style={{ color: theme.primary }}>
                              <StaffHoursLiveElapsed clockInAt={row.clockInAt} />
                            </td>
                          </tr>
                        ),
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </StaffHoursSectionCard>

          <StaffHoursSectionCard theme={theme} title="Today's completed sessions">
            <SessionsTable
              theme={theme}
              sessions={pageData.todayClosedSessions}
              emptyMessage="No completed sessions yet today."
            />
          </StaffHoursSectionCard>
        </div>
        )
      ) : (
        <div className="space-y-6">
          <AdminCard theme={theme} padding="canvas">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex min-w-[10rem] flex-col gap-1.5">
                <FilterLabel theme={theme}>From</FilterLabel>
                <SchoolAdminDatePicker
                  id="staff-hours-from"
                  C={C}
                  value={summaryFrom}
                  onChange={setSummaryFrom}
                  maxDate={summaryTo || dateBounds.maxDate}
                  placeholder="Select start date"
                />
              </div>
              <div className="flex min-w-[10rem] flex-col gap-1.5">
                <FilterLabel theme={theme}>To</FilterLabel>
                <SchoolAdminDatePicker
                  id="staff-hours-to"
                  C={C}
                  value={summaryTo}
                  onChange={setSummaryTo}
                  minDate={summaryFrom || dateBounds.minDate}
                  placeholder="Select end date"
                />
              </div>
              <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5 sm:max-w-xs">
                <FilterLabel theme={theme}>Staff</FilterLabel>
                <SchoolAdminSelect
                  C={C}
                  value={staffFilter}
                  onChange={setStaffFilter}
                  options={staffSelectOptions}
                  ariaLabel="Filter by staff member"
                  placeholder="All staff"
                />
              </div>
              <AdminButton
                theme={theme}
                type="button"
                disabled={loading}
                onClick={() => void applySummary()}
              >
                {loading ? "Loading…" : "Apply"}
              </AdminButton>
            </div>
          </AdminCard>

          <StaffHoursSectionCard theme={theme} title="Hours by staff">
            {loading ? (
              <StaffHoursSummaryTableLoadingSkeleton C={C} />
            ) : pageData.summaryRows.length === 0 ? (
              <p className="px-5 py-4 text-sm" style={{ color: theme.muted }}>
                No staff to show for this range.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr
                      className="border-b text-[11px] font-bold uppercase tracking-wider"
                      style={{ borderColor: TABLE_LINE, color: theme.muted }}
                    >
                      <th className="px-5 py-2.5">Staff</th>
                      <th className="px-5 py-2.5">Role</th>
                      <th className="px-5 py-2.5 text-right">Days</th>
                      <th className="px-5 py-2.5 text-right">Sessions</th>
                      <th className="px-5 py-2.5 text-right">Total</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.summaryRows.map((row) => {
                      const expanded = expandedStaffId === row.staffMemberId;
                      return (
                        <Fragment key={row.staffMemberId}>
                          <tr
                            className="border-b"
                            style={{ borderColor: TABLE_LINE, color: theme.ink }}
                          >
                            <td className="px-5 py-3 font-medium">{row.staffName}</td>
                            <td className="px-5 py-3" style={{ color: theme.muted }}>
                              {row.roleTitle ?? "—"}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums">{row.daysWorked}</td>
                            <td className="px-5 py-3 text-right tabular-nums">
                              {row.sessionCount}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold tabular-nums">
                              {formatHoursMinutes(row.totalMinutes)}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                type="button"
                                className="text-xs font-semibold"
                                style={{ color: theme.primary }}
                                onClick={() =>
                                  setExpandedStaffId(expanded ? null : row.staffMemberId)
                                }
                              >
                                {expanded ? "Hide" : "Sessions"}
                              </button>
                            </td>
                          </tr>
                          <AnimatePresence initial={false}>
                            {expanded ? (
                              <motion.tr
                                key={`${row.staffMemberId}-detail`}
                                {...rowMotion}
                                style={{ backgroundColor: "#F7F9F7" }}
                              >
                                <td
                                  colSpan={6}
                                  className="border-t px-0 py-0"
                                  style={{ borderColor: TABLE_LINE }}
                                >
                                  <SessionsTable
                                    theme={theme}
                                    sessions={sessionsForStaff(row.staffMemberId)}
                                    emptyMessage="No sessions in this range."
                                  />
                                </td>
                              </motion.tr>
                            ) : null}
                          </AnimatePresence>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </StaffHoursSectionCard>
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
