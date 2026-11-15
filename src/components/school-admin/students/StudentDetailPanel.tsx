"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, CircleX, ExternalLink, Eye, Heart, LayoutDashboard, Users } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GSkeleton, GTabBar, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelSectionGroup from "@/components/school-admin/admissions/DetailPanelSectionGroup";
import FamilyGuardiansSection from "@/components/school-admin/admissions/FamilyGuardiansSection";
import { SubmissionDetailStoryProvider } from "@/components/school-admin/admissions/SubmissionDetailStoryContext";
import { GardenLoadError } from "@/components/school-admin/garden/kit";
import { GardenFacts } from "@/components/school-admin/garden/blocks";
import ParentChildHealthTab from "@/components/school-parent/health/ParentChildHealthTab";
import StudentPhoto from "@/components/students/StudentPhoto";
import { GardenClassroomButton, GardenStudentTeachers } from "./GardenStudentCells";
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
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { photoMediaConsentLabel, type PhotoMediaConsent } from "@/lib/students/photo-media-consent";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { studentHasStandingHealthItems, type StudentHealthProfile } from "@/lib/student-health/types";
import { createClient } from "@/utils/supabase/client";

type Tab = "overview" | "family" | "health";

const CONSENT: Record<string, { tone: GChipTone; icon: typeof Camera }> = {
  full: { tone: "success", icon: CheckCircle2 },
  limited: { tone: "warning", icon: Eye },
  none: { tone: "alert", icon: CircleX },
};

function ConsentChip({ consent, label }: { consent: PhotoMediaConsent | null; label?: string }) {
  const config = (consent && CONSENT[consent]) || { tone: "info" as GChipTone, icon: Camera };
  const Icon = config.icon;
  return (
    <GChip tone={config.tone}>
      <span className="inline-flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label ?? photoMediaConsentLabel(consent)}
      </span>
    </GChip>
  );
}

/**
 * Student profile drawer (Garden). Opens for a row or a `?student=` link; when
 * the student isn't in the loaded rows the header falls back to the loaded
 * detail and classroom changes point back to the list.
 */
export default function StudentDetailPanel({
  open,
  studentId,
  student,
  organizationId,
  schoolSlug,
  theme,
  C,
  classroomsPath,
  assigningClassroom,
  onOpenClassrooms,
  onStudentHealthChange,
  onClose,
}: {
  open: boolean;
  studentId: string | null;
  student: AdminEnrolledStudentSummary | null;
  organizationId: string;
  schoolSlug: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  classroomsPath: string;
  assigningClassroom: boolean;
  onOpenClassrooms: () => void;
  onStudentHealthChange?: (studentId: string, hasStandingHealthItems: boolean) => void;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [visited, setVisited] = useState<Tab[]>(["overview"]);

  // New student → reset (previous-props pattern).
  if (studentId !== loadedFor) {
    setLoadedFor(studentId);
    setTab("overview");
    setVisited(["overview"]);
    setDetail(null);
    setError(null);
    setLoading(Boolean(studentId));
  }

  const loadDetail = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const next = await loadEnrolledStudentDetail(supabase, organizationId, studentId);
      if (!next) throw new Error("Student not found.");
      setDetail(next);
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "students.load_detail", error: "" },
        err,
      );
      setError(err instanceof Error ? err.message : "Failed to load student.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, studentId, supabase]);

  useEffect(() => {
    if (!studentId) return;
    queueMicrotask(() => {
      void loadDetail();
    });
  }, [loadDetail, studentId]);

  const handleHealthProfileChange = useCallback(
    (profile: StudentHealthProfile) => {
      if (studentId) onStudentHealthChange?.(studentId, studentHasStandingHealthItems(profile));
    },
    [onStudentHealthChange, studentId],
  );

  const name = student ? formatEnrolledStudentName(student) : detail ? formatEnrolledStudentName(detail) : "Student";
  const grade = formatStudentGrade(student?.grade ?? detail?.grade ?? null);
  const programs = student?.programNames.length ? student.programNames.join(" · ") : null;
  const submissionsPath = schoolAdminPath(schoolSlug, "admissions", "submissions");
  const subtitle = [grade, programs, student?.enrolledAt ? `Enrolled ${formatEnrolledDate(student.enrolledAt)}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <SubmissionDetailStoryProvider variant="garden" theme={theme}>
      <GSidePanel
        theme={theme}
        open={open && Boolean(studentId)}
        onClose={onClose}
        size="xl"
        kicker="Student profile"
        title={name}
        subtitle={subtitle || undefined}
        testId="student-detail-panel"
        panelId="student-detail-panel"
        headerAside={
          <div className="flex flex-wrap items-center gap-2">
            <StudentPhoto
              name={name}
              photoUrl={detail?.profilePhotoUrl ?? student?.profilePhotoUrl ?? null}
              size="sm"
              shape="circle"
              accentColor="var(--sf-clay)"
              accentGlowColor="var(--sf-accent-wash)"
            />
            <GChip tone="success">Enrolled</GChip>
            {student?.primaryContactEmail ? (
              <span className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
                {student.primaryContactName ?? student.familyName ?? "Family"} · {student.primaryContactEmail}
              </span>
            ) : null}
          </div>
        }
        headerBelow={
          detail && !loading && !error ? (
            <GTabBar
              ariaLabel="Student sections"
              activeKey={tab}
              onChange={(key) => {
                setTab(key as Tab);
                setVisited((current) => (current.includes(key as Tab) ? current : [...current, key as Tab]));
              }}
              items={[
                { key: "overview", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" aria-hidden /> },
                { key: "family", label: "Family", icon: <Users className="h-3.5 w-3.5" aria-hidden /> },
                { key: "health", label: "Health", icon: <Heart className="h-3.5 w-3.5" aria-hidden /> },
              ]}
            />
          ) : undefined
        }
      >
        <div className="sf-admin-garden-skin flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col gap-3" role="status" aria-live="polite">
              <span className="sr-only">Loading student</span>
              <GSkeleton className="h-[180px] !rounded-[20px]" />
              <GSkeleton className="h-[120px] !rounded-[20px]" />
            </div>
          ) : error ? (
            <GardenLoadError title="This student didn't load" description={error} onRetry={() => void loadDetail()} />
          ) : detail ? (
            <>
              <div hidden={tab !== "overview"}>
                <DetailPanelSectionGroup C={C}>
                  <DetailPanelSection C={C} title="Student details" description="Core profile information for this enrolled student.">
                    <GardenFacts
                      items={[
                        { label: "Full name", value: formatEnrolledStudentName(detail) },
                        { label: "Grade", value: formatStudentGrade(detail.grade) ?? "—" },
                        {
                          label: "Classrooms",
                          value: student ? (
                            <GardenClassroomButton
                              classroomNames={student.classroomNames}
                              busy={assigningClassroom}
                              onOpen={onOpenClassrooms}
                            />
                          ) : (
                            <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
                              {detail.enrollments.map((e) => e.classroomName).filter(Boolean).join(", ") || "Unassigned"}
                            </span>
                          ),
                          hint: student ? undefined : "Find this student in the list to change classrooms.",
                        },
                        {
                          label: "Teachers",
                          value: student ? <GardenStudentTeachers student={student} classroomsPath={classroomsPath} /> : "—",
                        },
                        { label: "Date of birth", value: detail.dateOfBirth ? formatEnrolledDate(detail.dateOfBirth) : "—" },
                        { label: "Student status", value: studentStatusLabel(detail.status) },
                        { label: "Family", value: detail.familyName ?? "—" },
                        { label: "Family email", value: detail.familyPrimaryEmail ?? "—" },
                        {
                          label: "Photo permissions",
                          value: <ConsentChip consent={detail.photoMediaConsent} label={detail.photoMediaConsentLabel} />,
                        },
                      ]}
                    />
                  </DetailPanelSection>

                  <DetailPanelSection C={C} title="Enrollments" description="Programs this student is currently enrolled in.">
                    {detail.enrollments.length === 0 ? (
                      <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">No enrolled programs found.</p>
                    ) : (
                      <ul className="m-0 flex list-none flex-col gap-2 p-0">
                        {detail.enrollments.map((enrollment) => (
                          <li key={enrollment.id} className="rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3.5 py-2.5">
                            <div className="text-[14px] font-extrabold text-[var(--sf-ink)]">{enrollment.programName}</div>
                            <div className="mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                              {enrollment.classroomName ? `Classroom: ${enrollment.classroomName}` : "No classroom assigned"} · Enrolled{" "}
                              {formatEnrolledDate(enrollment.enrolledAt)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </DetailPanelSection>

                  {detail.applicationId ? (
                    <DetailPanelSection C={C} title="Admissions" description="View the original application for this student.">
                      <Link href={`${submissionsPath}?application=${detail.applicationId}`} className={gLinkSm}>
                        View application
                        {detail.applicationStatus ? ` (${applicationStatusLabel(detail.applicationStatus)})` : null}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </DetailPanelSection>
                  ) : null}
                </DetailPanelSectionGroup>
              </div>

              {visited.includes("family") ? (
                <div hidden={tab !== "family"}>
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
                  <FamilyGuardiansSection
                    C={C}
                    organizationId={organizationId}
                    familyId={detail.familyId || null}
                    schoolSlug={schoolSlug}
                    detail={null}
                  />
                </DetailPanelSectionGroup>
                </div>
              ) : null}

              {visited.includes("health") ? (
                <div hidden={tab !== "health"}>
                <ParentChildHealthTab
                  theme={theme}
                  adminCompat={C}
                  organizationId={organizationId}
                  studentId={detail.id}
                  studentFirstName={detail.firstName}
                  portal="admin"
                  schoolSlug={schoolSlug}
                  onProfileChange={handleHealthProfileChange}
                />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </GSidePanel>
    </SubmissionDetailStoryProvider>
  );
}
