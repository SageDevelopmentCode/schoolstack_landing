"use client";

import { createElement, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ClipboardCheck, FileText, HeartPulse, Users } from "lucide-react";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import EnrollmentChecklistItemReadOnlyPanel from "@/components/admissions/EnrollmentChecklistItemReadOnlyPanel";
import StudentPhoto from "@/components/students/StudentPhoto";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import { extractStudentFromResponses } from "@/lib/admissions/apply-system-fields";
import {
  checklistItemStatusLabel,
  checklistItemStatusStyle,
  getChecklistItemTypeIcon,
} from "@/lib/admissions/enrollment-checklist-item-status-ui";
import { computeChecklistProgress } from "@/lib/admissions/enrollment-checklist-materialization";
import type { LoadedEnrollmentChecklist } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  CHECKLIST_ITEM_TYPE_LABELS,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { ApplicationDetail, ParentAssignedTeacher } from "@/lib/admissions/parent-portal-access";
import ParentChildTeachersTab from "@/components/school-parent/ParentChildTeachersTab";
import ParentChildHealthTab from "@/components/school-parent/health/ParentChildHealthTab";
import type { StudentHealthProfile } from "@/components/school-parent/health/parent-health-types";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import {
  StudentProfilePhotoClientError,
  uploadStudentProfilePhotoFromParent,
} from "@/lib/students/upload-student-profile-photo-client";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  childFirstName,
  type ParentChildRecordSection,
} from "@/components/school-parent/children/parent-children-utils";
import { parentChildrenViewTransition } from "@/components/school-parent/children/parent-children-view-transition";

const RECORD_TAB_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

type ParentChildRecordWorkspaceProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  application: ApplicationDetail;
  checklist: LoadedEnrollmentChecklist | null;
  assignedTeachers: ParentAssignedTeacher[];
  readOnly?: boolean;
  activeSection: ParentChildRecordSection;
  onSectionChange: (section: ParentChildRecordSection) => void;
  onPhotoUpdated?: (applicationId: string, profilePhotoUrl: string) => void;
  initialHealthProfile?: StudentHealthProfile | null;
  onHealthProfileChange?: (profile: StudentHealthProfile) => void;
  workspaceRef?: React.RefObject<HTMLElement | null>;
};

function formatBirthDate(value: string): string | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calculateAge(value: string): number | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= 0 ? age : null;
}

function ChecklistItemRow({
  C,
  theme,
  item,
  instance,
}: {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  item: EnrollmentChecklistItem;
  instance?: EnrollmentChecklistItemInstance;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = instance?.status ?? "not_started";
  const icon = getChecklistItemTypeIcon(item.type);
  const statusStyle = checklistItemStatusStyle(status, C);

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full min-h-[44px] items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={expanded}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: C.accentGlow }}
        >
          {createElement(icon, { className: "h-4 w-4", style: { color: C.accent } })}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" style={{ color: theme.ink }}>
            {item.label}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
            {CHECKLIST_ITEM_TYPE_LABELS[item.type]}
            {!item.required ? (
              <>
                <span className="mx-1.5 opacity-50">·</span>
                Optional
              </>
            ) : null}
          </p>
        </div>
        <span
          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={statusStyle}
        >
          {checklistItemStatusLabel(status)}
        </span>
        <ChevronDown
          className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: theme.muted, transform: expanded ? "rotate(180deg)" : undefined }}
        />
      </button>
      {expanded ? (
        <div className="border-t px-4 py-4" style={{ borderColor: theme.line }}>
          <EnrollmentChecklistItemReadOnlyPanel C={C} item={item} instance={instance} />
        </div>
      ) : null}
    </div>
  );
}

export default function ParentChildRecordWorkspace({
  theme,
  adminCompat: C,
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  application,
  checklist,
  assignedTeachers,
  readOnly = false,
  activeSection,
  onSectionChange,
  onPhotoUpdated,
  initialHealthProfile,
  onHealthProfileChange,
  workspaceRef,
}: ParentChildRecordWorkspaceProps) {
  const hasChecklist = Boolean(checklist && checklist.items.length > 0);
  const hasTeachersTab = Boolean(application.studentId);
  const hasHealthTab = Boolean(application.studentId);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(application.profilePhotoUrl);
  const [photoUploading, setPhotoUploading] = useState(false);

  const student = extractStudentFromResponses(application.responses);
  const fullName = student ? `${student.firstName} ${student.lastName}` : "Student";
  const firstName = childFirstName(fullName);
  const birthDate = student ? formatBirthDate(student.dateOfBirth) : null;
  const age = student ? calculateAge(student.dateOfBirth) : null;
  const statusStyle = applicationStatusBadgeStyle(application.status, C);
  const canUploadPhoto = !readOnly && Boolean(application.studentId);

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      if (!application.studentId || readOnly) return;

      setPhotoUploading(true);

      try {
        const nextUrl = await uploadStudentProfilePhotoFromParent(
          organizationId,
          application.studentId,
          file,
        );
        setProfilePhotoUrl(nextUrl);
        onPhotoUpdated?.(application.id, nextUrl);
        parentToast.success("Profile photo updated.");
      } catch (error) {
        parentToast.error(
          error instanceof StudentProfilePhotoClientError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Failed to upload photo.",
        );
      } finally {
        setPhotoUploading(false);
      }
    },
    [application.id, application.studentId, onPhotoUpdated, organizationId, readOnly],
  );

  const progress = checklist
    ? computeChecklistProgress(checklist.items, checklist.instances)
    : null;

  const instanceByTemplateItemId = useMemo(() => {
    const map = new Map<string, EnrollmentChecklistItemInstance>();
    for (const instance of checklist?.instances ?? []) {
      map.set(instance.templateItemId, instance);
    }
    return map;
  }, [checklist]);

  const tabs: Array<{
    key: ParentChildRecordSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "application",
      label: "Application",
      icon: <FileText className={RECORD_TAB_ICON_CLASS} aria-hidden />,
    },
  ];
  if (hasChecklist) {
    tabs.push({
      key: "checklist",
      label: "Enrollment checklist",
      icon: <ClipboardCheck className={RECORD_TAB_ICON_CLASS} aria-hidden />,
    });
  }
  if (hasTeachersTab) {
    tabs.push({
      key: "teachers",
      label: "Teachers",
      icon: <Users className={RECORD_TAB_ICON_CLASS} aria-hidden />,
    });
  }
  if (hasHealthTab) {
    tabs.push({
      key: "health",
      label: "Health",
      icon: <HeartPulse className={RECORD_TAB_ICON_CLASS} aria-hidden />,
    });
  }

  return (
    <section ref={workspaceRef} data-testid="parent-children-record-workspace">
    <ParentCard
      theme={theme}
      className="!p-0"
    >
      <div className="flex flex-col gap-0 border-b px-5 py-5 sm:px-6" style={{ borderColor: theme.line }}>
        <ParentSectionKicker theme={theme}>School record</ParentSectionKicker>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <StudentPhoto
              name={fullName}
              photoUrl={profilePhotoUrl}
              size="2xl"
              shape="square"
              theme={C}
              editable={canUploadPhoto}
              uploading={photoUploading}
              showEditHint={canUploadPhoto}
              onFileSelect={(file) => void handlePhotoUpload(file)}
            />
            <div className="min-w-0">
              <ParentDisplayHeading theme={theme} as="h2" size="section" className="!text-[1.4rem]">
                {fullName}
              </ParentDisplayHeading>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={statusStyle}
                >
                  {applicationStatusLabel(application.status)}
                </span>
                {student?.grade ? (
                  <ParentChip theme={theme} tone="info" className="!normal-case !tracking-normal">
                    Grade {student.grade}
                  </ParentChip>
                ) : null}
                {birthDate ? (
                  <ParentChip theme={theme} tone="info" className="!normal-case !tracking-normal">
                    Born {birthDate}
                    {age !== null ? ` · Age ${age}` : ""}
                  </ParentChip>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6">
        <ParentStoryPillNav
          theme={theme}
          items={tabs.map(({ key, label, icon }) => ({ key, label, icon }))}
          activeKey={activeSection}
          onChange={(key) => onSectionChange(key as ParentChildRecordSection)}
          ariaLabel={`${firstName} school record sections`}
          data-testid="parent-children-record-nav"
        />
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={`${application.id}-${activeSection}`} {...parentChildrenViewTransition}>
            {activeSection === "application" ? (
              <div
                className="rounded-2xl border px-5 py-6 sm:px-6"
                style={{ borderColor: theme.line, backgroundColor: theme.white }}
              >
                <ApplicationReadOnlyView
                  branding={branding}
                  schoolName={schoolName}
                  schoolSlug={schoolSlug}
                  application={application}
                  embedded
                />
              </div>
            ) : null}

            {activeSection === "checklist" && checklist && progress ? (
              <div className="space-y-4">
                <div
                  className="flex items-center justify-between rounded-2xl border px-5 py-4"
                  style={{ borderColor: theme.line, backgroundColor: theme.white }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                      {checklist.title}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                      {progress.completed}/{progress.total} required steps complete
                    </p>
                  </div>
                  <div
                    className="h-2 w-24 overflow-hidden rounded-full sm:w-32"
                    style={{ backgroundColor: theme.primarySoft }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: theme.primary,
                        width: `${progress.total > 0 ? Math.min(100, (progress.completed / progress.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {checklist.items.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      C={C}
                      theme={theme}
                      item={item}
                      instance={instanceByTemplateItemId.get(item.id)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {activeSection === "teachers" && hasTeachersTab ? (
              <ParentChildTeachersTab teachers={assignedTeachers} C={C} />
            ) : null}

            {activeSection === "health" && hasHealthTab && application.studentId ? (
              <ParentChildHealthTab
                theme={theme}
                adminCompat={C}
                organizationId={organizationId}
                studentId={application.studentId}
                studentFirstName={firstName}
                readOnly={readOnly}
                initialProfile={initialHealthProfile}
                onProfileChange={onHealthProfileChange}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </ParentCard>
    </section>
  );
}
