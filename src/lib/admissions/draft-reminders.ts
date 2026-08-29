import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveApplicantContact } from "@/lib/admissions/application-notifications";
import { parseApplicationFormNotificationConfig } from "@/lib/admissions/application-form-schema";
import {
  buildDraftApplicationReminderHtml,
  sendDraftApplicationReminderEmail,
} from "@/lib/emails";
import { notifyDraftApplicationReminderSent } from "@/lib/discord";
import { SITE_URL } from "@/lib/site";

type DraftApplicationRow = {
  id: string;
  organization_id: string;
  family_id: string | null;
  created_by_user_id: string | null;
  primary_guardian_id: string | null;
  updated_at: string;
  form_version_id: string;
  application_form_versions:
    | {
        title: string | null;
        notification_config: unknown;
      }
    | {
        title: string | null;
        notification_config: unknown;
      }[]
    | null;
};

type ReminderDeps = {
  sendEmail?: typeof sendDraftApplicationReminderEmail;
  notifyDiscord?: typeof notifyDraftApplicationReminderSent;
  now?: Date;
};

export function isDraftEligibleForReminder(
  updatedAt: string,
  delayHours: number,
  now: Date = new Date(),
): boolean {
  const updatedMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedMs)) {
    return false;
  }

  const cutoffMs = now.getTime() - delayHours * 60 * 60 * 1000;
  return updatedMs <= cutoffMs;
}

function resolveFormVersion(
  row: DraftApplicationRow,
): { title: string | null; notification_config: unknown } | null {
  const joined = row.application_form_versions;
  if (!joined) return null;
  return Array.isArray(joined) ? joined[0] ?? null : joined;
}

export async function sendDraftApplicationReminders(
  supabase: SupabaseClient,
  organizationId: string,
  deps: ReminderDeps = {},
): Promise<number> {
  const sendEmail = deps.sendEmail ?? sendDraftApplicationReminderEmail;
  const notifyDiscord = deps.notifyDiscord ?? notifyDraftApplicationReminderSent;
  const now = deps.now ?? new Date();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;

  const schoolName = String(org?.name ?? "Your school");
  const schoolSlug = String(org?.slug ?? "");

  const { data: drafts, error: draftsError } = await supabase
    .from("applications")
    .select(
      `
        id,
        organization_id,
        family_id,
        created_by_user_id,
        primary_guardian_id,
        updated_at,
        form_version_id,
        application_form_versions (
          title,
          notification_config
        )
      `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "draft")
    .is("draft_reminder_sent_at", null);

  if (draftsError) throw draftsError;
  if (!drafts?.length) return 0;

  const applyDashboardUrl = schoolSlug
    ? `${SITE_URL.replace(/\/$/, "")}/school/${schoolSlug}/apply`
    : SITE_URL;

  let sent = 0;

  for (const draft of drafts as DraftApplicationRow[]) {
    const formVersion = resolveFormVersion(draft);
    if (!formVersion) continue;

    const notificationConfig = parseApplicationFormNotificationConfig(
      formVersion.notification_config,
    );
    const draftReminders = notificationConfig.draft_reminders;
    if (!draftReminders.enabled) continue;

    const contactEmail = draftReminders.contact_email?.trim().toLowerCase() ?? "";
    if (!contactEmail) continue;

    if (
      !isDraftEligibleForReminder(
        draft.updated_at,
        draftReminders.delay_hours,
        now,
      )
    ) {
      continue;
    }

    const contact = await resolveApplicantContact(supabase, draft);
    if (!contact || contact.emails.length === 0) continue;

    const formTitle = String(formVersion.title ?? "your application").trim();
    const html = buildDraftApplicationReminderHtml({
      name: contact.displayName || "there",
      schoolName,
      formTitle,
      applyDashboardUrl,
      contactEmail,
    });

    let delivered = false;
    for (const email of contact.emails) {
      const result = await sendEmail({
        to: email,
        schoolName,
        html,
      });
      if (result.ok) {
        delivered = true;
      }
    }

    if (!delivered) continue;

    const { error: updateError } = await supabase
      .from("applications")
      .update({ draft_reminder_sent_at: now.toISOString() })
      .eq("id", draft.id)
      .eq("organization_id", organizationId)
      .is("draft_reminder_sent_at", null);

    if (updateError) throw updateError;

    void notifyDiscord({
      schoolName,
      schoolSlug,
      applicationId: draft.id,
      formTitle,
      contactName: contact.displayName,
      contactEmail: contact.email,
      recipientEmails: contact.emails,
      schoolContactEmail: contactEmail,
      delayHours: draftReminders.delay_hours,
      sentAt: now.toISOString(),
    }).catch((error) => {
      console.error("Draft reminder Discord notification failed:", error);
    });

    sent += 1;
  }

  return sent;
}
