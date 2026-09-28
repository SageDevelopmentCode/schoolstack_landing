import type {
  PublicTourChildEntry,
  PublicTourFieldDefinition,
  PublicTourRegistrant,
} from "./public-tour-settings";

export type ValidatePublicTourAnswersResult =
  | { ok: true; registrant: PublicTourRegistrant }
  | { ok: false; error: string; fieldId?: string };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseChildren(value: unknown): PublicTourChildEntry[] | null {
  if (!Array.isArray(value)) return null;
  const children: PublicTourChildEntry[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const name = asTrimmedString(record.name);
    if (!name) continue;
    const child: PublicTourChildEntry = { name };
    const gradeAttending = asTrimmedString(record.gradeAttending);
    if (gradeAttending) {
      child.gradeAttending = gradeAttending;
    }
    children.push(child);
  }

  return children;
}

export function validatePublicTourAnswers(
  fields: PublicTourFieldDefinition[],
  answers: Record<string, unknown>,
): ValidatePublicTourAnswersResult {
  const normalizedAnswers: Record<string, unknown> = {};
  let contactEmail = "";

  for (const field of fields) {
    const raw = answers[field.id];

    if (field.type === "children_repeat") {
      const children = parseChildren(raw);
      if (field.required && (!children || children.length === 0)) {
        return {
          ok: false,
          error: `${field.label} is required.`,
          fieldId: field.id,
        };
      }
      if (children && children.length > 0) {
        normalizedAnswers[field.id] = children;
      }
      continue;
    }

    if (field.type === "checkbox") {
      const checked = raw === true || raw === "true";
      if (field.required && !checked) {
        return {
          ok: false,
          error: `${field.label} is required.`,
          fieldId: field.id,
        };
      }
      normalizedAnswers[field.id] = checked;
      continue;
    }

    const value = asTrimmedString(raw);
    if (!value) {
      if (field.required) {
        return {
          ok: false,
          error: `${field.label} is required.`,
          fieldId: field.id,
        };
      }
      continue;
    }

    if (field.type === "email") {
      if (!value.includes("@")) {
        return {
          ok: false,
          error: "Enter a valid email address.",
          fieldId: field.id,
        };
      }
      if (field.id === "email" || field.type === "email") {
        contactEmail = value;
      }
    }

    if (field.type === "select" && field.options?.length) {
      if (!field.options.includes(value)) {
        return {
          ok: false,
          error: `Choose an option for ${field.label}.`,
          fieldId: field.id,
        };
      }
    }

    normalizedAnswers[field.id] = value;
    if (field.id === "email" && !contactEmail) {
      contactEmail = value;
    }
  }

  if (!contactEmail) {
    const emailField = fields.find((f) => f.id === "email" || f.type === "email");
    if (emailField) {
      return {
        ok: false,
        error: "Email is required.",
        fieldId: emailField.id,
      };
    }
    return { ok: false, error: "Email is required." };
  }

  return {
    ok: true,
    registrant: {
      contactEmail,
      answers: normalizedAnswers,
    },
  };
}
