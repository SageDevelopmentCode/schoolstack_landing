"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import NotificationChannelCard from "@/components/school-admin/notifications/NotificationChannelCard";
import {
  getDefaultNotificationSettings,
  normalizeNotificationEmails,
  type NotificationChannel,
  type OrganizationNotificationRecipients,
  type OrganizationNotificationSettings,
} from "@/lib/notifications/org-notification-settings";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type NotificationsSettingsPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  schoolName: string;
};

const NOTIFICATION_CHANNELS = [
  "applications",
  "payments",
  "visits",
] as const satisfies readonly NotificationChannel[];

const CHANNEL_COPY: Record<
  NotificationChannel,
  { title: string; description: string; toggleLabel: string }
> = {
  applications: {
    title: "Applications",
    description: "Email when a family submits an application.",
    toggleLabel: "Email admins when applications are submitted",
  },
  payments: {
    title: "Payments received",
    description: "Email when a family pays tuition or a fee.",
    toggleLabel: "Email admins when payments are received",
  },
  visits: {
    title: "Visits & scheduling",
    description: "Email when a family books a tour, interview, or shadow day.",
    toggleLabel: "Email admins when visits are scheduled",
  },
};

function emptyRecipients(): OrganizationNotificationRecipients {
  const empty = {
    orgAdminEmails: [],
    additionalEmails: [],
    allRecipients: [],
    needsAction: false,
  };
  return {
    applications: { ...empty },
    payments: { ...empty },
    visits: { ...empty },
  };
}

export default function NotificationsSettingsPage({
  organizationId,
  branding,
  schoolName,
}: NotificationsSettingsPageProps) {
  const C = buildAdminThemeTokens(branding);
  const [settings, setSettings] = useState<OrganizationNotificationSettings>(
    getDefaultNotificationSettings(),
  );
  const [recipients, setRecipients] =
    useState<OrganizationNotificationRecipients>(emptyRecipients());
  const [activeChannel, setActiveChannel] =
    useState<NotificationChannel>("applications");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(
        `/api/school-admin/notifications/settings?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const payload = (await response.json().catch(() => ({}))) as {
        settings?: OrganizationNotificationSettings;
        recipients?: OrganizationNotificationRecipients;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load notification settings.");
      }

      setSettings(payload.settings ?? getDefaultNotificationSettings());
      setRecipients(payload.recipients ?? emptyRecipients());
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load notification settings.",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(
    async (nextSettings: OrganizationNotificationSettings) => {
      setSaving(true);

      try {
        const response = await fetch("/api/school-admin/notifications/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            settings: nextSettings,
          }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
          settings?: OrganizationNotificationSettings;
          recipients?: OrganizationNotificationRecipients;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to save notification settings.");
        }

        setSettings(payload.settings ?? nextSettings);
        setRecipients(payload.recipients ?? emptyRecipients());
        adminToast.success("Notification settings saved");
      } catch (error) {
        adminToast.error(
          formatActionError(error, "Failed to save notification settings."),
        );
      } finally {
        setSaving(false);
      }
    },
    [organizationId],
  );

  const updateChannel = useCallback(
    (
      channel: NotificationChannel,
      patch: Partial<OrganizationNotificationSettings[NotificationChannel]>,
    ) => {
      const nextSettings: OrganizationNotificationSettings = {
        ...settings,
        [channel]: {
          ...settings[channel],
          ...patch,
        },
      };
      setSettings(nextSettings);
      void saveSettings(nextSettings);
    },
    [saveSettings, settings],
  );

  const handleAddEmail = (channel: NotificationChannel, email: string) => {
    const nextEmails = normalizeNotificationEmails([
      ...settings[channel].additional_emails,
      email,
    ]);
    updateChannel(channel, { additional_emails: nextEmails });
  };

  const handleRemoveEmail = (channel: NotificationChannel, email: string) => {
    updateChannel(channel, {
      additional_emails: settings[channel].additional_emails.filter(
        (value) => value !== email,
      ),
    });
  };

  const activeCopy = CHANNEL_COPY[activeChannel];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: C.accentLight, color: C.accent }}
        >
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: C.textPrimary }}
          >
            Notifications
          </h1>
          <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
            Manage email alerts for {schoolName}.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Loading notification settings…
        </p>
      ) : null}

      {loadError ? (
        <p className="text-sm font-medium" style={{ color: C.error }}>
          {loadError}
        </p>
      ) : null}

      {!loading && !loadError ? (
        <>
          <div
            className="overflow-x-auto overflow-y-hidden scrollbar-hide"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div
              className="-mb-px flex gap-6"
              role="tablist"
              aria-label="Notification channels"
            >
              {NOTIFICATION_CHANNELS.map((channel) => {
                const isActive = activeChannel === channel;
                const tabId = `notifications-tab-${channel}`;
                const panelId = `notifications-panel-${channel}`;
                const needsAction = recipients[channel].needsAction;

                return (
                  <button
                    key={channel}
                    id={tabId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    onClick={() => setActiveChannel(channel)}
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors"
                    style={{
                      borderBottomColor: isActive ? C.accent : "transparent",
                      color: isActive ? C.accent : C.textTertiary,
                    }}
                  >
                    {CHANNEL_COPY[channel].title}
                    {needsAction ? (
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: C.clay }}
                        aria-label="Action needed"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id={`notifications-panel-${activeChannel}`}
            role="tabpanel"
            aria-labelledby={`notifications-tab-${activeChannel}`}
          >
            <NotificationChannelCard
              C={C}
              title={activeCopy.title}
              description={activeCopy.description}
              toggleLabel={activeCopy.toggleLabel}
              channel={settings[activeChannel]}
              recipients={recipients[activeChannel]}
              saving={saving}
              showTitle={false}
              onToggle={(enabled) => updateChannel(activeChannel, { enabled })}
              onToggleIncludeOrgAdmins={(include_org_admins) =>
                updateChannel(activeChannel, { include_org_admins })
              }
              onAddEmail={(email) => handleAddEmail(activeChannel, email)}
              onRemoveEmail={(email) => handleRemoveEmail(activeChannel, email)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
