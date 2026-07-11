export const US_PHONE_DIGIT_COUNT = 10;

export function stripPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, US_PHONE_DIGIT_COUNT);
}

export function formatPhoneNumberInput(value: string): string {
  const digits = stripPhoneDigits(value);
  if (digits.length === 0) return "";

  if (digits.length <= 3) {
    return digits.length === 3 ? `(${digits})` : `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) - ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) - ${digits.slice(3, 6)} - ${digits.slice(6)}`;
}

export function isCompletePhoneNumber(value: string): boolean {
  return stripPhoneDigits(value).length === US_PHONE_DIGIT_COUNT;
}

export function validatePhoneFieldValue(
  value: string,
  options: { required: boolean; label: string },
): string | null {
  const digits = stripPhoneDigits(value);

  if (digits.length === 0) {
    return options.required ? `${options.label} is required.` : null;
  }

  if (digits.length !== US_PHONE_DIGIT_COUNT) {
    return `${options.label} must be a 10-digit phone number.`;
  }

  return null;
}
