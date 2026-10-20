import type { GalleryPhoto, GalleryPhotoRow } from "./types";

export function mapGalleryPhotoRow(row: GalleryPhotoRow): GalleryPhoto {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    photoDate: String(row.photo_date),
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes === null ? null : Number(row.size_bytes),
    uploadBatchId: row.upload_batch_id ? String(row.upload_batch_id) : null,
    uploadedBy: row.uploaded_by ? String(row.uploaded_by) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
