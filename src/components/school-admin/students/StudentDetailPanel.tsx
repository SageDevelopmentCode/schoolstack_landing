"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import { SchoolAdminDetailPanelSkeleton } from "@/components/school-admin/skeletons";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelSectionGroup from "@/components/school-admin/admissions/DetailPanelSectionGroup";
import FamilyGuardiansSection from "@/components/school-admin/admissions/FamilyGuardiansSection";
import StudentTeacherAssignSelect from "./StudentTeacherAssignSelect";
import {
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStudentGrade,
  loadEnrolledStudentDetail,
  studentStatusLabel,
  type AdminEnrolledStudentSummary,
  type EnrolledStudentDetail,
} from "@/lib/school-admin/enrolled-students";
import { applicationStatusLabel } from "@/lib/admissions/application-status-ui";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { createClient } from "@/utils/supabase/client";

type StudentDetailPanelProps = {
  student: AdminEnrolledStudentSummary;
  organizationId: string;
  branding: OrganizationBranding;
  schoolSlug: string;
  activeStaff: StaffMemberRecord[];
  staffPath: string;
  assigningTeacher?: boolean;
  onAssignTeacher: (
    studentId: string,
    staffMemberIds: string[],
  ) => Promise<void>;
  onClose: () => void;
};

type DetailTab = {
  id: string;
  label: string;
};

function enrolledBadgeStyle(C: ReturnType<typeof buildAdminThemeTokens>) {
  return {
    backgroundColor: C.successBg,
    color: C.success,
  };
}

function formatDateOfBirth(value: string | null): string {
  if (!value) return "—";
  return formatEnrolledDate(value);
}

export default function StudentDetailPanel({
  student,
  organizationId,
  branding,
  schoolSlug,
  activeStaff,
  staffPath,
  assigningTeacher = false,
  onAssignTeacher,
  onClose,
}: StudentDetailPanelProps) {
  const C = buildAdminThemeTokens(branding);
  const supabase = useMemo(() => createClient(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const navigateToTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextDetail = await loadEnrolledStudentDetail(
        supabase,
        organizationId,
        student.id,
      );
      if (!nextDetail) {
        throw new Error("Student not found.");
      }
      setDetail(nextDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, student.id, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDetail();
    });
  }, [loadDetail]);

  const tabs: DetailTab[] = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "family", label: "Family" },
    ],
    [],
  );

  const studentName = formatEnrolledStudentName(student);
  const formattedGrade = formatStudentGrade(student.grade);
  const programLabel =
    student.programNames.length > 0 ? student.programNames.join(" · ") : "No program";
  const contactLabel = student.primaryContactEmail ?? "No contact email";
  const submissionsPath = schoolAdminPath(schoolSlug, "admissions", "submissions");

  function renderOverviewTab(panelDetail: EnrolledStudentDetail) {
    return (
      <DetailPanelSectionGroup C={C}>
        <DetailPanelSection
          C={C}
          title="Student details"
          description="Core profile information for this enrolled student."
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Full name
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {formatEnrolledStudentName(panelDetail)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Grade
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {formatStudentGrade(panelDetail.grade) ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Teachers
              </dt>
              <dd className="mt-1">
                <StudentTeacherAssignSelect
                  C={C}
                  studentId={student.id}
                  studentName={formatEnrolledStudentName(student)}
                  assignedTeachers={student.assignedTeachers}
                  activeStaff={activeStaff}
                  staffPath={staffPath}
                  disabled={assigningTeacher}
                  onAssign={onAssignTeacher}
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Date of birth
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {formatDateOfBirth(panelDetail.dateOfBirth)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Student status
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {studentStatusLabel(panelDetail.status)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Family
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {panelDetail.familyName ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Family email
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {panelDetail.familyPrimaryEmail ?? "—"}
              </dd>
            </div>
          </dl>
        </DetailPanelSection>

        <DetailPanelSection
          C={C}
          title="Enrollments"
          description="Programs this student is currently enrolled in."
        >
          {panelDetail.enrollments.length === 0 ? (
            <p className="text-xs" style={{ color: C.textTertiary }}>
              No enrolled programs found.
            </p>
          ) : (
            <ul className="space-y-2">
              {panelDetail.enrollments.map((enrollment) => (
                <li
                  key={enrollment.id}
                  className="rounded-md px-3 py-2 text-sm"
                  style={{
                    backgroundColor: C.bg,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="font-medium" style={{ color: C.textPrimary }}>
                    {enrollment.programName}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                    {enrollment.classroomName
                      ? `Classroom: ${enrollment.classroomName}`
                      : "No classroom assigned"}
                    <span className="mx-1.5 opacity-50">·</span>
                    Enrolled {formatEnrolledDate(enrollment.enrolledAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DetailPanelSection>

        {panelDetail.applicationId ? (
          <DetailPanelSection
            C={C}
            title="Admissions"
            description="View the original application for this student."
          >
            <Link
              href={`${submissionsPath}?application=${panelDetail.applicationId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-2 hover:underline"
              style={{ color: C.accent }}
            >
              View application
              {panelDetail.applicationStatus
                ? ` (${applicationStatusLabel(panelDetail.applicationStatus)})`
                : null}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </DetailPanelSection>
        ) : null}
      </DetailPanelSectionGroup>
    );
  }

  function renderFamilyTab(panelDetail: EnrolledStudentDetail) {
    return (
      <DetailPanelSectionGroup C={C}>
        <DetailPanelSection
          C={C}
          title="Family record"
          description="Household contact details linked to this student."
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Family name
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {panelDetail.familyName ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Primary email
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {panelDetail.familyPrimaryEmail ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: C.textTertiary }}>
                Primary phone
              </dt>
              <dd className="mt-0.5" style={{ color: C.textPrimary }}>
                {panelDetail.familyPrimaryPhone ?? "—"}
              </dd>
            </div>
          </dl>
        </DetailPanelSection>

        <FamilyGuardiansSection
          C={C}
          organizationId={organizationId}
          familyId={panelDetail.familyId || null}
          schoolSlug={schoolSlug}
          detail={null}
        />
      </DetailPanelSectionGroup>
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
          <div className="flex min-w-0 items-start gap-3">
            <StudentPhoto
              name={studentName}
              photoUrl={detail?.profilePhotoUrl ?? student.profilePhotoUrl}
              size="md"
              shape="circle"
              accentColor={C.accent}
              accentGlowColor={C.accentLight}
            />
            <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="truncate text-sm font-semibold"
                style={{ color: C.textPrimary }}
              >
                {studentName}
              </h3>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={enrolledBadgeStyle(C)}
              >
                Enrolled
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs" style={{ color: C.textTertiary }}>
              {formattedGrade ? `${formattedGrade} · ` : null}
              {programLabel}
            </p>
            <p className="mt-1 truncate text-xs" style={{ color: C.textSecondary }}>
              {student.primaryContactName ?? student.familyName ?? "Family"}
              <span className="mx-1.5 opacity-50">·</span>
              {contactLabel}
              <span className="mx-1.5 opacity-50">·</span>
              Enrolled {formatEnrolledDate(student.enrolledAt)}
            </p>
            </div>
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
              aria-label="Student sections"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const tabId = `student-tab-${tab.id}`;
                const panelId = `student-panel-${tab.id}`;

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
            <SchoolAdminDetailPanelSkeleton C={C} label="Loading student" />
          ) : error ? (
            <p className="text-sm" style={{ color: C.error }}>
              {error}
            </p>
          ) : detail ? (
            <>
              <div
                id="student-panel-overview"
                role="tabpanel"
                aria-labelledby="student-tab-overview"
                hidden={activeTab !== "overview"}
              >
                {activeTab === "overview" ? renderOverviewTab(detail) : null}
              </div>
              <div
                id="student-panel-family"
                role="tabpanel"
                aria-labelledby="student-tab-family"
                hidden={activeTab !== "family"}
              >
                {activeTab === "family" ? renderFamilyTab(detail) : null}
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
