"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import {
  MAX_NOTIFY_EMAILS,
  normalizeNotificationEmails,
  type NotificationChannelSettings,
  type RecipientSummary,
} from "@/lib/notifications/org-notification-settings";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

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
  theme: ParentThemeTokens;
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
  theme: ParentThemeTokens;
  roleLabel: string;
  email: string;
  saving: boolean;
  showDivider: boolean;
  onRemove?: () => void;
};

function RecipientRow({
  C,
  theme,
  roleLabel,
  email,
  saving,
  showDivider,
  onRemove,
}: RecipientRowProps) {
  return (
    <li
      className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
      style={
        showDivider ? { borderBottom: `1px solid ${C.border}` } : undefined
      }
    >
      <span className="min-w-0 truncate" style={{ color: C.textPrimary }}>
        <span style={{ color: theme.muted }}>{roleLabel}</span>
        <span style={{ color: theme.muted }}> · </span>
        {email}
      </span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={saving}
          className="shrink-0 rounded p-1 transition-colors disabled:opacity-50"
          style={{ color: theme.muted }}
          aria-label={`Remove ${email}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </li>
  );
}

export default function NotificationChannelCard({
  theme,
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
    <AdminCard
      theme={theme}
      padding="canvas"
      data-testid="notification-channel-card"
      style={
        showActionNeeded
          ? {
              borderColor: "#E8D4B8",
              backgroundColor: "#FFFBF5",
            }
          : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            {showTitle ? (
              <AdminDisplayHeading theme={theme} as="h2" size="section">
                {title}
              </AdminDisplayHeading>
            ) : null}
            <p
              className={`text-[13px] ${showTitle ? "mt-1" : ""}`}
              style={{ color: theme.muted }}
            >
              {description}
            </p>
          </div>
          {showActionNeeded ? (
            <AdminChip theme={theme} tone="warning">
              Action needed
            </AdminChip>
          ) : null}
        </div>

        <AdminCard theme={theme} padding="none" className="!shadow-none overflow-hidden">
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
        </AdminCard>

        {!channel.enabled ? (
          <p className="text-[13px]" style={{ color: theme.muted }}>
            Notifications are turned off.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <p
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: theme.muted }}
              >
                Recipients
              </p>

              {hasRecipients ? (
                <AdminCard theme={theme} padding="none" className="!shadow-none overflow-hidden">
                  <ul>
                    {visibleOrgAdminEmails.map((email, index) => (
                      <RecipientRow
                        key={`org-${email}`}
                        C={C}
                        theme={theme}
                        roleLabel="Org admin"
                        email={email}
                        saving={saving}
                        showDivider={index < visibleRecipients.length - 1}
                      />
                    ))}
                    {recipients.additionalEmails.map((email, index) => (
                      <RecipientRow
                        key={`extra-${email}`}
                        C={C}
                        theme={theme}
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
                </AdminCard>
              ) : (
                <p className="text-[13px] font-medium" style={{ color: "#A26B22" }}>
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
                className="rounded-lg border px-3 py-2.5 text-sm sm:flex-1"
                style={committeeStoryInputStyle(theme)}
                data-testid="add-notification-recipient-email"
              />
              <AdminButton
                theme={theme}
                variant="soft"
                onClick={handleAddEmail}
                disabled={
                  saving ||
                  !emailDraft.trim() ||
                  channel.additional_emails.length >= MAX_NOTIFY_EMAILS
                }
                data-testid="add-notification-recipient-button"
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
          </>
        )}
      </div>
    </AdminCard>
  );
}
