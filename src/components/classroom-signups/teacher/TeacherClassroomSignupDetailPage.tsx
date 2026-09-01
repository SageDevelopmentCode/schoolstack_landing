"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Download } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import SignupProgressBar from "@/components/classroom-signups/shared/SignupProgressBar";
import {
  SignupStatusChip,
  SignupTypeChip,
} from "@/components/classroom-signups/shared/SignupTypeChip";
import ClassroomSignupNotifyModal from "./ClassroomSignupNotifyModal";
import {
  getMockResponsesForSignup,
  getMockSignupById,
} from "@/lib/classroom-signups/mock-data";
import type { ClassroomSignup } from "@/lib/classroom-signups/types";
import {
  formatAudienceLabel,
  formatSignupDeadline,
  getRoleFillCount,
  getSignupProgress,
  getSlotFillCount,
} from "@/lib/classroom-signups/utils";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";

type TeacherClassroomSignupDetailPageProps = {
  slug: string;
  signupId: string;
  teacherName: string;
  teacherBasePath?: string;
  previewMode?: boolean;
};

function formatSelection(
  signup: ClassroomSignup,
  response: ReturnType<typeof getMockResponsesForSignup>[number],
): string {
  if (signup.signupType === "time_slots") {
    const slots = signup.config.slots ?? [];
    return response.selectedSlotIds
      .map((id) => slots.find((s) => s.id === id)?.label ?? id)
      .join(", ");
  }
  if (signup.signupType === "roles") {
    const roles = signup.config.roles ?? [];
    return response.selectedRoleIds
      .map((id) => roles.find((r) => r.id === id)?.name ?? id)
      .join(", ");
  }
  return response.note ?? "Signed up";
}

export default function TeacherClassroomSignupDetailPage({
  slug,
  signupId,
  teacherName,
  teacherBasePath,
  previewMode = false,
}: TeacherClassroomSignupDetailPageProps) {
  const { theme } = useParentTheme();
  const [signup, setSignup] = useState<ClassroomSignup | undefined>(() =>
    getMockSignupById(signupId),
  );
  const [notifyOpen, setNotifyOpen] = useState(false);

  const responses = useMemo(
    () => getMockResponsesForSignup(signupId),
    [signupId],
  );

  const listHref = teacherBasePath
    ? `${teacherBasePath}/classroom_signups`
    : schoolTeacherPath(slug, "classroom_signups");

  if (!signup) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p style={{ color: theme.ink }}>Signup not found.</p>
        <Link href={listHref} className="mt-4 inline-block text-sm" style={{ color: theme.primary }}>
          Back to signups
        </Link>
      </div>
    );
  }

  const progress = getSignupProgress(signup, responses);
  const deadline = formatSignupDeadline(signup.responseDeadline);

  const handleClose = () => {
    setSignup((current) =>
      current
        ? {
            ...current,
            status: "closed",
            closedAt: new Date().toISOString(),
          }
        : current,
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href={listHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: theme.primary }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to signups
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SignupTypeChip theme={theme} type={signup.signupType} />
            <SignupStatusChip theme={theme} status={signup.status} />
            {deadline ? (
              <ParentDatePill theme={theme} label={`Due ${deadline}`} />
            ) : null}
          </div>
          <ParentDisplayHeading theme={theme}>{signup.title}</ParentDisplayHeading>
          <p className="mt-1 text-sm" style={{ color: "#76828A" }}>
            {formatAudienceLabel(signup)}
          </p>
        </div>
        {!previewMode && signup.status !== "closed" ? (
          <div className="flex flex-wrap gap-2">
            <AdminButton
              theme={theme}
              variant="soft"
              onClick={() => setNotifyOpen(true)}
            >
              <Bell className="mr-1.5 h-4 w-4" />
              Send reminder
            </AdminButton>
            <AdminButton theme={theme} variant="outline" onClick={handleClose}>
              Close signup
            </AdminButton>
            <AdminButton theme={theme} variant="outline" disabled>
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </AdminButton>
          </div>
        ) : null}
      </div>

      <ParentCard theme={theme} className="mb-6">
        <p className="text-sm leading-relaxed" style={{ color: "#5D6D73" }}>
          {signup.description}
        </p>
        <div className="mt-4">
          <SignupProgressBar
            theme={theme}
            filled={progress.filled}
            total={progress.total}
            label={progress.label}
            highlightIncomplete={signup.status === "open"}
          />
        </div>
      </ParentCard>

      {(signup.signupType === "time_slots" || signup.signupType === "roles") && (
        <ParentCard theme={theme} className="mb-6">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: theme.ink }}>
            {signup.signupType === "time_slots" ? "Slots" : "Roles"}
          </h3>
          <div className="space-y-2">
            {signup.signupType === "time_slots"
              ? (signup.config.slots ?? []).map((slot) => {
                  const filled = getSlotFillCount(slot.id, responses);
                  const needsAttention =
                    signup.status === "open" && filled < slot.capacity;
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-[10px] border px-3 py-2 text-sm"
                      style={{
                        borderColor: needsAttention ? "#E8C468" : "#E7EBE2",
                        backgroundColor: needsAttention ? "#FFF9E8" : "transparent",
                      }}
                    >
                      <span style={{ color: theme.ink }}>{slot.label}</span>
                      <span style={{ color: "#76828A" }}>
                        {filled}/{slot.capacity} filled
                      </span>
                    </div>
                  );
                })
              : (signup.config.roles ?? []).map((role) => {
                  const filled = getRoleFillCount(role.id, responses);
                  const needsAttention =
                    signup.status === "open" && filled < role.quantityNeeded;
                  return (
                    <div
                      key={role.id}
                      className="flex items-center justify-between rounded-[10px] border px-3 py-2 text-sm"
                      style={{
                        borderColor: needsAttention ? "#E8C468" : "#E7EBE2",
                        backgroundColor: needsAttention ? "#FFF9E8" : "transparent",
                      }}
                    >
                      <span style={{ color: theme.ink }}>{role.name}</span>
                      <span style={{ color: "#76828A" }}>
                        {filled}/{role.quantityNeeded} filled
                      </span>
                    </div>
                  );
                })}
          </div>
        </ParentCard>
      )}

      <ParentCard theme={theme}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: theme.ink }}>
          Responses ({responses.filter((r) => r.status === "confirmed").length})
        </h3>
        {responses.length === 0 ? (
          <p className="text-sm" style={{ color: "#76828A" }}>
            No responses yet. Send a notification to invite families to sign up.
          </p>
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr
                  className="border-b text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ borderColor: "#E7EBE2", color: "#76828A" }}
                >
                  <th className="px-6 py-3">Family</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Selection</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-6 py-3">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr
                    key={response.id}
                    className="border-b"
                    style={{ borderColor: "#F0F2EE" }}
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium" style={{ color: theme.ink }}>
                        {response.familyName}
                      </p>
                      <p className="text-xs" style={{ color: "#76828A" }}>
                        {response.guardianName}
                      </p>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#5D6D73" }}>
                      {response.studentName}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#5D6D73" }}>
                      {formatSelection(signup, response)}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#76828A" }}>
                      {response.note ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-xs" style={{ color: "#76828A" }}>
                      {new Date(response.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ParentCard>

      <ClassroomSignupNotifyModal
        signup={signup}
        responses={responses}
        teacherName={teacherName}
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
    </div>
  );
}
