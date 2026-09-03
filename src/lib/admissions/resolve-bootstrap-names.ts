export function resolveBootstrapNames(input: {
  bodyFirstName?: string;
  bodyLastName?: string;
  userMetadata?: Record<string, unknown> | null;
}): { firstName?: string; lastName?: string } {
  const bodyFirst = input.bodyFirstName?.trim();
  const bodyLast = input.bodyLastName?.trim();

  const meta = input.userMetadata ?? {};
  const metaFirst =
    typeof meta.first_name === "string" ? meta.first_name.trim() : "";
  const metaLast =
    typeof meta.last_name === "string" ? meta.last_name.trim() : "";

  const firstName = bodyFirst || metaFirst || undefined;
  const lastName = bodyLast || metaLast || undefined;

  if (!firstName && !lastName) {
    return {};
  }

  return { firstName, lastName };
}
