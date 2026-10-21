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

export type GalleryPhotosPage = {
  photos: GalleryPhoto[];
  hasMore: boolean;
  nextOffset: number;
};
