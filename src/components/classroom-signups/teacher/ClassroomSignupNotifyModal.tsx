"use client";

import { useId, useState } from "react";
import { BellRing, Clock, Mail, Smartphone, UsersRound } from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenNotice, gInputClass } from "@/components/school-admin/garden/kit";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { ClassroomSignup, ClassroomSignupResponse } from "@/lib/classroom-signups/types";
import { SIGNUP_REMINDER_MAX_MESSAGE_LENGTH } from "@/lib/classroom-signups/signup-reminder-rules";
import { countUnrespondedFamilies, formatSignupDeadline } from "@/lib/classroom-signups/utils";
import type { ReminderOutcome } from "./useTeacherClassroomSignupsModel";

type ClassroomSignupNotifyModalProps = {
  signup: ClassroomSignup;
  /** Confirmed responses (families who already signed up are skipped). */
  responses: ClassroomSignupResponse[];
  teacherName: string;
  open: boolean;
  sending: boolean;
  previewMode?: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<ReminderOutcome>;
};

export function defaultReminderMessage(signup: ClassroomSignup, teacherName: string): string {
  const upcoming = signup.responseDeadline != null && new Date(signup.responseDeadline) >= new Date();
  const deadline = upcoming ? formatSignupDeadline(signup.responseDeadline) : null;
  return `${teacherName} needs help with "${signup.title}".${deadline ? ` Please sign up by ${deadline}.` : ""}`;
}

/**
 * Send a reminder (Garden dialog): who it goes to, an editable message, and
 * a real send — email + phone notification to families in the signup's
 * audience who haven't signed up yet. One reminder per hour per signup.
 */
export default function ClassroomSignupNotifyModal(props: ClassroomSignupNotifyModalProps) {
  // Remount per signup so the message starts fresh.
  return props.open ? <ReminderDialog key={props.signup.id} {...props} /> : null;
}

function ReminderDialog({
  signup,
  responses,
  teacherName,
  open,
  sending,
  previewMode = false,
  onClose,
  onSend,
}: ClassroomSignupNotifyModalProps) {
  const { theme } = useParentTheme();
  const fieldId = useId();
  const unresponded = countUnrespondedFamilies(signup, responses);
  const [message, setMessage] = useState(() => defaultReminderMessage(signup, teacherName));
  const [cooldown, setCooldown] = useState<string | null>(null);
  const trimmed = message.trim();
  const tooLong = trimmed.length > SIGNUP_REMINDER_MAX_MESSAGE_LENGTH;
  const blockedReason = previewMode
    ? "Reminders are off in preview."
    : unresponded === 0
      ? "Every family has already signed up."
      : !trimmed
        ? "Write a short message first."
        : tooLong
          ? "The message is too long."
          : cooldown
            ? "Wait for the next reminder window."
            : null;

  const send = async () => {
    if (blockedReason || sending) return;
    const outcome = await onSend(trimmed);
    if (!outcome.ok && outcome.cooldown) setCooldown(outcome.cooldown);
  };

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={onClose}
      closeDisabled={sending}
      size="md"
      icon={<BellRing />}
      title="Send a reminder"
      description={`For “${signup.title}”`}
      data-testid="teacher-classroom-signup-reminder"
      footer={
        <>
          <button type="button" className={gBtnOutlineSm} onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            type="button"
            className={gBtnPopSm}
            onClick={() => void send()}
            disabled={Boolean(blockedReason) || sending}
            title={blockedReason ?? undefined}
            aria-busy={sending || undefined}
            data-testid="teacher-classroom-signup-reminder-send"
          >
            <BusyLabel busy={sending} busyLabel="Sending…">
              {unresponded > 0 ? `Send to ${unresponded} ${unresponded === 1 ? "family" : "families"}` : "Send reminder"}
            </BusyLabel>
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-4 py-3">
          <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
          <div className="min-w-0 text-[13.5px] font-semibold leading-snug text-[var(--sf-ink)]/85">
            {unresponded > 0 ? (
              <>
                Goes to <strong>{unresponded}</strong> {unresponded === 1 ? "family" : "families"}{" "}
                who haven&apos;t signed up yet. Families who already signed up won&apos;t hear from you again.
              </>
            ) : (
              <>Every family in this signup has already responded, so there&apos;s nobody to remind.</>
            )}
            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--sf-soft)]">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" aria-hidden /> Email with a sign-up link
              </span>
              <span className="inline-flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5" aria-hidden /> Phone notification for app users
              </span>
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor={fieldId} className="text-[13px] font-extrabold text-[var(--sf-ink)]">
              Message
            </label>
            <span
              className={`text-[12px] font-bold tabular-nums ${tooLong ? "text-[#9a3422]" : "text-[var(--sf-soft)]"}`}
              aria-live="polite"
            >
              {trimmed.length}/{SIGNUP_REMINDER_MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <textarea
            id={fieldId}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            disabled={sending}
            className={gInputClass(tooLong || (!trimmed && message.length > 0) ? "invalid" : null, "resize-y")}
          />
          <p className="m-0 mt-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
            Families see this message with the signup title and a button to sign up.
          </p>
        </div>

        {cooldown ? (
          <GardenNotice tone="warning" icon={Clock} role="status" title="A reminder just went out">
            {cooldown}
          </GardenNotice>
        ) : null}
      </div>
    </GDialog>
  );
}
