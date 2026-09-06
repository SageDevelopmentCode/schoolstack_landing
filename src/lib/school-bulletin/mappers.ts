import type {
  BulletinAttachment,
  BulletinAudience,
  BulletinPost,
  BulletinPostStatus,
} from "./types";

export type BulletinPostRow = {
  id: string;
  organization_id: string;
  title: string;
  body: string;
  status: BulletinPostStatus;
  audiences: BulletinAudience[] | null;
  program_ids: string[] | null;
  published_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BulletinAttachmentRow = {
  id: string;
  post_id: string;
  organization_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

const VALID_AUDIENCES: BulletinAudience[] = [
  "school_wide",
  "parents",
  "teachers",
  "program",
];

export function normalizeBulletinAudiences(
  audiences: BulletinAudience[] | null | undefined,
): BulletinAudience[] {
  if (!audiences?.length) return ["school_wide"];
  const unique = [...new Set(audiences.filter((value) => VALID_AUDIENCES.includes(value)))];
  return unique.length > 0 ? unique : ["school_wide"];
}

export function normalizeBulletinProgramIds(
  programIds: string[] | null | undefined,
): string[] {
  if (!programIds?.length) return [];
  return [...new Set(programIds.map((id) => String(id)).filter(Boolean))];
}

export function mapBulletinAttachmentRow(row: BulletinAttachmentRow): BulletinAttachment {
  return {
    id: String(row.id),
    fileName: String(row.file_name),
    storagePath: String(row.storage_path),
    mimeType: typeof row.mime_type === "string" ? row.mime_type : null,
    sizeBytes: row.size_bytes != null ? Number(row.size_bytes) : null,
  };
}

export function mapBulletinPostRow(
  row: BulletinPostRow,
  attachments: BulletinAttachment[] = [],
  programNames: string[] = [],
): BulletinPost {
  const programIds = normalizeBulletinProgramIds(row.program_ids);

  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    title: String(row.title),
    body: String(row.body ?? ""),
    status: row.status,
    audiences: normalizeBulletinAudiences(row.audiences),
    programIds,
    programNames: programNames.length > 0 ? programNames : undefined,
    publishedAt: row.published_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    attachments,
  };
}
