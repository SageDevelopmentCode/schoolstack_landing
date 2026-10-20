export type SchoolProfilePhotoRow = {
  id: string;
  organization_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  sort_order: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SchoolProfilePhoto = {
  id: string;
  organizationId: string;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  sortOrder: number;
  createdAt: string;
  url?: string;
};
