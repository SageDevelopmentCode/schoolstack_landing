import {
  composeEmail,
  emailBadge,
  emailHeading,
  emailMutedParagraph,
  emailOtpCode,
  emailParagraph,
  emailSignOff,
} from "@/lib/email-layout";

export const SUPABASE_OTP_TOKEN_PLACEHOLDER = "{{ .Token }}";

/** Paste into Supabase → Email Templates → Magic Link → Subject */
export const SUPABASE_MAGIC_LINK_SUBJECT =
  "{{ .Token }} is your sign-in code";

/** Paste into Supabase → Email Templates → Confirm signup → Subject */
export const SUPABASE_CONFIRM_SIGNUP_SUBJECT =
  "{{ .Token }} is your verification code";

export function buildSupabaseMagicLinkOtpHtml(
  tokenHtml: string = SUPABASE_OTP_TOKEN_PLACEHOLDER,
): string {
  return composeEmail({
    preheader: "{{ .Token }} is your sign-in code — enter it to continue your application.",
    contentHtml: `
      ${emailBadge("Sign In")}
      ${emailHeading("Your sign-in code", "to continue")}
      ${emailParagraph(
        "Enter this code on the application page to sign in and pick up where you left off.",
      )}
      ${emailOtpCode(tokenHtml)}
      ${emailMutedParagraph(
        "If you didn&rsquo;t request this code, you can safely ignore this email.",
      )}
      ${emailSignOff()}
    `,
  });
}

export function buildSupabaseConfirmSignupOtpHtml(
  tokenHtml: string = SUPABASE_OTP_TOKEN_PLACEHOLDER,
): string {
  return composeEmail({
    preheader: "{{ .Token }} is your verification code — finish creating your account.",
    contentHtml: `
      ${emailBadge("Verify Email")}
      ${emailHeading("Confirm your email")}
      ${emailParagraph(
        "Enter this code to finish creating your account and continue your application.",
      )}
      ${emailOtpCode(tokenHtml)}
      ${emailMutedParagraph(
        "If you didn&rsquo;t request this code, you can safely ignore this email.",
      )}
      ${emailSignOff()}
    `,
  });
}
