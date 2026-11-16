"use client";

import { AnimatePresence } from "framer-motion";
import { ArrowRight, Megaphone } from "lucide-react";
import PortalHomeSchoolBulletinLauncher from "@/components/portal-home/PortalHomeSchoolBulletinLauncher";
import { AttendanceApiProvider } from "@/components/school-admin/attendance/AttendanceApiContext";
import { GardenAttendanceSheets } from "@/components/school-admin/dashboard/garden/GardenAttendanceBoard";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { GChip, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import TeacherClassroomStudentsSidebar from "@/components/school-teacher/TeacherClassroomStudentsSidebar";
import TeacherDocumentationGuidePanel from "@/components/school-teacher/TeacherDocumentationGuidePanel";
import TeacherStudentDetailPanel from "@/components/school-teacher/TeacherStudentDetailPanel";
import TeacherDayRhythm from "@/components/school-teacher/home/garden/TeacherDayRhythm";
import TeacherGuidesCard from "@/components/school-teacher/home/garden/TeacherGuidesCard";
import TeacherRollCallDialog from "@/components/school-teacher/home/garden/TeacherRollCallDialog";
import TeacherSnapshotRail from "@/components/school-teacher/home/garden/TeacherSnapshotRail";
import TeacherStartHereCard from "@/components/school-teacher/home/garden/TeacherStartHereCard";
import TeacherWorkspace from "@/components/school-teacher/home/garden/TeacherWorkspace";
import {
  portalRoleLabel,
  useTeacherDashboardModel,
  type TeacherDashboardModel,
  type TeacherDashboardPageProps,
} from "@/components/school-teacher/home/useTeacherDashboardModel";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";

/**
 * Staff (teacher) Dashboard, Garden "classroom day": greeting + data status
 * line, today's rhythm (roll call → in class → pickup), Start here + the
 * classroom snapshot above the fold, then the workspace (attendance roster
 * with guided roll call, classrooms, students) and how-to guides.
 * State: `useTeacherDashboardModel`. Rules:
 * `.agents/skills/teacher-portal-garden-design/SKILL.md`.
 */
export default function TeacherDashboardPage(props: TeacherDashboardPageProps) {
  return (
    <AttendanceApiProvider apiBasePath="/api/teacher-portal/attendance" previewMode={props.previewMode ?? false}>
      <TeacherDashboardView {...props} />
    </AttendanceApiProvider>
  );
}

function TeacherDashboardView(props: TeacherDashboardPageProps) {
  const model = useTeacherDashboardModel(props);
  const { theme, summary, previewMode } = model;
  const { schoolName, userProfile, roleTitle, portalRole, organizationId, branding, slug } = props;

  return (
    <>
      <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <ParentGardenPageHeader
            kicker={`${schoolName} · Staff`}
            title={
              <>
                {model.greetingPrefix}, <span className="text-[var(--sf-clay)]">{model.name}</span>.{" "}
                <span aria-hidden="true">{model.greetingEmoji}</span>
              </>
            }
            subtitle={
              <>
                {previewMode
                  ? `Previewing ${schoolName}'s staff portal as ${userProfile.displayName}.`
                  : `Here's your classroom picture for ${model.todayLabel}.`}
                <span className="mt-2 flex flex-wrap items-center gap-2">
                  <GChip tone="neutral">
                    {roleTitle || "Staff"} · {portalRoleLabel(portalRole)}
                  </GChip>
                  <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70" data-testid="teacher-dashboard-status-line">
                    {model.statusLine}
                  </span>
                </span>
              </>
            }
            actions={
              <PortalHomeSchoolBulletinLauncher
                theme={theme}
                bulletinEnabled={summary.bulletinEnabled}
                bulletinPosts={summary.bulletinPosts}
                renderTrigger={(open) => (
                  <button type="button" onClick={open} className={gBtnOutlineSm}>
                    <Megaphone className="h-4 w-4" aria-hidden />
                    School Bulletin
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              />
            }
          />

          <TeacherDayRhythm model={model} />

          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
            <TeacherStartHereCard model={model} />
            <TeacherSnapshotRail model={model} />
          </div>

          <TeacherWorkspace model={model} />

          <TeacherGuidesCard model={model} />

          <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
            Need access changes? Contact your school administrator.
          </p>
        </div>
      </ParentGardenFrame>

      {/* Drawers, sheets and dialogs stay outside the Garden frame. */}
      <TeacherOverlays model={model} organizationId={organizationId} branding={branding} slug={slug} />
    </>
  );
}

function TeacherOverlays({
  model,
  organizationId,
  branding,
  slug,
}: {
  model: TeacherDashboardModel;
  organizationId: string;
  branding: TeacherDashboardPageProps["branding"];
  slug: string;
}) {
  const { theme, adminCompat, summary, selectedStudent } = model;
  return (
    <>
      {model.showAttendanceSection ? (
        <>
          <GardenAttendanceSheets att={model.att} organizationId={organizationId} theme={theme} C={adminCompat} />
          <TeacherRollCallDialog model={model} />
        </>
      ) : null}

      <TeacherClassroomStudentsSidebar
        theme={theme}
        classroomName={model.classroomSidebar?.name ?? ""}
        students={model.classroomSidebarStudents}
        open={model.classroomSidebar !== null}
        onClose={model.closeClassroomSidebar}
        onSelectStudent={model.setSelectedStudent}
      />

      <TeacherDocumentationGuidePanel
        theme={theme}
        guide={model.activeGuide}
        open={model.activeGuide != null}
        onClose={model.closeGuide}
      />

      <AnimatePresence>
        {selectedStudent && summary.staffMemberId ? (
          <div className="fixed inset-0 z-[110]">
            <TeacherStudentDetailPanel
              key={selectedStudent.id}
              student={selectedStudent}
              organizationId={organizationId}
              staffMemberId={summary.staffMemberId}
              branding={branding}
              schoolSlug={slug}
              detailAccess="assigned"
              readOnly={model.previewMode}
              onClose={() => model.setSelectedStudent(null)}
            />
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
