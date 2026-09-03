import type { ApplicationField } from '@/lib/admissions/application-form-schema';

export type ApplicationFileUploadMeta = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

type ApplicationAddressValue = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

const EMPTY_APPLICATION_ADDRESS: ApplicationAddressValue = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
};

function isApplicationAddressValue(value: unknown): value is ApplicationAddressValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.line1 === 'string' &&
    typeof record.city === 'string' &&
    typeof record.state === 'string' &&
    typeof record.zip === 'string' &&
    (record.line2 === undefined || typeof record.line2 === 'string')
  );
}

function parseApplicationAddressFieldValue(value: string): ApplicationAddressValue {
  if (!value.trim()) return { ...EMPTY_APPLICATION_ADDRESS };
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isApplicationAddressValue(parsed)) {
      return { ...EMPTY_APPLICATION_ADDRESS };
    }
    return {
      line1: parsed.line1,
      line2: parsed.line2 ?? '',
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
    };
  } catch {
    return { ...EMPTY_APPLICATION_ADDRESS };
  }
}

function isApplicationAddressEmpty(address: ApplicationAddressValue): boolean {
  return (
    !address.line1.trim() &&
    !address.line2?.trim() &&
    !address.city.trim() &&
    !address.state.trim() &&
    !address.zip.trim()
  );
}

function formatApplicationAddress(address: ApplicationAddressValue): string {
  const parts: string[] = [];
  const line1 = address.line1.trim();
  const line2 = address.line2?.trim();
  const city = address.city.trim();
  const state = address.state.trim();
  const zip = address.zip.trim();

  if (line1) parts.push(line1);
  if (line2) parts.push(line2);

  const cityStateZip = [city, state].filter(Boolean).join(', ');
  const locality = [cityStateZip, zip].filter(Boolean).join(' ');
  if (locality) parts.push(locality);

  return parts.join(', ');
}

function formatStoredAddressValue(value: string): string | null {
  if (!value.trim().startsWith('{')) return null;
  const address = parseApplicationAddressFieldValue(value);
  if (isApplicationAddressEmpty(address)) return '—';
  return formatApplicationAddress(address);
}

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
    const address = parseApplicationAddressFieldValue(value);
    if (isApplicationAddressEmpty(address)) return '—';
    return formatApplicationAddress(address);
  }

  const formattedAddress = formatStoredAddressValue(value);
  if (formattedAddress !== null) return formattedAddress;

  return value;
}

export function parseStoredSignerName(
  responses: Record<string, unknown> | null | undefined,
): string {
  const signerName = responses?.signerName;
  return typeof signerName === 'string' ? signerName : '';
}
