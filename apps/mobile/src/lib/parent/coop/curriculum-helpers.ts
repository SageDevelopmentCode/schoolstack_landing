import type { ParentCoopCurriculumRecord } from '@/lib/parent/parent-portal-api';

/**
 * The name a parent sees for a guide: the admin's display name, else the file
 * name tidied up ("Math 6 Book 1_1.2_compressed.pdf" → "Math 6 Book 1 1.2").
 * Display only; the record keeps its real file name.
 */
export function curriculumGuideLabel(
  record: Pick<ParentCoopCurriculumRecord, 'displayName' | 'fileName'>,
): string {
  const display = record.displayName?.trim();
  if (display) return display;
  const tidied = record.fileName
    .replace(/\.pdf$/i, '')
    .replace(/[_-]?compressed[_-]?/gi, ' ')
    .replace(/^compressed/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return tidied || record.fileName || 'Curriculum guide';
}

/** "64 MB" / "820 KB" for the guide card; null when the size is unknown. */
export function formatGuideFileSize(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
