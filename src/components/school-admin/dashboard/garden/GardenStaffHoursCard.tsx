"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StaffHoursLiveElapsed } from "@/components/school-admin/staff-hours/StaffHoursLiveElapsed";
import {
  GCard,
  GChip,
  GKicker,
  PANEL_TINTS,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminDashboardToday } from "@/lib/school-admin/dashboard-summary";

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** Pulsing "live" dot (static under reduced motion). */
export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex h-2 w-2 shrink-0 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--sf-forest)] opacity-50 motion-reduce:hidden" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--sf-forest)]" />
    </span>
  );
}

function StaffAvatar({ name, index }: { name: string; index: number }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[13px] font-extrabold text-[var(--sf-ink)]/70 ${PANEL_TINTS[index % PANEL_TINTS.length]}`}
    >
      {initials(name)}
    </span>
  );
}

function StaffList({
  kicker,
  count,
  live = false,
  empty,
  children,
  footer,
}: {
  kicker: string;
  count: number;
  live?: boolean;
  empty: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section aria-label={kicker} className="flex min-w-0 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <GKicker>{kicker}</GKicker>
        <GChip tone={count > 0 ? (live ? "success" : "neutral") : "neutral"} className="tabular-nums">
          {live && count > 0 ? <LiveDot /> : null}
          {count}
        </GChip>
      </div>
      {count === 0 ? (
        <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] px-4 py-3.5 text-[13.5px] font-semibold text-[var(--sf-soft)]">
          {empty}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">{children}</ul>
      )}
      {footer}
    </section>
  );
}

/**
 * Staff hours · Today: live stat strip, who's on the clock (live timers) and
 * who finished today. Read-only; refreshes with the dashboard.
 */
export default function GardenStaffHoursCard({
  slug,
  today,
  index = 5,
}: {
  slug: string;
  today: AdminDashboardToday;
  index?: number;
}) {
  const data = today.staffHoursToday;
  if (!data) return null;
  const href = schoolAdminPath(slug, "my_school", "staff_hours");

  const stats: Array<{ label: string; value: string; live?: boolean }> = [
    { label: "Clocked in now", value: String(data.clockedInCount), live: data.clockedInCount > 0 },
    { label: "Sessions done today", value: String(data.completedSessionCount) },
    { label: "Logged today", value: data.totalHoursLabel },
  ];

  return (
    <GCard
      index={index}
      kicker="Staff hours"
      title="Who's working today"
      action={
        <Link href={href} className={gLinkSm}>
          Open Staff hours <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
      data-testid="dashboard-staff-hours"
    >
      <p className="sr-only">{data.summaryLine}</p>

      {/* Stat strip */}
      <dl className="m-0 grid grid-cols-3 overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex min-w-0 flex-col-reverse gap-1 px-3 py-3 sm:px-5 ${i > 0 ? "border-l-[1.5px] border-[var(--sf-ink)]/[0.08]" : ""}`}
          >
            <dt className="flex items-center gap-1.5 text-[12px] font-extrabold leading-tight text-[var(--sf-ink)]/60 sm:text-[13px]">
              {stat.live ? <LiveDot /> : null}
              {stat.label}
            </dt>
            <dd className="sf-display m-0 text-[1.5rem] leading-none tabular-nums text-[var(--sf-ink)] sm:text-[1.9rem]">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Lists */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <StaffList
          kicker="On the clock"
          count={data.clockedIn.length}
          live
          empty="No one is clocked in right now."
        >
          {data.clockedIn.map((row, i) => (
            <li
              key={row.staffMemberId}
              className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-2.5"
            >
              <StaffAvatar name={row.staffName} index={i} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-extrabold text-[var(--sf-ink)]">
                  {row.staffName}
                </span>
                <span className="block text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
                  In since {row.clockInLabel}
                </span>
              </span>
              <GChip tone="success" className="tabular-nums">
                <LiveDot />
                <span className="sr-only">On the clock for </span>
                <StaffHoursLiveElapsed clockInAt={row.clockInAt} />
              </GChip>
            </li>
          ))}
        </StaffList>

        <StaffList
          kicker="Finished today"
          count={data.completedSessionCount}
          empty="No completed sessions yet today."
          footer={
            data.hiddenCompletedCount > 0 ? (
              <Link href={href} className={`${gLinkSm} mt-2.5 self-start px-1`}>
                +{data.hiddenCompletedCount} more on Staff hours <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null
          }
        >
          {data.completedToday.map((row, i) => (
            <li
              key={`${row.staffMemberId}-${row.clockInLabel}-${row.clockOutLabel}`}
              className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-2.5"
            >
              <StaffAvatar name={row.staffName} index={i + 2} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-extrabold text-[var(--sf-ink)]">
                  {row.staffName}
                </span>
                <span className="block text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
                  {row.clockInLabel} – {row.clockOutLabel}
                </span>
              </span>
              <span className="shrink-0 text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                {row.durationLabel}
              </span>
            </li>
          ))}
        </StaffList>
      </div>
    </GCard>
  );
}
