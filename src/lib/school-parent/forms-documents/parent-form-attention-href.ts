export function resolveParentFormAttentionHref(
  item: {
    form: { id: string; formCategory: "general" | "tuition" };
  },
  bases: { formsBase: string; billingBase: string },
): string {
  const isTuition = item.form.formCategory === "tuition";
  const hrefBase = isTuition ? bases.billingBase : bases.formsBase;
  const hrefParams = isTuition
    ? `tab=agreements&form=${encodeURIComponent(item.form.id)}`
    : `form=${encodeURIComponent(item.form.id)}`;
  return `${hrefBase}?${hrefParams}`;
}
