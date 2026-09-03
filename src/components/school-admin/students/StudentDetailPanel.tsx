"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Heart, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import { SchoolAdminDetailPanelSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelSectionGroup from "@/components/school-admin/admissions/DetailPanelSectionGroup";
import FamilyGuardiansSection from "@/components/school-admin/admissions/FamilyGuardiansSection";
import ParentChildHealthTab from "@/components/school-parent/health/ParentChildHealthTab";
import { SubmissionDetailStoryProvider } from "@/components/school-admin/admissions/SubmissionDetailStoryContext";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
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
import { formatShortDate } from "@/lib/admissions/application-submissions";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { createClient } from "@/utils/supabase/client";
import { studentHasStandingHealthItems, type StudentHealthProfile } from "@/lib/student-health/types";

type StudentDetailPanelProps = {
  student: AdminEnrolledStudentSummary;
  organizationId: string;
  branding: OrganizationBranding;
  schoolSlug: string;
  activeStaff: StaffMemberRecord[];
  staffPath: string;
  staffLoading?: boolean;
  assigningTeacher?: boolean;
  onAssignTeacher: (
    studentId: string,
    staffMemberIds: string[],
  ) => Promise<void>;
  onRequestStaff?: () => void;
  onStudentHealthChange?: (studentId: string, hasStandingHealthItems: boolean) => void;
  onClose: () => void;
};

type DetailTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

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
  staffLoading = false,
  assigningTeacher = false,
  onAssignTeacher,
  onRequestStaff,
  onStudentHealthChange,
  onClose,
}: StudentDetailPanelProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const reducedMotion = useReducedMotion();
  const supabase = useMemo(() => createClient(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(["overview"]));

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

  const loadDetail = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
      }
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
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [organizationId, student.id, supabase],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadDetail();
    });
  }, [loadDetail]);

  useEffect(() => {
    onRequestStaff?.();
  }, [onRequestStaff]);

  const handleAssignTeacher = useCallback(
    async (studentId: string, staffMemberIds: string[]) => {
      await onAssignTeacher(studentId, staffMemberIds);
      await loadDetail({ silent: true });
    },
    [loadDetail, onAssignTeacher],
  );

  const handleHealthProfileChange = useCallback(
    (profile: StudentHealthProfile) => {
      onStudentHealthChange?.(student.id, studentHasStandingHealthItems(profile));
    },
    [onStudentHealthChange, student.id],
  );

  const tabs: DetailTab[] = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "family", label: "Family", icon: Users },
      { id: "health", label: "Health", icon: Heart },
    ],
    [],
  );

  const studentName = formatEnrolledStudentName(student);
  const formattedGrade = formatStudentGrade(student.grade);
  const programLabel =
    student.programNames.length > 0 ? student.programNames.join(" · ") : "No program";
  const contactLabel = student.primaryContactEmail ?? "No contact email";
  const submissionsPath = schoolAdminPath(schoolSlug, "admissions", "submissions");
  const metaLine = [formattedGrade, programLabel].filter(Boolean).join(" · ");

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
                  staffLoading={staffLoading}
                  disabled={assigningTeacher}
                  onAssign={handleAssignTeacher}
                  onInteract={onRequestStaff}
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

  function renderHealthTab(panelDetail: EnrolledStudentDetail) {
    return (
      <ParentChildHealthTab
        theme={theme}
        adminCompat={C}
        organizationId={organizationId}
        studentId={student.id}
        studentFirstName={panelDetail.firstName}
        portal="admin"
        schoolSlug={schoolSlug}
        onProfileChange={handleHealthProfileChange}
      />
    );
  }

  function renderTabPanel(tabId: string) {
    if (!detail) return null;
    if (tabId === "overview") return renderOverviewTab(detail);
    if (tabId === "family") return renderFamilyTab(detail);
    if (tabId === "health") return renderHealthTab(detail);
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
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <StudentPhoto
              name={studentName}
              photoUrl={detail?.profilePhotoUrl ?? student.profilePhotoUrl}
              size="md"
              shape="circle"
              accentColor={C.accent}
              accentGlowColor={C.accentLight}
            />
            <div className="min-w-0 flex-1">
              <AdminSectionKicker theme={theme}>Student profile</AdminSectionKicker>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AdminDisplayHeading theme={theme} as="h2" size="section" className="truncate">
                  {studentName}
                </AdminDisplayHeading>
                <AdminChip theme={theme} tone="success">
                  Enrolled
                </AdminChip>
              </div>
              {metaLine ? (
                <p className="mt-1 truncate text-[11px]" style={{ color: theme.muted }}>
                  {metaLine}
                  <span className="mx-1.5 opacity-50">·</span>
                  Enrolled {formatShortDate(student.enrolledAt)}
                </p>
              ) : null}
              <p className="mt-0.5 truncate text-[11px]" style={{ color: theme.muted }}>
                {student.primaryContactName ?? student.familyName ?? "Family"}
                <span className="mx-1.5 opacity-50">·</span>
                {contactLabel}
              </p>
            </div>
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
              <SchoolAdminDetailPanelSkeleton C={C} label="Loading student" />
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
                      id={`student-panel-${tab.id}`}
                      role="tabpanel"
                      aria-labelledby={`student-tab-${tab.id}`}
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
            ) : null}
          </div>
        </SubmissionDetailStoryProvider>
      </motion.div>
    </motion.div>
  );
}
