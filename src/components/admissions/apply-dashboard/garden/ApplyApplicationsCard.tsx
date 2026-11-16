"use client";

import { ArrowRight, FilePlus2 } from "lucide-react";
import NavigationLink from "@/components/school/shared/NavigationLink";
import {
  GCard,
  GChip,
  GIcon,
  GProgress,
  PANEL_TINTS,
  SPRINGY,
  G_FOCUS,
  gBtnPopSm,
  type GChipTone,
} from "@/components/school-parent/garden/ui";
import {
  applicationStatusChipTone,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import ApplyJourneySteps from "./ApplyJourneySteps";
import type { ApplicationRow } from "../useApplyDashboardModel";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function chipTone(status: string): GChipTone {
  return applicationStatusChipTone(status);
}

function statusChipPrefix(status: string): string {
  if (status === "enrolled" || status === "accepted") return "✓ ";
  return "";
}

function ApplicationRowLink({
  row,
  index,
  isFocused,
}: {
  row: ApplicationRow;
  index: number;
  isFocused: boolean;
}) {
  const { application, action, statusForDisplay, dateLabel, sideStatusText, enrollmentProgress, journey } = row;
  const enrolling = application.status === "enrolling" && statusForDisplay !== "enrolled";

  return (
    <li id={isFocused ? "preview-focus" : undefined} className="scroll-mt-24">
      <NavigationLink
        href={action.href}
        aria-label={action.label}
        data-testid="apply-application-card-link"
        className={`group block rounded-[18px] border-[1.5px] bg-[var(--sf-paper)] p-4 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 hover:bg-white hover:shadow-[0_10px_22px_-16px_rgba(43,36,29,0.55)] sm:p-5 ${SPRINGY} ${G_FOCUS} ${
          isFocused
            ? "border-[var(--sf-clay)] ring-4 ring-[var(--sf-clay)]/15"
            : "border-[var(--sf-ink)]/10"
        }`}
      >
        <article className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-3 sm:grid-cols-[auto_1fr_auto]">
          <span
            aria-hidden="true"
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 ${PANEL_TINTS[index % PANEL_TINTS.length]}`}
          >
            <span className="sf-display text-[1.35rem] text-[var(--sf-ink)]/70">{initials(row.studentName)}</span>
          </span>

          <div className="min-w-0">
            <h3 className="sf-display m-0 text-[1.2rem] leading-tight text-[var(--sf-ink)]">{row.studentName}</h3>
            <p className="m-0 mt-0.5 truncate text-[13px] font-semibold text-[var(--sf-soft)]">{application.formTitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <GChip tone={chipTone(statusForDisplay)}>
                {statusChipPrefix(statusForDisplay)}
                {applicationStatusLabel(statusForDisplay)}
              </GChip>
              {dateLabel ? (
                <span className="text-[12px] font-semibold text-[var(--sf-soft)]">{dateLabel}</span>
              ) : null}
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:flex-col sm:items-end sm:justify-start sm:text-right">
            <span className="text-[12px] font-semibold text-[var(--sf-soft)]">{sideStatusText}</span>
            <span className="inline-flex items-center gap-1 text-sm font-extrabold text-[var(--sf-clay-deep)]">
              {action.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>

          <div className="col-span-2 min-w-0 sm:col-span-3">
            <ApplyJourneySteps journey={journey} />
            {enrolling && enrollmentProgress && enrollmentProgress.total > 0 ? (
              <div className="mt-3 flex items-center gap-3">
                <GProgress
                  value={enrollmentProgress.completed}
                  total={enrollmentProgress.total}
                  label="Enrollment checklist progress"
                />
                <span className="shrink-0 text-[12px] font-extrabold text-[var(--sf-ink)]/70">
                  {enrollmentProgress.completed}/{enrollmentProgress.total}
                </span>
              </div>
            ) : null}
            {application.status === "accepted" ? (
              <p className="m-0 mt-3 rounded-[12px] bg-[var(--sf-mint)] px-3 py-2 text-[13px] font-semibold leading-relaxed text-[var(--sf-forest)]">
                Congratulations — your application was accepted. The school will
                start your enrollment checklist soon.
              </p>
            ) : null}
          </div>
        </article>
      </NavigationLink>
    </li>
  );
}

export default function ApplyApplicationsCard({
  rows,
  index,
  schoolName,
  hasUpcomingVisits,
  startApplicationHref,
  previewMode,
  focusApplicationId,
}: {
  rows: ApplicationRow[];
  index: number;
  schoolName: string;
  hasUpcomingVisits: boolean;
  startApplicationHref: string;
  previewMode: boolean;
  focusApplicationId: string | null;
}) {
  if (rows.length === 0) {
    return (
      <GCard index={index} kicker="Applications" data-testid="apply-applications-card">
        <div className="flex flex-col items-center rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-6 py-10 text-center">
          <GIcon size="lg">
            <FilePlus2 />
          </GIcon>
          <h2 className="sf-display m-0 mt-4 text-[1.4rem] text-[var(--sf-ink)]">No applications yet</h2>
          <p className="m-0 mt-2 max-w-sm text-[15px] font-semibold text-[var(--sf-soft)]">
            {hasUpcomingVisits
              ? `When you're ready, start your application to ${schoolName}.`
              : `Start an application to apply to ${schoolName}.`}
          </p>
          {previewMode ? (
            <span aria-disabled="true" className={`${gBtnPopSm} mt-6 cursor-not-allowed opacity-50`}>
              Start application
            </span>
          ) : (
            <NavigationLink href={startApplicationHref} className={`${gBtnPopSm} mt-6`}>
              Start application <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </NavigationLink>
          )}
        </div>
      </GCard>
    );
  }

  return (
    <GCard
      index={index}
      kicker="Applications"
      title={`${rows.length} ${rows.length === 1 ? "application" : "applications"}`}
      data-testid="apply-applications-card"
    >
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {rows.map((row, i) => (
          <ApplicationRowLink
            key={row.application.id}
            row={row}
            index={i}
            isFocused={focusApplicationId === row.application.id}
          />
        ))}
      </ul>
    </GCard>
  );
}
