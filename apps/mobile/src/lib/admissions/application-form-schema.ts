export type ApplicationFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'select'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'address';

export type ApplicationFieldOption = {
  value: string;
  label: string;
};

export type ApplicationField = {
  id: string;
  label: string;
  type: ApplicationFieldType;
  placeholder?: string;
  required?: boolean;
  width?: 'full' | 'half';
  options?: ApplicationFieldOption[];
  rows?: number;
  helpText?: string;
};

export type ApplicationSection = {
  id: string;
  title: string;
  description?: string;
  fields: ApplicationField[];
  allowMultiple?: boolean;
};

export type ApplicationAcknowledgment = {
  id: string;
  label: string;
};

export type ApplicationFormSchema = {
  sections: ApplicationSection[];
  acknowledgments: ApplicationAcknowledgment[];
};

export type ApplicationFormFeeConfig = {
  enabled: boolean;
  label?: string;
  amount_cents?: number;
};

export type ApplicationFormPostSubmitConfig = {
  actions: Array<{
    id: string;
    type: string;
    enabled?: boolean;
    required?: boolean;
    label?: string;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const FIELD_TYPES: ApplicationFieldType[] = [
  'text',
  'email',
  'tel',
  'date',
  'select',
  'textarea',
  'radio',
  'checkbox',
  'file',
  'address',
];

function parseApplicationField(raw: unknown): ApplicationField | null {
  if (!isRecord(raw)) return null;
  const type = raw.type;
  if (typeof type !== 'string' || !FIELD_TYPES.includes(type as ApplicationFieldType)) {
    return null;
  }
  const id = typeof raw.id === 'string' ? raw.id : '';
  const label = typeof raw.label === 'string' ? raw.label : '';
  if (!id || !label) return null;

  const field: ApplicationField = {
    id,
    label,
    type: type as ApplicationFieldType,
    required: raw.required === true,
  };

  if (typeof raw.placeholder === 'string') field.placeholder = raw.placeholder;
  if (raw.width === 'full' || raw.width === 'half') field.width = raw.width;
  if (typeof raw.helpText === 'string') field.helpText = raw.helpText;
  if (typeof raw.rows === 'number') field.rows = raw.rows;

  if (Array.isArray(raw.options)) {
    field.options = raw.options
      .filter(isRecord)
      .map((option) => ({
        value: String(option.value ?? ''),
        label: String(option.label ?? ''),
      }))
      .filter((option) => option.value && option.label);
  }

  return field;
}

function parseApplicationSection(raw: unknown): ApplicationSection | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' ? raw.id : '';
  const title = typeof raw.title === 'string' ? raw.title : '';
  if (!id) return null;

  const fields = Array.isArray(raw.fields)
    ? raw.fields
        .map(parseApplicationField)
        .filter((field): field is ApplicationField => field !== null)
    : [];

  return {
    id,
    title,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    fields,
    allowMultiple: raw.allowMultiple === true,
  };
}

export function parseApplicationFormSchema(raw: unknown): ApplicationFormSchema {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { sections: [], acknowledgments: [] };
  }
  const record = raw as Record<string, unknown>;
  const sections = Array.isArray(record.sections)
    ? record.sections
        .map(parseApplicationSection)
        .filter((section): section is ApplicationSection => section !== null)
    : [];
  const acknowledgments = Array.isArray(record.acknowledgments)
    ? record.acknowledgments
        .filter(isRecord)
        .map((ack) => ({
          id: String(ack.id ?? ''),
          label: String(ack.label ?? ''),
        }))
        .filter((ack) => ack.id)
    : [];
  return { sections, acknowledgments };
}

export function parseApplicationFormFeeConfig(raw: unknown): ApplicationFormFeeConfig {
  if (!raw || typeof raw !== 'object') return { enabled: false, label: 'Application fee' };
  const record = raw as Record<string, unknown>;
  return {
    enabled: Boolean(record.enabled),
    label: typeof record.label === 'string' ? record.label : 'Application fee',
    amount_cents: typeof record.amount_cents === 'number' ? record.amount_cents : 0,
  };
}

export function parseApplicationFormPostSubmitConfig(raw: unknown): ApplicationFormPostSubmitConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { actions: [] };
  }
  const record = raw as Record<string, unknown>;
  const actions = Array.isArray(record.actions)
    ? record.actions
        .filter((action): action is Record<string, unknown> => Boolean(action && typeof action === 'object'))
        .map((action) => ({
          id: String(action.id ?? ''),
          type: String(action.type ?? ''),
          enabled: action.enabled !== false,
          required: action.required !== false,
          label: typeof action.label === 'string' ? action.label : undefined,
        }))
    : [];
  return { actions };
}

export function formatFeeAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
