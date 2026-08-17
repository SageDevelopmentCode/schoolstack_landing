"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Pencil, Plus, Trash2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { MAX_FAMILY_NOTIFICATION_EMAILS, getDisplayNotificationEmails } from "@/lib/notifications/family-notification-email-constants";
import { parentToast } from "@/lib/school-parent/parent-toast";

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

export default function ParentNotificationSettingsPage({
  organizationId,
  branding,
  readOnly = false,
  initialSettings = null,
}: ParentNotificationSettingsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [loading, setLoading] = useState(!initialSettings);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsResponse | null>(
    initialSettings,
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
    if (readOnly && initialSettings) {
      setSettings(initialSettings);
      applyConfiguredEmails(
        initialSettings.configuredEmails,
        initialSettings.loginEmail,
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
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
    } finally {
      setLoading(false);
    }
  }, [applyConfiguredEmails, initialSettings, organizationId, readOnly]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

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
    try {
      const emailsToSave = collectEmailsForSave();
      const response = await fetch("/api/parent-portal/notification-settings", {
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
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (readOnly) return;

    applyConfiguredEmails([], settings?.loginEmail ?? null);
    setSaving(true);
    try {
      const response = await fetch("/api/parent-portal/notification-settings", {
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.accent }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6" data-testid="parent-notification-settings">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: C.textPrimary }}>
          Notification settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
          Choose where family emails go for applications, billing, messages, and
          other parent portal updates. This can differ from the email you use to
          sign in. School admin alerts are not affected.
        </p>
      </div>

      <InfoCard C={C} title="Login email">
        <p className="text-sm" style={{ color: C.textPrimary }}>
          {settings?.loginEmail ?? "—"}
        </p>
        <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
          Used for sign-in codes only.
        </p>
      </InfoCard>

      <InfoCard C={C} title="Currently sending to" className="mt-4">
        {settings?.effectiveEmails.length ? (
          <ul className="space-y-2">
            {settings.effectiveEmails.map((email, index) => (
              <li
                key={email}
                className="flex items-start gap-2 text-sm"
                style={{ color: C.textPrimary }}
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.accent }} />
                <span>
                  {email}
                  {settings.sources[index] ? (
                    <span
                      className="mt-0.5 block text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {sourceLabel(settings.sources[index])}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm" style={{ color: C.textSecondary }}>
            No email address on file yet.
          </p>
        )}
      </InfoCard>

      <InfoCard C={C} title="Notification emails" className="mt-4">
        <p className="mb-4 text-sm" style={{ color: C.textSecondary }}>
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
                  C={C}
                  email={email}
                  readOnly
                />
              ))
            ) : (
              <p className="text-sm" style={{ color: C.textSecondary }}>
                No notification emails configured.
              </p>
            )
          ) : (
            <>
              {emails.map((email, index) =>
                editingIndex === index ? (
                  <NotificationEmailInput
                    key={`edit-${index}`}
                    C={C}
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
                    C={C}
                    email={email}
                    onEdit={() => handleEdit(index)}
                    onDelete={() => handleDelete(index)}
                    disabled={saving}
                  />
                ),
              )}

              {showFirstEmailInput ? (
                <NotificationEmailInput
                  C={C}
                  value={newEmailDraft}
                  disabled={saving}
                  testId="notification-email-input-0"
                  onChange={setNewEmailDraft}
                />
              ) : null}

              {addingNew ? (
                <NotificationEmailInput
                  C={C}
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
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
            style={{ color: C.accent }}
            data-testid="add-notification-email"
          >
            <Plus className="h-4 w-4" />
            Add another email
          </button>
        ) : null}

        {!readOnly ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: C.accent }}
              data-testid="save-notification-settings"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {settings?.configuredEmails.length ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleClear()}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  borderColor: C.border,
                  color: C.textSecondary,
                  backgroundColor: C.surface,
                }}
                data-testid="clear-notification-settings"
              >
                Use defaults
              </button>
            ) : null}
          </div>
        ) : null}
      </InfoCard>
    </div>
  );
}

function NotificationEmailRow({
  C,
  email,
  readOnly = false,
  onEdit,
  onDelete,
  disabled = false,
}: {
  C: AdminThemeTokens;
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
        borderColor: C.border,
        backgroundColor: C.surface,
      }}
    >
      <Mail className="h-4 w-4 shrink-0" style={{ color: C.accent }} />
      <span className="min-w-0 flex-1 truncate text-sm" style={{ color: C.textPrimary }}>
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
            <Pencil className="h-4 w-4" style={{ color: C.textSecondary }} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="rounded-lg p-2 transition-colors hover:bg-black/5 disabled:opacity-50"
            aria-label="Delete email"
          >
            <Trash2 className="h-4 w-4" style={{ color: C.textSecondary }} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function NotificationEmailInput({
  C,
  value,
  disabled,
  testId,
  onChange,
}: {
  C: AdminThemeTokens;
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
      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-60"
      style={{
        borderColor: C.border,
        color: C.textPrimary,
        backgroundColor: C.surface,
      }}
      data-testid={testId}
    />
  );
}

function InfoCard({
  C,
  title,
  children,
  className = "",
}: {
  C: AdminThemeTokens;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border p-4 ${className}`}
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      <h2 className="mb-2 text-sm font-semibold" style={{ color: C.textPrimary }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
