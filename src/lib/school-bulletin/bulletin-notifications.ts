import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import {
  buildEmailNotificationContext,
  sendBulletinPublishedEmail,
  truncateBulletinBodyExcerpt,
} from "@/lib/emails";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import { schoolParentRootPath } from "@/lib/organization-settings/parent-routes";
import { reportOperationalError } from "@/lib/operational-errors";
import { getRuntimeSiteUrl } from "@/lib/site";
import {
  formatBulletinAudiencesLabel,
  isBulletinPostActive,
} from "./bulletin-audience";
import { resolveBulletinEmailRecipients } from "./bulletin-notification-audience";
import {
  mapBulletinAttachmentRow,
  mapBulletinPostRow,
  type BulletinAttachmentRow,
  type BulletinPostRow,
} from "./mappers";
import type { BulletinPost } from "./types";

const POST_SELECT = `
  id,
  organization_id,
  title,
  body,
  status,
  audiences,
  program_ids,
  published_at,
  expires_at,
  created_by,
  created_at,
  updated_at
`;

async function listProgramNameById(
  admin: SupabaseClient,
  organizationId: string,
): Promise<Map<string, string>> {
  const { data, error } = await admin
    .from("programs")
    .select("id, name")
    .eq("organization_id", organizationId);

  if (error) throw error;

  return new Map(
    (data ?? []).map((row) => [String(row.id), String(row.name ?? "Program")]),
  );
}

async function loadBulletinPostForNotifications(
  admin: SupabaseClient,
  organizationId: string,
  postId: string,
): Promise<BulletinPost | null> {
  const { data, error } = await admin
    .from("school_bulletin_posts")
    .select(POST_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: attachments, error: attachmentError } = await admin
    .from("school_bulletin_attachments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (attachmentError) throw attachmentError;

  const programNameById = await listProgramNameById(admin, organizationId);
  const programIds = (data as BulletinPostRow).program_ids ?? [];
  const programNames = programIds
    .map((id) => programNameById.get(String(id)))
    .filter((name): name is string => Boolean(name));

  return mapBulletinPostRow(
    data as BulletinPostRow,
    (attachments ?? []).map((row) =>
      mapBulletinAttachmentRow(row as BulletinAttachmentRow),
    ),
    programNames,
  );
}

type OrganizationBulletinContext = {
  schoolName: string;
  schoolSlug: string;
  bulletinEnabled: boolean;
};

async function loadOrganizationBulletinContext(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationBulletinContext | null> {
  const { data: org, error } = await admin
    .from("organizations")
    .select(
      `
      name,
      slug,
      organization_settings (
        features
      )
    `,
    )
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!org?.slug) return null;

  const settings = org.organization_settings as
    | { features?: Record<string, unknown> }
    | { features?: Record<string, unknown> }[]
    | null;
  const settingsRow = Array.isArray(settings) ? settings[0] : settings;

  const features = mergeFeatures(
    settingsRow?.features as Record<string, unknown> | null | undefined,
  );

  return {
    schoolName: String(org.name ?? "Your school"),
    schoolSlug: String(org.slug),
    bulletinEnabled: Boolean(features.admin?.bulletin),
  };
}

async function loadPublisherName(
  admin: SupabaseClient,
  staffMemberId?: string | null,
): Promise<string | null> {
  if (!staffMemberId) return null;

  const { data, error } = await admin
    .from("staff_members")
    .select("first_name, last_name")
    .eq("id", staffMemberId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
  return name || null;
}

async function tryClaimBulletinPublishedEmailSend(
  admin: SupabaseClient,
  organizationId: string,
  postId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("school_bulletin_posts")
    .update({ published_email_sent_at: new Date().toISOString() })
    .eq("organization_id", organizationId)
    .eq("id", postId)
    .is("published_email_sent_at", null)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function clearBulletinPublishedEmailSent(
  admin: SupabaseClient,
  organizationId: string,
  postId: string,
): Promise<void> {
  const { error } = await admin
    .from("school_bulletin_posts")
    .update({ published_email_sent_at: null })
    .eq("organization_id", organizationId)
    .eq("id", postId);

  if (error) throw error;
}

export type SendBulletinPublishedEmailNotificationsInput = {
  organizationId: string;
  post: BulletinPost;
  publisherStaffId?: string | null;
  emailSurface?: "web" | "cron";
};

export type BulletinNotificationDeps = {
  loadOrganizationContext?: typeof loadOrganizationBulletinContext;
  loadPublisherName?: typeof loadPublisherName;
  resolveRecipients?: typeof resolveBulletinEmailRecipients;
  sendEmail?: typeof sendBulletinPublishedEmail;
  tryClaimSent?: typeof tryClaimBulletinPublishedEmailSend;
  clearSent?: typeof clearBulletinPublishedEmailSent;
  logSettledNotificationFailures?: typeof logSettledNotificationFailures;
};

export async function sendBulletinPublishedEmailNotifications(
  admin: SupabaseClient,
  input: SendBulletinPublishedEmailNotificationsInput,
  deps: BulletinNotificationDeps = {},
): Promise<{ emailsAttempted: number; emailsSucceeded: number }> {
  const loadOrganizationContext =
    deps.loadOrganizationContext ?? loadOrganizationBulletinContext;
  const resolvePublisherName = deps.loadPublisherName ?? loadPublisherName;
  const resolveRecipients = deps.resolveRecipients ?? resolveBulletinEmailRecipients;
  const sendEmail = deps.sendEmail ?? sendBulletinPublishedEmail;
  const tryClaimSent =
    deps.tryClaimSent ?? tryClaimBulletinPublishedEmailSend;
  const clearSent = deps.clearSent ?? clearBulletinPublishedEmailSent;
  const logFailures =
    deps.logSettledNotificationFailures ?? logSettledNotificationFailures;

  const org = await loadOrganizationContext(admin, input.organizationId);
  if (!org?.bulletinEnabled) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const programNameById = await listProgramNameById(admin, input.organizationId);
  const audienceLabel = formatBulletinAudiencesLabel(
    input.post.audiences,
    programNameById,
    input.post.programIds,
  );
  const excerpt = truncateBulletinBodyExcerpt(input.post.body);
  const publisherName = await resolvePublisherName(admin, input.publisherStaffId);

  const recipients = await resolveRecipients(
    admin,
    input.organizationId,
    input.post.audiences,
    input.post.programIds,
  );

  const claimed = await tryClaimSent(
    admin,
    input.organizationId,
    input.post.id,
  );
  if (!claimed) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  if (recipients.length === 0) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const parentPortalUrl = `${getRuntimeSiteUrl()}${schoolParentRootPath(org.schoolSlug)}`;
  const teacherPortalUrl = `${getRuntimeSiteUrl()}/school/${org.schoolSlug}/teacher`;
  const emailNotificationContext = buildEmailNotificationContext({
    organizationId: input.organizationId,
    organizationSlug: org.schoolSlug,
    surface: input.emailSurface ?? "web",
    entityType: "school_bulletin_post",
    entityId: input.post.id,
  });

  const emailSendPromises = recipients.map((recipient) =>
    sendEmail({
      to: recipient.email,
      schoolName: org.schoolName,
      postTitle: input.post.title,
      audienceLabel,
      excerpt,
      attachmentCount: input.post.attachments.length,
      portalUrl:
        recipient.portal === "teacher" ? teacherPortalUrl : parentPortalUrl,
      publisherName,
      recipientAudience:
        recipient.portal === "teacher" ? "teacher" : "parent",
      notificationContext: emailNotificationContext,
    }),
  );

  const emailResults = await Promise.allSettled(emailSendPromises);
  await logFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "bulletin_post_published_email",
      entityType: "school_bulletin_post",
      entityId: input.post.id,
    },
    emailResults,
  );

  const emailsSucceeded = emailResults.filter(
    (result) => result.status === "fulfilled" && result.value.ok,
  ).length;

  if (emailsSucceeded !== recipients.length) {
    await clearSent(admin, input.organizationId, input.post.id);
  }

  return {
    emailsAttempted: recipients.length,
    emailsSucceeded,
  };
}

export async function maybeSendBulletinEmailsOnPublish(
  admin: SupabaseClient,
  input: SendBulletinPublishedEmailNotificationsInput,
  deps?: BulletinNotificationDeps,
): Promise<void> {
  if (!isBulletinPostActive(input.post)) {
    return;
  }

  await sendBulletinPublishedEmailNotifications(admin, input, deps);
}

export function fireBulletinPublishedEmailNotifications(
  admin: SupabaseClient,
  promise: Promise<void>,
  input: { organizationId: string; postId: string },
): void {
  void promise.catch((err) => {
    void reportOperationalError({
      supabase: admin,
      surface: "system",
      organizationId: input.organizationId,
      operation: "bulletin_post_published_email",
      error:
        err instanceof Error
          ? err.message
          : "Failed to send bulletin published email notifications.",
      entityType: "school_bulletin_post",
      entityId: input.postId,
      actor: { type: "system" },
      cause: err,
    });
  });
}

export type PendingBulletinEmailCronResult = {
  postsProcessed: number;
  emailsAttempted: number;
  emailsSucceeded: number;
  failures: number;
};

export async function sendPendingScheduledBulletinEmailsForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  deps?: BulletinNotificationDeps,
): Promise<PendingBulletinEmailCronResult> {
  const org = await (deps?.loadOrganizationContext ?? loadOrganizationBulletinContext)(
    admin,
    organizationId,
  );
  if (!org?.bulletinEnabled) {
    return {
      postsProcessed: 0,
      emailsAttempted: 0,
      emailsSucceeded: 0,
      failures: 0,
    };
  }

  const nowIso = new Date().toISOString();
  const { data: rows, error } = await admin
    .from("school_bulletin_posts")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "published")
    .is("published_email_sent_at", null)
    .lte("published_at", nowIso);

  if (error) throw error;

  let postsProcessed = 0;
  let emailsAttempted = 0;
  let emailsSucceeded = 0;
  let failures = 0;

  for (const row of rows ?? []) {
    const postId = String(row.id);
    const post = await loadBulletinPostForNotifications(admin, organizationId, postId);
    if (!post || !isBulletinPostActive(post)) continue;

    postsProcessed += 1;
    try {
      const result = await sendBulletinPublishedEmailNotifications(
        admin,
        {
          organizationId,
          post,
          publisherStaffId: post.createdBy,
          emailSurface: "cron",
        },
        deps,
      );
      emailsAttempted += result.emailsAttempted;
      emailsSucceeded += result.emailsSucceeded;
      if (result.emailsAttempted > 0 && result.emailsSucceeded === 0) {
        failures += 1;
      }
    } catch {
      failures += 1;
    }
  }

  return {
    postsProcessed,
    emailsAttempted,
    emailsSucceeded,
    failures,
  };
}
