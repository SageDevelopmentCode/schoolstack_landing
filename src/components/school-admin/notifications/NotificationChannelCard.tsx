"use client";

import { useState, type CSSProperties } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  MAX_NOTIFY_EMAILS,
  normalizeNotificationEmails,
  type NotificationChannelSettings,
  type RecipientSummary,
} from "@/lib/notifications/org-notification-settings";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

function inputStyle(C: AdminThemeTokens): CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

type SettingToggleRowProps = {
  C: AdminThemeTokens;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  showDivider?: boolean;
};

function SettingToggleRow({
  C,
  label,
  checked,
  disabled,
  onChange,
  description,
  showDivider = false,
}: SettingToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={description ? `${label}. ${description}` : label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full min-h-[44px] items-center justify-between gap-4 px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={
        showDivider ? { borderBottom: `1px solid ${C.border}` } : undefined
      }
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
            {description}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? C.accent : C.border }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}

type NotificationChannelCardProps = {
  C: AdminThemeTokens;
  title: string;
  description: string;
  toggleLabel: string;
  channel: NotificationChannelSettings;
  recipients: RecipientSummary;
  saving: boolean;
  onToggle: (enabled: boolean) => void;
  onToggleIncludeOrgAdmins: (include: boolean) => void;
  onAddEmail: (email: string) => void;
  onRemoveEmail: (email: string) => void;
  showTitle?: boolean;
};

type RecipientRowProps = {
  C: AdminThemeTokens;
  roleLabel: string;
  email: string;
  saving: boolean;
  showDivider: boolean;
  onRemove?: () => void;
};

function RecipientRow({
  C,
  roleLabel,
  email,
  saving,
  showDivider,
  onRemove,
}: RecipientRowProps) {
  return (
    <li
      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
      style={
        showDivider ? { borderBottom: `1px solid ${C.border}` } : undefined
      }
    >
      <span className="min-w-0 truncate" style={{ color: C.textPrimary }}>
        <span style={{ color: C.textTertiary }}>{roleLabel}</span>
        <span style={{ color: C.textTertiary }}> · </span>
        {email}
      </span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={saving}
          className="shrink-0 rounded p-1 transition-colors disabled:opacity-50"
          style={{ color: C.textTertiary }}
          aria-label={`Remove ${email}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </li>
  );
}

export default function NotificationChannelCard({
  C,
  title,
  description,
  toggleLabel,
  channel,
  recipients,
  saving,
  onToggle,
  onToggleIncludeOrgAdmins,
  onAddEmail,
  onRemoveEmail,
  showTitle = true,
}: NotificationChannelCardProps) {
  const [emailDraft, setEmailDraft] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const showActionNeeded = channel.enabled && recipients.needsAction;

  const cardStyle: CSSProperties = {
    backgroundColor: showActionNeeded ? C.warningBg : C.surface,
    border: `1px solid ${showActionNeeded ? C.warningBorder : C.border}`,
    borderRadius: C.r.lg,
  };

  const handleToggle = (enabled: boolean) => {
    if (!enabled) {
      setEmailDraft("");
      setEmailError(null);
    }
    onToggle(enabled);
  };

  const handleAddEmail = () => {
    const candidate = emailDraft.trim().toLowerCase();
    if (!candidate) return;

    const nextEmails = normalizeNotificationEmails([
      ...channel.additional_emails,
      candidate,
    ]);

    if (nextEmails.length === channel.additional_emails.length) {
      setEmailError("Enter a valid email address.");
      return;
    }

    if (nextEmails.length > MAX_NOTIFY_EMAILS) {
      setEmailError(`Add at most ${MAX_NOTIFY_EMAILS} notification emails.`);
      return;
    }

    setEmailError(null);
    setEmailDraft("");
    onAddEmail(candidate);
  };

  const visibleOrgAdminEmails = channel.include_org_admins
    ? recipients.orgAdminEmails
    : [];
  const visibleRecipients = [
    ...visibleOrgAdminEmails,
    ...recipients.additionalEmails,
  ];
  const hasRecipients = visibleRecipients.length > 0;

  return (
    <section className="space-y-4 p-5" style={cardStyle}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {showTitle ? (
            <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
              {title}
            </h2>
          ) : null}
          <p
            className={`text-sm ${showTitle ? "mt-1" : ""}`}
            style={{ color: C.textSecondary }}
          >
            {description}
          </p>
        </div>
        {showActionNeeded ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: C.clayBg,
              border: `1px solid ${C.clayBorder}`,
              color: C.clay,
            }}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Action needed
          </span>
        ) : null}
      </div>

      <div
        className="overflow-hidden rounded-md"
        style={{
          border: `1px solid ${C.border}`,
          backgroundColor: C.bg,
        }}
      >
        <SettingToggleRow
          C={C}
          label={toggleLabel}
          checked={channel.enabled}
          disabled={saving}
          onChange={handleToggle}
          showDivider={channel.enabled}
        />
        {channel.enabled ? (
          <SettingToggleRow
            C={C}
            label="Include org admins"
            description="Notify all active org admin accounts"
            checked={channel.include_org_admins}
            disabled={saving}
            onChange={onToggleIncludeOrgAdmins}
          />
        ) : null}
      </div>

      {!channel.enabled ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          Notifications are turned off.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
              Recipients
            </p>

            {hasRecipients ? (
              <ul
                className="overflow-hidden rounded-md"
                style={{
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bg,
                }}
              >
                {visibleOrgAdminEmails.map((email, index) => (
                  <RecipientRow
                    key={`org-${email}`}
                    C={C}
                    roleLabel="Org admin"
                    email={email}
                    saving={saving}
                    showDivider={
                      index < visibleRecipients.length - 1
                    }
                  />
                ))}
                {recipients.additionalEmails.map((email, index) => (
                  <RecipientRow
                    key={`extra-${email}`}
                    C={C}
                    roleLabel="Additional"
                    email={email}
                    saving={saving}
                    showDivider={
                      visibleOrgAdminEmails.length + index <
                      visibleRecipients.length - 1
                    }
                    onRemove={() => onRemoveEmail(email)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm font-medium" style={{ color: C.clay }}>
                No recipients yet. Add an email below or invite an org admin.
              </p>
            )}
          </div>

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
              placeholder="admissions@school.com"
              disabled={
                saving || channel.additional_emails.length >= MAX_NOTIFY_EMAILS
              }
              className="sm:flex-1"
              style={inputStyle(C)}
            />
            <button
              type="button"
              onClick={handleAddEmail}
              disabled={
                saving ||
                !emailDraft.trim() ||
                channel.additional_emails.length >= MAX_NOTIFY_EMAILS
              }
              className="inline-flex shrink-0 items-center justify-center gap-1 px-3 text-xs font-medium disabled:opacity-50"
              style={{
                backgroundColor: C.accentLight,
                color: C.accent,
                border: `1px solid ${C.secondaryBtnBorder}`,
                borderRadius: C.r.md,
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add email
            </button>
          </div>

          {emailError ? (
            <p className="text-xs font-medium" style={{ color: C.error }}>
              {emailError}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
