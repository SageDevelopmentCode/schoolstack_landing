/**
 * Tour cursor targets inside demos that may be inside a CSS-scaled embed
 * (e.g. DemoStage). getBoundingClientRect() returns visual (post-transform)
 * pixels; local absolute positioning uses layout (pre-transform) coordinates.
 */
export function getTourTargetCenter(
  container: HTMLElement,
  target: Element,
): { x: number; y: number } | null {
  if (!(target instanceof HTMLElement)) return null;
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const visualScale =
    container.clientWidth > 0 ? containerRect.width / container.clientWidth : 1;
  const safeScale = visualScale > 0 ? visualScale : 1;
  return {
    x:
      (targetRect.left - containerRect.left + targetRect.width / 2) / safeScale,
    y: (targetRect.top - containerRect.top + targetRect.height / 2) / safeScale,
  };
}
