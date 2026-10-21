import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import {
  buildEmailNotificationContext,
  sendGalleryPhotosUploadedEmail,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { reportOperationalError } from "@/lib/operational-errors";
import { listAllEnrolledParentFamilyIds } from "@/lib/school-bulletin/bulletin-notification-audience";
import { getRuntimeSiteUrl } from "@/lib/site";
import type { GalleryUploadSurface } from "./gallery-activity";
import { formatGalleryDateLabel } from "./format-gallery-date";
import { isSchoolGalleryEnabled } from "./gallery-enabled";

const PARENT_EMAIL_SENT_METADATA_KEY = "parentEmailSentAt";

export type SendGalleryPhotosUploadedParentEmailsInput = {
  organizationId: string;
  uploadBatchId: string;
  photoCount: number;
  photoDate: string;
  uploaderName: string;
  activityEventId: string | null;
};

type OrganizationGalleryContext = {
  schoolName: string;
  schoolSlug: string;
  galleryEnabled: boolean;
};

export type GalleryNotificationDeps = {
  loadOrganizationContext?: (
    admin: SupabaseClient,
    organizationId: string,
  ) => Promise<OrganizationGalleryContext | null>;
  listEnrolledFamilyIds?: typeof listAllEnrolledParentFamilyIds;
  loadFamilyNotificationEmails?: typeof loadFamilyNotificationEmails;
  tryClaimSent?: (
    admin: SupabaseClient,
    activityEventId: string,
  ) => Promise<boolean>;
  clearSent?: (
    admin: SupabaseClient,
    activityEventId: string,
  ) => Promise<void>;
  sendEmail?: typeof sendGalleryPhotosUploadedEmail;
  logSettledNotificationFailures?: typeof logSettledNotificationFailures;
};

async function loadOrganizationGalleryContext(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationGalleryContext | null> {
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
    galleryEnabled: isSchoolGalleryEnabled(features),
  };
}

async function tryClaimGalleryUploadParentEmailSend(
  admin: SupabaseClient,
  activityEventId: string,
): Promise<boolean> {
  const { data: row, error: fetchError } = await admin
    .from("activity_events")
    .select("id, metadata")
    .eq("id", activityEventId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!row) return false;

  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  if (metadata[PARENT_EMAIL_SENT_METADATA_KEY] != null) {
    return false;
  }

  const sentAt = new Date().toISOString();
  const { data, error } = await admin
    .from("activity_events")
    .update({
      metadata: {
        ...metadata,
        [PARENT_EMAIL_SENT_METADATA_KEY]: sentAt,
      },
    })
    .eq("id", activityEventId)
    .filter(`metadata->>${PARENT_EMAIL_SENT_METADATA_KEY}`, "is", null)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function clearGalleryUploadParentEmailSent(
  admin: SupabaseClient,
  activityEventId: string,
): Promise<void> {
  const { data: row, error: fetchError } = await admin
    .from("activity_events")
    .select("metadata")
    .eq("id", activityEventId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!row) return;

  const metadata = { ...(row.metadata ?? {}) } as Record<string, unknown>;
  delete metadata[PARENT_EMAIL_SENT_METADATA_KEY];

  const { error } = await admin
    .from("activity_events")
    .update({ metadata })
    .eq("id", activityEventId);

  if (error) throw error;
}

export async function sendGalleryPhotosUploadedParentEmails(
  admin: SupabaseClient,
  input: SendGalleryPhotosUploadedParentEmailsInput,
  deps: GalleryNotificationDeps = {},
): Promise<{ emailsAttempted: number; emailsSucceeded: number }> {
  const loadOrganizationContext =
    deps.loadOrganizationContext ?? loadOrganizationGalleryContext;
  const listEnrolledFamilyIds =
    deps.listEnrolledFamilyIds ?? listAllEnrolledParentFamilyIds;
  const loadFamilyEmails =
    deps.loadFamilyNotificationEmails ?? loadFamilyNotificationEmails;
  const tryClaimSent =
    deps.tryClaimSent ?? tryClaimGalleryUploadParentEmailSend;
  const clearSent = deps.clearSent ?? clearGalleryUploadParentEmailSent;
  const sendEmail = deps.sendEmail ?? sendGalleryPhotosUploadedEmail;
  const logFailures =
    deps.logSettledNotificationFailures ?? logSettledNotificationFailures;

  const org = await loadOrganizationContext(admin, input.organizationId);
  if (!org?.galleryEnabled) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  if (!input.activityEventId) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const claimed = await tryClaimSent(admin, input.activityEventId);
  if (!claimed) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const familyIds = await listEnrolledFamilyIds(admin, input.organizationId);
  if (familyIds.length === 0) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const uploaderName = input.uploaderName.trim() || "Someone";
  const photoDateLabel = formatGalleryDateLabel(input.photoDate);
  const photosUrl = `${getRuntimeSiteUrl()}${schoolParentPath(org.schoolSlug, "photos")}`;
  const emailNotificationContext = buildEmailNotificationContext({
    organizationId: input.organizationId,
    organizationSlug: org.schoolSlug,
    surface: "web",
    entityType: "school_gallery_upload_batch",
    entityId: input.uploadBatchId,
  });

  const emailSendPromises: Promise<{ ok: boolean }>[] = [];
  const seenEmails = new Set<string>();

  for (const familyId of familyIds) {
    const emails = await loadFamilyEmails(admin, familyId);
    for (const email of emails) {
      const normalized = email.trim().toLowerCase();
      if (!normalized || seenEmails.has(normalized)) continue;
      seenEmails.add(normalized);
      emailSendPromises.push(
        sendEmail({
          to: normalized,
          schoolName: org.schoolName,
          uploaderName,
          photoCount: input.photoCount,
          photoDateLabel,
          photosUrl,
          notificationContext: emailNotificationContext,
        }),
      );
    }
  }

  if (emailSendPromises.length === 0) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const emailResults = await Promise.allSettled(emailSendPromises);
  await logFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "school_gallery_photos_uploaded_email",
      entityType: "school_gallery_upload_batch",
      entityId: input.uploadBatchId,
    },
    emailResults,
  );

  const emailsSucceeded = emailResults.filter(
    (result) => result.status === "fulfilled" && result.value.ok,
  ).length;

  if (emailsSucceeded !== emailSendPromises.length) {
    await clearSent(admin, input.activityEventId);
  }

  return {
    emailsAttempted: emailSendPromises.length,
    emailsSucceeded,
  };
}

export function fireGalleryPhotosUploadedEmailNotifications(
  supabase: SupabaseClient,
  promise: Promise<{ emailsAttempted: number; emailsSucceeded: number }>,
  input: {
    organizationId: string;
    uploadBatchId: string;
    surface: GalleryUploadSurface;
    actorUserId: string;
  },
): void {
  void promise.catch((err) => {
    void reportOperationalError({
      supabase,
      surface: input.surface,
      organizationId: input.organizationId,
      operation: "school_gallery_photos_uploaded_email",
      error:
        err instanceof Error
          ? err.message
          : "Failed to send gallery photos uploaded email notifications.",
      entityType: "school_gallery_upload_batch",
      entityId: input.uploadBatchId,
      actor: {
        type: input.surface === "teacher_portal" ? "teacher" : "school_admin",
        userId: input.actorUserId,
      },
      cause: err,
    });
  });
}
