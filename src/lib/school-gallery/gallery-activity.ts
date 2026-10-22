import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { formatGalleryDateLabel } from "./format-gallery-date";

export type GalleryUploadActorType = "teacher" | "school_admin";
export type GalleryUploadSurface = "teacher_portal" | "school_admin";

export type LogGalleryPhotosUploadedInput = {
  organizationId: string;
  uploadBatchId: string;
  photoCount: number;
  photoDate: string;
  actorType: GalleryUploadActorType;
  actorUserId: string;
  actorName: string;
  surface: GalleryUploadSurface;
};

export function buildGalleryUploadActivitySummary(input: {
  uploaderName: string;
  photoCount: number;
  photoDate: string;
}): string {
  const countLabel = input.photoCount === 1 ? "1 photo" : `${input.photoCount} photos`;
  const dateLabel = formatGalleryDateLabel(input.photoDate);
  return `${input.uploaderName} uploaded ${countLabel} for ${dateLabel}`;
}

export async function logGalleryPhotosUploaded(
  supabase: SupabaseClient,
  input: LogGalleryPhotosUploadedInput,
): Promise<string | null> {
  const uploaderName = input.actorName.trim() || "Someone";
  const summary = buildGalleryUploadActivitySummary({
    uploaderName,
    photoCount: input.photoCount,
    photoDate: input.photoDate,
  });

  return logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    actorName: uploaderName,
    surface: input.surface,
    action: ACTIVITY_ACTIONS.SCHOOL_GALLERY_PHOTOS_UPLOADED,
    entityType: "school_gallery_upload_batch",
    entityId: input.uploadBatchId,
    summary,
    metadata: {
      uploadBatchId: input.uploadBatchId,
      photoCount: input.photoCount,
      photoDate: input.photoDate,
      uploaderName,
      uploaderRole: input.actorType,
    },
  });
}
