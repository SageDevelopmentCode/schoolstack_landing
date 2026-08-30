import type { SupabaseClient } from "@supabase/supabase-js";
import { listOrganizationMemberships } from "@/lib/admin/organization-memberships";
import { parseApplicationFormNotificationConfig } from "@/lib/admissions/application-form-schema";
import { mergeFeatures } from "@/lib/organization-settings/merge";

export const MAX_NOTIFY_EMAILS = 10;
/** @deprecated Use MAX_NOTIFY_EMAILS */
export const MAX_PAYMENT_NOTIFY_EMAILS = MAX_NOTIFY_EMAILS;

const NOTIFY_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NotificationChannel = "applications" | "payments" | "visits";

export type NotificationChannelSettings = {
  enabled: boolean;
  include_org_admins: boolean;
  additional_emails: string[];
};

export type OrganizationNotificationSettings = {
  applications: NotificationChannelSettings;
  payments: NotificationChannelSettings;
  visits: NotificationChannelSettings;
};

export type RecipientSummary = {
  orgAdminEmails: string[];
  additionalEmails: string[];
  allRecipients: string[];
  needsAction: boolean;
};

export type OrganizationNotificationRecipients = Record<
  NotificationChannel,
  RecipientSummary
>;

function parseChannelSettings(
  raw: Record<string, unknown> | undefined,
  defaults: NotificationChannelSettings,
): NotificationChannelSettings {
  return {
    enabled:
      typeof raw?.enabled === "boolean" ? raw.enabled : defaults.enabled,
    include_org_admins:
      typeof raw?.include_org_admins === "boolean"
        ? raw.include_org_admins
        : defaults.include_org_admins,
    additional_emails: normalizeNotificationEmails(raw?.additional_emails),
  };
}

export function getDefaultNotificationSettings(): OrganizationNotificationSettings {
  return {
    applications: {
      enabled: true,
      include_org_admins: true,
      additional_emails: [],
    },
    payments: {
      enabled: true,
      include_org_admins: true,
      additional_emails: [],
    },
    visits: {
      enabled: true,
      include_org_admins: true,
      additional_emails: [],
    },
  };
}

export function normalizeNotificationEmails(
  emails: unknown,
  max = MAX_NOTIFY_EMAILS,
): string[] {
  if (!Array.isArray(emails)) return [];

  const normalized: string[] = [];
  for (const value of emails) {
    if (typeof value !== "string") continue;
    const email = value.trim().toLowerCase();
    if (!email || !NOTIFY_EMAIL_PATTERN.test(email)) continue;
    if (!normalized.includes(email)) {
      normalized.push(email);
    }
    if (normalized.length >= max) break;
  }

  return normalized;
}

export function parseOrganizationNotificationSettings(
  stored: Record<string, unknown> | null | undefined,
): OrganizationNotificationSettings {
  const defaults = getDefaultNotificationSettings();
  if (!stored || typeof stored !== "object") {
    return defaults;
  }

  const applicationsRaw =
    stored.applications && typeof stored.applications === "object"
      ? (stored.applications as Record<string, unknown>)
      : undefined;
  const paymentsRaw =
    stored.payments && typeof stored.payments === "object"
      ? (stored.payments as Record<string, unknown>)
      : undefined;
  const visitsRaw =
    stored.visits && typeof stored.visits === "object"
      ? (stored.visits as Record<string, unknown>)
      : undefined;

  return {
    applications: parseChannelSettings(applicationsRaw, defaults.applications),
    payments: parseChannelSettings(paymentsRaw, defaults.payments),
    visits: parseChannelSettings(visitsRaw, defaults.visits),
  };
}

function validateChannelEmails(
  emails: string[],
  channelLabel: string,
): string | null {
  if (emails.length > MAX_NOTIFY_EMAILS) {
    return `Add at most ${MAX_NOTIFY_EMAILS} ${channelLabel} notification emails.`;
  }

  for (const email of emails) {
    if (!NOTIFY_EMAIL_PATTERN.test(email)) {
      return `Invalid email address: ${email}`;
    }
  }

  return null;
}

export function validateOrganizationNotificationSettings(
  settings: OrganizationNotificationSettings,
): string | null {
  return (
    validateChannelEmails(
      settings.applications.additional_emails,
      "application",
    ) ??
    validateChannelEmails(settings.payments.additional_emails, "payment") ??
    validateChannelEmails(settings.visits.additional_emails, "visit")
  );
}

/** @deprecated Use validateOrganizationNotificationSettings */
export function validatePaymentNotificationSettings(
  settings: OrganizationNotificationSettings,
): string | null {
  return validateOrganizationNotificationSettings(settings);
}

export function computeNotificationRecipients(
  channel: NotificationChannelSettings,
  orgAdminEmails: string[],
): RecipientSummary {
  const uniqueOrgAdminEmails = [...new Set(orgAdminEmails)];
  const additionalEmails = channel.additional_emails;
  const activeOrgAdminEmails = channel.include_org_admins
    ? uniqueOrgAdminEmails
    : [];
  const allRecipients = [
    ...new Set([...activeOrgAdminEmails, ...additionalEmails]),
  ];

  return {
    orgAdminEmails: uniqueOrgAdminEmails,
    additionalEmails,
    allRecipients,
    needsAction: channel.enabled && allRecipients.length === 0,
  };
}

export function buildOrganizationNotificationRecipients(
  settings: OrganizationNotificationSettings,
  orgAdminEmails: string[],
): OrganizationNotificationRecipients {
  return {
    applications: computeNotificationRecipients(
      settings.applications,
      orgAdminEmails,
    ),
    payments: computeNotificationRecipients(settings.payments, orgAdminEmails),
    visits: computeNotificationRecipients(settings.visits, orgAdminEmails),
  };
}

export async function resolveOrganizationAdminEmails(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string[]> {
  const memberships = await listOrganizationMemberships(admin, organizationId);
  return [
    ...new Set(
      memberships
        .filter((membership) => membership.status === "active" && membership.email)
        .map((membership) => membership.email!.trim().toLowerCase()),
    ),
  ];
}

export async function collectPublishedFormSubmissionNotifyEmails(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string[]> {
  const { data, error } = await admin
    .from("application_form_versions")
    .select("notification_config")
    .eq("organization_id", organizationId)
    .eq("status", "published");

  if (error) throw error;

  const emails = new Set<string>();
  for (const row of data ?? []) {
    const config = parseApplicationFormNotificationConfig(row.notification_config);
    for (const email of config.submission_notify_emails) {
      emails.add(email);
    }
  }

  return [...emails];
}

export async function maybeMigrateApplicationNotificationEmails(
  admin: SupabaseClient,
  organizationId: string,
  settings: OrganizationNotificationSettings,
): Promise<OrganizationNotificationSettings> {
  if (settings.applications.additional_emails.length > 0) {
    return settings;
  }

  const legacyEmails = await collectPublishedFormSubmissionNotifyEmails(
    admin,
    organizationId,
  );
  if (legacyEmails.length === 0) {
    return settings;
  }

  const nextSettings: OrganizationNotificationSettings = {
    ...settings,
    applications: {
      ...settings.applications,
      additional_emails: normalizeNotificationEmails(legacyEmails),
    },
  };

  const { error } = await admin
    .from("organization_settings")
    .update({ notifications: nextSettings })
    .eq("organization_id", organizationId);

  if (error) throw error;

  return nextSettings;
}

async function resolveChannelNotificationEmails(
  admin: SupabaseClient,
  organizationId: string,
  channel: NotificationChannel,
): Promise<string[]> {
  const { data, error } = await admin
    .from("organization_settings")
    .select("features, notifications")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  const features = mergeFeatures(
    data?.features as Record<string, unknown> | null | undefined,
  );

  if (!features.admin.notifications) {
    return [];
  }

  const settings = parseOrganizationNotificationSettings(
    data?.notifications as Record<string, unknown> | null | undefined,
  );

  const channelSettings = settings[channel];
  if (!channelSettings.enabled) {
    return [];
  }

  const emails = new Set<string>();

  if (channelSettings.include_org_admins) {
    const orgAdminEmails = await resolveOrganizationAdminEmails(
      admin,
      organizationId,
    );

    for (const email of orgAdminEmails) {
      emails.add(email);
    }
  }

  for (const email of channelSettings.additional_emails) {
    emails.add(email);
  }

  return [...emails];
}

export async function loadOrganizationNotificationSettings(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationNotificationSettings> {
  const { data, error } = await admin
    .from("organization_settings")
    .select("notifications")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  return parseOrganizationNotificationSettings(
    data?.notifications as Record<string, unknown> | null | undefined,
  );
}

export async function resolveApplicationNotificationEmails(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string[]> {
  return resolveChannelNotificationEmails(admin, organizationId, "applications");
}

export async function resolvePaymentNotificationEmails(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string[]> {
  return resolveChannelNotificationEmails(admin, organizationId, "payments");
}

export async function resolveVisitNotificationEmails(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string[]> {
  return resolveChannelNotificationEmails(admin, organizationId, "visits");
}
