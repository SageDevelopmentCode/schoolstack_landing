"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BellRing,
  CalendarClock,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  AdminGardenPageSkeleton,
  BusyLabel,
  GardenField,
  GardenLoadError,
  GardenNotice,
  GardenNumberedSection,
  GardenSwitch,
  ROW_INTERACTIVE,
  gIconBtn,
  gInputClass,
} from "@/components/school-admin/garden/kit";
import { GARDEN_LIST_DETAIL_GRID, GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import { GCard, GChip, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  MAX_NOTIFY_EMAILS,
  normalizeNotificationEmails,
  type NotificationChannel,
} from "@/lib/notifications/org-notification-settings";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  CHANNEL_COPY,
  NOTIFICATION_CHANNELS,
  peopleLabel,
  useAlertsModel,
  type AlertsModel,
} from "./useAlertsModel";

type NotificationsSettingsPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  schoolName: string;
};

const CHANNEL_ICONS: Record<NotificationChannel, { icon: LucideIcon; tint: string }> = {
  applications: { icon: FileText, tint: "bg-[var(--sf-sky)]" },
  payments: { icon: CreditCard, tint: "bg-[var(--sf-mint)]" },
  visits: { icon: CalendarClock, tint: "bg-[var(--sf-butter)]" },
  committees: { icon: Users, tint: "bg-[var(--sf-lav)]" },
  program_signups: { icon: Sparkles, tint: "bg-[var(--sf-peach)]" },
  staff_hours: { icon: Clock3, tint: "bg-[var(--sf-sky)]" },
};

/** Alerts (admin Garden): who gets an email when something happens at school. */
export default function NotificationsSettingsPage({
  organizationId,
  schoolName,
}: NotificationsSettingsPageProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const model = useAlertsModel({ organizationId });
  const [focusToken, setFocusToken] = useState(0);

  const needs = model.channelsNeedingAction;
  const statusParts = [`Email alerts for ${schoolName}`];
  if (!model.loading && !model.loadError) {
    statusParts.push(`${model.channelsOn} of ${NOTIFICATION_CHANNELS.length} channels on`);
    statusParts.push(
      needs.length === 0
        ? "every channel has recipients"
        : `${needs.length} need${needs.length === 1 ? "s" : ""} recipients`,
    );
  }

  const goToFirstNeedingAction = () => {
    const first = needs[0];
    if (!first) return;
    model.selectChannel(first);
    setFocusToken((token) => token + 1);
  };

  let content;
  if (model.loading) {
    content = <AdminGardenPageSkeleton label="Loading alerts" layout="split" />;
  } else if (model.loadError) {
    content = (
      <GCard index={1}>
        <GardenLoadError
          title="Couldn't load your alert settings."
          description={`${model.loadError} Nothing has changed.`}
          onRetry={() => void model.loadSettings()}
        />
      </GCard>
    );
  } else {
    content = (
      <>
        {needs.length > 0 ? (
          <GardenLeadStrip
            icon={BellRing}
            title={
              needs.length === 1
                ? `${CHANNEL_COPY[needs[0]].title} alerts have no recipients.`
                : `${needs.length} alert channels have no recipients.`
            }
            meta="Those emails go nowhere until someone is on the list."
            cta={needs.length === 1 ? "Add a recipient" : "Review channels"}
            onClick={goToFirstNeedingAction}
            data-testid="alerts-needs-attention-banner"
          />
        ) : null}

        <div className={GARDEN_LIST_DETAIL_GRID}>
          <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-4">
            <ChannelList model={model} />
            <ParentRemindersCard model={model} />
          </div>
          <ChannelDetail model={model} focusToken={focusToken} />
        </div>
      </>
    );
  }

  return (
    <AdminGardenPage theme={theme} data-testid="notifications-settings-page">
      <AdminGardenPageHeader
        kicker="Workspace"
        title={<span className="text-[var(--sf-clay)]">Alerts</span>}
        subtitle={statusParts.join(" · ")}
        refresh={
          model.loading || model.loadError
            ? undefined
            : {
                onRefresh: () => void model.loadSettings({ silent: true, announce: true }),
                refreshing: model.refreshing,
                lastUpdatedAt: model.lastUpdatedAt,
                label: "Refresh alerts",
              }
        }
        data-testid="alerts-story-header"
      />
      {content}
    </AdminGardenPage>
  );
}

/* ------------------------------------------------------------------ */

function channelState(model: AlertsModel, channel: NotificationChannel) {
  const settings = model.settings[channel];
  const recipients = model.recipients[channel];
  const count = recipients.allRecipients.length;
  const needsAction = recipients.needsAction;
  return { enabled: settings.enabled, count, needsAction };
}

function ChannelList({ model }: { model: AlertsModel }) {
  return (
    <GCard index={1} kicker="Channels" title="What we email about">
      <ul className="m-0 -mx-2 flex list-none flex-col gap-0.5 p-0" aria-label="Alert channels">
        {NOTIFICATION_CHANNELS.map((channel) => {
          const { enabled, count, needsAction } = channelState(model, channel);
          const selected = model.activeChannel === channel;
          const flashed = model.lastSavedKey === channel;
          const { icon: Icon, tint } = CHANNEL_ICONS[channel];
          const pending = model.pendingKey?.startsWith(`${channel}-`) ?? false;
          return (
            <li key={channel}>
              <button
                type="button"
                id={`alerts-tab-${channel}`}
                aria-controls="alerts-panel"
                aria-current={selected ? "true" : undefined}
                onClick={() => {
                  model.selectChannel(channel);
                  // Phones/tablets: the detail sits under the list, so bring it into view.
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    window.setTimeout(
                      () => document.getElementById("alerts-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }),
                      60,
                    );
                  }
                }}
                className={`${ROW_INTERACTIVE} duration-300 ${
                  flashed
                    ? "!bg-[var(--sf-mint)]"
                    : selected
                      ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-inset ring-[var(--sf-clay)]/35"
                      : ""
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/15 ${tint}`}
                >
                  <Icon className="h-4 w-4 text-[var(--sf-ink)]/75" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                    {CHANNEL_COPY[channel].title}
                  </span>
                  <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                    {enabled ? `On · ${count === 0 ? "no recipients" : peopleLabel(count)}` : "Off"}
                  </span>
                </span>
                {pending ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--sf-clay)]" aria-label="Saving" />
                ) : needsAction ? (
                  <GChip tone="warning">Action needed</GChip>
                ) : enabled ? (
                  <GChip tone="success">On</GChip>
                ) : (
                  <GChip tone="neutral">Off</GChip>
                )}
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/30 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </GCard>
  );
}

function ParentRemindersCard({ model }: { model: AlertsModel }) {
  const enabled = model.settings.parent_reminders.incomplete_admissions.enabled;
  const busy = model.pendingKey === "parent-reminders";
  return (
    <GCard index={2} kicker="Families" title="Parent reminders" data-testid="parent-reminders-card">
      <p className="m-0 mb-4 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
        Outbound emails to families — separate from the staff alert channels.
      </p>
      <div
        className={`rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 p-3.5 transition-colors duration-300 ${
          model.lastSavedKey === "parent-reminders" ? "bg-[var(--sf-mint)]" : "bg-[var(--sf-paper)]"
        }`}
      >
        <GardenSwitch
          checked={enabled}
          busy={busy}
          disabled={model.saving && !busy}
          onChange={(next) => void model.setParentReminders(next)}
          label="Email families with unfinished applications or enrollment"
          description="Sends up to two reminders: first after 72 hours of inactivity, then again 7 days later. The school contact in those emails comes from your Applications alert channel."
          data-testid="parent-reminders-switch"
        />
      </div>
    </GCard>
  );
}

function ChannelDetail({ model, focusToken }: { model: AlertsModel; focusToken: number }) {
  const reduce = useReducedMotion() === true;
  const channel = model.activeChannel;
  const copy = CHANNEL_COPY[channel];
  const { enabled, needsAction } = channelState(model, channel);
  const showActionNeeded = enabled && needsAction;

  return (
    <GCard
      index={2}
      id="alerts-panel"
      kicker="Alert channel"
      title={copy.title}
      action={
        showActionNeeded ? (
          <GChip tone="warning">Action needed</GChip>
        ) : enabled ? (
          <GChip tone="success">On</GChip>
        ) : (
          <GChip tone="neutral">Off</GChip>
        )
      }
      data-testid="notification-channel-card"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={channel}
          role="region"
          aria-labelledby={`alerts-tab-${channel}`}
          id={`alerts-panel-${channel}`}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: PORTAL_EASE }}
        >
          {/* Keyed by channel so the email draft resets when switching. */}
          <ChannelDetailBody key={channel} model={model} channel={channel} focusToken={focusToken} />
        </motion.div>
      </AnimatePresence>
    </GCard>
  );
}

function ChannelDetailBody({
  model,
  channel,
  focusToken,
}: {
  model: AlertsModel;
  channel: NotificationChannel;
  focusToken: number;
}) {
  const copy = CHANNEL_COPY[channel];
  const settings = model.settings[channel];
  const recipients = model.recipients[channel];
  const [emailDraft, setEmailDraft] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The lead strip's "Add a recipient" lands the cursor in the email field.
  useEffect(() => {
    if (focusToken === 0) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [focusToken]);

  const enabledKey = `${channel}-enabled`;
  const orgAdminsKey = `${channel}-org-admins`;
  const addKey = `${channel}-email-add`;
  const atLimit = settings.additional_emails.length >= MAX_NOTIFY_EMAILS;
  const adding = model.pendingKey === addKey;

  const visibleOrgAdminEmails = settings.include_org_admins ? recipients.orgAdminEmails : [];
  const rows = [
    ...visibleOrgAdminEmails.map((email) => ({ email, role: "Org admin" as const })),
    ...recipients.additionalEmails.map((email) => ({ email, role: "Additional" as const })),
  ];

  const handleAddEmail = async () => {
    const candidate = emailDraft.trim().toLowerCase();
    if (!candidate) return;
    const nextEmails = normalizeNotificationEmails([...settings.additional_emails, candidate]);
    if (nextEmails.length === settings.additional_emails.length) {
      setEmailError(
        settings.additional_emails.includes(candidate)
          ? "That email is already on the list."
          : "Enter a valid email address.",
      );
      return;
    }
    if (nextEmails.length > MAX_NOTIFY_EMAILS) {
      setEmailError(`Add at most ${MAX_NOTIFY_EMAILS} notification emails.`);
      return;
    }
    setEmailError(null);
    // The draft clears once the address is saved (also after a toast Retry);
    // on failure what they typed stays put.
    await model.addEmail(channel, candidate, () => setEmailDraft(""));
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 text-[13.5px] font-semibold leading-snug text-[var(--sf-soft)]">{copy.description}</p>

      <GardenNumberedSection step={1} title="Turn it on" done={settings.enabled} id={`alerts-${channel}-step-on`}>
        <div className="flex flex-col gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
          <GardenSwitch
            checked={settings.enabled}
            busy={model.pendingKey === enabledKey}
            disabled={model.saving && model.pendingKey !== enabledKey}
            onChange={(next) => {
              if (!next) {
                setEmailDraft("");
                setEmailError(null);
              }
              void model.setChannelEnabled(channel, next);
            }}
            label={copy.toggleLabel}
            data-testid="notification-channel-enabled"
          />
          {settings.enabled ? (
            <div className="border-t border-[var(--sf-ink)]/[0.08] pt-3">
              <GardenSwitch
                checked={settings.include_org_admins}
                busy={model.pendingKey === orgAdminsKey}
                disabled={model.saving && model.pendingKey !== orgAdminsKey}
                onChange={(next) => void model.setIncludeOrgAdmins(channel, next)}
                label="Include org admins"
                description="Notify all active org admin accounts"
                data-testid="notification-channel-org-admins"
              />
            </div>
          ) : null}
        </div>
      </GardenNumberedSection>

      {!settings.enabled ? (
        <GardenNotice tone="info" title="Notifications are turned off.">
          Turn this channel on to choose who gets these emails.
        </GardenNotice>
      ) : (
        <>
          <GardenNumberedSection
            step={2}
            title="Who gets these emails"
            description={rows.length > 0 ? peopleLabel(rows.length) : undefined}
            done={rows.length > 0}
            id={`alerts-${channel}-step-recipients`}
          >
            {rows.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label={`${copy.title} recipients`}>
                {rows.map(({ email, role }) => {
                  const removeKey = `${channel}-email-remove:${email}`;
                  const removing = model.pendingKey === removeKey;
                  const flashed = model.lastSavedKey === `${channel}:${email}`;
                  return (
                    <li
                      key={`${role}-${email}`}
                      className={`flex items-center justify-between gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 transition-colors duration-300 ${
                        flashed
                          ? "border-[var(--sf-forest)]/25 bg-[var(--sf-mint)]"
                          : "border-[var(--sf-ink)]/[0.08] bg-white"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <GChip tone={role === "Org admin" ? "info" : "neutral"}>{role}</GChip>
                        <span className="min-w-0 truncate text-[14px] font-bold text-[var(--sf-ink)]">{email}</span>
                      </span>
                      {role === "Additional" ? (
                        <button
                          type="button"
                          className={gIconBtn}
                          onClick={() => void model.removeEmail(channel, email)}
                          disabled={model.saving}
                          aria-busy={removing || undefined}
                          aria-label={`Remove ${email}`}
                        >
                          {removing ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <GardenNotice tone="warning" title="No recipients yet." role="status">
                Add an email below or invite an org admin.
              </GardenNotice>
            )}
          </GardenNumberedSection>

          <GardenNumberedSection
            step={3}
            title="Add someone"
            description={`Up to ${MAX_NOTIFY_EMAILS} extra addresses · ${settings.additional_emails.length} used`}
            id={`alerts-${channel}-step-add`}
          >
            <GardenField
              id={`alerts-${channel}-email`}
              label={<span className="sr-only">Email address</span>}
              error={emailError}
              hint={atLimit ? `You've added the maximum of ${MAX_NOTIFY_EMAILS} emails. Remove one to add another.` : undefined}
            >
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleAddEmail();
                }}
              >
                <input
                  ref={inputRef}
                  id={`alerts-${channel}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={emailDraft}
                  onChange={(event) => {
                    setEmailDraft(event.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="admissions@school.com"
                  disabled={model.saving || atLimit}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? `alerts-${channel}-email-error` : undefined}
                  className={gInputClass(emailError, "sm:flex-1")}
                  data-garden-skip
                  data-testid="add-notification-recipient-email"
                />
                <button
                  type="submit"
                  className={gBtnOutlineSm}
                  disabled={model.saving || !emailDraft.trim() || atLimit}
                  aria-busy={adding || undefined}
                  data-testid="add-notification-recipient-button"
                >
                  <BusyLabel busy={adding} busyLabel="Adding…" icon={<Plus className="h-4 w-4" aria-hidden />}>
                    Add email
                  </BusyLabel>
                </button>
              </form>
            </GardenField>
          </GardenNumberedSection>
        </>
      )}
    </div>
  );
}
