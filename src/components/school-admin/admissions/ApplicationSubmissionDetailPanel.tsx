"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import ApplicationSubmissionPostSubmitSection from "@/components/admissions/ApplicationSubmissionPostSubmitSection";
import ApplicationSubmissionHistorySection from "./ApplicationSubmissionHistorySection";
import ApplicationDecisionSection from "./ApplicationDecisionSection";
import EnrollmentStatusCard from "./EnrollmentStatusCard";
import StartEnrollmentModal from "./StartEnrollmentModal";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
  FEE_STATUS_LABELS,
} from "@/lib/admissions/application-status-ui";
import {
  formatShortDate,
  formatSubmissionProgress,
  listFamilyAdmissionHistory,
  resolveApplicationFamilyId,
  type AdminApplicationSubmission,
  type FamilyAdmissionHistoryEntry,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadApplicationDetail>>>(null);
  const [hasChecklist, setHasChecklist] = useState(false);
  const [startEnrollmentOpen, setStartEnrollmentOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(submission.status);
  const [activeTab, setActiveTab] = useState("overview");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyUnlinked, setHistoryUnlinked] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<FamilyAdmissionHistoryEntry[]>([]);

  const loadChecklistState = useCallback(async () => {
    const checklist = await getChecklistForApplication(supabase, submission.id);
    setHasChecklist(Boolean(checklist));
  }, [submission.id, supabase]);

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
      await loadChecklistState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [loadChecklistState, organizationId, submission.id, supabase]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    setActiveTab("overview");
    setHistoryEntries([]);
    setHistoryUnlinked(false);
    setHistoryLoading(false);
  }, [submission.id]);

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
        setHistoryEntries([]);
        setHistoryUnlinked(true);
        return;
      }

      const rows = await listFamilyAdmissionHistory(
        supabase,
        organizationId,
        familyId,
      );
      setHistoryEntries(rows);
    } catch {
      setHistoryEntries([]);
      setHistoryUnlinked(true);
    } finally {
      setHistoryLoading(false);
    }
  }, [organizationId, submission.id, supabase]);

  useEffect(() => {
    if (activeTab === "history") {
      void loadHistory();
    }
  }, [activeTab, loadHistory]);

  const tabs = useMemo<DetailTab[]>(() => {
    if (!detail) return [];

    const items: DetailTab[] = [{ id: "overview", label: "Overview" }];
    for (const section of detail.schema.sections) {
      items.push({ id: section.id, label: section.title });
    }
    if (detail.schema.acknowledgments.length > 0) {
      items.push({ id: "acknowledgments", label: "Acknowledgments" });
    }
    items.push({ id: "history", label: "History" });
    return items;
  }, [detail]);

  const statusStyle = applicationStatusBadgeStyle(currentStatus, C);
  const familyLabel =
    submission.guardianName || submission.studentLabel || "Application";
  const contactLabel = submission.contactEmail ?? "No contact email";
  const canStartEnrollment = currentStatus === "accepted" && !hasChecklist;
  const showEnrollmentStatus =
    currentStatus === "enrolling" || hasChecklist;

  function renderTabPanel(tabId: string) {
    if (!detail) return null;

    if (tabId === "overview") {
      return (
        <>
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

          {canStartEnrollment ? (
            <div>
              <button
                type="button"
                onClick={() => setStartEnrollmentOpen(true)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: C.accent }}
              >
                Start enrollment
              </button>
              <p className="mt-2 text-xs" style={{ color: C.textTertiary }}>
                Choose the enrollment agreement and send the checklist to the family.
              </p>
            </div>
          ) : null}

          {showEnrollmentStatus ? (
            <EnrollmentStatusCard
              C={C}
              organizationId={organizationId}
              applicationId={submission.id}
            />
          ) : null}

          <ApplicationSubmissionPostSubmitSection
            C={C}
            steps={detail.postSubmitSteps}
          />
        </>
      );
    }

    if (tabId === "acknowledgments") {
      return (
        <ApplicationReadOnlyView
          branding={branding}
          schoolName={schoolName}
          schoolSlug={schoolSlug}
          application={detail}
          embedded
          view="acknowledgments"
        />
      );
    }

    if (tabId === "history") {
      return (
        <ApplicationSubmissionHistorySection
          C={C}
          currentApplicationId={submission.id}
          currentApplicationStatus={currentStatus}
          entries={historyEntries}
          loading={historyLoading}
          unlinked={historyUnlinked}
          onSelect={(applicationId) => onSelectSubmission?.(applicationId)}
        />
      );
    }

    return (
      <ApplicationReadOnlyView
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        application={detail}
        embedded
        view="section"
        sectionId={tabId}
      />
    );
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
                  onClick={() => setActiveTab(tab.id)}
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

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textTertiary }} />
          </div>
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
                className="space-y-6"
              >
                {renderTabPanel(tab.id)}
              </div>
            ))}
          </>
        ) : null}
      </div>

      <div
        className="flex flex-shrink-0 flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-xs sm:px-5"
        style={{ borderTop: `1px solid ${C.border}`, color: C.textTertiary }}
      >
        <span>Created {formatShortDate(submission.createdAt)}</span>
        {submission.submittedAt ? (
          <span>Submitted {formatShortDate(submission.submittedAt)}</span>
        ) : null}
        <span>{formatSubmissionProgress(submission)}</span>
        {submission.feeEnabled && submission.feeStatus !== "not_required" ? (
          <span>Fee {FEE_STATUS_LABELS[submission.feeStatus] ?? submission.feeStatus}</span>
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
