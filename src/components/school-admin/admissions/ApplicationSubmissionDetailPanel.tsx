"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SchoolAdminDetailPanelSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GSkeleton, GTabBar } from "@/components/school-parent/garden/ui";
import { GardenLoadError } from "@/components/school-admin/garden/kit";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ApplicationSubmissionPostSubmitSection from "@/components/admissions/ApplicationSubmissionPostSubmitSection";
import ApplicationSubmissionHistorySection, {
  buildAdmissionHistoryContextDescription,
} from "./ApplicationSubmissionHistorySection";
import SubmissionPaymentsPanel from "./SubmissionPaymentsPanel";
import ApplicationFormStatusCard from "./ApplicationFormStatusCard";
import DetailPanelSection from "./DetailPanelSection";
import DetailPanelSectionGroup from "./DetailPanelSectionGroup";
import ApplicationDecisionSection from "./ApplicationDecisionSection";
import AcceptedEnrollmentSection from "./AcceptedEnrollmentSection";
import EnrollmentStatusCard from "./EnrollmentStatusCard";
import StartEnrollmentModal from "./StartEnrollmentModal";
import FamilyGuardiansSection from "./FamilyGuardiansSection";
import { SubmissionDetailStoryProvider } from "./SubmissionDetailStoryContext";
import {
  SubmissionDetailPreviewProvider,
  type SubmissionDetailPreview,
  type SubmissionDetailPreviewScript,
} from "./SubmissionDetailPreviewContext";
import {
  applicationStatusChipTone,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import {
  formatShortDate,
  listFamilyAdmissionHistory,
  resolveApplicationFamilyId,
  type AdminApplicationSubmission,
  type FamilyAdmissionTimelineEvent,
} from "@/lib/admissions/application-submissions";
import { getChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  getIncompletePostSubmitNotice,
  SUBMISSION_POST_APPLICATION_STEPS_ANCHOR_ID,
} from "@/lib/admissions/admin-post-submit-steps";
import { loadApplicationDetail } from "@/lib/admissions/parent-portal-access";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { createClient } from "@/utils/supabase/client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type SubmissionStatusUpdate = { status: AdminApplicationSubmission["status"] };

type ApplicationSubmissionDetailPanelProps = {
  submission: AdminApplicationSubmission;
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  onClose: () => void;
  onSubmissionUpdated?: (update?: SubmissionStatusUpdate) => void;
  onSelectSubmission?: (applicationId: string) => void;
  /** Garden drawer on Admissions → Submissions; story elsewhere (Schedule). */
  appearance?: "story" | "garden";
  /**
   * Fixture detail (marketing preview): every loader is skipped and the
   * sections read this instead of Supabase / `/api`.
   */
  previewDetail?: SubmissionDetailPreview | null;
  /** Disables writes (or resolves them locally). Never hides UI. */
  previewMode?: boolean;
  /** Timed presses of the drawer's real controls (preview only). */
  previewScript?: SubmissionDetailPreviewScript | null;
  /** In-canvas node for dialogs in a scaled preview (default `document.body`). */
  portalContainer?: HTMLElement | null;
};

type DetailTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export default function ApplicationSubmissionDetailPanel({
  submission,
  organizationId,
  branding,
  schoolName,
  schoolSlug,
  onClose,
  onSubmissionUpdated,
  onSelectSubmission,
  appearance = "story",
  previewDetail = null,
  previewMode: previewModeProp = false,
  previewScript = null,
  portalContainer = null,
}: ApplicationSubmissionDetailPanelProps) {
  const garden = appearance === "garden";
  const previewMode = previewModeProp || previewDetail != null;
  const { theme, C } = useSchoolAdminStoryTheme();
  const reducedMotion = useReducedMotion();
  const supabase = createClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const historyLoadedRef = useRef(false);
  const [loading, setLoading] = useState(previewDetail == null);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadApplicationDetail>>>(
    previewDetail?.detail ?? null,
  );
  const [hasChecklist, setHasChecklist] = useState(previewDetail?.hasChecklist ?? false);
  const [hasPublishedEnrollmentChecklist, setHasPublishedEnrollmentChecklist] =
    useState(previewDetail?.publishedChecklistName != null);
  const [enrollmentChecklistName, setEnrollmentChecklistName] = useState<string | null>(
    previewDetail?.publishedChecklistName ?? null,
  );
  const [startEnrollmentOpen, setStartEnrollmentOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(submission.status);
  const [activeTab, setActiveTab] = useState("overview");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(["overview"]));
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyUnlinked, setHistoryUnlinked] = useState(false);
  const [historyEvents, setHistoryEvents] = useState<FamilyAdmissionTimelineEvent[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(previewDetail?.familyId ?? null);

  const navigateToTab = useCallback((tabId: string) => {
    setVisitedTabs((previous) => {
      if (previous.has(tabId)) return previous;
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
    setActiveTab(tabId);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const loadChecklistState = useCallback(async () => {
    const checklist = await getChecklistForApplication(supabase, submission.id);
    setHasChecklist(Boolean(checklist));
  }, [submission.id, supabase, setHasChecklist]);

  const loadPublishedEnrollmentChecklistState = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admissions/applications/${submission.id}/start-enrollment`,
      );
      if (response.ok) {
        const body = (await response.json()) as { templateName?: string };
        setHasPublishedEnrollmentChecklist(true);
        setEnrollmentChecklistName(
          typeof body.templateName === "string" ? body.templateName : null,
        );
      } else {
        setHasPublishedEnrollmentChecklist(false);
        setEnrollmentChecklistName(null);
      }
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.submission.load_checklist_state",
        error: "",
      }, err);
      setHasPublishedEnrollmentChecklist(false);
      setEnrollmentChecklistName(null);
    }
  }, [organizationId, submission.id]);

  const invalidateHistory = useCallback(() => {
    historyLoadedRef.current = false;
    setHistoryEvents([]);
    setHistoryUnlinked(false);
  }, []);

  const loadDetail = useCallback(
    async (options?: { silent?: boolean }) => {
      if (previewDetail) return;
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const row = await loadApplicationDetail(supabase, submission.id, organizationId);
        if (!row) {
          setError("Application not found.");
          setDetail(null);
          return;
        }
        setDetail(row);
        setCurrentStatus(row.status);
        const resolvedFamilyId = await resolveApplicationFamilyId(
          supabase,
          organizationId,
          submission.id,
        );
        setFamilyId(resolvedFamilyId);
        await Promise.all([loadChecklistState(), loadPublishedEnrollmentChecklistState()]);
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.submission.load_detail",
          error: "",
        }, err);
        setError(err instanceof Error ? err.message : "Failed to load application.");
        setDetail(null);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [
      loadChecklistState,
      loadPublishedEnrollmentChecklistState,
      organizationId,
      previewDetail,
      submission.id,
      supabase,
    ],
  );

  const loadHistory = useCallback(async () => {
    if (previewDetail) {
      setHistoryEvents(previewDetail.history);
      setHistoryUnlinked(previewDetail.familyId == null);
      return;
    }
    setHistoryLoading(true);
    setHistoryUnlinked(false);
    try {
      const familyId = await resolveApplicationFamilyId(
        supabase,
        organizationId,
        submission.id,
      );
      if (!familyId) {
        setHistoryEvents([]);
        setHistoryUnlinked(true);
        return;
      }

      const rows = await listFamilyAdmissionHistory(
        supabase,
        organizationId,
        familyId,
      );
      setHistoryEvents(rows);
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.submission.load_history",
        error: "",
      }, err);
      setHistoryEvents([]);
      setHistoryUnlinked(true);
    } finally {
      setHistoryLoading(false);
    }
  }, [organizationId, previewDetail, submission.id, supabase]);

  const refreshAfterMutation = useCallback(async () => {
    // Preview: the local state change is the whole update.
    if (previewDetail) return;
    invalidateHistory();
    await loadDetail({ silent: true });
    if (visitedTabs.has("history")) {
      historyLoadedRef.current = true;
      await loadHistory();
    }
  }, [invalidateHistory, loadDetail, loadHistory, previewDetail, visitedTabs]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDetail();
    });
  }, [loadDetail]);

  useEffect(() => {
    if (!visitedTabs.has("history") || historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    queueMicrotask(() => {
      void loadHistory();
    });
  }, [visitedTabs, loadHistory]);

  const historyContextDescription = useMemo(
    () => buildAdmissionHistoryContextDescription(historyEvents),
    [historyEvents],
  );

  const incompletePostSubmitNotice = useMemo(
    () => getIncompletePostSubmitNotice(detail?.postSubmitSteps ?? []),
    [detail?.postSubmitSteps],
  );

  const scrollToPostApplicationSteps = useCallback(() => {
    document
      .getElementById(SUBMISSION_POST_APPLICATION_STEPS_ANCHOR_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const canStartEnrollment =
    currentStatus === "accepted" &&
    !hasChecklist &&
    hasPublishedEnrollmentChecklist;
  const canMarkEnrolled =
    currentStatus === "accepted" || currentStatus === "enrolling";

  // Preview script: press "Accept" the way the admin would (it opens Start
  // enrollment when the program has a published checklist).
  const acceptAfterMs = previewDetail ? previewScript?.acceptAfterMs : undefined;
  const canScriptAccept =
    acceptAfterMs != null &&
    hasPublishedEnrollmentChecklist &&
    !hasChecklist &&
    !canMarkEnrolled &&
    currentStatus !== "enrolled";
  const scriptAcceptedRef = useRef(false);
  useEffect(() => {
    if (!canScriptAccept || scriptAcceptedRef.current) return;
    const timer = window.setTimeout(() => {
      scriptAcceptedRef.current = true;
      setStartEnrollmentOpen(true);
    }, acceptAfterMs);
    return () => window.clearTimeout(timer);
  }, [acceptAfterMs, canScriptAccept]);
  const showEnrollmentStatus =
    currentStatus === "enrolling" || hasChecklist;

  const tabs = useMemo<DetailTab[]>(() => {
    if (!detail) return [];

    const result: DetailTab[] = [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "family-portal-access", label: "Family portal access", icon: Users },
    ];
    if (showEnrollmentStatus) {
      result.push({ id: "application", label: "Application form", icon: FileText });
    }
    result.push(
      { id: "history", label: "History", icon: History },
      { id: "payments", label: "Payments", icon: CreditCard },
    );
    return result;
  }, [detail, showEnrollmentStatus]);

  const familyLabel =
    submission.guardianName || submission.studentLabel || "Application";
  const contactLabel = submission.contactEmail ?? "No contact email";
  const metaLine = [
    submission.studentLabel,
    submission.formTitle,
    submission.programName,
  ]
    .filter(Boolean)
    .join(" · ");

  const applicationFormStatusCard = detail ? (
    <ApplicationFormStatusCard
      C={C}
      branding={branding}
      schoolName={schoolName}
      schoolSlug={schoolSlug}
      detail={detail}
      feeStatus={submission.feeStatus}
      applicationStatus={currentStatus}
      formTitle={detail.formTitle}
      submittedAt={submission.submittedAt}
      feeEnabled={submission.feeEnabled}
      downloadLabel={
        submission.studentLabel || submission.guardianName || detail.formTitle
      }
    />
  ) : null;

  function renderTabPanel(tabId: string) {
    if (!detail) return null;

    if (tabId === "overview") {
      return (
        <DetailPanelSectionGroup C={C}>
          {canMarkEnrolled ? (
            <AcceptedEnrollmentSection
              C={C}
              organizationId={organizationId}
              applicationId={submission.id}
              applicationStatus={
                currentStatus === "enrolling" ? "enrolling" : "accepted"
              }
              programName={submission.programName}
              enrollmentChecklistName={enrollmentChecklistName}
              showStartEnrollment={canStartEnrollment}
              hasPublishedChecklist={
                hasPublishedEnrollmentChecklist || hasChecklist
              }
              onStartEnrollment={
                canStartEnrollment ? () => setStartEnrollmentOpen(true) : undefined
              }
              onStatusChanged={(status) => {
                setCurrentStatus(status);
                onSubmissionUpdated?.({ status });
                void refreshAfterMutation();
              }}
            />
          ) : (
            <ApplicationDecisionSection
              C={C}
              organizationId={organizationId}
              applicationId={submission.id}
              currentStatus={currentStatus}
              onAccept={
                hasPublishedEnrollmentChecklist && !hasChecklist
                  ? () => setStartEnrollmentOpen(true)
                  : undefined
              }
              postSubmitNotice={
                incompletePostSubmitNotice
                  ? {
                      ...incompletePostSubmitNotice,
                      onClick: scrollToPostApplicationSteps,
                    }
                  : undefined
              }
              onStatusChanged={(status) => {
                setCurrentStatus(status);
                onSubmissionUpdated?.({ status });
                void refreshAfterMutation();
              }}
            />
          )}

          {showEnrollmentStatus ? (
            <EnrollmentStatusCard
              C={C}
              organizationId={organizationId}
              applicationId={submission.id}
            />
          ) : (
            applicationFormStatusCard
          )}

          <ApplicationSubmissionPostSubmitSection
            C={C}
            organizationId={organizationId}
            applicationId={submission.id}
            steps={detail.postSubmitSteps}
            onStepUpdated={() => {
              onSubmissionUpdated?.({ status: currentStatus });
              void refreshAfterMutation();
            }}
          />
        </DetailPanelSectionGroup>
      );
    }

    if (tabId === "family-portal-access") {
      return (
        <DetailPanelSectionGroup C={C}>
          <FamilyGuardiansSection
            C={C}
            organizationId={organizationId}
            familyId={familyId}
            schoolSlug={schoolSlug}
            detail={detail}
            primaryGuardianId={submission.primaryGuardianId}
          />
        </DetailPanelSectionGroup>
      );
    }

    if (tabId === "application") {
      return (
        <DetailPanelSectionGroup C={C}>
          {applicationFormStatusCard}
        </DetailPanelSectionGroup>
      );
    }

    if (tabId === "history") {
      return (
        <DetailPanelSectionGroup C={C}>
          <DetailPanelSection
            C={C}
            title="Admission history"
            description={historyContextDescription}
          >
            <ApplicationSubmissionHistorySection
              C={C}
              currentApplicationId={submission.id}
              currentApplicationStatus={currentStatus}
              events={historyEvents}
              loading={historyLoading}
              unlinked={historyUnlinked}
              onSelect={(applicationId) => onSelectSubmission?.(applicationId)}
            />
          </DetailPanelSection>
        </DetailPanelSectionGroup>
      );
    }

    if (tabId === "payments") {
      return (
        <DetailPanelSectionGroup C={C}>
          <DetailPanelSection
            C={C}
            title="Payments"
            description="Application fees and enrollment charges for this application."
          >
            <SubmissionPaymentsPanel
              organizationId={organizationId}
              applicationId={submission.id}
              branding={branding}
            />
          </DetailPanelSection>
        </DetailPanelSectionGroup>
      );
    }

    return null;
  }

  const startEnrollmentModal = (
    <StartEnrollmentModal
      C={C}
      appearance={appearance}
      theme={theme}
      organizationId={organizationId}
      open={startEnrollmentOpen}
      applicationId={submission.id}
      studentLabel={submission.studentLabel}
      contactEmail={submission.contactEmail}
      previewMode={previewMode}
      previewData={previewDetail?.startEnrollment ?? null}
      autoSubmitAfterMs={previewDetail ? previewScript?.startEnrollmentAfterMs : undefined}
      portalContainer={portalContainer}
      onClose={() => setStartEnrollmentOpen(false)}
      onStarted={() => {
        setCurrentStatus("enrolling");
        setHasChecklist(true);
        onSubmissionUpdated?.({ status: "enrolling" });
        void refreshAfterMutation();
      }}
    />
  );

  const previewValue = {
    preview: previewDetail,
    previewMode,
    script: previewScript,
    portalContainer,
  };

  if (garden) {
    const panelBody = loading ? (
      <div className="flex flex-col gap-3" role="status" aria-live="polite">
        <span className="sr-only">Loading application</span>
        <GSkeleton className="h-[150px] !rounded-[20px]" />
        <GSkeleton className="h-[220px] !rounded-[20px]" />
        <GSkeleton className="h-[120px] !rounded-[20px]" />
      </div>
    ) : error ? (
      <GardenLoadError
        title="This application didn't load"
        description={error}
        onRetry={() => void loadDetail()}
        retrying={loading}
      />
    ) : detail ? (
      <>
        {tabs.map((tab) =>
          visitedTabs.has(tab.id) ? (
            <div
              key={tab.id}
              id={`submission-panel-${tab.id}`}
              role="tabpanel"
              aria-label={tab.label}
              hidden={activeTab !== tab.id}
            >
              <motion.div
                variants={tabPanelVariants(reducedMotion ?? false)}
                initial={false}
                animate={activeTab === tab.id ? "animate" : "initial"}
                transition={tabPanelTransition(reducedMotion ?? false)}
              >
                {renderTabPanel(tab.id)}
              </motion.div>
            </div>
          ) : null,
        )}
      </>
    ) : null;

    return (
      <SubmissionDetailPreviewProvider value={previewValue}>
        <SubmissionDetailStoryProvider variant="garden" theme={theme}>
          <GSidePanel
            theme={theme}
            open
            size="xl"
            panelId={`submission-detail-${submission.id}`}
            testId="submission-detail-panel"
            kicker="Application review"
            title={familyLabel}
            onClose={onClose}
            bodyRef={scrollContainerRef}
            subtitle={
              <>
                {metaLine ? (
                  <span className="block truncate">
                    {metaLine} · Updated {formatShortDate(submission.updatedAt)}
                  </span>
                ) : null}
                <span className="block truncate">{contactLabel}</span>
              </>
            }
            headerAside={
              <GChip tone={applicationStatusChipTone(currentStatus)}>
                ● {applicationStatusLabel(currentStatus)}
              </GChip>
            }
            headerBelow={
              detail && !loading && !error ? (
                <GTabBar
                  items={tabs.map((tab) => ({
                    key: tab.id,
                    label: tab.label,
                    icon: <tab.icon className="h-3.5 w-3.5" aria-hidden />,
                    testId: `submission-tab-${tab.id}`,
                  }))}
                  activeKey={activeTab}
                  onChange={navigateToTab}
                  ariaLabel="Application sections"
                  className="!shadow-none"
                />
              ) : undefined
            }
          >
            {panelBody}
          </GSidePanel>
          {startEnrollmentModal}
        </SubmissionDetailStoryProvider>
      </SubmissionDetailPreviewProvider>
    );
  }

  return (
    <SubmissionDetailPreviewProvider value={previewValue}>
      <motion.div
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(34,48,44,0.47)" }}
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
          style={{
            backgroundColor: "#F8FAF8",
            borderLeft: "1px solid #E0E8E0",
            boxShadow: "0 -18px 45px rgba(26,47,37,0.2)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex flex-shrink-0 items-start justify-between gap-3 bg-white px-[21px] py-[17px]"
            style={{ borderBottom: "1px solid #E0E8E0" }}
          >
            <div className="min-w-0 flex-1">
              <AdminSectionKicker theme={theme}>Application review</AdminSectionKicker>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AdminDisplayHeading theme={theme} as="h2" size="section" className="truncate">
                  {familyLabel}
                </AdminDisplayHeading>
                <AdminChip theme={theme} tone={applicationStatusChipTone(currentStatus)}>
                  {applicationStatusLabel(currentStatus)}
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
                {contactLabel}
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

          {detail && !loading && !error ? (
            <div
              className="flex flex-shrink-0 overflow-x-auto bg-white px-[21px]"
              style={{ borderBottom: "1px solid #E1E8E1" }}
            >
              <div
                className="-mb-px flex gap-[3px]"
                role="tablist"
                aria-label="Application sections"
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const tabId = `submission-tab-${tab.id}`;
                  const panelId = `submission-panel-${tab.id}`;

                  return (
                    <button
                      key={tab.id}
                      id={tabId}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={panelId}
                      onClick={() => navigateToTab(tab.id)}
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
          ) : null}

          <SubmissionDetailStoryProvider variant="story" theme={theme}>
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-5 sm:pb-8"
            >
              {loading ? (
                <SchoolAdminDetailPanelSkeleton C={C} label="Loading application" />
              ) : error ? (
                <p className="text-sm" style={{ color: C.error }}>
                  {error}
                </p>
              ) : detail ? (
                <>
                  {tabs.map((tab) =>
                    visitedTabs.has(tab.id) ? (
                      <div
                        key={tab.id}
                        id={`submission-panel-${tab.id}`}
                        role="tabpanel"
                        aria-labelledby={`submission-tab-${tab.id}`}
                        hidden={activeTab !== tab.id}
                        className={
                          tab.id === "overview" ||
                          tab.id === "application" ||
                          tab.id === "history"
                            ? ""
                            : "space-y-6"
                        }
                      >
                        <motion.div
                          variants={tabPanelVariants(reducedMotion ?? false)}
                          initial={false}
                          animate={activeTab === tab.id ? "animate" : "initial"}
                          transition={tabPanelTransition(reducedMotion ?? false)}
                        >
                          {renderTabPanel(tab.id)}
                        </motion.div>
                      </div>
                    ) : null,
                  )}
                </>
              ) : null}
            </div>
          </SubmissionDetailStoryProvider>
        </motion.div>

        {startEnrollmentModal}
      </motion.div>
    </SubmissionDetailPreviewProvider>
  );
}
