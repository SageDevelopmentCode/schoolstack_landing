export type GalleryPhoto = {
  id: string;
  organizationId: string;
  photoDate: string;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadBatchId: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  uploadedByName?: string;
};

export type GalleryPhotoRow = {
  id: string;
  organization_id: string;
  photo_date: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  upload_batch_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};
