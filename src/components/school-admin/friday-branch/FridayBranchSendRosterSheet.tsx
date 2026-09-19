"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import FridayBranchRosterEmailPreviewDialog from "@/components/school-admin/friday-branch/FridayBranchRosterEmailPreviewDialog";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MAX_ROSTER_RECIPIENTS } from "@/lib/friday-branch/friday-branch-roster-constants";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import { normalizeNotificationEmails } from "@/lib/notifications/org-notification-settings";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  FRIDAY_BRANCH_FIELD_INPUT_CLASS,
  fridayBranchFieldInputStyle,
} from "@/lib/school-admin/friday-branch/friday-branch-form-options";

type FridayBranchSendRosterSheetProps = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  classId: string | null;
  className: string;
  slotTime: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

type RosterEmailPreview = {
  subject: string;
  html: string;
};

export default function FridayBranchSendRosterSheet({
  open,
  onClose,
  organizationId,
  classId,
  className,
  slotTime,
  theme,
  C,
}: FridayBranchSendRosterSheetProps) {
  const [emailDraft, setEmailDraft] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RosterEmailPreview | null>(null);

  useEffect(() => {
    if (!open) {
      setPreviewDialogOpen(false);
      setPreviewLoading(false);
      setPreviewError(null);
      setPreview(null);
      return;
    }

    setEmailDraft("");
    setRecipients([]);
    setEmailError(null);
    setSending(false);
    setPreviewDialogOpen(false);
    setPreviewLoading(false);
    setPreviewError(null);
    setPreview(null);
  }, [open, classId]);

  const fieldInputStyle = fridayBranchFieldInputStyle(theme, C);

  const loadPreview = useCallback(async () => {
    if (!classId) return;

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const response = await fetch(
        `/api/school-admin/friday-branch/classes/${encodeURIComponent(classId)}/roster-email-preview?organizationId=${encodeURIComponent(organizationId)}`,
      );

      const payload = (await response.json().catch(() => null)) as
        | RosterEmailPreview
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload && "error" in payload ? payload.error : "Failed to load preview.");
      }

      setPreview(payload as RosterEmailPreview);
    } catch (err) {
      const message = formatActionError(err, "Failed to load roster email preview.");
      setPreviewError(message);
      void reportClientOperationalError({
        organizationId,
        operation: "friday_branch.class.roster.preview",
        error: message,
      });
    } finally {
      setPreviewLoading(false);
    }
  }, [classId, organizationId]);

  const handleOpenPreview = () => {
    setPreviewDialogOpen(true);
    setPreview(null);
    setPreviewError(null);
    void loadPreview();
  };

  const handleAddEmail = () => {
    const nextEmails = normalizeNotificationEmails([
      ...recipients,
      emailDraft.trim(),
    ]);

    if (nextEmails.length === recipients.length) {
      setEmailError("Enter a valid email address.");
      return;
    }

    if (nextEmails.length > MAX_ROSTER_RECIPIENTS) {
      setEmailError(`You can add up to ${MAX_ROSTER_RECIPIENTS} email addresses.`);
      return;
    }

    setRecipients(nextEmails);
    setEmailDraft("");
    setEmailError(null);
  };

  const handleRemoveEmail = (email: string) => {
    setRecipients((current) => current.filter((entry) => entry !== email));
    setEmailError(null);
  };

  const handleSend = async () => {
    if (!classId || recipients.length === 0) return;

    setSending(true);
    try {
      const response = await fetch(
        `/api/school-admin/friday-branch/classes/${encodeURIComponent(classId)}/send-roster`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            emails: recipients,
          }),
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; sentCount?: number }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to send roster.");
      }

      const sentCount = payload?.sentCount ?? recipients.length;
      adminToast.success(
        sentCount === 1
          ? "Roster sent to 1 recipient"
          : `Roster sent to ${sentCount} recipients`,
      );
      onClose();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to send roster."));
      void reportClientOperationalError({
        organizationId,
        operation: "friday_branch.class.roster.send",
        error: formatActionError(err, "Failed to send roster."),
      });
    } finally {
      setSending(false);
    }
  };

  const subtitle = [className, slotTime].filter(Boolean).join(" · ");

  return (
    <>
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Send roster"
      subtitle={subtitle || undefined}
      C={C}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <AdminButton
            theme={theme}
            variant="soft"
            type="button"
            onClick={handleOpenPreview}
            disabled={sending || !classId}
          >
            Preview email
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            type="button"
            onClick={handleSend}
            disabled={sending || recipients.length === 0 || !classId}
          >
            {sending ? "Sending…" : "Send roster"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4" style={{ fontFamily: theme.fontBody }}>
        <p className="text-xs" style={{ color: C.textTertiary }}>
          Email the current class roster with student names, families, grades, sign-up
          status, and family contact info.
        </p>

        {recipients.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {recipients.map((email) => (
              <li key={email}>
                <AdminChip theme={theme} tone="info">
                  <span className="inline-flex items-center gap-1.5">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="border-0 bg-transparent p-0"
                      aria-label={`Remove ${email}`}
                      disabled={sending}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </AdminChip>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] font-medium" style={{ color: "#A26B22" }}>
            Add at least one recipient email.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            type="email"
            value={emailDraft}
            onChange={(event) => {
              setEmailDraft(event.target.value);
              if (emailError) setEmailError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddEmail();
              }
            }}
            placeholder="teacher@school.com"
            disabled={sending || recipients.length >= MAX_ROSTER_RECIPIENTS}
            className={`${FRIDAY_BRANCH_FIELD_INPUT_CLASS} sm:flex-1`}
            style={fieldInputStyle}
            aria-label="Recipient email"
          />
          <AdminButton
            theme={theme}
            variant="soft"
            type="button"
            onClick={handleAddEmail}
            disabled={
              sending ||
              !emailDraft.trim() ||
              recipients.length >= MAX_ROSTER_RECIPIENTS
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add email
          </AdminButton>
        </div>

        {emailError ? (
          <p className="text-xs font-medium" style={{ color: theme.alert }}>
            {emailError}
          </p>
        ) : null}

        <p className="text-[11px]" style={{ color: C.textTertiary }}>
          Up to {MAX_ROSTER_RECIPIENTS} recipients per send.
        </p>
      </div>
    </SchoolAdminSlideOverShell>

    <FridayBranchRosterEmailPreviewDialog
      open={previewDialogOpen}
      onClose={() => setPreviewDialogOpen(false)}
      C={C}
      theme={theme}
      className={className}
      slotTime={slotTime}
      loading={previewLoading}
      error={previewError}
      subject={preview?.subject ?? null}
      html={preview?.html ?? null}
    />
    </>
  );
}
