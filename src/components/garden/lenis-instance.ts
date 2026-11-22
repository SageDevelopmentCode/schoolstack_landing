import type Lenis from "lenis";

/**
 * The page's live Lenis instance (set by SmoothScroll). Programmatic scrolls go
 * through it so they aren't overridden by a wheel scroll Lenis is still easing.
 * Kept in its own tiny module so callers don't pull in GSAP.
 */
let activeLenis: Lenis | null = null;

export function setActiveLenis(lenis: Lenis | null) {
  activeLenis = lenis;
}

export function getActiveLenis(): Lenis | null {
  return activeLenis;
}
