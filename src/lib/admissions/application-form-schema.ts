export type ApplicationFieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "select"
  | "textarea"
  | "radio"
  | "checkbox"
  | "file";

export interface ApplicationFieldOption {
  value: string;
  label: string;
}

export interface ApplicationField {
  id: string;
  label: string;
  type: ApplicationFieldType;
  placeholder?: string;
  required?: boolean;
  width?: "full" | "half";
  options?: ApplicationFieldOption[];
  rows?: number;
  helpText?: string;
  maxFiles?: number;
  accept?: string;
  /** Locked apply-form field mapped to students table columns */
  system?: boolean;
}

export type ApplicationStepNoticePlacement = "top" | "bottom";

export interface ApplicationStepNotice {
  body: string;
  placement: ApplicationStepNoticePlacement;
}

export interface ApplicationSection {
  id: string;
  title: string;
  description?: string;
  stepNotice?: ApplicationStepNotice;
  fields: ApplicationField[];
  /** Locked apply-form step containing system student fields */
  system?: boolean;
}

export interface ApplicationAcknowledgment {
  id: string;
  label: string;
}

export interface ApplicationFormSchema {
  sections: ApplicationSection[];
  acknowledgments: ApplicationAcknowledgment[];
}

export interface ApplicationFormFeeConfig {
  enabled: boolean;
  label?: string;
  amount_cents?: number;
  fee_definition_id?: string;
  required_to_submit?: boolean;
}

export type ApplicationFormStatus = "draft" | "published" | "archived";

export interface ApplicationFormVersion {
  id: string;
  organization_id: string;
  program_id: string | null;
  version: number;
  status: ApplicationFormStatus;
  title: string;
  intro: string | null;
  public_slug: string | null;
  schema: ApplicationFormSchema;
  fee_config: ApplicationFormFeeConfig;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const APPLICATION_FIELD_TYPES: {
  value: ApplicationFieldType;
  label: string;
}[] = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Long text" },
  { value: "radio", label: "Multiple choice" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File upload" },
];

export function newAdmissionsId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyApplicationFormSchema(): ApplicationFormSchema {
  return { sections: [], acknowledgments: [] };
}

export function defaultApplicationFormFeeConfig(): ApplicationFormFeeConfig {
  return {
    enabled: false,
    label: "Application fee",
    amount_cents: 0,
    required_to_submit: true,
  };
}

export function emptyApplicationSection(title = "Step 1"): ApplicationSection {
  return {
    id: newAdmissionsId(),
    title,
    fields: [
      {
        id: newAdmissionsId(),
        label: "First Name",
        type: "text",
        required: true,
        width: "half",
      },
      {
        id: newAdmissionsId(),
        label: "Email",
        type: "email",
        required: true,
        width: "half",
      },
    ],
  };
}

export function parseApplicationFormSchema(raw: unknown): ApplicationFormSchema {
  if (!raw || typeof raw !== "object") {
    return emptyApplicationFormSchema();
  }

  const record = raw as Record<string, unknown>;
  const sections = Array.isArray(record.sections)
    ? (record.sections as ApplicationSection[])
    : [];
  const acknowledgments = Array.isArray(record.acknowledgments)
    ? (record.acknowledgments as ApplicationAcknowledgment[])
    : [];

  return { sections, acknowledgments };
}

export function parseApplicationFormFeeConfig(
  raw: unknown,
): ApplicationFormFeeConfig {
  if (!raw || typeof raw !== "object") {
    return defaultApplicationFormFeeConfig();
  }

  const record = raw as Record<string, unknown>;
  return {
    enabled: Boolean(record.enabled),
    label:
      typeof record.label === "string" ? record.label : "Application fee",
    amount_cents:
      typeof record.amount_cents === "number" ? record.amount_cents : 0,
    fee_definition_id:
      typeof record.fee_definition_id === "string"
        ? record.fee_definition_id
        : undefined,
    required_to_submit:
      record.required_to_submit !== undefined
        ? Boolean(record.required_to_submit)
        : true,
  };
}

export function validateApplicationFormSchema(
  schema: ApplicationFormSchema,
): string[] {
  const errors: string[] = [];
  const fieldIds = new Set<string>();

  if (schema.sections.length === 0) {
    errors.push("Add at least one form step.");
  }

  for (const section of schema.sections) {
    if (!section.title.trim()) {
      errors.push("Every step needs a title.");
    }
    for (const field of section.fields) {
      if (!field.label.trim()) {
        errors.push("Every question needs a label.");
      }
      if (fieldIds.has(field.id)) {
        errors.push(`Duplicate field id: ${field.id}`);
      }
      fieldIds.add(field.id);
      if (
        (field.type === "select" || field.type === "radio") &&
        (!field.options || field.options.length === 0)
      ) {
        errors.push(`"${field.label}" needs at least one option.`);
      }
    }
  }

  for (const ack of schema.acknowledgments) {
    if (!ack.label.trim()) {
      errors.push("Every acknowledgment needs text.");
    }
  }

  return errors;
}

const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizePublicSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function slugifyFormTitle(title: string): string {
  const slug = normalizePublicSlug(title);
  return slug.length >= 2 ? slug : "";
}

export function validatePublicSlug(slug: string | null | undefined): string | null {
  if (!slug || !slug.trim()) {
    return "A public URL slug is required to publish.";
  }

  const normalized = normalizePublicSlug(slug);
  if (normalized.length < 2 || normalized.length > 48) {
    return "Slug must be 2–48 characters.";
  }
  if (!PUBLIC_SLUG_PATTERN.test(normalized)) {
    return "Use lowercase letters, numbers, and hyphens only.";
  }
  return null;
}

export function applicationFormFromRow(row: Record<string, unknown>): ApplicationFormVersion {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    program_id: row.program_id ? String(row.program_id) : null,
    version: Number(row.version),
    status: row.status as ApplicationFormStatus,
    title: String(row.title),
    intro: row.intro ? String(row.intro) : null,
    public_slug: row.public_slug ? String(row.public_slug) : null,
    schema: parseApplicationFormSchema(row.schema),
    fee_config: parseApplicationFormFeeConfig(row.fee_config),
    published_at: row.published_at ? String(row.published_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function schemaToDbJson(schema: ApplicationFormSchema): Record<string, unknown> {
  return {
    sections: schema.sections,
    acknowledgments: schema.acknowledgments,
  };
}

export function formatFeeAmount(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatFormUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
