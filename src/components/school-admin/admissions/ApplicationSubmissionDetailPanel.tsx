"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { SchoolAdminDetailPanelSkeleton } from "@/components/school-admin/skeletons";
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
import {
  applicationStatusBadgeStyle,
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
import { loadApplicationDetail } from "@/lib/admissions/parent-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ApplicationSubmissionDetailPanelProps = {
  submission: AdminApplicationSubmission;
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  onClose: () => void;
  onSubmissionUpdated?: () => void;
  onSelectSubmission?: (applicationId: string) => void;
};

type DetailTab = {
  id: string;
  label: string;
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
}: ApplicationSubmissionDetailPanelProps) {
  const C = buildAdminThemeTokens(branding);
  const supabase = createClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadApplicationDetail>>>(null);
  const [hasChecklist, setHasChecklist] = useState(false);
  const [startEnrollmentOpen, setStartEnrollmentOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(submission.status);
  const [activeTab, setActiveTab] = useState("overview");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyUnlinked, setHistoryUnlinked] = useState(false);
  const [historyEvents, setHistoryEvents] = useState<FamilyAdmissionTimelineEvent[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);

  const navigateToTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const loadChecklistState = useCallback(async () => {
    const checklist = await getChecklistForApplication(supabase, submission.id);
    setHasChecklist(Boolean(checklist));
  }, [submission.id, supabase, setHasChecklist]);

  const loadDetail = useCallback(async () => {
    setLoading(true);
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
      await loadChecklistState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [
    loadChecklistState,
    organizationId,
    submission.id,
    supabase,
    setCurrentStatus,
    setDetail,
    setError,
    setLoading,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDetail();
    });
  }, [loadDetail]);

  const loadHistory = useCallback(async () => {
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
    } catch {
      setHistoryEvents([]);
      setHistoryUnlinked(true);
    } finally {
      setHistoryLoading(false);
    }
  }, [organizationId, submission.id, supabase]);

  useEffect(() => {
    if (activeTab === "history") {
      queueMicrotask(() => {
        void loadHistory();
      });
    }
  }, [activeTab, loadHistory]);

  const historyContextDescription = useMemo(
    () => buildAdmissionHistoryContextDescription(historyEvents),
    [historyEvents],
  );

  const canStartEnrollment = currentStatus === "accepted" && !hasChecklist;
  const showEnrollmentStatus =
    currentStatus === "enrolling" || hasChecklist;

  const tabs = useMemo<DetailTab[]>(() => {
    if (!detail) return [];

    const result: DetailTab[] = [{ id: "overview", label: "Overview" }];
    if (showEnrollmentStatus) {
      result.push({ id: "application", label: "Application form" });
    }
    result.push(
      { id: "history", label: "History" },
      { id: "payments", label: "Payments" },
    );
    return result;
  }, [detail, showEnrollmentStatus]);

  const statusStyle = applicationStatusBadgeStyle(currentStatus, C);
  const familyLabel =
    submission.guardianName || submission.studentLabel || "Application";
  const contactLabel = submission.contactEmail ?? "No contact email";

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
          {canStartEnrollment ? (
            <AcceptedEnrollmentSection
              C={C}
              applicationId={submission.id}
              onStartEnrollment={() => setStartEnrollmentOpen(true)}
              onStatusChanged={(status) => {
                setCurrentStatus(status);
                onSubmissionUpdated?.();
                void loadDetail();
              }}
            />
          ) : (
            <ApplicationDecisionSection
              C={C}
              applicationId={submission.id}
              currentStatus={currentStatus}
              onStatusChanged={(status) => {
                setCurrentStatus(status);
                onSubmissionUpdated?.();
                void loadDetail();
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
            steps={detail.postSubmitSteps}
          />

          <FamilyGuardiansSection
            C={C}
            organizationId={organizationId}
            familyId={familyId}
            schoolSlug={schoolSlug}
            detail={detail}
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
              applicationId={submission.id}
              branding={branding}
            />
          </DetailPanelSection>
        </DetailPanelSectionGroup>
      );
    }

    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
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
          backgroundColor: C.surface,
          borderLeft: `1px solid ${C.border}`,
          boxShadow: C.shadowMedium,
        }}
        onClick={(event) => event.stopPropagation()}
      >
      <div
        className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
              {familyLabel}
            </h3>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={statusStyle}
            >
              {applicationStatusLabel(currentStatus)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs" style={{ color: C.textTertiary }}>
            {submission.formTitle}
            {submission.programName ? (
              <>
                <span className="mx-1.5 opacity-50">·</span>
                {submission.programName}
              </>
            ) : null}
          </p>
          <p className="mt-1 truncate text-xs" style={{ color: C.textSecondary }}>
            {contactLabel}
            <span className="mx-1.5 opacity-50">·</span>
            Updated {formatShortDate(submission.updatedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded p-1"
          style={{ color: C.textTertiary }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {detail && !loading && !error ? (
        <div
          className="flex flex-shrink-0 overflow-x-auto px-4 sm:px-5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="-mb-px flex gap-6"
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
                  className="shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors"
                  style={{
                    borderBottomColor: isActive ? C.accent : "transparent",
                    color: isActive ? C.accent : C.textTertiary,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5"
      >
        {loading ? (
          <SchoolAdminDetailPanelSkeleton C={C} label="Loading application" />
        ) : error ? (
          <p className="text-sm" style={{ color: C.error }}>
            {error}
          </p>
        ) : detail ? (
          <>
            {tabs.map((tab) => (
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
                {renderTabPanel(tab.id)}
              </div>
            ))}
          </>
        ) : null}
      </div>
      </motion.div>

      <StartEnrollmentModal
        C={C}
        open={startEnrollmentOpen}
        applicationId={submission.id}
        studentLabel={submission.studentLabel}
        contactEmail={submission.contactEmail}
        onClose={() => setStartEnrollmentOpen(false)}
        onStarted={() => {
          setCurrentStatus("enrolling");
          setHasChecklist(true);
          onSubmissionUpdated?.();
          void loadDetail();
        }}
      />
    </motion.div>
  );
}
