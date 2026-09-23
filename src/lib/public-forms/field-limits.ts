export const MAX_PUBLIC_FORM_NAME_LENGTH = 120;
export const MAX_PUBLIC_FORM_EMAIL_LENGTH = 254;
export const MAX_PUBLIC_FORM_SOURCE_PAGE_PATH_LENGTH = 500;
export const MAX_PUBLIC_FORM_MESSAGE_LENGTH = 5000;
export const MAX_PUBLIC_FORM_SCHOOL_NAME_LENGTH = 200;
export const MAX_PUBLIC_FORM_SCHOOL_SLUG_LENGTH = 100;
export const MAX_PUBLIC_FORM_SOURCE_LENGTH = 100;
export const MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH = 200;
export const MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH = 500;
export const MAX_PUBLIC_FORM_SCHEDULED_TIME_LENGTH = 20;

export function exceedsMaxLength(value: string, max: number): boolean {
  return value.length > max;
}

export function fieldTooLongLabel(fieldLabel: string): string {
  return `${fieldLabel} is too long.`;
}
