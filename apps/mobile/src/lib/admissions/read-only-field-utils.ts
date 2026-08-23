import type { ApplicationField } from '@/lib/admissions/application-form-schema';

export type ApplicationFileUploadMeta = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

export function parseApplicationFileFieldValue(value: string): ApplicationFileUploadMeta[] {
  if (!value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ApplicationFileUploadMeta =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as ApplicationFileUploadMeta).storagePath === 'string' &&
        typeof (item as ApplicationFileUploadMeta).fileName === 'string',
    );
  } catch {
    return [];
  }
}

export function parseChecklistFileResponses(
  responses: Record<string, unknown> | null | undefined,
): ApplicationFileUploadMeta[] {
  const files = responses?.files;
  if (!Array.isArray(files)) return [];
  return files.filter(
    (item): item is ApplicationFileUploadMeta =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as ApplicationFileUploadMeta).storagePath === 'string' &&
      typeof (item as ApplicationFileUploadMeta).fileName === 'string',
  );
}

export function formatReadOnlyFieldValue(field: ApplicationField, value: string | undefined): string {
  if (!value) return '—';

  if (field.type === 'checkbox') {
    return value === 'true' || value === 'on' || value === '1' ? 'Yes' : 'No';
  }

  if (field.type === 'select' || field.type === 'radio') {
    const option = field.options?.find((entry) => entry.value === value);
    return option?.label ?? value;
  }

  if (field.type === 'file') {
    const files = parseApplicationFileFieldValue(value);
    if (files.length === 0) return '—';
    return files.map((file) => file.fileName).join(', ');
  }

  if (field.type === 'address') {
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      const parts = [
        parsed.line1,
        parsed.line2,
        parsed.city,
        parsed.state,
        parsed.postalCode,
      ]
        .filter((part) => typeof part === 'string' && part.trim())
        .map((part) => String(part).trim());
      return parts.length > 0 ? parts.join(', ') : '—';
    } catch {
      return value;
    }
  }

  return value;
}

export function parseStoredSignerName(
  responses: Record<string, unknown> | null | undefined,
): string {
  const signerName = responses?.signerName;
  return typeof signerName === 'string' ? signerName : '';
}
