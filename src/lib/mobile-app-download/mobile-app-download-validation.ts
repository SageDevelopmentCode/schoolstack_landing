import {
  exceedsMaxLength,
  fieldTooLongLabel,
  MAX_PUBLIC_FORM_EMAIL_LENGTH,
  MAX_PUBLIC_FORM_NAME_LENGTH,
  MAX_PUBLIC_FORM_SOURCE_PAGE_PATH_LENGTH,
} from "@/lib/public-forms/field-limits";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type MobileAppDownloadLeadBody = {
  name: string;
  email: string;
  sourcePagePath?: string | null;
  companyWebsite?: string | null;
};

export type MobileAppDownloadLeadValidationResult =
  | { ok: true; value: MobileAppDownloadLeadBody }
  | { ok: false; error: string };

export function validateMobileAppDownloadLeadBody(
  body: unknown,
): MobileAppDownloadLeadValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const sourcePagePathRaw =
    typeof record.sourcePagePath === "string"
      ? record.sourcePagePath.trim()
      : "";
  const companyWebsite =
    typeof record.companyWebsite === "string" ? record.companyWebsite : null;

  if (!name || !email) {
    return { ok: false, error: "Missing required fields." };
  }

  if (exceedsMaxLength(name, MAX_PUBLIC_FORM_NAME_LENGTH)) {
    return { ok: false, error: fieldTooLongLabel("Name") };
  }

  if (exceedsMaxLength(email, MAX_PUBLIC_FORM_EMAIL_LENGTH)) {
    return { ok: false, error: fieldTooLongLabel("Email") };
  }

  if (
    sourcePagePathRaw &&
    exceedsMaxLength(sourcePagePathRaw, MAX_PUBLIC_FORM_SOURCE_PAGE_PATH_LENGTH)
  ) {
    return { ok: false, error: fieldTooLongLabel("Source page path") };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Invalid email address." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      sourcePagePath: sourcePagePathRaw || null,
      companyWebsite,
    },
  };
}
