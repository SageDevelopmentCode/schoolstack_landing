import { validatePhoneFieldValue } from "@/lib/phone-format";
import { validateApplicationAddressFieldValue } from "@/lib/admissions/application-address";
import { parseApplicationFileFieldValue } from "@/lib/admissions/application-file-storage";
import type { ApplicationField, ApplicationSection } from "./application-form-schema";

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
