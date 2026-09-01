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
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
} from "@/lib/classroom-signups/types";
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
  organizationId: string;
  signupId: string;
  teacherName: string;
  initialSignup: ClassroomSignup | null;
  initialResponses: ClassroomSignupResponse[];
  teacherBasePath?: string;
  previewMode?: boolean;
};

function formatSelection(
  signup: ClassroomSignup,
  response: ClassroomSignupResponse,
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
  organizationId,
  signupId,
  teacherName,
  initialSignup,
  initialResponses,
  teacherBasePath,
  previewMode = false,
}: TeacherClassroomSignupDetailPageProps) {
  const { theme } = useParentTheme();
  const [signup, setSignup] = useState<ClassroomSignup | null>(initialSignup);
  const [responses, setResponses] =
    useState<ClassroomSignupResponse[]>(initialResponses);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const listHref = teacherBasePath
    ? `${teacherBasePath}/classroom_signups`
    : schoolTeacherPath(slug, "classroom_signups");

  const confirmedResponses = useMemo(
    () => responses.filter((response) => response.status === "confirmed"),
    [responses],
  );

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

  const progress = getSignupProgress(signup, confirmedResponses);
  const deadline = formatSignupDeadline(signup.responseDeadline);

  const handleClose = async () => {
    if (previewMode || closing) return;
    setClosing(true);
    try {
      const response = await fetch(
        `/api/teacher-portal/classroom-signups/${signupId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, status: "closed" }),
        },
      );
      const payload = (await response.json()) as { signup?: ClassroomSignup };
      if (payload.signup) {
        setSignup(payload.signup);
      }
    } finally {
      setClosing(false);
    }
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
          </div>
          <ParentDisplayHeading theme={theme}>{signup.title}</ParentDisplayHeading>
          <p className="mt-2 text-sm" style={{ color: "#76828A" }}>
            {formatAudienceLabel(signup)}
            {deadline ? ` · Sign up by ${deadline}` : ""}
          </p>
        </div>
        {!previewMode && signup.status === "open" ? (
          <div className="flex flex-wrap gap-2">
            <AdminButton theme={theme} variant="outline" onClick={() => setNotifyOpen(true)}>
              <Bell className="mr-1.5 h-4 w-4" />
              Send reminder
            </AdminButton>
            <AdminButton
              theme={theme}
              variant="outline"
              disabled={closing}
              onClick={() => void handleClose()}
            >
              {closing ? "Closing…" : "Close signup"}
            </AdminButton>
          </div>
        ) : null}
      </div>

      <ParentCard theme={theme} className="mb-6">
        <p className="text-sm leading-relaxed" style={{ color: "#5D6D73" }}>
          {signup.description}
        </p>
        {deadline ? (
          <div className="mt-4">
            <ParentDatePill theme={theme} label={`Deadline: ${deadline}`} />
          </div>
        ) : null}
      </ParentCard>

      <ParentCard theme={theme} className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={{ color: theme.ink }}>
            Response progress
          </p>
          <p className="text-sm" style={{ color: "#76828A" }}>
            {progress.filled} of {progress.total} families
          </p>
        </div>
        <SignupProgressBar
          theme={theme}
          filled={progress.filled}
          total={progress.total}
        />
      </ParentCard>

      {signup.signupType === "time_slots" ? (
        <ParentCard theme={theme} className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#76828A]">
            Time slots
          </p>
          <div className="space-y-2">
            {(signup.config.slots ?? []).map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-[10px] border px-3 py-2 text-sm"
                style={{ borderColor: "#E7EBE2" }}
              >
                <span style={{ color: theme.ink }}>{slot.label}</span>
                <span style={{ color: "#76828A" }}>
                  {getSlotFillCount(slot.id, confirmedResponses)}/
                  {slot.capacity} filled
                </span>
              </div>
            ))}
          </div>
        </ParentCard>
      ) : null}

      {signup.signupType === "roles" ? (
        <ParentCard theme={theme} className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#76828A]">
            Roles
          </p>
          <div className="space-y-2">
            {(signup.config.roles ?? []).map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-[10px] border px-3 py-2 text-sm"
                style={{ borderColor: "#E7EBE2" }}
              >
                <span style={{ color: theme.ink }}>{role.name}</span>
                <span style={{ color: "#76828A" }}>
                  {getRoleFillCount(role.id, confirmedResponses)}/
                  {role.quantityNeeded} filled
                </span>
              </div>
            ))}
          </div>
        </ParentCard>
      ) : null}

      <ParentCard theme={theme}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={{ color: theme.ink }}>
            Responses ({confirmedResponses.length})
          </p>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 text-xs font-medium opacity-50"
            style={{ color: "#76828A" }}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
        {confirmedResponses.length === 0 ? (
          <p className="text-sm" style={{ color: "#76828A" }}>
            No responses yet.
          </p>
        ) : (
          <div className="space-y-3">
            {confirmedResponses.map((response) => (
              <div
                key={response.id}
                className="rounded-[12px] border p-3"
                style={{ borderColor: "#E7EBE2" }}
              >
                <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                  {response.familyName}
                </p>
                <p className="mt-1 text-xs" style={{ color: "#76828A" }}>
                  {response.studentName} · {formatSelection(signup, response)}
                </p>
              </div>
            ))}
          </div>
        )}
      </ParentCard>

      <ClassroomSignupNotifyModal
        signup={signup}
        responses={confirmedResponses}
        teacherName={teacherName}
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
    </div>
  );
}
