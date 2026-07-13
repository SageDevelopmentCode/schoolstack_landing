import { validatePhoneFieldValue } from "@/lib/phone-format";
import { validateApplicationAddressFieldValue } from "@/lib/admissions/application-address";
import type { ApplicationSection } from "./application-form-schema";
import type {
  ChecklistFormEntry,
  ChecklistFormResponses,
} from "./checklist-form-responses";
import { isMultiEntryResponses } from "./checklist-form-responses";

export function validateChecklistFormResponses(
  formSchema: ApplicationSection,
  responses: ChecklistFormResponses,
): string | null {
  const allowMultiple = formSchema.allowMultiple ?? false;
  const fields = formSchema.fields;

  if (allowMultiple) {
    if (!isMultiEntryResponses(responses) || responses.entries.length === 0) {
      return "Add at least one entry.";
    }

    for (const [index, entry] of responses.entries.entries()) {
      const entryError = validateFieldValues(fields, entry.values, index + 1);
      if (entryError) return entryError;
    }
    return null;
  }

  const values = isMultiEntryResponses(responses)
    ? (responses.entries[0]?.values ?? {})
    : responses;

  return validateFieldValues(fields, values);
}

function validateFieldValues(
  fields: ApplicationSection["fields"],
  values: Record<string, string>,
  entryIndex?: number,
): string | null {
  const prefix = entryIndex ? `Entry ${entryIndex}: ` : "";

  for (const field of fields) {
    const value = values[field.id]?.trim() ?? "";

    if (field.type === "tel") {
      const phoneError = validatePhoneFieldValue(value, {
        required: Boolean(field.required),
        label: field.label,
      });
      if (phoneError) {
        return `${prefix}${phoneError}`;
      }
      continue;
    }

    if (field.type === "address") {
      const addressError = validateApplicationAddressFieldValue(value, {
        required: Boolean(field.required),
        label: field.label,
      });
      if (addressError) {
        return `${prefix}${addressError}`;
      }
      continue;
    }

    if (!field.required) continue;
    if (!value) {
      return `${prefix}${field.label} is required.`;
    }
  }

  return null;
}

export function buildChecklistFormPayload(
  formSchema: ApplicationSection,
  values: Record<string, string>,
  entries: ChecklistFormEntry[],
): ChecklistFormResponses {
  if (formSchema.allowMultiple) {
    return { entries };
  }
  return values;
}
