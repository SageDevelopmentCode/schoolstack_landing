"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, LayoutDashboard, Users } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelSectionGroup from "@/components/school-admin/admissions/DetailPanelSectionGroup";
import { SubmissionDetailStoryProvider } from "@/components/school-admin/admissions/SubmissionDetailStoryContext";
import { GardenLoadError } from "@/components/school-admin/garden/kit";
import { GardenFacts } from "@/components/school-admin/garden/blocks";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import ParentChildHealthTab from "@/components/school-parent/health/ParentChildHealthTab";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GSkeleton, GTabBar } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import {
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStudentGrade,
  loadTeacherAssignedStudentDetail,
  loadTeacherMessageableFamilyStudentDetail,
  loadTeacherSchoolStudentDetail,
  studentStatusLabel,
  type AdminEnrolledStudentSummary,
  type EnrolledStudentDetail,
} from "@/lib/school-admin/enrolled-students";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { studentHasStandingHealthItems, type StudentHealthProfile } from "@/lib/student-health/types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";

type TeacherStudentDetailPanelProps = {
  student: AdminEnrolledStudentSummary;
  organizationId: string;
  staffMemberId: string;
  branding: OrganizationBranding;
  schoolSlug: string;
  detailAccess?: "assigned" | "messageableFamily" | "school";
  readOnly?: boolean;
  /** Keep the panel mounted and toggle this to animate it out (default: open while mounted). */
  open?: boolean;
  onStudentHealthChange?: (studentId: string, hasStandingHealthItems: boolean) => void;
  onClose: () => void;
};

type Tab = "overview" | "family" | "health";

/**
 * Staff student profile drawer (Garden `GSidePanel`): Overview, Family and
 * Health tabs, inline load error + Try again, Escape closes. Shared by the
 * Dashboard, My Students and Messages.
 */
export default function TeacherStudentDetailPanel({
  student,
  organizationId,
  staffMemberId,
  schoolSlug,
  detailAccess = "assigned",
  readOnly = false,
  open = true,
  onStudentHealthChange,
  onClose,
}: TeacherStudentDetailPanelProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [visited, setVisited] = useState<Tab[]>(["overview"]);
  const [loadedFor, setLoadedFor] = useState(student.id);

  // A different student → start over (previous-props pattern).
  if (student.id !== loadedFor) {
    setLoadedFor(student.id);
    setTab("overview");
    setVisited(["overview"]);
    setDetail(null);
    setError(null);
    setLoading(true);
  }

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let nextDetail: EnrolledStudentDetail | null = null;
      if (detailAccess === "messageableFamily") {
        nextDetail = await loadTeacherMessageableFamilyStudentDetail(supabase, organizationId, staffMemberId, student.id);
      } else if (detailAccess === "school") {
        nextDetail = await loadTeacherSchoolStudentDetail(supabase, organizationId, student.id);
      } else {
        nextDetail = await loadTeacherAssignedStudentDetail(supabase, organizationId, staffMemberId, student.id);
      }
      if (!nextDetail) {
        throw new Error(
          detailAccess === "messageableFamily"
            ? "Student not found or not available for this conversation."
            : detailAccess === "school"
              ? "Student not found or not enrolled at this school."
              : "Student not found or not assigned to you.",
        );
      }
      setDetail(nextDetail);
    } catch (err) {
      void reportPortalOperationalError(
        "teacher_portal",
        { organizationId, operation: "students.load_detail", error: "" },
        err,
      );
      setError(err instanceof Error ? err.message : "Failed to load student.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [detailAccess, organizationId, staffMemberId, student.id, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDetail();
    });
  }, [loadDetail]);

  const handleHealthProfileChange = useCallback(
    (profile: StudentHealthProfile) => {
      onStudentHealthChange?.(student.id, studentHasStandingHealthItems(profile));
    },
    [onStudentHealthChange, student.id],
  );

  const studentName = formatEnrolledStudentName(student);
  const subtitle = [
    formatStudentGrade(student.grade),
    student.programNames.length > 0 ? student.programNames.join(" · ") : "No program",
    student.enrolledAt ? `Enrolled ${formatEnrolledDate(student.enrolledAt)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const changeTab = (key: string) => {
    const next = key as Tab;
    setTab(next);
    setVisited((current) => (current.includes(next) ? current : [...current, next]));
  };

  return (
    <SubmissionDetailStoryProvider variant="garden" theme={theme}>
      <AdminGardenSkin theme={theme}>
        <GSidePanel
          theme={theme}
          open={open}
          onClose={onClose}
          size="xl"
          kicker="Student profile"
          title={studentName}
          subtitle={subtitle}
          testId="teacher-student-detail-panel"
          panelId="teacher-student-detail-panel"
          closeLabel={`Close ${studentName}'s profile`}
          headerAside={
            <div className="flex flex-wrap items-center gap-2">
              <StudentPhoto
                name={studentName}
                photoUrl={detail?.profilePhotoUrl ?? student.profilePhotoUrl}
                size="sm"
                shape="circle"
                accentColor="var(--sf-clay)"
                accentGlowColor="var(--sf-accent-wash)"
                healthIndicator={student.hasStandingHealthItems}
                healthIndicatorColor="#b4412f"
              />
              <GChip tone="success">Enrolled</GChip>
              <span className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
                {student.primaryContactName ?? student.familyName ?? "Family"} ·{" "}
                {student.primaryContactEmail ?? "No contact email"}
              </span>
            </div>
          }
          headerBelow={
            detail && !loading && !error ? (
              <GTabBar
                ariaLabel="Student sections"
                activeKey={tab}
                onChange={changeTab}
                items={[
                  { key: "overview", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />, testId: "teacher-student-tab-overview" },
                  { key: "family", label: "Family", icon: <Users className="h-3.5 w-3.5" aria-hidden />, testId: "teacher-student-tab-family" },
                  { key: "health", label: "Health", icon: <Heart className="h-3.5 w-3.5" aria-hidden />, testId: "teacher-student-tab-health" },
                ]}
              />
            ) : undefined
          }
        >
          <div className="sf-admin-garden-skin flex flex-col gap-4">
            {loading ? (
              <div className="flex flex-col gap-3" role="status" aria-live="polite">
                <span className="sr-only">Loading {studentName}&apos;s profile</span>
                <GSkeleton className="h-[180px] !rounded-[20px]" />
                <GSkeleton className="h-[120px] !rounded-[20px]" />
              </div>
            ) : error ? (
              <GardenLoadError
                title={`${student.firstName}'s profile didn't load`}
                description={error}
                onRetry={() => void loadDetail()}
              />
            ) : detail ? (
              <>
                <div id="teacher-student-panel-overview" role="tabpanel" aria-label="Overview" hidden={tab !== "overview"}>
                  <DetailPanelSectionGroup C={C}>
                    <DetailPanelSection C={C} title="Student details" description="Core profile information for this student.">
                      <GardenFacts
                        items={[
                          { label: "Full name", value: formatEnrolledStudentName(detail) },
                          { label: "Grade", value: formatStudentGrade(detail.grade) ?? "—" },
                          ...(detailAccess === "school"
                            ? [{ label: "Teachers", value: detail.assignedTeacherNames.trim() || "Unassigned" }]
                            : []),
                          { label: "Date of birth", value: detail.dateOfBirth ? formatEnrolledDate(detail.dateOfBirth) : "—" },
                          { label: "Student status", value: studentStatusLabel(detail.status) },
                          { label: "Family", value: detail.familyName ?? "—" },
                          { label: "Family email", value: detail.familyPrimaryEmail ?? "—" },
                        ]}
                      />
                    </DetailPanelSection>

                    <DetailPanelSection C={C} title="Enrollments" description="Programs this student is currently enrolled in.">
                      {detail.enrollments.length === 0 ? (
                        <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">No enrolled programs found.</p>
                      ) : (
                        <ul className="m-0 flex list-none flex-col gap-2 p-0">
                          {detail.enrollments.map((enrollment) => (
                            <li
                              key={enrollment.id}
                              className="rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3.5 py-2.5"
                            >
                              <div className="text-[14px] font-extrabold text-[var(--sf-ink)]">{enrollment.programName}</div>
                              <div className="mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                                {enrollment.classroomName ? `Classroom: ${enrollment.classroomName}` : "No classroom assigned"} ·
                                Enrolled {formatEnrolledDate(enrollment.enrolledAt)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </DetailPanelSection>
                  </DetailPanelSectionGroup>
                </div>

                {visited.includes("family") ? (
                  <div id="teacher-student-panel-family" role="tabpanel" aria-label="Family" hidden={tab !== "family"}>
                    <DetailPanelSectionGroup C={C}>
                      <DetailPanelSection C={C} title="Family record" description="Household contact details linked to this student.">
                        <GardenFacts
                          items={[
                            { label: "Family name", value: detail.familyName ?? "—" },
                            { label: "Primary email", value: detail.familyPrimaryEmail ?? "—" },
                            { label: "Primary phone", value: detail.familyPrimaryPhone ?? "—" },
                          ]}
                        />
                      </DetailPanelSection>
                    </DetailPanelSectionGroup>
                  </div>
                ) : null}

                {visited.includes("health") ? (
                  <div id="teacher-student-panel-health" role="tabpanel" aria-label="Health" hidden={tab !== "health"}>
                    <ParentChildHealthTab
                      theme={theme}
                      adminCompat={C}
                      organizationId={organizationId}
                      studentId={student.id}
                      studentFirstName={detail.firstName}
                      portal="teacher"
                      schoolSlug={schoolSlug}
                      readOnly={readOnly}
                      onProfileChange={handleHealthProfileChange}
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </GSidePanel>
      </AdminGardenSkin>
    </SubmissionDetailStoryProvider>
  );
}
