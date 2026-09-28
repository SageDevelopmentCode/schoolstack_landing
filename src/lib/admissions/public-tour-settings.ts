export const PUBLIC_TOUR_POST_SUBMIT_ACTION_ID = "public:schedule_campus_tour";

export type PublicTourFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "checkbox"
  | "children_repeat";

export type PublicTourFieldDefinition = {
  id: string;
  label: string;
  required: boolean;
  type: PublicTourFieldType;
  options?: string[];
  helpText?: string;
};

export type PublicTourPageSettings = {
  enabled?: boolean;
  headline?: string;
  intro?: string;
  fields?: PublicTourFieldDefinition[];
};

export const DEFAULT_PUBLIC_TOUR_FIELDS: PublicTourFieldDefinition[] = [
  {
    id: "contact_name",
    label: "Your name",
    required: true,
    type: "text",
  },
  {
    id: "email",
    label: "Email",
    required: true,
    type: "email",
  },
  {
    id: "phone",
    label: "Phone",
    required: false,
    type: "phone",
  },
  {
    id: "children",
    label: "Children",
    required: false,
    type: "children_repeat",
    helpText: "Add each child you are considering enrolling.",
  },
  {
    id: "notes",
    label: "Anything we should know?",
    required: false,
    type: "textarea",
  },
  {
    id: "how_heard",
    label: "How did you hear about us?",
    required: false,
    type: "text",
  },
];

export const DEFAULT_PUBLIC_TOUR_HEADLINE = "Schedule a campus tour";
export const DEFAULT_PUBLIC_TOUR_INTRO =
  "Pick a time that works for you. We will send a confirmation to the email you provide.";

const PUBLIC_TOUR_FIELD_TYPES = new Set<PublicTourFieldType>([
  "text",
  "textarea",
  "email",
  "phone",
  "select",
  "checkbox",
  "children_repeat",
]);

function parseField(raw: unknown): PublicTourFieldDefinition | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const type = record.type;
  if (!id || !label || typeof type !== "string") return null;
  if (!PUBLIC_TOUR_FIELD_TYPES.has(type as PublicTourFieldType)) return null;

  const field: PublicTourFieldDefinition = {
    id,
    label,
    required: Boolean(record.required),
    type: type as PublicTourFieldType,
  };

  if (typeof record.helpText === "string" && record.helpText.trim()) {
    field.helpText = record.helpText.trim();
  }

  if (field.type === "select" && Array.isArray(record.options)) {
    const options = record.options
      .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
      .map((o) => o.trim());
    if (options.length > 0) {
      field.options = options;
    }
  }

  return field;
}

export function parsePublicTourPageSettings(raw: unknown): PublicTourPageSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const settings: PublicTourPageSettings = {};

  if (typeof record.enabled === "boolean") {
    settings.enabled = record.enabled;
  }
  if (typeof record.headline === "string" && record.headline.trim()) {
    settings.headline = record.headline.trim();
  }
  if (typeof record.intro === "string" && record.intro.trim()) {
    settings.intro = record.intro.trim();
  }

  if (Array.isArray(record.fields)) {
    const fields = record.fields
      .map(parseField)
      .filter((f): f is PublicTourFieldDefinition => f != null);
    if (fields.length > 0) {
      settings.fields = fields;
    }
  }

  return settings;
}

export function resolvePublicTourFields(
  settings: PublicTourPageSettings,
): PublicTourFieldDefinition[] {
  return settings.fields?.length ? settings.fields : DEFAULT_PUBLIC_TOUR_FIELDS;
}

export function resolvePublicTourHeadline(settings: PublicTourPageSettings): string {
  return settings.headline?.trim() || DEFAULT_PUBLIC_TOUR_HEADLINE;
}

export function resolvePublicTourIntro(settings: PublicTourPageSettings): string {
  return settings.intro?.trim() || DEFAULT_PUBLIC_TOUR_INTRO;
}

export function isPublicTourEnabled(settings: PublicTourPageSettings): boolean {
  return settings.enabled === true;
}

export type PublicTourChildEntry = {
  name: string;
  gradeAttending?: string;
};

export type PublicTourRegistrant = {
  contactEmail: string;
  answers: Record<string, unknown>;
};

export function sanitizePublicTourFieldsForSave(
  fields: PublicTourFieldDefinition[],
): PublicTourFieldDefinition[] {
  const seen = new Set<string>();
  const result: PublicTourFieldDefinition[] = [];

  for (const field of fields) {
    const id = field.id.trim();
    const label = field.label.trim();
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);

    const next: PublicTourFieldDefinition = {
      id,
      label,
      required: Boolean(field.required),
      type: field.type,
    };
    if (field.helpText?.trim()) {
      next.helpText = field.helpText.trim();
    }
    if (field.type === "select" && field.options?.length) {
      next.options = [...new Set(field.options.map((o) => o.trim()).filter(Boolean))];
    }
    result.push(next);
  }

  return result;
}
