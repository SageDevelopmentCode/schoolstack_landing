import { newAdmissionsId } from "./application-form-schema";

export type ChecklistFormFieldValues = Record<string, string>;

export type ChecklistFormEntry = {
  id: string;
  values: ChecklistFormFieldValues;
};

export type ChecklistFormMultiEntryResponses = {
  entries: ChecklistFormEntry[];
};

export type ChecklistFormResponses =
  | ChecklistFormFieldValues
  | ChecklistFormMultiEntryResponses;

export function isMultiEntryResponses(
  responses: ChecklistFormResponses | null | undefined,
): responses is ChecklistFormMultiEntryResponses {
  return (
    responses != null &&
    typeof responses === "object" &&
    "entries" in responses &&
    Array.isArray(responses.entries)
  );
}

export function createEmptyEntry(): ChecklistFormEntry {
  return {
    id: newAdmissionsId(),
    values: {},
  };
}

export function createEmptyEntries(count = 1): ChecklistFormEntry[] {
  return Array.from({ length: count }, () => createEmptyEntry());
}

export function normalizeFormResponses(
  responses: ChecklistFormResponses | null | undefined,
  allowMultiple: boolean,
): ChecklistFormResponses {
  if (allowMultiple) {
    if (isMultiEntryResponses(responses) && responses.entries.length > 0) {
      return responses;
    }
    return { entries: createEmptyEntries() };
  }

  if (isMultiEntryResponses(responses)) {
    return responses.entries[0]?.values ?? {};
  }

  return responses ?? {};
}
