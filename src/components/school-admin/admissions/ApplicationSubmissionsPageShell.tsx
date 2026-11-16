"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, ClipboardList, ExternalLink, Inbox, Loader2 } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { GCard, GChip, GSkeleton, gBtnOnAccent, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  BusyLabel,
  GardenEmptyState,
  GardenFilterChips,
  GardenLoadError,
  GardenStatTiles,
  type GardenStat,
} from "@/components/school-admin/garden/kit";
import ApplicationSubmissionDetailPanel from "./ApplicationSubmissionDetailPanel";
import { SubmissionsPageContext } from "./submissions-page-context";
import {
  GardenContactCell,
  GardenFeeBadges,
  GardenNextStepCell,
  GardenProgressCell,
  toGChipTone,
} from "./submissions/GardenSubmissionCells";
import {
  useApplicationSubmissionsModel,
  type ApplicationSubmissionsModel,
} from "./submissions/useApplicationSubmissionsModel";
import {
  adminApplicationStatusLabel,
  applicationStatusChipTone,
  APPLICATION_STATUS_FILTER_ORDER,
} from "@/lib/admissions/application-status-ui";
import { formatShortDate, type AdminApplicationSubmission } from "@/lib/admissions/application-submissions";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import type { ApplicationSubmissionsPageMeta } from "@/lib/school-admin/load-submissions-page-data";
import type { ApplicationSubmissionsTableData } from "@/lib/school-admin/load-submissions-table-data";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ApplicationSubmissionsPageShellProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  initialMeta: ApplicationSubmissionsPageMeta;
  initialTableData?: ApplicationSubmissionsTableData;
  initialLoginStatusByGuardianId?: Record<string, ParentPortalLoginStatus>;
  children?: ReactNode;
};

function statusLine(model: ApplicationSubmissionsModel): string {
  const parts: string[] = [];
  if (model.submittedCount > 0) {
    parts.push(`${model.submittedCount} ready to review`);
  }
  parts.push(`${model.activeSubmissionsCount} active application${model.activeSubmissionsCount === 1 ? "" : "s"}`);
  if (model.draftCount > 0) parts.push(`${model.draftCount} in progress`);
  return parts.join(" · ");
}

export default function ApplicationSubmissionsPageShell({
  organizationId,
  branding,
  schoolName,
  slug,
  initialMeta,
  initialTableData,
  initialLoginStatusByGuardianId,
  children,
}: ApplicationSubmissionsPageShellProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const model = useApplicationSubmissionsModel({
    organizationId,
    slug,
    initialMeta,
    initialTableData,
    initialLoginStatusByGuardianId,
    hasStreamedTable: children != null,
  });

  const stats: GardenStat[] = [
    {
      id: "all",
      label: "All applications",
      value: String(model.activeSubmissionsCount),
      accent: "forest",
      active: model.statusFilter === "all",
      onClick: () => model.changeStatusFilter("all"),
    },
    {
      id: "draft",
      label: "In progress",
      value: String(model.draftCount),
      accent: "sky",
      active: model.statusFilter === "draft",
      onClick: () => model.changeStatusFilter("draft"),
    },
    {
      id: "submitted",
      label: "Ready to review",
      value: String(model.submittedCount),
      accent: "gold",
      active: model.statusFilter === "submitted",
      onClick: () => model.changeStatusFilter("submitted"),
    },
    {
      id: "enrolled",
      label: "Enrolled learners",
      value: String(model.enrolledCount),
      accent: "berry",
      active: model.statusFilter === "enrolled",
      onClick: () => model.changeStatusFilter("enrolled"),
    },
  ];

  const statusOptions = [
    { key: "all", label: "All", count: model.activeSubmissionsCount },
    ...APPLICATION_STATUS_FILTER_ORDER.filter((status) => model.statusCounts[status]).map((status) => ({
      key: status,
      label: adminApplicationStatusLabel(status),
      count: model.statusCounts[status],
    })),
  ];

  return (
    <SubmissionsPageContext.Provider value={{ hydrateTable: model.hydrateTable }}>
      <AdminGardenPage
        theme={theme}
        data-testid="admin-submissions-page"
        overlays={
          <AnimatePresence>
            {model.selectedSubmission ? (
              <ApplicationSubmissionDetailPanel
                key={model.selectedSubmission.id}
                appearance="garden"
                submission={model.selectedSubmission}
                organizationId={organizationId}
                branding={branding}
                schoolName={schoolName}
                schoolSlug={slug}
                onClose={() => model.setSelectedId(null)}
                onSubmissionUpdated={model.handleSubmissionUpdated}
                onSelectSubmission={model.setSelectedId}
              />
            ) : null}
          </AnimatePresence>
        }
      >
        <AdminGardenPageHeader
          kicker={
            <>
              Admissions<span className="hidden sm:inline"> · {schoolName}</span>
            </>
          }
          title={
            <>
              Application <span className="text-[var(--sf-clay)]">submissions</span>
            </>
          }
          subtitle={model.showMetrics ? statusLine(model) : "Every application families send lands here."}
          refresh={
            model.tableReady
              ? {
                  onRefresh: () => void model.refresh(),
                  refreshing: model.isRefetching,
                  lastUpdatedAt: model.lastUpdatedAt,
                  label: "Refresh submissions",
                }
              : undefined
          }
          actions={
            model.applyPublicPath ? (
              <a
                href={model.applyPublicPath}
                target="_blank"
                rel="noopener noreferrer"
                className={gBtnOutlineSm}
              >
                Public apply link
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : null
          }
        />

        {model.showMetrics ? <GardenStatTiles stats={stats} ariaLabel="Application totals" /> : null}

        {model.showMetrics && model.latestSubmitted ? (
          <ReviewNextStrip
            latest={model.latestSubmitted}
            count={model.submittedCount}
            onOpen={() => model.setSelectedId(model.latestSubmitted!.id)}
          />
        ) : null}

        <SubmissionsTableCard model={model} statusOptions={statusOptions} theme={theme}>
          {children}
        </SubmissionsTableCard>
      </AdminGardenPage>
    </SubmissionsPageContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* "Review next" lead strip (the page's one toy button)               */
/* ------------------------------------------------------------------ */

function ReviewNextStrip({
  latest,
  count,
  onOpen,
}: {
  latest: NonNullable<ApplicationSubmissionsModel["latestSubmitted"]>;
  count: number;
  onOpen: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const first = latest.guardianName?.split(" ")[0] ?? "family";
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex w-full flex-col items-start gap-3 rounded-[22px] border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] px-5 py-4 text-left text-white shadow-[0_4px_0_0_var(--sf-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between"
      data-testid="submissions-review-next"
    >
      <span className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)]"
        >
          <ClipboardList className="h-5 w-5 text-[var(--sf-ink)]" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">
            Needs attention{count > 1 ? ` · ${count} ready to review` : ""}
          </span>
          <span className="mt-0.5 block text-[16px] font-extrabold leading-snug">
            {latest.guardianName ?? "A family"}&apos;s completed application is ready for your review
          </span>
          {latest.submittedAt ? (
            <span className="block text-[13px] font-semibold text-white/80">
              Submitted {formatShortDate(latest.submittedAt)}
            </span>
          ) : null}
        </span>
      </span>
      <span className={gBtnOnAccent}>
        Review {first}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

function SubmissionsTableCard({
  model,
  statusOptions,
  theme,
  children,
}: {
  model: ApplicationSubmissionsModel;
  statusOptions: Array<{ key: string; label: string; count?: number }>;
  theme: ParentThemeTokens;
  /** Streamed table loader (Suspense) until the table hydrates. */
  children?: ReactNode;
}) {
  const filters = (
    <div className="flex flex-col gap-2.5">
      <GardenFilterChips
        ariaLabel="Filter by status"
        options={statusOptions}
        value={model.statusFilter}
        onChange={model.changeStatusFilter}
        busy={model.isRefetching}
      />
      {model.formOptions.length > 1 ? (
        <GardenFilterChips
          ariaLabel="Filter by form"
          options={[
            { key: "all", label: "All forms" },
            ...model.formOptions.map((option) => ({ key: option.key, label: option.title })),
          ]}
          value={model.formFilter}
          onChange={model.changeFormFilter}
        />
      ) : null}
    </div>
  );

  let body: ReactNode;
  if (model.error && !model.tableReady) {
    body = (
      <GardenLoadError
        title="Submissions didn't load"
        description={model.error}
        onRetry={model.retry}
        retrying={model.initialLoading}
      />
    );
  } else if (model.tableReady && model.showEmptyFilteredState) {
    body = (
      <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
        No submissions match the current filters.{" "}
        <button
          type="button"
          onClick={() => {
            model.changeStatusFilter("all");
            model.changeFormFilter("all");
          }}
          className={gLinkSm}
        >
          Show all applications
        </button>
      </div>
    );
  } else if (model.tableReady && model.unfilteredTotalCount === 0) {
    body = (
      <GardenEmptyState
        icon={Inbox}
        title="No applications yet"
        description="Publish an enrollment flow and share your public apply link with families."
        action={
          <Link href={model.flowsPath} className={gLinkSm}>
            Go to Enrollment Flows
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        }
      />
    );
  } else if (model.tableReady) {
    body = <SubmissionsTable model={model} theme={theme} />;
  } else if (model.hasStreamedTable) {
    body = children;
  } else {
    body = <SubmissionsTableSkeletonRows columns={model.tableColumnCount} />;
  }

  return (
    <GCard
      index={3}
      kicker="Applications"
      title={
        model.statusFilter === "all"
          ? "All submissions"
          : adminApplicationStatusLabel(model.statusFilter)
      }
      action={
        model.tableReady && model.unfilteredTotalCount > 0 ? (
          <span className="text-[12.5px] font-bold tabular-nums text-[var(--sf-soft)]" aria-live="polite">
            {model.filteredSubmissions.length} shown
          </span>
        ) : null
      }
      data-testid="submissions-table-card"
    >
      {model.tableReady && model.unfilteredTotalCount > 0 ? (
        <div className="mb-4 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4">{filters}</div>
      ) : null}
      {body}
    </GCard>
  );
}

export function SubmissionsTableSkeletonRows({ columns = 6 }: { columns?: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <span className="sr-only">Loading submissions</span>
      <div className="flex gap-2">
        {Array.from({ length: Math.min(columns, 5) }).map((_, i) => (
          <GSkeleton key={i} className="h-8 w-24 !rounded-full" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <GSkeleton key={i} className="h-[58px] !rounded-[14px]" />
      ))}
    </div>
  );
}

function rowName(submission: AdminApplicationSubmission): string {
  return [submission.guardianName, submission.studentLabel].filter(Boolean).join(", ");
}

function SubmissionsTable({ model, theme }: { model: ApplicationSubmissionsModel; theme: ParentThemeTokens }) {
  const reduce = useReducedMotion() === true;
  const toggle = (id: string) => model.setSelectedId(model.selectedId === id ? null : id);

  return (
    <div className="relative">
      {model.isRefetching ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-16" aria-hidden>
          <Loader2 className="h-5 w-5 animate-spin text-[var(--sf-clay)]" />
        </div>
      ) : null}
      <div className={`transition-opacity duration-200 ${model.isRefetching ? "opacity-55" : ""}`}>
        {/* Phones: one tappable card per application */}
        <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
          {model.filteredSubmissions.map((submission) => {
            const selected = submission.id === model.selectedId;
            const flashed = submission.id === model.flashId;
            return (
              <li key={submission.id}>
                {/* Stretched-button card: the overlay button opens the record, the
                    login-status tooltip (its own button) stays clickable above it. */}
                <div
                  className={`relative flex w-full flex-col gap-2.5 rounded-[16px] border-[1.5px] px-3.5 py-3 text-left transition-colors ${
                    flashed
                      ? "border-[var(--sf-forest)]/40 bg-[var(--sf-mint)]"
                      : selected
                        ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                        : "border-[var(--sf-ink)]/10 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(submission.id)}
                    aria-label={`Open ${rowName(submission) || "application"}`}
                    aria-expanded={selected}
                    className="absolute inset-0 rounded-[16px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35"
                  />
                  <div className="pointer-events-none flex w-full items-start justify-between gap-2">
                    <GardenContactCell
                      submission={submission}
                      loginStatusByGuardianId={model.loginStatusByGuardianId}
                      loginStatusLoading={model.loginStatusLoading}
                      theme={theme}
                    />
                    <GChip tone={applicationStatusChipTone(submission.status)}>
                      {adminApplicationStatusLabel(submission.status)}
                    </GChip>
                  </div>
                  <div className="pointer-events-none flex w-full items-end justify-between gap-2">
                    <span className="min-w-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                      {submission.studentLabel ?? "—"}
                      {model.showFormColumn ? ` · ${submission.formTitle}` : ""}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40" aria-hidden />
                  </div>
                  <div className="pointer-events-none">
                    <GardenNextStepCell submission={submission} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Tablet and up: the full table (scrolls inside the card) */}
        <div className="-mx-1 hidden overflow-x-auto md:block">
          <table className={`w-full ${model.tableMinWidth} border-separate border-spacing-0 text-left`}>
            <thead>
              <tr>
                {model.tableHeadings.map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="border-b-[1.5px] border-[var(--sf-ink)]/10 px-3 pb-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {model.filteredSubmissions.map((submission) => {
                const selected = submission.id === model.selectedId;
                const flashed = submission.id === model.flashId;
                const cell = "border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 align-middle";
                return (
                  <tr
                    key={submission.id}
                    onClick={() => toggle(submission.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle(submission.id);
                      }
                    }}
                    tabIndex={0}
                    aria-selected={selected}
                    className={`cursor-pointer transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sf-clay)]/45 ${
                      flashed
                        ? "bg-[var(--sf-mint)]"
                        : selected
                          ? "bg-[var(--sf-accent-wash)]"
                          : "hover:bg-[var(--sf-accent-wash)]"
                    }`}
                  >
                    {model.showFormColumn ? (
                      <td className={cell}>
                        <div className="text-[13px] font-extrabold text-[var(--sf-ink)]">{submission.formTitle}</div>
                        {submission.programName ? (
                          <div className="mt-0.5 text-[12px] font-semibold text-[var(--sf-soft)]">
                            {submission.programName}
                          </div>
                        ) : null}
                      </td>
                    ) : null}
                    <td className={cell}>
                      <GardenContactCell
                        submission={submission}
                        loginStatusByGuardianId={model.loginStatusByGuardianId}
                        loginStatusLoading={model.loginStatusLoading}
                        theme={theme}
                      />
                    </td>
                    <td className={`${cell} text-[13px] font-bold text-[var(--sf-ink)]/80`}>
                      {submission.studentLabel ?? "—"}
                    </td>
                    <td className={cell}>
                      <GChip tone={applicationStatusChipTone(submission.status)}>
                        {adminApplicationStatusLabel(submission.status)}
                      </GChip>
                    </td>
                    {model.showEnrollmentColumn ? (
                      <td className={cell}>
                        {model.enrichmentLoading && !submission.enrollmentSummary ? (
                          <GSkeleton className="h-5 w-16 !rounded-full" />
                        ) : submission.enrollmentSummary ? (
                          <GChip tone={toGChipTone(submission.enrollmentSummary.tone)}>
                            <span title={submission.enrollmentSummary.label}>
                              {submission.enrollmentSummary.label}
                            </span>
                          </GChip>
                        ) : (
                          <span className="text-[var(--sf-soft)]">—</span>
                        )}
                      </td>
                    ) : null}
                    {model.showPostSubmitColumn ? (
                      <td className={cell}>
                        {model.enrichmentLoading && !submission.postSubmitSummary ? (
                          <GSkeleton className="h-5 w-20 !rounded-full" />
                        ) : submission.postSubmitSummary ? (
                          <GChip tone={toGChipTone(submission.postSubmitSummary.tone)} className="max-w-[12rem]">
                            <span className="truncate" title={submission.postSubmitSummary.label}>
                              {submission.postSubmitSummary.label}
                            </span>
                          </GChip>
                        ) : (
                          <span className="text-[var(--sf-soft)]">—</span>
                        )}
                      </td>
                    ) : null}
                    <td className={cell}>
                      <GardenProgressCell submission={submission} />
                    </td>
                    <td className={cell}>
                      <GardenNextStepCell submission={submission} />
                    </td>
                    {model.showFeesColumn ? (
                      <td className={cell}>
                        <GardenFeeBadges submission={submission} />
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {model.hasMoreSubmissions ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4">
          <button
            type="button"
            disabled={model.loadingMore}
            aria-busy={model.loadingMore || undefined}
            onClick={model.loadMore}
            className={gBtnOutlineSm}
          >
            <BusyLabel busy={model.loadingMore} busyLabel="Loading more…">
              Show more ({model.unfilteredTotalCount - model.loadedSubmissions.length} remaining)
            </BusyLabel>
          </button>
          <span className="text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
            Showing {model.loadedSubmissions.length} of {model.unfilteredTotalCount}
          </span>
        </div>
      ) : null}
    </div>
  );
}
