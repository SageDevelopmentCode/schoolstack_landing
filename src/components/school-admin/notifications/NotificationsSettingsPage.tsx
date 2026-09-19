"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import AlertsStoryHeader from "@/components/school-admin/notifications/AlertsStoryHeader";
import NotificationChannelCard, {
  SettingToggleRow,
} from "@/components/school-admin/notifications/NotificationChannelCard";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AlertsChannelTabBar from "@/components/school-admin/notifications/AlertsChannelTabBar";
import {
  getDefaultNotificationSettings,
  normalizeNotificationEmails,
  type NotificationChannel,
  type OrganizationNotificationRecipients,
  type OrganizationNotificationSettings,
} from "@/lib/notifications/org-notification-settings";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

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
  "committees",
  "program_signups",
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
  committees: {
    title: "Committee join requests",
    description: "Email when a parent requests to join a committee.",
    toggleLabel: "Email admins when committee join requests are submitted",
  },
  program_signups: {
    title: "Program sign-ups",
    description: "Email when a parent signs up for an enrichment program or elective class.",
    toggleLabel: "Email admins when program sign-ups are submitted",
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
    committees: { ...empty },
    program_signups: { ...empty },
  };
}

export default function NotificationsSettingsPage({
  organizationId,
  branding: _branding,
  schoolName,
}: NotificationsSettingsPageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const reducedMotion = useReducedMotion() ?? false;
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

  const channelsNeedingAction = useMemo(
    () =>
      NOTIFICATION_CHANNELS.filter((channel) => recipients[channel].needsAction),
    [recipients],
  );

  const channelsNeedingActionCount = channelsNeedingAction.length;

  const firstChannelNeedingAction = channelsNeedingAction[0] ?? null;

  const alertTabs = useMemo(
    () =>
      NOTIFICATION_CHANNELS.map((channel) => ({
        id: channel,
        label: CHANNEL_COPY[channel].title,
        needsAction: recipients[channel].needsAction,
      })),
    [recipients],
  );

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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "notifications.settings.load",
        error: "",
      }, error);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load notification settings.",
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSettings();
    });
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
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "notifications.settings.save",
          error: "",
        }, error);
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

  const updateParentReminders = useCallback(
    (enabled: boolean) => {
      const nextSettings: OrganizationNotificationSettings = {
        ...settings,
        parent_reminders: {
          incomplete_admissions: {
            enabled,
          },
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

  const focusFirstChannelNeedingAction = () => {
    if (firstChannelNeedingAction) {
      setActiveChannel(firstChannelNeedingAction);
    }
  };

  const activeCopy = CHANNEL_COPY[activeChannel];

  return (
    <div
      className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px]"
      data-testid="notifications-settings-page"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <AlertsStoryHeader
          theme={theme}
          schoolName={schoolName}
          channelsNeedingActionCount={channelsNeedingActionCount}
        />

        {loading ? (
          <AdminCard theme={theme} className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: theme.muted }} />
          </AdminCard>
        ) : null}

        {loadError ? (
          <AdminCard theme={theme} className="space-y-4">
            <p className="text-sm" style={{ color: theme.muted }}>
              {loadError}
            </p>
            <AdminButton theme={theme} variant="outline" onClick={() => void loadSettings()}>
              Try again
            </AdminButton>
          </AdminCard>
        ) : null}

        {!loading && !loadError ? (
          <>
            {channelsNeedingActionCount > 0 ? (
              <div
                className="flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
                style={{
                  backgroundColor: "#EAF4EB",
                  borderColor: "#C7DFCB",
                  color: "#42694F",
                }}
                data-testid="alerts-needs-attention-banner"
              >
                <span className="text-xs">
                  <b>Needs attention:</b>{" "}
                  {channelsNeedingActionCount === 1
                    ? "1 alert channel has no recipients."
                    : `${channelsNeedingActionCount} alert channels have no recipients.`}
                </span>
                <AdminButton theme={theme} variant="soft" onClick={focusFirstChannelNeedingAction}>
                  Review channels →
                </AdminButton>
              </div>
            ) : null}

            <AlertsChannelTabBar
              theme={theme}
              tabs={alertTabs}
              activeTab={activeChannel}
              onTabChange={setActiveChannel}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeChannel}
                id={`alerts-panel-${activeChannel}`}
                role="tabpanel"
                aria-labelledby={`alerts-tab-${activeChannel}`}
                variants={tabPanelVariants(reducedMotion)}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={tabPanelTransition(reducedMotion)}
              >
                <NotificationChannelCard
                  theme={theme}
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
              </motion.div>
            </AnimatePresence>

            <AdminCard
              theme={theme}
              className="space-y-1"
              data-testid="parent-reminders-card"
            >
              <div className="space-y-1 px-1 pb-1">
                <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                  Parent reminders
                </h2>
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  Outbound emails to families — separate from the staff alert channels above.
                </p>
              </div>
              <SettingToggleRow
                C={C}
                label="Email families with unfinished applications or enrollment"
                description="Sends up to two reminders: first after 72 hours of inactivity, then again 7 days later. The school contact in those emails comes from your Applications alert channel."
                checked={settings.parent_reminders.incomplete_admissions.enabled}
                disabled={saving}
                onChange={updateParentReminders}
              />
            </AdminCard>
          </>
        ) : null}
      </div>
    </div>
  );
}
