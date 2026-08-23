import type { ApplicationSection } from '@/lib/admissions/application-form-schema';

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
    typeof responses === 'object' &&
    'entries' in responses &&
    Array.isArray(responses.entries)
  );
}

export function normalizeFormResponses(
  responses: ChecklistFormResponses | null | undefined,
  allowMultiple: boolean,
): ChecklistFormResponses {
  if (allowMultiple) {
    if (isMultiEntryResponses(responses) && responses.entries.length > 0) {
      return responses;
    }
    return { entries: [{ id: 'entry-1', values: {} }] };
  }

  if (isMultiEntryResponses(responses)) {
    return responses.entries[0]?.values ?? {};
  }

  return responses ?? {};
}
