"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Loader2, Mail, Pencil, Plus, Trash2 } from "lucide-react";
import ParentNotificationSettingsStoryHeader from "@/components/school-parent/notifications/ParentNotificationSettingsStoryHeader";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  MAX_FAMILY_NOTIFICATION_EMAILS,
  getDisplayNotificationEmails,
} from "@/lib/notifications/family-notification-email-constants";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type NotificationSettingsResponse = {
  familyId: string;
  loginEmail: string | null;
  configuredEmails: string[];
  effectiveEmails: string[];
  sources: string[];
};

type ParentNotificationSettingsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  readOnly?: boolean;
  initialSettings?: NotificationSettingsResponse | null;
};

function sourceLabel(source: string): string {
  switch (source) {
    case "configured":
      return "Notification settings";
    case "guardian_email":
      return "Guardian contact email";
    case "primary_email":
      return "Family primary email";
    case "auth_email":
      return "Login email";
    default:
      return source;
  }
}

function resetEmailEditorState(
  configuredEmails: string[],
  loginEmail: string | null,
): {
  emails: string[];
  editingIndex: null;
  addingNew: boolean;
  newEmailDraft: string;
} {
  return {
    emails: getDisplayNotificationEmails(configuredEmails, loginEmail),
    editingIndex: null,
    addingNew: false,
    newEmailDraft: "",
  };
}

function inputStyle(theme: ParentThemeTokens): CSSProperties {
  return {
    borderColor: theme.line,
    backgroundColor: theme.white,
    color: theme.ink,
  };
}

export default function ParentNotificationSettingsPage({
  organizationId,
  branding: _branding,
  readOnly = false,
  initialSettings,
}: ParentNotificationSettingsPageProps) {
  const { theme } = useParentTheme();
  const hasInitialData = initialSettings !== undefined;
  const [loading, setLoading] = useState(!hasInitialData);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsResponse | null>(
    initialSettings ?? null,
  );
  const [emails, setEmails] = useState<string[]>(() =>
    getDisplayNotificationEmails(
      initialSettings?.configuredEmails ?? [],
      initialSettings?.loginEmail ?? null,
    ),
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newEmailDraft, setNewEmailDraft] = useState("");

  const applyConfiguredEmails = useCallback(
    (configuredEmails: string[], loginEmail: string | null) => {
      const next = resetEmailEditorState(configuredEmails, loginEmail);
      setEmails(next.emails);
      setEditingIndex(next.editingIndex);
      setAddingNew(next.addingNew);
      setNewEmailDraft(next.newEmailDraft);
    },
    [],
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);
    let response: Response | undefined;
    try {
      response = await fetch(
        `/api/parent-portal/notification-settings?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const payload = (await response.json()) as NotificationSettingsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load notification settings.");
      }

      setSettings(payload);
      applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
    } catch (error) {
      parentToast.error(
        error instanceof Error
          ? error.message
          : "Failed to load notification settings.",
      );
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "notification_settings.load",
          error: "",
        },
        error,
        response?.status,
      );
    } finally {
      setLoading(false);
    }
  }, [applyConfiguredEmails, organizationId]);

  useEffect(() => {
    if (hasInitialData) return;
    queueMicrotask(() => {
      void loadSettings();
    });
  }, [hasInitialData, loadSettings]);

  const showFirstEmailInput = !readOnly && emails.length === 0 && !addingNew;
  const canAddEmail =
    !readOnly &&
    emails.length < MAX_FAMILY_NOTIFICATION_EMAILS &&
    !addingNew &&
    !showFirstEmailInput;

  const collectEmailsForSave = (): string[] => {
    const saved = emails.map((email) => email.trim()).filter(Boolean);
    const draft = newEmailDraft.trim();
    if ((addingNew || showFirstEmailInput) && draft) {
      return [...saved, draft];
    }
    return saved;
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setAddingNew(false);
    setNewEmailDraft("");
  };

  const handleDelete = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleAdd = () => {
    setEditingIndex(null);
    setAddingNew(true);
    setNewEmailDraft("");
  };

  const handleSave = async () => {
    if (readOnly) return;

    setSaving(true);
    let response: Response | undefined;
    try {
      const emailsToSave = collectEmailsForSave();
      response = await fetch("/api/parent-portal/notification-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, emails: emailsToSave }),
      });
      const payload = (await response.json()) as NotificationSettingsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save notification settings.");
      }

      setSettings(payload);
      applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
      parentToast.success("Notification settings saved.");
    } catch (error) {
      parentToast.error(
        error instanceof Error
          ? error.message
          : "Failed to save notification settings.",
      );
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "notification_settings.save",
          error: "",
        },
        error,
        response?.status,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (readOnly) return;

    applyConfiguredEmails([], settings?.loginEmail ?? null);
    setSaving(true);
    let response: Response | undefined;
    try {
      response = await fetch("/api/parent-portal/notification-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, emails: [] }),
      });
      const payload = (await response.json()) as NotificationSettingsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to clear notification settings.");
      }

      setSettings(payload);
      applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
      parentToast.success("Using default family email addresses again.");
    } catch (error) {
      parentToast.error(
        error instanceof Error
          ? error.message
          : "Failed to clear notification settings.",
      );
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "notification_settings.clear",
          error: "",
        },
        error,
        response?.status,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.muted }} />
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex max-w-[1250px] flex-col gap-6 px-4 py-6 sm:gap-8 sm:py-8 md:px-9"
      data-testid="parent-notification-settings"
    >
      <ParentNotificationSettingsStoryHeader theme={theme} />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <SettingsCard theme={theme} title="Login email">
            <p className="text-sm" style={{ color: theme.ink }}>
              {settings?.loginEmail ?? "—"}
            </p>
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              Used for sign-in codes only.
            </p>
          </SettingsCard>

          <SettingsCard theme={theme} title="Currently sending to">
            {settings?.effectiveEmails.length ? (
              <ul className="space-y-3">
                {settings.effectiveEmails.map((email, index) => (
                  <li key={`${email}-${index}`} className="flex items-start gap-2">
                    <Mail
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: theme.primary }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm" style={{ color: theme.ink }}>
                        {email}
                      </p>
                      {settings.sources[index] ? (
                        <ParentChip theme={theme} tone="info" className="mt-1.5">
                          {sourceLabel(settings.sources[index])}
                        </ParentChip>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: theme.muted }}>
                No email address on file yet.
              </p>
            )}
          </SettingsCard>
        </div>

        <SettingsCard theme={theme} title="Notification emails">
          <p className="mb-4 text-sm" style={{ color: theme.muted }}>
            Add up to {MAX_FAMILY_NOTIFICATION_EMAILS} addresses for all family
            notifications. Your login email is included by default — remove it here
            if you prefer notifications elsewhere.
          </p>

          <div className="space-y-3">
            {readOnly ? (
              emails.length > 0 ? (
                emails.map((email) => (
                  <NotificationEmailRow
                    key={email}
                    theme={theme}
                    email={email}
                    readOnly
                  />
                ))
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  No notification emails configured.
                </p>
              )
            ) : (
              <>
                {emails.map((email, index) =>
                  editingIndex === index ? (
                    <NotificationEmailInput
                      key={`edit-${index}`}
                      theme={theme}
                      value={email}
                      disabled={saving}
                      testId={`notification-email-input-${index}`}
                      onChange={(value) => {
                        const next = [...emails];
                        next[index] = value;
                        setEmails(next);
                      }}
                    />
                  ) : (
                    <NotificationEmailRow
                      key={`${email}-${index}`}
                      theme={theme}
                      email={email}
                      onEdit={() => handleEdit(index)}
                      onDelete={() => handleDelete(index)}
                      disabled={saving}
                    />
                  ),
                )}

                {showFirstEmailInput ? (
                  <NotificationEmailInput
                    theme={theme}
                    value={newEmailDraft}
                    disabled={saving}
                    testId="notification-email-input-0"
                    onChange={setNewEmailDraft}
                  />
                ) : null}

                {addingNew ? (
                  <NotificationEmailInput
                    theme={theme}
                    value={newEmailDraft}
                    disabled={saving}
                    testId={`notification-email-input-${emails.length}`}
                    onChange={setNewEmailDraft}
                  />
                ) : null}
              </>
            )}
          </div>

          {canAddEmail ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleAdd}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ color: theme.primary }}
              data-testid="add-notification-email"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another email
            </button>
          ) : null}

          {!readOnly ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <ParentButton
                theme={theme}
                disabled={saving}
                onClick={() => void handleSave()}
                data-testid="save-notification-settings"
              >
                {saving ? "Saving…" : "Save"}
              </ParentButton>
              {settings?.configuredEmails.length ? (
                <ParentButton
                  theme={theme}
                  variant="outline"
                  disabled={saving}
                  onClick={() => void handleClear()}
                  data-testid="clear-notification-settings"
                >
                  Use defaults
                </ParentButton>
              ) : null}
            </div>
          ) : null}
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({
  theme,
  title,
  children,
}: {
  theme: ParentThemeTokens;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ParentCard theme={theme} className="!p-5">
      <ParentDisplayHeading
        theme={theme}
        as="h2"
        size="section"
        className="!mb-3 !text-lg !tracking-[-0.02em]"
      >
        {title}
      </ParentDisplayHeading>
      {children}
    </ParentCard>
  );
}

function NotificationEmailRow({
  theme,
  email,
  readOnly = false,
  onEdit,
  onDelete,
  disabled = false,
}: {
  theme: ParentThemeTokens;
  email: string;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-2"
      style={{
        borderColor: theme.line,
        backgroundColor: theme.white,
      }}
    >
      <Mail className="h-4 w-4 shrink-0" style={{ color: theme.primary }} />
      <span className="min-w-0 flex-1 truncate text-sm" style={{ color: theme.ink }}>
        {email}
      </span>
      {!readOnly ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={onEdit}
            className="rounded-lg p-2 transition-colors hover:bg-black/5 disabled:opacity-50"
            aria-label="Edit email"
          >
            <Pencil className="h-4 w-4" style={{ color: theme.muted }} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="rounded-lg p-2 transition-colors hover:bg-black/5 disabled:opacity-50"
            aria-label="Delete email"
          >
            <Trash2 className="h-4 w-4" style={{ color: theme.muted }} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function NotificationEmailInput({
  theme,
  value,
  disabled,
  testId,
  onChange,
}: {
  theme: ParentThemeTokens;
  value: string;
  disabled: boolean;
  testId: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="email"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder="name@example.com"
      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-60"
      style={inputStyle(theme)}
      data-testid={testId}
    />
  );
}
