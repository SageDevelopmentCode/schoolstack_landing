"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import {
  ADMIN_DEMO_STORY_COMPAT,
  ADMIN_DEMO_STORY_THEME,
} from "@/components/demo/shared/admin-demo-runtime";
import { DEMO_ADMIN_PAPER_BG } from "@/components/demo/shared/demo-story-theme";
import {
  computeDemoSubmissionMetrics,
  findDemoLeadForSubmission,
  getDemoFormOptions,
  getLatestSubmittedRow,
  mapDemoLeadsToSubmissions,
  type DemoSubmissionLead,
} from "@/components/demo/shared/demo-submissions-mapper";
import SubmissionContactCell from "@/components/school-admin/admissions/SubmissionContactCell";
import SubmissionFeeBadges from "@/components/school-admin/admissions/SubmissionFeeBadges";
import SubmissionNextStepCell from "@/components/school-admin/admissions/SubmissionNextStepCell";
import SubmissionProgressCell from "@/components/school-admin/admissions/SubmissionProgressCell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import {
  adminApplicationStatusLabel,
  applicationStatusChipTone,
  applicationSubmissionRowStyle,
  APPLICATION_STATUS_FILTER_ORDER,
} from "@/lib/admissions/application-status-ui";
import { enrollmentProgressBadgeStyle } from "@/lib/admissions/admin-enrollment-progress";
import { postSubmitSummaryBadgeStyle } from "@/lib/admissions/admin-post-submit-steps";
import { submissionHasFeeBadges } from "@/lib/admissions/admin-submission-fee-badges";
import {
  formatShortDate,
  matchesSubmissionListFilters,
} from "@/lib/admissions/application-submissions";

export const DEMO_NEW_SUBMISSION_LEAD_ID = "l0";

type StatusFilter = "all" | string;
type FormFilter = "all" | string;

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  const theme = ADMIN_DEMO_STORY_THEME;
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
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

export default function DemoApplicationSubmissionsTab({
  leads,
  onSelectLead,
  selectedLeadId = null,
  animateNewSubmission = false,
  newSubmissionLeadId = DEMO_NEW_SUBMISSION_LEAD_ID,
}: {
  leads: DemoSubmissionLead[];
  onSelectLead: (lead: DemoSubmissionLead) => void;
  selectedLeadId?: string | null;
  animateNewSubmission?: boolean;
  newSubmissionLeadId?: string;
}) {
  const theme = ADMIN_DEMO_STORY_THEME;
  const C = ADMIN_DEMO_STORY_COMPAT;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [timedReveal, setTimedReveal] = useState(false);

  useEffect(() => {
    if (!animateNewSubmission) return;
    const timer = setTimeout(() => setTimedReveal(true), 700);
    return () => {
      clearTimeout(timer);
      setTimedReveal(false);
    };
  }, [animateNewSubmission]);

  const submissions = useMemo(() => mapDemoLeadsToSubmissions(leads), [leads]);
  const metrics = useMemo(
    () => computeDemoSubmissionMetrics(submissions),
    [submissions],
  );
  const formOptions = useMemo(() => getDemoFormOptions(submissions), [submissions]);
  const latestSubmitted = useMemo(
    () => getLatestSubmittedRow(submissions),
    [submissions],
  );

  const filteredSubmissions = useMemo(
    () =>
      submissions.filter((row) =>
        matchesSubmissionListFilters(row, {
          statusFilter,
          formKey: formFilter,
        }),
      ),
    [formFilter, statusFilter, submissions],
  );

  const animatedLead = animateNewSubmission
    ? leads.find((lead) => lead.id === newSubmissionLeadId)
    : undefined;
  const animatedSubmission = animatedLead
    ? submissions.find((row) => row.id === animatedLead.id)
    : undefined;
  const useNewSubmissionAnimation =
    animateNewSubmission && !!animatedLead && !!animatedSubmission;
  const newSubmissionRevealed = !animateNewSubmission || timedReveal;

  const visibleSubmissions = useMemo(() => {
    if (!useNewSubmissionAnimation) return filteredSubmissions;
    const withoutAnimated = filteredSubmissions.filter(
      (row) => row.id !== newSubmissionLeadId,
    );
    if (!newSubmissionRevealed || !animatedSubmission) return withoutAnimated;
    return [animatedSubmission, ...withoutAnimated];
  }, [
    animatedSubmission,
    filteredSubmissions,
    newSubmissionLeadId,
    newSubmissionRevealed,
    useNewSubmissionAnimation,
  ]);

  const showFormColumn = formOptions.length > 1;
  const showFeesColumn = submissions.some((row) => submissionHasFeeBadges(row));
  const showPostSubmitColumn = submissions.some((row) => row.hasPostSubmitActions);
  const showEnrollmentColumn = submissions.some((row) => row.enrollmentSummary !== null);

  const tableMinWidth = showFormColumn ? "min-w-[980px]" : "min-w-[900px]";

  const tableHeadings = [
    ...(showFormColumn ? ["Form"] : []),
    "Contact",
    "Student",
    "Status",
    ...(showEnrollmentColumn ? ["Enrollment"] : []),
    ...(showPostSubmitColumn ? ["Post-submit"] : []),
    "Progress",
    "Next step",
    ...(showFeesColumn ? ["Fees"] : []),
  ];

  const showEmptyFilteredState =
    filteredSubmissions.length === 0 && submissions.length > 0;

  function handleRowClick(submissionId: string) {
    const lead = findDemoLeadForSubmission(leads, submissionId);
    if (lead) onSelectLead(lead);
  }

  function renderSubmissionCells(submission: (typeof submissions)[number]) {
    return (
      <>
        {showFormColumn ? (
          <td className="px-[15px] py-3">
            <div className="text-xs font-semibold" style={{ color: theme.ink }}>
              {submission.formTitle}
            </div>
            {submission.programName ? (
              <div className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
                {submission.programName}
              </div>
            ) : null}
          </td>
        ) : null}
        <td className="px-[15px] py-3">
          <SubmissionContactCell
            guardianName={submission.guardianName}
            contactEmail={submission.contactEmail}
            primaryGuardianId={submission.primaryGuardianId}
            loginStatusByGuardianId={{}}
            loginStatusLoading={false}
            C={C}
            theme={theme}
          />
        </td>
        <td className="px-[15px] py-3 text-xs" style={{ color: "#607078" }}>
          {submission.studentLabel ?? "—"}
        </td>
        <td className="px-[15px] py-3">
          <AdminChip theme={theme} tone={applicationStatusChipTone(submission.status)}>
            {adminApplicationStatusLabel(submission.status)}
          </AdminChip>
        </td>
        {showEnrollmentColumn ? (
          <td className="px-[15px] py-3">
            {submission.enrollmentSummary ? (
              <span
                className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                style={enrollmentProgressBadgeStyle(
                  submission.enrollmentSummary.tone,
                  C,
                )}
                title={submission.enrollmentSummary.label}
              >
                {submission.enrollmentSummary.label}
              </span>
            ) : (
              <span style={{ color: theme.muted }}>—</span>
            )}
          </td>
        ) : null}
        {showPostSubmitColumn ? (
          <td className="px-[15px] py-3">
            {submission.postSubmitSummary ? (
              <span
                className="inline-flex max-w-[12rem] truncate rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                style={postSubmitSummaryBadgeStyle(
                  submission.postSubmitSummary.tone,
                  C,
                )}
                title={submission.postSubmitSummary.label}
              >
                {submission.postSubmitSummary.label}
              </span>
            ) : (
              <span style={{ color: theme.muted }}>—</span>
            )}
          </td>
        ) : null}
        <td className="px-[15px] py-3">
          <SubmissionProgressCell submission={submission} theme={theme} />
        </td>
        <td className="px-[15px] py-3">
          <SubmissionNextStepCell submission={submission} theme={theme} />
        </td>
        {showFeesColumn ? (
          <td className="px-[15px] py-3">
            <SubmissionFeeBadges submission={submission} C={C} />
          </td>
        ) : null}
      </>
    );
  }

  function renderSubmissionRow(
    submission: (typeof submissions)[number],
    animationProps?: {
      initial?: { opacity: number; x?: number };
      animate?: {
        opacity: number;
        x?: number;
        backgroundColor?: string | string[];
      };
      transition?: {
        duration?: number;
        ease?: [number, number, number, number];
        backgroundColor?: { duration?: number; ease?: string };
      };
    },
  ) {
    const isSelected = submission.id === selectedLeadId;
    const isHovered = hoveredId === submission.id;
    const rowStyle = applicationSubmissionRowStyle(submission.status, C, {
      isSelected,
      isHovered,
    });
    const rowHandlers = {
      onClick: () => handleRowClick(submission.id),
      onMouseEnter: () => setHoveredId(submission.id),
      onMouseLeave: () => setHoveredId(null),
    };
    const rowClassName = "cursor-pointer transition-colors";
    const rowSurfaceStyle = {
      ...rowStyle,
      borderTop: "1px solid #EDF1ED",
    };

    if (animationProps) {
      return (
        <motion.tr
          key={submission.id}
          {...rowHandlers}
          className={rowClassName}
          style={rowSurfaceStyle}
          initial={animationProps.initial}
          animate={animationProps.animate}
          transition={animationProps.transition}
        >
          {renderSubmissionCells(submission)}
        </motion.tr>
      );
    }

    return (
      <tr key={submission.id} {...rowHandlers} className={rowClassName} style={rowSurfaceStyle}>
        {renderSubmissionCells(submission)}
      </tr>
    );
  }

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{ backgroundColor: DEMO_ADMIN_PAPER_BG }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard
              theme={theme}
              value={String(metrics.activeCount)}
              label="All applications"
              accent="forest"
            />
            <AdminMetricCard
              theme={theme}
              value={String(metrics.draftCount)}
              label="In progress"
              accent="sky"
            />
            <AdminMetricCard
              theme={theme}
              value={String(metrics.submittedCount)}
              label="Ready to review"
              accent="gold"
            />
            <AdminMetricCard
              theme={theme}
              value={String(metrics.enrolledCount)}
              label="Enrolled learners"
              accent="berry"
            />
          </div>

          {latestSubmitted ? (
            <div
              className="mb-[15px] flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
              style={{
                backgroundColor: "#EAF4EB",
                borderColor: "#C7DFCB",
                color: "#42694F",
              }}
            >
              <span className="text-xs">
                <b>Needs attention:</b>{" "}
                {latestSubmitted.guardianName ?? "A family"}&apos;s completed application is
                ready for your review
                {latestSubmitted.submittedAt
                  ? ` · Submitted ${formatShortDate(latestSubmitted.submittedAt)}`
                  : ""}
                .
              </span>
              <AdminButton
                theme={theme}
                variant="soft"
                onClick={() => handleRowClick(latestSubmitted.id)}
              >
                Review {latestSubmitted.guardianName?.split(" ")[0] ?? "family"} →
              </AdminButton>
            </div>
          ) : null}

          <div className="mb-[15px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StoryFilterPill
                active={statusFilter === "all"}
                label="All"
                count={metrics.activeCount}
                onClick={() => setStatusFilter("all")}
              />
              {APPLICATION_STATUS_FILTER_ORDER.filter(
                (status) => metrics.statusCounts[status],
              ).map((status) => (
                <StoryFilterPill
                  key={status}
                  active={statusFilter === status}
                  label={adminApplicationStatusLabel(status)}
                  count={metrics.statusCounts[status]}
                  onClick={() => setStatusFilter(status)}
                />
              ))}
            </div>
            <AdminButton theme={theme} variant="primary" type="button">
              Public apply link
              <ExternalLink className="h-3.5 w-3.5" />
            </AdminButton>
          </div>

          {formOptions.length > 1 ? (
            <div className="mb-[15px] flex flex-wrap items-center gap-2">
              <StoryFilterPill
                active={formFilter === "all"}
                label="All forms"
                count={submissions.length}
                onClick={() => setFormFilter("all")}
              />
              {formOptions.map((option) => (
                <StoryFilterPill
                  key={option.key}
                  active={formFilter === option.key}
                  label={option.label}
                  count={option.count}
                  onClick={() => setFormFilter(option.key)}
                />
              ))}
            </div>
          ) : null}

          {submissions.length === 0 ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                No applications yet. Publish an enrollment flow and share your public apply
                link with families.
              </p>
            </AdminCard>
          ) : showEmptyFilteredState ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm" style={{ color: theme.muted }}>
                No submissions match the current filters.
              </p>
            </AdminCard>
          ) : (
            <AdminCard theme={theme} padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`w-full ${tableMinWidth} border-collapse text-left`}>
                  <thead style={{ backgroundColor: "#FBFCFB" }}>
                    <tr>
                      {tableHeadings.map((heading) => (
                        <th
                          key={heading}
                          className="px-[15px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                          style={{ color: "#8B9699" }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <motion.tbody
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {useNewSubmissionAnimation ? (
                      <>
                        <AnimatePresence>
                          {newSubmissionRevealed && animatedSubmission
                            ? renderSubmissionRow(animatedSubmission, {
                                initial: { opacity: 0, x: 56 },
                                animate: {
                                  opacity: 1,
                                  x: 0,
                                  backgroundColor: [C.accentLight, "transparent"],
                                },
                                transition: {
                                  duration: 0.65,
                                  ease: [0.22, 1, 0.36, 1],
                                  backgroundColor: { duration: 1.2, ease: "easeOut" },
                                },
                              })
                            : null}
                        </AnimatePresence>
                        {visibleSubmissions
                          .filter((row) => row.id !== newSubmissionLeadId)
                          .map((submission) => renderSubmissionRow(submission))}
                      </>
                    ) : (
                      visibleSubmissions.map((submission) =>
                        renderSubmissionRow(submission),
                      )
                    )}
                  </motion.tbody>
                </table>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
