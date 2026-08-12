"use client";

import { createElement, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
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
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import {
  StudentProfilePhotoClientError,
  uploadStudentProfilePhotoFromParent,
} from "@/lib/students/upload-student-profile-photo-client";
import { parentToast } from "@/lib/school-parent/parent-toast";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ChildProfileSidePanelProps = {
  open: boolean;
  onClose: () => void;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  application: ApplicationDetail | null;
  checklist: LoadedEnrollmentChecklist | null;
  readOnly?: boolean;
  onPhotoUpdated?: (applicationId: string, profilePhotoUrl: string) => void;
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

function Pill({
  children,
  C,
}: {
  children: React.ReactNode;
  C: AdminThemeTokens;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: C.elevated, color: C.textSecondary }}
    >
      {children}
    </span>
  );
}

function ChecklistItemRow({
  C,
  item,
  instance,
}: {
  C: AdminThemeTokens;
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
      style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={expanded}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: C.accentGlow }}
        >
          {createElement(icon, { className: "h-4 w-4", style: { color: C.accent } })}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
            {item.label}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
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
          style={{ color: C.textTertiary, transform: expanded ? "rotate(180deg)" : undefined }}
        />
      </button>
      {expanded ? (
        <div className="border-t px-4 py-4" style={{ borderColor: C.border }}>
          <EnrollmentChecklistItemReadOnlyPanel C={C} item={item} instance={instance} />
        </div>
      ) : null}
    </div>
  );
}

function ChildProfileSidePanelContent({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  application,
  checklist,
  readOnly = false,
  onPhotoUpdated,
  onClose,
}: {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  application: ApplicationDetail;
  checklist: LoadedEnrollmentChecklist | null;
  readOnly?: boolean;
  onPhotoUpdated?: (applicationId: string, profilePhotoUrl: string) => void;
  onClose: () => void;
}) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const hasChecklist = Boolean(checklist && checklist.items.length > 0);
  const [activeTab, setActiveTab] = useState<"application" | "checklist">("application");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    application.profilePhotoUrl,
  );
  const [photoUploading, setPhotoUploading] = useState(false);

  const student = extractStudentFromResponses(application.responses);
  const fullName = student ? `${student.firstName} ${student.lastName}` : "Student";
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

  return (
    <>
      <div
        className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-4 sm:px-6"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
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
            <h2
              className="truncate font-heading text-lg font-bold"
              style={{ color: C.accentDark }}
            >
              {fullName}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={statusStyle}
              >
                {applicationStatusLabel(application.status)}
              </span>
              {student?.grade ? <Pill C={C}>Grade {student.grade}</Pill> : null}
              {birthDate ? (
                <Pill C={C}>
                  Born {birthDate}
                  {age !== null ? ` · Age ${age}` : ""}
                </Pill>
              ) : null}
            </div>
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

      <div
        className="flex flex-shrink-0 overflow-x-auto px-4 sm:px-6"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="-mb-px flex gap-6" role="tablist" aria-label="Child profile sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "application"}
            onClick={() => setActiveTab("application")}
            className="shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors"
            style={{
              borderBottomColor: activeTab === "application" ? C.accent : "transparent",
              color: activeTab === "application" ? C.accent : C.textTertiary,
            }}
          >
            Application
          </button>
          {hasChecklist ? (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "checklist"}
              onClick={() => setActiveTab("checklist")}
              className="shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors"
              style={{
                borderBottomColor: activeTab === "checklist" ? C.accent : "transparent",
                color: activeTab === "checklist" ? C.accent : C.textTertiary,
              }}
            >
              Enrollment checklist
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {activeTab === "application" ? (
          <div
            className="rounded-2xl border bg-white px-5 py-6 sm:px-6"
            style={{ borderColor: C.border, boxShadow: C.shadowCard }}
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

        {activeTab === "checklist" && checklist && progress ? (
          <div className="space-y-4">
            <div
              className="flex items-center justify-between rounded-2xl border bg-white px-5 py-4"
              style={{ borderColor: C.border, boxShadow: C.shadowCard }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {checklist.title}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  {progress.completed}/{progress.total} required steps complete
                </p>
              </div>
              <div
                className="h-2 w-24 overflow-hidden rounded-full sm:w-32"
                style={{ backgroundColor: C.elevated }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: C.accent,
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
                  item={item}
                  instance={instanceByTemplateItemId.get(item.id)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function ChildProfileSidePanel({
  open,
  onClose,
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  application,
  checklist,
  readOnly = false,
  onPhotoUpdated,
}: ChildProfileSidePanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <AnimatePresence>
      {open && application ? (
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
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,40rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: C.surface,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <ChildProfileSidePanelContent
              key={application.id}
              branding={branding}
              schoolName={schoolName}
              schoolSlug={schoolSlug}
              organizationId={organizationId}
              application={application}
              checklist={checklist}
              readOnly={readOnly}
              onPhotoUpdated={onPhotoUpdated}
              onClose={onClose}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
