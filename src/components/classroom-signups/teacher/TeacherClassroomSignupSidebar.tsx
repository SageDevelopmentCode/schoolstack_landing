"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Download, Pencil, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SignupProgressBar from "@/components/classroom-signups/shared/SignupProgressBar";
import ClassroomSignupConfigureForm from "./ClassroomSignupConfigureForm";
import ClassroomSignupNotifyModal from "./ClassroomSignupNotifyModal";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type {
  ClassroomSignup,
  ClassroomSignupDraft,
  ClassroomSignupResponse,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import { SIGNUP_STATUS_LABELS, SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import {
  formatAudienceLabel,
  formatSignupDeadline,
  getRoleFillCount,
  getSignupProgress,
  getSlotFillCount,
  signupToDraft,
} from "@/lib/classroom-signups/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type TeacherClassroomSignupSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  signup: ClassroomSignup | null;
  responses: ClassroomSignupResponse[];
  teacherName: string;
  classroomOptions: TeacherClassroomOption[];
  previewMode?: boolean;
  onClose: () => void;
  onSignupUpdated: (signup: ClassroomSignup) => void;
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

export default function TeacherClassroomSignupSidebar({
  theme,
  open,
  organizationId,
  signup,
  responses,
  teacherName,
  classroomOptions,
  previewMode = false,
  onClose,
  onSignupUpdated,
}: TeacherClassroomSignupSidebarProps) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<ClassroomSignupDraft | null>(() =>
    signup ? signupToDraft(signup) : null,
  );
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const confirmedResponses = useMemo(
    () => responses.filter((response) => response.status === "confirmed"),
    [responses],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving && !closing) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, saving, closing]);

  if (!signup || !draft) return null;

  const progress = getSignupProgress(signup, confirmedResponses);
  const deadline = formatSignupDeadline(signup.responseDeadline);
  const hasConfirmedResponses = confirmedResponses.length > 0;
  const canEdit =
    !previewMode &&
    signup.status !== "closed" &&
    (signup.status === "draft" || signup.status === "open");
  const fieldMode =
    signup.status === "open" && hasConfirmedResponses ? "safe_only" : "full";
  const showActions = !previewMode && signup.status === "open" && !editMode;

  const handleCloseSignup = async () => {
    if (closing) return;
    setClosing(true);
    try {
      const response = await fetch(
        `/api/teacher-portal/classroom-signups/${signup.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, status: "closed" }),
        },
      );
      const payload = (await response.json()) as { signup?: ClassroomSignup };
      if (payload.signup) {
        onSignupUpdated(payload.signup);
        setEditMode(false);
      }
    } finally {
      setClosing(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!draft.title.trim() || saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(
        `/api/teacher-portal/classroom-signups/${signup.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            update: {
              title: draft.title,
              description: draft.description,
              responseDeadline: draft.responseDeadline,
              signupType: draft.signupType,
              audience: draft.audience,
              classroomId: draft.classroomId,
              classroomIds: draft.classroomIds,
              config: draft.config,
              status: publish ? "open" : draft.status,
            },
          }),
        },
      );
      const payload = (await response.json()) as {
        signup?: ClassroomSignup;
        error?: string;
      };
      if (!response.ok || !payload.signup) {
        throw new Error(payload.error ?? "Failed to save signup.");
      }
      onSignupUpdated(payload.signup);
      setDraft(signupToDraft(payload.signup));
      setEditMode(false);
    } catch (error) {
      void reportPortalOperationalError("teacher_portal", {
        organizationId,
        operation: "classroom_signups.save",
        error: "",
      }, error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save signup.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[110]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-testid="teacher-classroom-signup-sidebar"
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="teacher-classroom-signup-sidebar-title"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,36rem)] max-w-full flex-col overflow-hidden border-l"
              style={{
                backgroundColor: theme.white,
                borderColor: theme.line,
                boxShadow: theme.shadowCard,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
                style={{ borderColor: theme.line, backgroundColor: theme.paper }}
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-xs font-medium" style={{ color: theme.muted }}>
                    Classroom signup
                  </p>
                  <h2
                    id="teacher-classroom-signup-sidebar-title"
                    className="mt-1 truncate text-base font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  >
                    {signup.title}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                    {formatAudienceLabel(signup)}
                    {deadline ? ` · Sign up by ${deadline}` : ""}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                    {SIGNUP_TYPE_LABELS[signup.signupType]} ·{" "}
                    {SIGNUP_STATUS_LABELS[signup.status]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {canEdit && !editMode ? (
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-medium"
                      style={{ borderColor: theme.line, color: theme.primary }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="border-0 bg-transparent p-0"
                  >
                    <X className="h-5 w-5" style={{ color: theme.muted }} />
                  </button>
                </div>
              </div>

              {showActions ? (
                <div
                  className="flex shrink-0 flex-wrap gap-2 border-b px-5 py-3"
                  style={{ borderColor: theme.line }}
                >
                  <AdminButton
                    theme={theme}
                    variant="outline"
                    onClick={() => setNotifyOpen(true)}
                  >
                    <Bell className="mr-1.5 h-4 w-4" />
                    Send reminder
                  </AdminButton>
                  <AdminButton
                    theme={theme}
                    variant="outline"
                    disabled={closing}
                    onClick={() => void handleCloseSignup()}
                  >
                    {closing ? "Closing…" : "Close signup"}
                  </AdminButton>
                </div>
              ) : null}

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {editMode ? (
                  <>
                    <ClassroomSignupConfigureForm
                      theme={theme}
                      draft={draft}
                      onDraftChange={(patch) =>
                        setDraft((current) =>
                          current ? { ...current, ...patch } : current,
                        )
                      }
                      classroomOptions={classroomOptions}
                      fieldMode={fieldMode}
                    />
                    {saveError ? (
                      <p className="mt-3 text-sm text-red-600">{saveError}</p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <AdminButton
                        theme={theme}
                        variant="outline"
                        disabled={saving}
                        onClick={() => {
                          setDraft(signupToDraft(signup));
                          setEditMode(false);
                          setSaveError(null);
                        }}
                      >
                        Cancel
                      </AdminButton>
                      {signup.status === "draft" ? (
                        <>
                          <AdminButton
                            theme={theme}
                            variant="outline"
                            disabled={saving || !draft.title.trim()}
                            onClick={() => void handleSave(false)}
                          >
                            {saving ? "Saving…" : "Save draft"}
                          </AdminButton>
                          <AdminButton
                            theme={theme}
                            variant="primary"
                            disabled={
                              saving ||
                              !draft.title.trim() ||
                              draft.classroomIds.length === 0
                            }
                            onClick={() => void handleSave(true)}
                          >
                            {saving ? "Publishing…" : "Publish"}
                          </AdminButton>
                        </>
                      ) : (
                        <AdminButton
                          theme={theme}
                          variant="primary"
                          disabled={saving || !draft.title.trim()}
                          onClick={() => void handleSave(false)}
                        >
                          {saving ? "Saving…" : "Save changes"}
                        </AdminButton>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className="mb-5 text-sm leading-relaxed"
                      style={{ color: "#5D6D73" }}
                    >
                      {signup.description}
                    </p>

                    <ParentCard theme={theme} className="mb-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                          Response progress
                        </p>
                        <p className="text-sm" style={{ color: theme.muted }}>
                          {progress.filled} of {progress.total} families
                        </p>
                      </div>
                      <SignupProgressBar
                        theme={theme}
                        filled={progress.filled}
                        total={progress.total}
                        highlightIncomplete={signup.status === "open"}
                      />
                    </ParentCard>

                    {signup.signupType === "time_slots" ? (
                      <ParentCard theme={theme} className="mb-4">
                        <p className="mb-3 text-xs font-medium" style={{ color: theme.muted }}>
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
                              <span style={{ color: theme.muted }}>
                                {getSlotFillCount(slot.id, confirmedResponses)}/
                                {slot.capacity} filled
                              </span>
                            </div>
                          ))}
                        </div>
                      </ParentCard>
                    ) : null}

                    {signup.signupType === "roles" ? (
                      <ParentCard theme={theme} className="mb-4">
                        <p className="mb-3 text-xs font-medium" style={{ color: theme.muted }}>
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
                              <span style={{ color: theme.muted }}>
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
                          style={{ color: theme.muted }}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export CSV
                        </button>
                      </div>
                      {confirmedResponses.length === 0 ? (
                        <p className="text-sm" style={{ color: theme.muted }}>
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
                              <p
                                className="text-sm font-semibold"
                                style={{ color: theme.ink }}
                              >
                                {response.familyName}
                              </p>
                              <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                                {response.studentName} ·{" "}
                                {formatSelection(signup, response)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ParentCard>
                  </>
                )}
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ClassroomSignupNotifyModal
        signup={signup}
        responses={confirmedResponses}
        teacherName={teacherName}
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
    </>
  );
}
