export function readFormIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("form");
}

export function syncFormDetailUrl(pathname: string, formId: string | null): void {
  const params = new URLSearchParams(window.location.search);
  if (formId) params.set("form", formId);
  else params.delete("form");
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
}

export function resolveValidFormId(
  formId: string | null,
  forms: ReadonlyArray<{ id: string }>,
): string | null {
  if (!formId) return null;
  return forms.some((form) => form.id === formId) ? formId : null;
}
