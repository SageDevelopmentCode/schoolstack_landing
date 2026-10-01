/** Hidden field name on public marketing forms — must stay empty for real users. */
export const PUBLIC_FORM_HONEYPOT_FIELD = "companyWebsite";

export function isPublicFormHoneypotTripped(
  value: string | null | undefined,
): boolean {
  return Boolean(value?.trim());
}

type PublicFormHoneypotBody = {
  [PUBLIC_FORM_HONEYPOT_FIELD]?: unknown;
};

export function readPublicFormHoneypot(
  body: PublicFormHoneypotBody | null | undefined,
): string | null {
  if (!body) return null;
  const raw = body[PUBLIC_FORM_HONEYPOT_FIELD];
  return typeof raw === "string" ? raw : null;
}
