const SIGNUPS_NOT_ALLOWED_MESSAGE =
  "We couldn't find an account for that email. Check the address, or use the email your school has on file.";

/**
 * Turns Supabase auth errors into copy suitable for the web login form.
 * Email OTP uses `shouldCreateUser: false`, so unknown emails surface as
 * "Signups not allowed for otp".
 */
export function normalizeLoginErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const message =
    error instanceof Error
      ? error.message.trim()
      : typeof error === "string"
        ? error.trim()
        : "";

  if (!message) return fallback;

  if (/signups? not allowed/i.test(message)) {
    return SIGNUPS_NOT_ALLOWED_MESSAGE;
  }

  return message;
}

export const NO_SCHOOL_ACCESS_MESSAGE =
  "You do not have access to any schools for this account. Try signing in with a different account.";
