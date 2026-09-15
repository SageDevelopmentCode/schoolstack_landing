export type BulletinPostStatus = 'draft' | 'published' | 'archived';

export type BulletinAudience = 'school_wide' | 'parents' | 'teachers' | 'program';

export type BulletinAttachment = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
  downloadUrl?: string;
};

export type BulletinPost = {
  id: string;
  organizationId: string;
  title: string;
  body: string;
  status: BulletinPostStatus;
  audiences: BulletinAudience[];
  programIds: string[];
  programNames?: string[];
  publishedAt?: string;
  expiresAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  attachments: BulletinAttachment[];
};

export type BulletinPostDisplayStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'expired'
  | 'archived';

export type ProgramOption = {
  id: string;
  name: string;
};

export type SaveBulletinPostInput = {
  title: string;
  body: string;
  audiences: BulletinAudience[];
  programIds: string[];
  status: BulletinPostStatus;
  publishedAt: string | null;
  expiresAt: string | null;
};

export type StagedBulletinFile = {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
};
