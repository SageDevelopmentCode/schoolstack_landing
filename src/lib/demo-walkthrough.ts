const DEFAULT_PROTOTYPE_BASE = "/prototype/rooted-meadows-school";

export function prototypeStepUrl(
  stepId: string,
  base = DEFAULT_PROTOTYPE_BASE,
) {
  return `${base}?step=${encodeURIComponent(stepId)}`;
}

export function resolveWalkthroughStepIndex(
  steps: { id: string }[],
  stepParam: string | null,
): number | null {
  if (!stepParam) return null;

  const byId = steps.findIndex((step) => step.id === stepParam);
  if (byId >= 0) return byId;

  const asIndex = Number(stepParam);
  if (
    Number.isInteger(asIndex) &&
    asIndex >= 0 &&
    asIndex < steps.length
  ) {
    return asIndex;
  }

  return null;
}
