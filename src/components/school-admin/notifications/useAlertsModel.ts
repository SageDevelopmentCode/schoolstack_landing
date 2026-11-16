"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import {
  getDefaultNotificationSettings,
  normalizeNotificationEmails,
  type NotificationChannel,
  type OrganizationNotificationRecipients,
  type OrganizationNotificationSettings,
} from "@/lib/notifications/org-notification-settings";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * Alerts view-model (admin Garden). Same API as before
 * (/api/school-admin/notifications/settings GET + PATCH with the whole
 * settings object). Every change saves right away; while it saves only that
 * control spins and the rest wait. A failed save rolls the page back to the
 * last saved settings so the screen never shows a state the server rejected.
 */

export const NOTIFICATION_CHANNELS = [
  "applications",
  "payments",
  "visits",
  "committees",
  "program_signups",
  "staff_hours",
] as const satisfies readonly NotificationChannel[];

export const CHANNEL_COPY: Record<
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
  staff_hours: {
    title: "Staff hours",
    description: "Weekly summary every Sunday morning when staff logged time that week.",
    toggleLabel: "Email admins the weekly staff hours summary",
  },
};

export function emptyRecipients(): OrganizationNotificationRecipients {
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
    staff_hours: { ...empty },
  };
}

function parseChannel(value: string | null): NotificationChannel | null {
  return (NOTIFICATION_CHANNELS as readonly string[]).includes(value ?? "")
    ? (value as NotificationChannel)
    : null;
}

export function peopleLabel(count: number): string {
  return `${count} ${count === 1 ? "person" : "people"}`;
}

type SettingsResponse = {
  settings?: OrganizationNotificationSettings;
  recipients?: OrganizationNotificationRecipients;
  error?: string;
};

export function useAlertsModel({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const action = useAdminAction();

  const [settings, setSettings] = useState<OrganizationNotificationSettings>(
    getDefaultNotificationSettings(),
  );
  const [recipients, setRecipients] =
    useState<OrganizationNotificationRecipients>(emptyRecipients());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const savedRef = useRef<OrganizationNotificationSettings>(getDefaultNotificationSettings());
  const requestIdRef = useRef(0);
  const reloadRef = useRef<(options?: { silent?: boolean; announce?: boolean }) => Promise<void>>(
    async () => {},
  );

  const urlChannel = parseChannel(searchParams.get("channel"));
  const [localChannel, setLocalChannel] = useState<NotificationChannel>(
    urlChannel ?? "applications",
  );
  const activeChannel = urlChannel ?? localChannel;

  const selectChannel = useCallback(
    (channel: NotificationChannel) => {
      setLocalChannel(channel);
      const params = new URLSearchParams(searchParams.toString());
      if (channel === "applications") params.delete("channel");
      else params.set("channel", channel);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const applyResponse = useCallback(
    (payload: SettingsResponse, fallback: OrganizationNotificationSettings) => {
      const nextSettings = payload.settings ?? fallback;
      savedRef.current = nextSettings;
      setSettings(nextSettings);
      setRecipients(payload.recipients ?? emptyRecipients());
      setLastUpdatedAt(Date.now());
      return { settings: nextSettings, recipients: payload.recipients ?? emptyRecipients() };
    },
    [],
  );

  const loadSettings = useCallback(
    async (options?: { silent?: boolean; announce?: boolean }) => {
      const requestId = ++requestIdRef.current;
      if (options?.silent) setRefreshing(true);
      else {
        setLoading(true);
        setLoadError(null);
      }

      try {
        const response = await fetch(
          `/api/school-admin/notifications/settings?organizationId=${encodeURIComponent(organizationId)}`,
        );
        const payload = (await response.json().catch(() => ({}))) as SettingsResponse;
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load notification settings.");
        }
        if (requestId !== requestIdRef.current) return;
        const next = applyResponse(payload, getDefaultNotificationSettings());
        setLoadError(null);
        if (options?.announce) {
          const needs = NOTIFICATION_CHANNELS.filter((c) => next.recipients[c].needsAction).length;
          adminToast.dismiss("alerts-refresh-error");
          adminToast.success("Alerts are up to date.", {
            id: "alerts-refresh",
            description:
              needs === 0
                ? "Every alert channel has someone to email."
                : `${needs} channel${needs === 1 ? " still needs" : "s still need"} recipients.`,
          });
        }
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "notifications.settings.load", error: "" },
          error,
        );
        const message = formatActionError(error, "Failed to load notification settings.");
        if (options?.silent) {
          // A manual refresh keeps what's on screen and says so.
          adminToast.error("Couldn't refresh alerts.", {
            id: "alerts-refresh-error",
            description: `${message} Your settings on screen haven't changed.`,
            action: { label: "Retry", onClick: () => void reloadRef.current({ silent: true, announce: true }) },
          });
        } else {
          setLoadError(message);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [applyResponse, organizationId],
  );

  useEffect(() => {
    reloadRef.current = loadSettings;
  }, [loadSettings]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSettings();
    });
  }, [loadSettings]);

  /**
   * Save the whole settings object (the API's contract). Optimistic: the
   * screen shows `next` straight away and goes back to the last saved
   * settings if the server says no. Retry on the error toast re-applies it.
   */
  const save = useCallback(
    (
      next: OrganizationNotificationSettings,
      options: {
        key: string;
        flashKey?: string;
        success: (result: {
          settings: OrganizationNotificationSettings;
          recipients: OrganizationNotificationRecipients;
        }) => { title: string; description?: string };
        notChanged: string;
        successAction?: { label: string; onClick: () => void };
        /** Runs inside the action, so it also runs after a successful Retry. */
        onSaved?: () => void;
      },
    ) =>
      action.run(
        async () => {
          setSettings(next);
          try {
            const response = await fetch("/api/school-admin/notifications/settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ organizationId, settings: next }),
            });
            const payload = (await response.json().catch(() => ({}))) as SettingsResponse;
            if (!response.ok) {
              throw new Error(payload.error ?? "Failed to save notification settings.");
            }
            const applied = applyResponse(payload, next);
            options.onSaved?.();
            return applied;
          } catch (error) {
            setSettings(savedRef.current);
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "notifications.settings.save", error: "" },
              error,
            );
            throw error;
          }
        },
        {
          key: options.key,
          id: `alerts-${options.key}`,
          flashKey: options.flashKey ?? options.key,
          success: options.success,
          successAction: options.successAction,
          error: {
            title: "Couldn't save your alert settings.",
            description: options.notChanged,
            fallback: "Failed to save notification settings.",
          },
        },
      ),
    [action, applyResponse, organizationId],
  );

  const recipientCount = (
    result: { recipients: OrganizationNotificationRecipients },
    channel: NotificationChannel,
  ) => result.recipients[channel].allRecipients.length;

  const setChannelEnabled = useCallback(
    (channel: NotificationChannel, enabled: boolean) => {
      const base = savedRef.current;
      const title = CHANNEL_COPY[channel].title;
      return save(
        { ...base, [channel]: { ...base[channel], enabled } },
        {
          key: `${channel}-enabled`,
          flashKey: channel,
          notChanged: `${title} alerts are still ${base[channel].enabled ? "on" : "off"}.`,
          success: (result) => {
            if (!enabled) {
              return {
                title: `${title} alerts turned off.`,
                description: "No one gets these emails until you turn them back on.",
              };
            }
            const count = recipientCount(result, channel);
            return {
              title: `${title} alerts turned on.`,
              description:
                count > 0
                  ? `Emails go to ${peopleLabel(count)}.`
                  : "No one gets these yet. Add a recipient to finish.",
            };
          },
        },
      );
    },
    [save],
  );

  const setIncludeOrgAdmins = useCallback(
    (channel: NotificationChannel, include: boolean) => {
      const base = savedRef.current;
      const title = CHANNEL_COPY[channel].title;
      return save(
        { ...base, [channel]: { ...base[channel], include_org_admins: include } },
        {
          key: `${channel}-org-admins`,
          flashKey: channel,
          notChanged: include
            ? "Org admins still aren't on this list."
            : "Org admins are still on this list.",
          success: (result) => {
            const count = recipientCount(result, channel);
            return {
              title: include
                ? `Org admins added to ${title} alerts.`
                : `Org admins removed from ${title} alerts.`,
              description:
                count > 0
                  ? `Emails go to ${peopleLabel(count)}.`
                  : "No one gets these now. Add a recipient below.",
            };
          },
        },
      );
    },
    [save],
  );

  const addEmail = useCallback(
    (channel: NotificationChannel, email: string, onSaved?: () => void) => {
      const base = savedRef.current;
      const title = CHANNEL_COPY[channel].title;
      const nextEmails = normalizeNotificationEmails([...base[channel].additional_emails, email]);
      return save(
        { ...base, [channel]: { ...base[channel], additional_emails: nextEmails } },
        {
          key: `${channel}-email-add`,
          flashKey: `${channel}:${email}`,
          notChanged: `${email} wasn't added.`,
          onSaved,
          success: (result) => ({
            title: `${email} added.`,
            description: `${title} alerts now go to ${peopleLabel(recipientCount(result, channel))}.`,
          }),
        },
      );
    },
    [save],
  );

  const removeEmail = useCallback(
    (channel: NotificationChannel, email: string) => {
      const base = savedRef.current;
      const title = CHANNEL_COPY[channel].title;
      return save(
        {
          ...base,
          [channel]: {
            ...base[channel],
            additional_emails: base[channel].additional_emails.filter((value) => value !== email),
          },
        },
        {
          key: `${channel}-email-remove:${email}`,
          flashKey: channel,
          notChanged: `${email} is still on the list.`,
          success: (result) => {
            const count = recipientCount(result, channel);
            return {
              title: `${email} removed.`,
              description:
                count > 0
                  ? `${title} alerts now go to ${peopleLabel(count)}.`
                  : `No one gets ${title} alerts now.`,
            };
          },
          successAction: { label: "Undo", onClick: () => void addEmail(channel, email) },
        },
      );
    },
    [addEmail, save],
  );

  const setParentReminders = useCallback(
    (enabled: boolean) => {
      const base = savedRef.current;
      return save(
        {
          ...base,
          parent_reminders: {
            ...base.parent_reminders,
            incomplete_admissions: { enabled },
          },
        },
        {
          key: "parent-reminders",
          notChanged: `Parent reminders are still ${
            base.parent_reminders.incomplete_admissions.enabled ? "on" : "off"
          }.`,
          success: () =>
            enabled
              ? {
                  title: "Parent reminders turned on.",
                  description:
                    "Families with unfinished applications or enrollment get up to two reminder emails.",
                }
              : {
                  title: "Parent reminders turned off.",
                  description: "Families won't get reminder emails about unfinished applications.",
                },
        },
      );
    },
    [save],
  );

  const channelsNeedingAction = useMemo(
    () => NOTIFICATION_CHANNELS.filter((channel) => recipients[channel].needsAction),
    [recipients],
  );
  const channelsOn = useMemo(
    () => NOTIFICATION_CHANNELS.filter((channel) => settings[channel].enabled).length,
    [settings],
  );

  return {
    settings,
    recipients,
    loading,
    refreshing,
    loadError,
    lastUpdatedAt,
    loadSettings,
    activeChannel,
    selectChannel,
    channelsNeedingAction,
    channelsOn,
    saving: action.pendingKey != null,
    pendingKey: action.pendingKey,
    lastSavedKey: action.lastSavedKey,
    setChannelEnabled,
    setIncludeOrgAdmins,
    addEmail,
    removeEmail,
    setParentReminders,
  };
}

export type AlertsModel = ReturnType<typeof useAlertsModel>;
