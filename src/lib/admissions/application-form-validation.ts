import { validatePhoneFieldValue } from "@/lib/phone-format";
import { validateApplicationAddressFieldValue } from "@/lib/admissions/application-address";
import { parseApplicationFileFieldValue } from "@/lib/admissions/application-file-storage";
import { isSystemSection, validateStudentResponses } from "./apply-system-fields";
import type {
  ApplicationField,
  ApplicationFormSchema,
  ApplicationSection,
} from "./application-form-schema";

const PROGRESS_KEY = "__progress";

export function parseApplicationResponses(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === PROGRESS_KEY) continue;
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function validateFieldValue(
  field: ApplicationField,
  value: string,
): string | null {
  if (field.type === "tel") {
    return validatePhoneFieldValue(value, {
      required: Boolean(field.required),
      label: field.label,
    });
  }

  if (field.type === "address") {
    return validateApplicationAddressFieldValue(value, {
      required: Boolean(field.required),
      label: field.label,
    });
  }

  if (field.type === "checkbox") {
    if (field.required && value !== "true") {
      return `${field.label} is required.`;
    }
    return null;
  }

  if (field.type === "file") {
    if (!field.required) return null;
    const files = parseApplicationFileFieldValue(value);
    if (files.length === 0) {
      return `${field.label} is required.`;
    }
    return null;
  }

  if (!field.required) return null;
  if (!value.trim()) {
    return `${field.label} is required.`;
  }

  return null;
}

export function validateApplicationSectionResponses(
  section: ApplicationSection,
  values: Record<string, string>,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const field of section.fields) {
    const value = values[field.id] ?? "";
    const error = validateFieldValue(field, value);
    if (error) {
      fieldErrors[field.id] = error;
    }
  }

  return fieldErrors;
}

export function validateCustomSectionResponses(
  schema: ApplicationFormSchema,
  responses: unknown,
): string | null {
  const values = parseApplicationResponses(responses);

  for (const section of schema.sections) {
    if (isSystemSection(section)) continue;

    const fieldErrors = validateApplicationSectionResponses(section, values);
    const firstError = Object.values(fieldErrors)[0];
    if (firstError) {
      return firstError;
    }
  }

  return null;
}

export function validateAcknowledgmentsComplete(
  schema: ApplicationFormSchema,
  acknowledgments: Record<string, boolean>,
): string | null {
  for (const item of schema.acknowledgments) {
    if (!acknowledgments[item.id]) {
      return "Please confirm all acknowledgments before submitting.";
    }
  }
  return null;
}

export type ApplicationSubmitValidationError = {
  error: string;
  code:
    | "acknowledgments_incomplete"
    | "student_fields_incomplete"
    | "custom_fields_incomplete";
};

export function validateApplicationForSubmit(
  schema: ApplicationFormSchema,
  application: {
    responses: unknown;
    acknowledgments: Record<string, boolean>;
  },
): ApplicationSubmitValidationError | null {
  const ackError = validateAcknowledgmentsComplete(
    schema,
    application.acknowledgments,
  );
  if (ackError) {
    return { error: ackError, code: "acknowledgments_incomplete" };
  }

  const studentError = validateStudentResponses(application.responses);
  if (studentError) {
    return { error: studentError, code: "student_fields_incomplete" };
  }

  const customError = validateCustomSectionResponses(
    schema,
    application.responses,
  );
  if (customError) {
    return { error: customError, code: "custom_fields_incomplete" };
  }

  return null;
}
