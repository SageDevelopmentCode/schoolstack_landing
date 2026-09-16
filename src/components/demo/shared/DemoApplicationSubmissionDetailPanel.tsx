"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  ADMIN_DEMO_STORY_COMPAT,
  ADMIN_DEMO_STORY_THEME,
} from "@/components/demo/shared/admin-demo-runtime";
import { DEMO_DRAWER_PAPER_BG } from "@/components/demo/shared/demo-story-theme";
import {
  buildDemoSubmissionActivity,
  formatDemoSubmissionFieldAnswer,
  type DemoSubmissionFlowField,
  type DemoSubmissionFlowStep,
  type DemoSubmissionLead,
} from "@/components/demo/shared/demo-submissions-mapper";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import {
  adminApplicationStatusLabel,
  applicationStatusChipTone,
} from "@/lib/admissions/application-status-ui";
import { deriveSubmissionNextStep } from "@/lib/admissions/admin-submission-next-step";
import {
  buildSubmissionFeeBadges,
  formatSubmissionFeeBadgeLabel,
  submissionFeeBadgeStyle,
} from "@/lib/admissions/admin-submission-fee-badges";
import {
  formatShortDate,
  formatSubmissionProgress,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";

type DemoSubmissionFlow = {
  id: string;
  name: string;
  steps: DemoSubmissionFlowStep[];
};

type DetailTab = {
  id: "overview" | "application" | "history" | "payments";
  label: string;
  icon: LucideIcon;
};

const ACTIVITY_ICONS = {
  mail: { Icon: Mail, color: "#0284C7" },
  note: { Icon: MessageSquare, color: "#A78BFA" },
  action: { Icon: Zap, color: "#16A34A" },
} as const;

function DemoActivityTimelineRow({
  variant,
  title,
  date,
  detail,
  author,
  showConnectorBelow,
}: {
  variant: keyof typeof ACTIVITY_ICONS;
  title: string;
  date: string;
  detail: string;
  author?: string;
  showConnectorBelow: boolean;
}) {
  const C = ADMIN_DEMO_STORY_COMPAT;
  const { Icon, color } = ACTIVITY_ICONS[variant];

  return (
    <div className="relative flex gap-3 pb-4">
      <div className="flex flex-col items-center">
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
        {showConnectorBelow ? (
          <div className="mt-1 w-px flex-1 min-h-[12px]" style={{ backgroundColor: C.border }} />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
            {title}
          </p>
          <p className="text-[10px]" style={{ color: C.textTertiary }}>
            {date}
          </p>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: C.textSecondary }}>
          {detail}
        </p>
        {author ? (
          <p className="mt-1 text-[10px]" style={{ color: C.textTertiary }}>
            — {author}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function OverviewSection({
  submission,
  lead,
}: {
  submission: AdminApplicationSubmission;
  lead: DemoSubmissionLead;
}) {
  const theme = ADMIN_DEMO_STORY_THEME;
  const C = ADMIN_DEMO_STORY_COMPAT;
  const nextStep = deriveSubmissionNextStep(submission);

  return (
    <div className="space-y-4">
      <AdminCard theme={theme} padding="default">
        <p
          className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em]"
          style={{ color: theme.muted }}
        >
          Status
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <AdminChip theme={theme} tone={applicationStatusChipTone(submission.status)}>
            {adminApplicationStatusLabel(submission.status)}
          </AdminChip>
          <span className="text-xs" style={{ color: theme.muted }}>
            {formatSubmissionProgress(submission)}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed" style={{ color: theme.ink }}>
          <span className="font-semibold">Next step:</span> {nextStep.primary}
          {nextStep.secondary ? ` · ${nextStep.secondary}` : ""}
        </p>
      </AdminCard>

      <AdminCard theme={theme} padding="default">
        <p
          className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.08em]"
          style={{ color: theme.muted }}
        >
          Contact
        </p>
        <div className="space-y-2 text-xs" style={{ color: theme.ink }}>
          <p>
            <span style={{ color: theme.muted }}>Guardian </span>
            {lead.name}
          </p>
          <p>
            <span style={{ color: theme.muted }}>Email </span>
            {lead.email}
          </p>
          <p>
            <span style={{ color: theme.muted }}>Phone </span>
            {lead.phone}
          </p>
        </div>
      </AdminCard>

      <AdminCard theme={theme} padding="default">
        <p
          className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.08em]"
          style={{ color: theme.muted }}
        >
          Student &amp; form
        </p>
        <div className="space-y-2 text-xs" style={{ color: theme.ink }}>
          <p>
            <span style={{ color: theme.muted }}>Student </span>
            {submission.studentLabel ?? "—"}
          </p>
          <p>
            <span style={{ color: theme.muted }}>Form </span>
            {submission.formTitle}
          </p>
          {submission.programName ? (
            <p>
              <span style={{ color: theme.muted }}>Program </span>
              {submission.programName}
            </p>
          ) : null}
          {lead.message ? (
            <p className="leading-relaxed">
              <span style={{ color: theme.muted }}>Inquiry </span>
              {lead.message}
            </p>
          ) : null}
        </div>
      </AdminCard>
    </div>
  );
}

function ApplicationFormSection({
  flow,
  lead,
}: {
  flow: DemoSubmissionFlow | null | undefined;
  lead: DemoSubmissionLead;
}) {
  const C = ADMIN_DEMO_STORY_COMPAT;
  const responseMap = lead.responses as Record<string, string | boolean>;

  if (!flow || flow.steps.length === 0) {
    return (
      <p className="text-sm" style={{ color: C.textTertiary }}>
        Form definition not found for this submission.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {flow.steps.map((step) => (
        <section key={step.id}>
          <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
            {step.title}
          </p>
          <div
            className="mt-1 mb-3 h-px w-8 rounded-full"
            style={{ backgroundColor: ADMIN_DEMO_STORY_THEME.primary }}
          />
          <div className="flex flex-col gap-3">
            {step.fields.map((field: DemoSubmissionFlowField) => {
              const answer = formatDemoSubmissionFieldAnswer(
                field,
                responseMap[field.id],
              );
              const multiline = field.type === "text" && answer.length > 80;
              return (
                <div
                  key={field.id}
                  className="rounded-sm px-3 py-2.5 sm:px-4 sm:py-3"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 1px 2px rgba(17,28,22,0.04)",
                  }}
                >
                  <p
                    className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    {field.label}
                    {field.required ? (
                      <span style={{ color: C.textQuaternary }}> *</span>
                    ) : null}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      multiline ? "whitespace-pre-wrap leading-relaxed" : ""
                    }`}
                    style={{ color: C.textPrimary }}
                  >
                    {answer}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function PaymentsSection({ submission }: { submission: AdminApplicationSubmission }) {
  const theme = ADMIN_DEMO_STORY_THEME;
  const C = ADMIN_DEMO_STORY_COMPAT;
  const badges = buildSubmissionFeeBadges(submission);

  if (badges.length === 0) {
    return (
      <AdminCard theme={theme} padding="default">
        <p className="text-sm" style={{ color: theme.muted }}>
          No fees configured for this application.
        </p>
      </AdminCard>
    );
  }

  return (
    <AdminCard theme={theme} padding="default">
      <p
        className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.08em]"
        style={{ color: theme.muted }}
      >
        Fee summary
      </p>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge.key}
            className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={submissionFeeBadgeStyle(badge.status, C)}
          >
            {formatSubmissionFeeBadgeLabel(badge)}
          </span>
        ))}
      </div>
    </AdminCard>
  );
}

export default function DemoApplicationSubmissionDetailPanel({
  lead,
  submission,
  flow,
  onClose,
  autoSendEnrollmentLink = false,
}: {
  lead: DemoSubmissionLead;
  submission: AdminApplicationSubmission;
  flow?: DemoSubmissionFlow | null;
  onClose: () => void;
  autoSendEnrollmentLink?: boolean;
}) {
  const theme = ADMIN_DEMO_STORY_THEME;
  const C = ADMIN_DEMO_STORY_COMPAT;
  const [activeTab, setActiveTab] = useState<DetailTab["id"]>("overview");
  const [linkSentDelayed, setLinkSentDelayed] = useState(false);
  const enrollmentLinkSent = !autoSendEnrollmentLink || linkSentDelayed;
  const activity = useMemo(() => buildDemoSubmissionActivity(lead), [lead]);

  useEffect(() => {
    if (!autoSendEnrollmentLink) return;
    const timer = setTimeout(() => setLinkSentDelayed(true), 1000);
    return () => {
      clearTimeout(timer);
      setLinkSentDelayed(false);
    };
  }, [autoSendEnrollmentLink, lead.id]);

  const tabs = useMemo<DetailTab[]>(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "application", label: "Application form", icon: FileText },
      { id: "history", label: "History", icon: History },
      { id: "payments", label: "Payments", icon: CreditCard },
    ],
    [],
  );

  const metaLine = [submission.studentLabel, submission.formTitle, submission.programName]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
      style={{
        backgroundColor: DEMO_DRAWER_PAPER_BG,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: C.shadowMedium,
      }}
    >
      <div
        className="flex flex-shrink-0 items-start justify-between gap-3 bg-white px-[21px] py-[17px]"
        style={{ borderBottom: "1px solid #E0E8E0" }}
      >
        <div className="min-w-0 flex-1">
          <AdminSectionKicker theme={theme}>Application review</AdminSectionKicker>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <AdminDisplayHeading theme={theme} as="h2" size="section" className="truncate">
              {submission.guardianName ?? lead.name}
            </AdminDisplayHeading>
            <AdminChip theme={theme} tone={applicationStatusChipTone(submission.status)}>
              {adminApplicationStatusLabel(submission.status)}
            </AdminChip>
          </div>
          {metaLine ? (
            <p className="mt-1 truncate text-[11px]" style={{ color: theme.muted }}>
              {metaLine}
              <span className="mx-1.5 opacity-50">·</span>
              Updated {formatShortDate(submission.updatedAt)}
            </p>
          ) : null}
          <p className="mt-0.5 truncate text-[11px]" style={{ color: theme.muted }}>
            {submission.contactEmail ?? lead.email}
          </p>
        </div>
        <AdminButton
          theme={theme}
          variant="soft"
          size="compact"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0"
        >
          Close ×
        </AdminButton>
      </div>

      <div
        className="flex flex-shrink-0 overflow-x-auto bg-white px-[21px]"
        style={{ borderBottom: "1px solid #E1E8E1" }}
      >
        <div className="-mb-px flex gap-[3px]" role="tablist" aria-label="Application sections">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-[9px] py-[11px] text-[11px] font-bold transition-colors"
                style={{
                  borderBottomColor: isActive ? theme.primary : "transparent",
                  color: isActive ? theme.primary : "#77858A",
                }}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-5 sm:pb-8">
        {activeTab === "overview" ? (
          <OverviewSection submission={submission} lead={lead} />
        ) : null}
        {activeTab === "application" ? (
          <ApplicationFormSection flow={flow} lead={lead} />
        ) : null}
        {activeTab === "history" ? (
          <div>
            <p
              className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.08em]"
              style={{ color: theme.muted }}
            >
              Activity log
            </p>
            {activity.map((row, index) => (
              <DemoActivityTimelineRow
                key={row.id}
                variant={row.variant}
                title={row.title}
                date={row.at}
                detail={row.summary}
                author={row.actor}
                showConnectorBelow={index < activity.length - 1}
              />
            ))}
          </div>
        ) : null}
        {activeTab === "payments" ? <PaymentsSection submission={submission} /> : null}
      </div>

      <div
        className="flex-shrink-0 bg-white px-4 py-3 sm:px-5"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <motion.button
          type="button"
          disabled={enrollmentLinkSent}
          className="w-full rounded-[10px] py-2.5 text-sm font-semibold"
          animate={{
            backgroundColor: enrollmentLinkSent ? C.successBg : theme.primary,
            color: enrollmentLinkSent ? C.success : theme.white,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            cursor: enrollmentLinkSent ? "default" : "pointer",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {enrollmentLinkSent ? (
              <motion.span
                key="sent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Sent
              </motion.span>
            ) : (
              <motion.span
                key="send"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Send application link
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
