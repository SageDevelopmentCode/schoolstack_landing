"use client";

import { Fragment, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BarChart3, ChevronDown, ClipboardList, Clock, Settings, TimerReset } from "lucide-react";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  GardenField,
  GardenLoadError,
  GardenSelect,
  GardenStatTiles,
  GardenSwitch,
  LiveDot,
  gInputClass,
  useGardenFieldId,
} from "@/components/school-admin/garden/kit";
import {
  G_TABLE,
  G_TD,
  G_TH,
  GardenAvatar,
  GardenGroupHeading,
  GardenLeadStrip,
  GardenRefetchVeil,
  gRowClass,
} from "@/components/school-admin/garden/blocks";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, G_FOCUS, G_TOGGLE, G_TOGGLE_OFF, G_TOGGLE_ON, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { BusyLabel } from "@/components/school-admin/garden/kit";
import { StaffHoursLiveElapsed } from "@/components/school-admin/staff-hours/StaffHoursLiveElapsed";
import StaffHoursRequestsPanel, {
  StaffHoursPendingRequestsSection,
} from "@/components/school-admin/staff-hours/StaffHoursRequestsPanel";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type {
  AdminStaffHoursPageData,
  AdminStaffHoursSessionRow,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import {
  formatHoursMinutes,
  formatShortWeekdayDate,
  parseDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import { useAdminStaffHoursModel, type AdminStaffHoursModel, type StaffHoursView } from "./useAdminStaffHoursModel";

type StaffHoursPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  initialData: AdminStaffHoursPageData;
};

function viewAriaLabel(view: StaffHoursView): string {
  if (view === "summary") return "Staff hours summary";
  if (view === "requests") return "Hour adjustment requests";
  if (view === "settings") return "Staff hours settings";
  return "Live staff hours";
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export default function StaffHoursPage({ organizationId, slug, branding, initialData }: StaffHoursPageProps) {
  void slug;
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const model = useAdminStaffHoursModel({ organizationId, initialData });
  const reduce = useReducedMotion() === true;
  const pendingCount = model.pendingRequests.length;
  const { pageData } = model;

  const statusParts = [
    `${pageData.liveRows.length} clocked in now`,
    plural(pageData.todayClosedSessions.length, "session") + " finished today",
  ];
  if (pendingCount > 0) statusParts.push(`${plural(pendingCount, "request")} waiting for you`);

  return (
    <AdminGardenPage theme={theme} data-testid="admin-staff-hours-page">
      <AdminGardenPageHeader
        kicker="My school"
        title={
          <>
            Staff <span className="text-[var(--sf-clay)]">hours</span>
          </>
        }
        subtitle={statusParts.join(" · ")}
        refresh={{
          onRefresh: () => void model.reload({ announce: true }),
          refreshing: model.loading,
          lastUpdatedAt: model.lastUpdatedAt,
          label: "Refresh staff hours",
        }}
        tabs={{
          items: [
            { key: "live", label: "Live", icon: <Clock className="h-3.5 w-3.5" aria-hidden />, testId: "staff-hours-tab-live" },
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
              suffix:
                pendingCount > 0 ? (
                  <span
                    className="inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-butter)] px-1 text-[11px] font-extrabold leading-none tabular-nums text-[var(--sf-ink)]"
                    data-testid="staff-hours-requests-count"
                  >
                    {pendingCount}
                  </span>
                ) : null,
            },
            {
              key: "settings",
              label: "Settings",
              icon: <Settings className="h-3.5 w-3.5" aria-hidden />,
              testId: "staff-hours-tab-settings",
            },
          ],
          activeKey: model.view,
          onChange: (key) => model.selectView(key as StaffHoursView),
          ariaLabel: "Staff hours views",
          "data-testid": "staff-hours-tab-nav",
        }}
      />

      {model.loadError ? (
        <GardenLoadError
          title="Couldn't refresh staff hours"
          description={`${model.loadError} You're seeing the last numbers that loaded.`}
          onRetry={() => void model.reload()}
          retrying={model.loading}
        />
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={model.view}
          role="tabpanel"
          aria-label={viewAriaLabel(model.view)}
          aria-busy={model.loading}
          className="flex min-w-0 flex-col gap-5"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: PORTAL_EASE }}
        >
          {model.view === "live" ? (
            <LiveView model={model} organizationId={organizationId} />
          ) : model.view === "summary" ? (
            <SummaryView model={model} />
          ) : model.view === "requests" ? (
            <StaffHoursRequestsPanel model={model} />
          ) : (
            <SettingsView model={model} />
          )}
        </motion.div>
      </AnimatePresence>
    </AdminGardenPage>
  );
}

/* ------------------------------------------------------------------ */
/* Live                                                                */
/* ------------------------------------------------------------------ */

function LiveView({ model, organizationId }: { model: AdminStaffHoursModel; organizationId: string }) {
  void organizationId;
  const { pageData } = model;
  const pending = model.pendingRequests;
  const live = pageData.liveRows;
  const finished = pageData.todayClosedSessions;
  const todayLabel = formatShortWeekdayDate(parseDateKey(pageData.referenceDateKey));

  return (
    <>
      {pending.length > 0 ? (
        <GardenLeadStrip
          icon={TimerReset}
          kicker={`Needs attention · ${plural(pending.length, "request")}`}
          title={
            pending.length === 1
              ? `${pending[0].staffName} asked to change their hours`
              : `${pending[0].staffName} and ${plural(pending.length - 1, "other")} asked to change their hours`
          }
          meta={`For ${formatShortWeekdayDate(parseDateKey(pending[0].workDate))}`}
          cta="Review requests"
          onClick={() => model.selectView("requests")}
          data-testid="staff-hours-review-next"
        />
      ) : null}

      <GardenStatTiles
        layout="strip"
        ariaLabel="Staff hours today"
        stats={[
          {
            id: "clocked-in",
            label: "Clocked in now",
            value: (
              <span className="inline-flex items-center gap-2">
                {live.length}
                {live.length > 0 ? <LiveDot /> : null}
              </span>
            ),
          },
          { id: "sessions-today", label: "Sessions today", value: finished.length },
          { id: "hours-today", label: "Logged today", value: formatHoursMinutes(model.todayMinutes) },
          {
            id: "requests",
            label: "Requests waiting",
            value: pending.length,
            onClick: () => model.selectView("requests"),
          },
        ]}
      />

      <GardenRefetchVeil active={model.loading}>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <GCard
            index={1}
            kicker={todayLabel}
            title="On the clock"
            action={<GChip tone={live.length > 0 ? "success" : "neutral"}>{live.length}</GChip>}
            data-testid="staff-hours-live-active"
          >
            {live.length === 0 ? (
              <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
                No one is clocked in right now. Teachers clock in from My Hours in the teacher portal.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {live.map((row) => (
                  <li key={row.entryId} className="flex items-center gap-3 rounded-[14px] px-2 py-2.5">
                    <GardenAvatar name={row.staffName} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{row.staffName}</span>
                      <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                        {row.roleTitle ? `${row.roleTitle} · ` : ""}In at {row.clockInLabel}
                      </span>
                    </span>
                    <GChip tone="success">
                      <span className="inline-flex items-center gap-1.5">
                        <LiveDot />
                        <StaffHoursLiveElapsed clockInAt={row.clockInAt} />
                      </span>
                    </GChip>
                  </li>
                ))}
              </ul>
            )}
          </GCard>

          <GCard
            index={2}
            kicker={todayLabel}
            title="Finished today"
            action={<GChip tone="neutral">{finished.length}</GChip>}
            data-testid="staff-hours-live-finished"
          >
            {finished.length === 0 ? (
              <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
                No completed sessions yet today.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {finished.map((session) => (
                  <li key={session.id} className="flex items-center gap-3 rounded-[14px] px-2 py-2.5">
                    <GardenAvatar name={session.staffName} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                        {session.staffName}
                      </span>
                      <span className="block truncate text-[12.5px] font-semibold tabular-nums text-[var(--sf-soft)]">
                        {session.clockInLabel} – {session.clockOutLabel}
                      </span>
                    </span>
                    <span className="text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                      {formatHoursMinutes(session.minutes)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GCard>
        </div>
      </GardenRefetchVeil>

      {pending.length > 0 ? <StaffHoursPendingRequestsSection model={model} /> : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

function SessionsList({ sessions, emptyMessage }: { sessions: AdminStaffHoursSessionRow[]; emptyMessage: string }) {
  if (sessions.length === 0) {
    return <p className="m-0 px-3 py-3 text-[13px] font-semibold text-[var(--sf-soft)]">{emptyMessage}</p>;
  }
  return (
    <ul className="m-0 grid list-none gap-1.5 p-2 sm:grid-cols-2">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex items-center justify-between gap-3 rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/[0.08] bg-white px-3 py-2"
        >
          <span className="min-w-0">
            <span className="block text-[13px] font-extrabold text-[var(--sf-ink)]">
              {formatShortWeekdayDate(parseDateKey(session.workDate))}
            </span>
            <span className="block text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
              {session.clockInLabel} – {session.clockOutLabel}
            </span>
          </span>
          <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]">
            {formatHoursMinutes(session.minutes)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SummaryView({ model }: { model: AdminStaffHoursModel }) {
  const fromId = useGardenFieldId("sh-from");
  const toId = useGardenFieldId("sh-to");
  const staffId = useGardenFieldId("sh-staff");
  const { pageData } = model;
  const rangeLabel = `${formatShortWeekdayDate(parseDateKey(model.applied.from))} – ${formatShortWeekdayDate(
    parseDateKey(model.applied.to),
  )}`;
  const staffOptions = [
    { value: "", label: "All staff" },
    ...pageData.staffOptions.map((option) => ({ value: option.id, label: option.name })),
  ];
  const appliedStaff = pageData.staffOptions.find((o) => o.id === model.applied.staff)?.name;
  const rangeInvalid = Boolean(model.summaryFrom && model.summaryTo && model.summaryFrom > model.summaryTo);

  return (
    <>
      <GCard index={1} kicker="Date range" title="Choose what to total">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick ranges">
            {model.presets.map((preset) => {
              const active = model.summaryFrom === preset.from && model.summaryTo === preset.to;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => model.applyPreset(preset)}
                  className={`${G_TOGGLE} ${active ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr_auto] sm:items-end">
            <GardenField id={fromId} label="From">
              <input
                id={fromId}
                type="date"
                value={model.summaryFrom}
                max={model.summaryTo || undefined}
                onChange={(e) => model.setSummaryFrom(e.target.value)}
                data-garden-skip
                className={gInputClass(rangeInvalid ? "invalid" : null)}
              />
            </GardenField>
            <GardenField id={toId} label="To">
              <input
                id={toId}
                type="date"
                value={model.summaryTo}
                min={model.summaryFrom || undefined}
                onChange={(e) => model.setSummaryTo(e.target.value)}
                data-garden-skip
                className={gInputClass(rangeInvalid ? "invalid" : null)}
              />
            </GardenField>
            <GardenField id={staffId} label="Staff">
              <GardenSelect
                id={staffId}
                value={model.staffFilter}
                onChange={model.setStaffFilter}
                options={staffOptions}
                aria-label="Filter by staff member"
              />
            </GardenField>
            <button
              type="button"
              className={gBtnPopSm}
              disabled={model.loading || rangeInvalid || !model.summaryFrom || !model.summaryTo}
              aria-busy={model.loading || undefined}
              onClick={() => void model.applySummary()}
              data-testid="staff-hours-summary-apply"
            >
              <BusyLabel busy={model.loading} busyLabel="Loading…">
                Apply
              </BusyLabel>
            </button>
          </div>
          <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
            {rangeInvalid
              ? "The start date needs to be on or before the end date."
              : model.summaryDirty
                ? "Press Apply to update the totals below."
                : `Showing ${rangeLabel}${appliedStaff ? ` for ${appliedStaff}` : " for all staff"}.`}
          </p>
        </div>
      </GCard>

      <GardenStatTiles
        layout="strip"
        ariaLabel="Totals for this range"
        stats={[
          { id: "total", label: "Total hours", value: formatHoursMinutes(model.summaryTotals.minutes) },
          { id: "sessions", label: "Sessions", value: model.summaryTotals.sessions },
          { id: "staff", label: "Staff with hours", value: model.summaryTotals.staffWithHours },
        ]}
      />

      <GCard index={2} kicker={rangeLabel} title="Hours by staff" data-testid="admin-staff-hours-summary">
        <GardenRefetchVeil active={model.loading}>
          {pageData.summaryRows.length === 0 ? (
            <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
              No staff to show for this range.
            </p>
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className={`${G_TABLE} min-w-[560px]`}>
                <thead>
                  <tr>
                    <th scope="col" className={G_TH}>Staff</th>
                    <th scope="col" className={`${G_TH} text-right`}>Days</th>
                    <th scope="col" className={`${G_TH} text-right`}>Sessions</th>
                    <th scope="col" className={`${G_TH} text-right`}>Total</th>
                    <th scope="col" className={G_TH}>
                      <span className="sr-only">Sessions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.summaryRows.map((row) => {
                    const expanded = model.expandedStaffId === row.staffMemberId;
                    const toggle = () => model.setExpandedStaffId(expanded ? null : row.staffMemberId);
                    return (
                      <Fragment key={row.staffMemberId}>
                        <tr
                          className={gRowClass({ interactive: true, selected: expanded })}
                          onClick={toggle}
                        >
                          <td className={G_TD}>
                            <span className="flex items-center gap-3">
                              <GardenAvatar name={row.staffName} size="sm" />
                              <span className="min-w-0">
                                <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{row.staffName}</span>
                                <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">
                                  {row.roleTitle ?? "—"}
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className={`${G_TD} text-right text-[14px] font-bold tabular-nums`}>{row.daysWorked}</td>
                          <td className={`${G_TD} text-right text-[14px] font-bold tabular-nums`}>{row.sessionCount}</td>
                          <td className={`${G_TD} text-right text-[15px] font-extrabold tabular-nums`}>
                            {formatHoursMinutes(row.totalMinutes)}
                          </td>
                          <td className={`${G_TD} text-right`}>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggle();
                              }}
                              aria-expanded={expanded}
                              aria-label={`${expanded ? "Hide" : "Show"} sessions for ${row.staffName}`}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
                            >
                              {expanded ? "Hide" : "Sessions"}
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
                            </button>
                          </td>
                        </tr>
                        {expanded ? (
                          <tr>
                            <td colSpan={5} className="border-b border-[var(--sf-ink)]/[0.06] bg-[var(--sf-paper)] p-0">
                              <SessionsList
                                sessions={model.sessionsForStaff(row.staffMemberId)}
                                emptyMessage="No sessions in this range."
                              />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-3 pt-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">
                      Total
                    </td>
                    <td />
                    <td className="px-3 pt-3 text-right text-[14px] font-extrabold tabular-nums">{model.summaryTotals.sessions}</td>
                    <td className="px-3 pt-3 text-right text-[15px] font-extrabold tabular-nums">
                      {formatHoursMinutes(model.summaryTotals.minutes)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </GardenRefetchVeil>
      </GCard>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function SettingsView({ model }: { model: AdminStaffHoursModel }) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
      <GCard index={1} kicker="Hour adjustments" title="Approvals" data-testid="staff-hours-settings-panel">
        <GardenSwitch
          checked={model.requireApproval}
          onChange={() => void model.toggleRequireApproval()}
          busy={model.settingsSaving}
          label="Require approval for hour adjustments"
          description="When this is on, teacher changes stay pending until you approve them."
          data-testid="staff-hours-require-approval"
        />
        <div className="mt-4 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/80">
          {model.requireApproval ? (
            <>
              <b className="text-[var(--sf-ink)]">On:</b> when a teacher edits their hours, the change waits under{" "}
              <button type="button" className={`font-extrabold text-[var(--sf-clay-deep)] hover:underline ${G_FOCUS}`} onClick={() => model.selectView("requests")}>
                Requests
              </button>{" "}
              until you approve or deny it.
            </>
          ) : (
            <>
              <b className="text-[var(--sf-ink)]">Off:</b> when a teacher edits their hours, the change saves right away.
            </>
          )}
        </div>
      </GCard>
      <GCard index={2} tone="paper" kicker="Good to know" title="How staff hours work">
        <GardenGroupHeading>Clocking in</GardenGroupHeading>
        <p className="m-0 mb-3 text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/80">
          Teachers clock in and out from My Hours in the teacher portal. Live sessions show up on the Live tab.
        </p>
        <GardenGroupHeading>Totals</GardenGroupHeading>
        <p className="m-0 text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/80">
          Summary adds up finished sessions for any date range, per staff member.
        </p>
      </GCard>
    </div>
  );
}
