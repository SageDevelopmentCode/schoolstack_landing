"use client";

import { useMemo, useState } from "react";
import { BellRing, CalendarClock, Download, Lock, Pencil, Send } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { GChip, GKicker, GProgress, gBtnOutlineSm, gBtnPopSm, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenNotice, gBtnDangerSm } from "@/components/school-admin/garden/kit";
import { GardenAvatar } from "@/components/school-admin/garden/blocks";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import ClassroomSignupConfigureForm from "./ClassroomSignupConfigureForm";
import { describeSignupSelection } from "@/lib/classroom-signups/export-responses-csv";
import { updateTeacherSignup } from "@/lib/classroom-signups/teacher-signups-client";
import type {
  ClassroomSignup,
  ClassroomSignupDraft,
  ClassroomSignupResponse,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import { SIGNUP_STATUS_LABELS, SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import {
  countUnrespondedFamilies,
  formatAudienceLabel,
  formatSignupDeadline,
  getRoleFillCount,
  getSignupProgress,
  getSlotFillCount,
  signupToDraft,
} from "@/lib/classroom-signups/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

export const SIGNUP_STATUS_TONES: Record<ClassroomSignup["status"], GChipTone> = {
  draft: "warning",
  open: "success",
  closed: "neutral",
};

type TeacherClassroomSignupSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  signup: ClassroomSignup | null;
  responses: ClassroomSignupResponse[];
  teacherName: string;
  classroomOptions: TeacherClassroomOption[];
  previewMode?: boolean;
  closing?: boolean;
  onClose: () => void;
  onSignupUpdated: (signup: ClassroomSignup) => void;
  onRequestCloseSignup: (signup: ClassroomSignup) => void;
  onSendReminder: (signup: ClassroomSignup) => void;
  onExportCsv: (signup: ClassroomSignup) => void;
};

const PREVIEW_REASON = "Editing is off in preview";

/**
 * Signup drawer (Garden `GSidePanel`): progress, slot/role fill, responses
 * with faces, and the actions — Send reminder, Edit, Close signup (asks
 * first), Export CSV. Editing happens in place with Save / Publish; leaving
 * with unsaved edits asks first. Escape is ignored while saving.
 */
export default function TeacherClassroomSignupSidebar({
  theme,
  open,
  organizationId,
  signup,
  responses,

  classroomOptions,
  previewMode = false,
  closing = false,
  onClose,
  onSignupUpdated,
  onRequestCloseSignup,
  onSendReminder,
  onExportCsv,
}: TeacherClassroomSignupSidebarProps) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<ClassroomSignupDraft | null>(() => (signup ? signupToDraft(signup) : null));
  const [saving, setSaving] = useState<null | "save" | "publish">(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  const confirmedResponses = useMemo(() => responses.filter((r) => r.status === "confirmed"), [responses]);

  if (!signup || !draft) return null;

  const progress = getSignupProgress(signup, confirmedResponses);
  const deadline = formatSignupDeadline(signup.responseDeadline);
  const pastDue = signup.responseDeadline != null && new Date(signup.responseDeadline) < new Date();
  const hasConfirmedResponses = confirmedResponses.length > 0;
  const fieldMode = signup.status === "open" && hasConfirmedResponses ? "safe_only" : "full";
  const unresponded = countUnrespondedFamilies(signup, confirmedResponses);
  const dirty = editMode && JSON.stringify(draft) !== JSON.stringify(signupToDraft(signup));
  const busy = saving !== null || closing;

  const requestClosePanel = () => {
    if (busy) return;
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  };

  const cancelEdit = () => {
    setDraft(signupToDraft(signup));
    setEditMode(false);
    setSaveError(null);
  };

  const save = async function save(publish: boolean) {
    if (!draft.title.trim() || saving) return;
    setSaving(publish ? "publish" : "save");
    setSaveError(null);
    const errorId = `signup-save-${signup.id}-error`;
    try {
      const next = await updateTeacherSignup(organizationId, signup.id, draft, publish ? "open" : draft.status);
      onSignupUpdated(next);
      setDraft(signupToDraft(next));
      setEditMode(false);
      adminToast.dismiss(errorId);
      adminToast.success(
        publish ? `“${next.title}” is open.` : signup.status === "draft" ? "Draft saved." : "Changes saved.",
        {
          id: `signup-save-${signup.id}`,
          description: publish
            ? `${next.familyCount} ${next.familyCount === 1 ? "family" : "families"} can sign up from the parent portal now.`
            : signup.status === "draft"
              ? "Families can't see it until you publish."
              : "Families see the update right away.",
        },
      );
    } catch (error) {
      void reportPortalOperationalError(
        "teacher_portal",
        { organizationId, operation: "classroom_signups.save", error: "" },
        error,
      );
      const message = formatActionError(error, "Failed to save signup.");
      setSaveError(message);
      adminToast.error(publish ? "Couldn't publish the signup." : "Couldn't save your changes.", {
        id: errorId,
        description: `${message} Your edits are still here.`,
        action: { label: "Retry", onClick: () => void save(publish) },
      });
    } finally {
      setSaving(null);
    }
  };

  const disabledTitle = previewMode ? PREVIEW_REASON : undefined;

  const headerActions = editMode ? null : signup.status === "open" ? (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={gBtnPopSm}
        onClick={() => onSendReminder(signup)}
        disabled={previewMode || unresponded === 0}
        title={previewMode ? "Reminders are off in preview" : unresponded === 0 ? "Every family has already signed up" : undefined}
        data-testid="teacher-classroom-signup-remind"
      >
        <BellRing className="h-4 w-4" aria-hidden />
        Send reminder
      </button>
      <button type="button" className={gBtnOutlineSm} onClick={() => setEditMode(true)} disabled={previewMode} title={disabledTitle}>
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Edit
      </button>
      <button
        type="button"
        className={gBtnDangerSm}
        onClick={() => onRequestCloseSignup(signup)}
        disabled={previewMode || closing}
        title={disabledTitle}
        aria-busy={closing || undefined}
      >
        <BusyLabel busy={closing} busyLabel="Closing…" icon={<Lock className="h-3.5 w-3.5" aria-hidden />}>
          Close signup
        </BusyLabel>
      </button>
    </div>
  ) : signup.status === "draft" ? (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={gBtnPopSm} onClick={() => setEditMode(true)} disabled={previewMode} title={disabledTitle}>
        <Pencil className="h-4 w-4" aria-hidden />
        Finish & publish
      </button>
    </div>
  ) : null;

  const footer = editMode ? (
    <>
      <button type="button" className={gBtnOutlineSm} onClick={cancelEdit} disabled={saving !== null}>
        Cancel
      </button>
      {signup.status === "draft" ? (
        <>
          <button
            type="button"
            className={gBtnOutlineSm}
            disabled={saving !== null || !draft.title.trim()}
            onClick={() => void save(false)}
          >
            <BusyLabel busy={saving === "save"} busyLabel="Saving…">
              Save draft
            </BusyLabel>
          </button>
          <button
            type="button"
            className={`${gBtnPopSm} ml-auto`}
            disabled={saving !== null || !draft.title.trim() || draft.classroomIds.length === 0}
            title={draft.classroomIds.length === 0 ? "Pick at least one classroom first" : undefined}
            onClick={() => void save(true)}
          >
            <BusyLabel busy={saving === "publish"} busyLabel="Publishing…" icon={<Send className="h-4 w-4" aria-hidden />}>
              Publish to families
            </BusyLabel>
          </button>
        </>
      ) : (
        <button
          type="button"
          className={`${gBtnPopSm} ml-auto`}
          disabled={saving !== null || !draft.title.trim() || !dirty}
          title={!dirty ? "Nothing has changed yet" : undefined}
          onClick={() => void save(false)}
        >
          <BusyLabel busy={saving === "save"} busyLabel="Saving…">
            Save changes
          </BusyLabel>
        </button>
      )}
    </>
  ) : undefined;

  return (
    <AdminGardenSkin theme={theme}>
      <GSidePanel
        theme={theme}
        open={open}
        onClose={requestClosePanel}
        size="xl"
        kicker={editMode ? (signup.status === "draft" ? "Finish your draft" : "Edit signup") : "Classroom signup"}
        title={signup.title}
        subtitle={`${formatAudienceLabel(signup)}${deadline ? ` · Sign up by ${deadline}` : ""}`}
        testId="teacher-classroom-signup-sidebar"
        panelId="teacher-classroom-signup-sidebar"
        closeLabel="Close signup details"
        headerAside={
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <GChip tone={SIGNUP_STATUS_TONES[signup.status]}>{SIGNUP_STATUS_LABELS[signup.status]}</GChip>
              <GChip tone="info">{SIGNUP_TYPE_LABELS[signup.signupType]}</GChip>
              {signup.status === "open" && pastDue ? <GChip tone="alert">Past the deadline</GChip> : null}
            </div>
            {headerActions}
          </div>
        }
        footer={footer}
      >
        <div className="sf-admin-garden-skin flex flex-col gap-4">
          {editMode ? (
            <>
              {fieldMode === "safe_only" ? (
                <GardenNotice tone="info" role="status" title="Some settings are locked">
                  Families have already signed up, so you can change the wording and deadline but not the slots,
                  roles or audience.
                </GardenNotice>
              ) : null}
              <ClassroomSignupConfigureForm
                theme={theme}
                draft={draft}
                onDraftChange={(patch) => setDraft((current) => (current ? { ...current, ...patch } : current))}
                classroomOptions={classroomOptions}
                fieldMode={fieldMode}
              />
              {saveError ? (
                <GardenNotice tone="alert" role="alert" title="Not saved yet">
                  {saveError}
                </GardenNotice>
              ) : null}
            </>
          ) : (
            <>
              {signup.status === "draft" ? (
                <GardenNotice tone="warning" role="status" title="This is a draft">
                  Families can&apos;t see it yet. Finish the details and publish when you&apos;re ready.
                </GardenNotice>
              ) : signup.status === "closed" ? (
                <GardenNotice tone="info" icon={Lock} role="status" title="Closed">
                  Families can no longer sign up. Responses are kept below.
                </GardenNotice>
              ) : null}

              {signup.description ? (
                <p className="m-0 text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">{signup.description}</p>
              ) : null}

              <section className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4">
                <div className="mb-2.5 flex items-baseline justify-between gap-3">
                  <GKicker>Response progress</GKicker>
                  <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/75">{progress.label}</span>
                </div>
                <GProgress
                  value={progress.filled}
                  total={Math.max(progress.total, 1)}
                  label={progress.label}
                  done={progress.isComplete}
                />
                {signup.status === "open" ? (
                  <p className="m-0 mt-2.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                    {unresponded > 0
                      ? `${unresponded} ${unresponded === 1 ? "family hasn't" : "families haven't"} signed up yet.`
                      : "Every family has signed up."}
                  </p>
                ) : null}
              </section>

              {signup.signupType === "time_slots" && (signup.config.slots ?? []).length > 0 ? (
                <FillList
                  title="Time slots"
                  rows={(signup.config.slots ?? []).map((slot) => ({
                    id: slot.id,
                    label: slot.label || "Untitled slot",
                    filled: getSlotFillCount(slot.id, confirmedResponses),
                    total: slot.capacity,
                  }))}
                />
              ) : null}

              {signup.signupType === "roles" && (signup.config.roles ?? []).length > 0 ? (
                <FillList
                  title="Roles"
                  rows={(signup.config.roles ?? []).map((role) => ({
                    id: role.id,
                    label: role.name || "Untitled role",
                    filled: getRoleFillCount(role.id, confirmedResponses),
                    total: role.quantityNeeded,
                  }))}
                />
              ) : null}

              <section className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <GKicker>Responses · {confirmedResponses.length}</GKicker>
                  <button
                    type="button"
                    className={gLinkSm}
                    onClick={() => onExportCsv(signup)}
                    disabled={confirmedResponses.length === 0}
                    title={confirmedResponses.length === 0 ? "No responses to export yet" : undefined}
                    data-testid="teacher-classroom-signup-export"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    Export CSV
                  </button>
                </div>
                {confirmedResponses.length === 0 ? (
                  <p className="m-0 rounded-[14px] bg-[var(--sf-paper)] p-3.5 text-[13.5px] font-semibold text-[var(--sf-soft)]">
                    {signup.status === "draft"
                      ? "Responses will show here once you publish."
                      : "No responses yet. A reminder often helps."}
                  </p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {confirmedResponses.map((response) => (
                      <li
                        key={response.id}
                        className="flex items-start gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/[0.08] px-3 py-2.5"
                      >
                        <GardenAvatar name={response.familyName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">{response.familyName}</p>
                          <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                            {response.studentName} · {describeSignupSelection(signup, response)}
                          </p>
                          {response.note ? (
                            <p className="m-0 mt-1 rounded-[10px] bg-[var(--sf-paper)] px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--sf-ink)]/80">
                              “{response.note}”
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </GSidePanel>

      <GConfirmDialog
        theme={theme}
        open={discardOpen}
        title="Discard your changes?"
        description="Your edits to this signup haven't been saved."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          setDiscardOpen(false);
          cancelEdit();
          onClose();
        }}
        onClose={() => setDiscardOpen(false)}
      />
    </AdminGardenSkin>
  );
}

function FillList({ title, rows }: { title: string; rows: { id: string; label: string; filled: number; total: number }[] }) {
  return (
    <section className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4">
      <GKicker className="mb-3 block">{title}</GKicker>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {rows.map((row) => {
          const full = row.total > 0 && row.filled >= row.total;
          return (
            <li key={row.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[13.5px] font-extrabold text-[var(--sf-ink)]">{row.label}</span>
                <span className={`shrink-0 text-[12.5px] font-extrabold tabular-nums ${full ? "text-[var(--sf-forest)]" : "text-[var(--sf-ink)]/70"}`}>
                  {row.filled}/{row.total} {full ? "· full" : "filled"}
                </span>
              </div>
              <GProgress value={row.filled} total={Math.max(row.total, 1)} label={`${row.label}: ${row.filled} of ${row.total} filled`} done={full} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
