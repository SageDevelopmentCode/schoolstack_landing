"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const DEFAULT_HORIZONTAL_MARGIN_PX = 420;

function elementOverlapsViewport(
  el: Element,
  horizontalMarginPx: number,
): boolean {
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return (
    rect.bottom > 0 &&
    rect.top < vh &&
    rect.right > -horizontalMarginPx &&
    rect.left < vw + horizontalMarginPx
  );
}

function defaultActiveIds(slideIds: readonly string[]): Set<string> {
  const next = new Set<string>();
  if (slideIds.length > 0) next.add(slideIds[0]);
  if (slideIds.length > 1) next.add(slideIds[1]);
  return next;
}

function computeActiveIds(
  slideIds: readonly string[],
  itemRefs: Map<string, HTMLElement>,
  horizontalMarginPx: number,
): Set<string> {
  const visibleIndices: number[] = [];
  for (let i = 0; i < slideIds.length; i++) {
    const el = itemRefs.get(slideIds[i]);
    if (el && elementOverlapsViewport(el, horizontalMarginPx)) {
      visibleIndices.push(i);
    }
  }

  if (visibleIndices.length === 0) {
    return defaultActiveIds(slideIds);
  }

  const next = new Set<string>();
  for (const idx of visibleIndices) {
    next.add(slideIds[idx]);
    if (idx > 0) next.add(slideIds[idx - 1]);
    if (idx < slideIds.length - 1) next.add(slideIds[idx + 1]);
  }
  return next;
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

function mergeSlideIdSets(...sets: Set<string>[]): Set<string> {
  const merged = new Set<string>();
  for (const set of sets) {
    for (const id of set) {
      merged.add(id);
    }
  }
  return merged;
}

type UseGetStartedShowcaseActiveSlideIdsOptions = {
  horizontalMarginPx?: number;
  /** Poll while CSS marquee animation runs (transform does not fire scroll). */
  marqueeAnimating?: boolean;
  /** Scroll container for reduced-motion horizontal strip. */
  scrollRootRef?: RefObject<HTMLElement | null>;
  enableScrollListener?: boolean;
};

export function useGetStartedShowcaseActiveSlideIds(
  slideIds: readonly string[],
  options: UseGetStartedShowcaseActiveSlideIdsOptions = {},
) {
  const {
    horizontalMarginPx = DEFAULT_HORIZONTAL_MARGIN_PX,
    marqueeAnimating = false,
    scrollRootRef,
    enableScrollListener = false,
  } = options;

  const itemRefs = useRef(new Map<string, HTMLElement>());
  const everMountedIds = useRef(
    new Set(defaultActiveIds(slideIds)),
  );
  const [activeSlideIds, setActiveSlideIds] = useState<Set<string>>(() =>
    defaultActiveIds(slideIds),
  );

  const setSlideItemRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const recomputeSlideVisibility = useCallback(() => {
    const visible = computeActiveIds(
      slideIds,
      itemRefs.current,
      horizontalMarginPx,
    );
    for (const id of visible) {
      everMountedIds.current.add(id);
    }
    const next = mergeSlideIdSets(visible, everMountedIds.current);
    setActiveSlideIds((prev) => (setsEqual(prev, next) ? prev : next));
  }, [slideIds, horizontalMarginPx]);

  useEffect(() => {
    recomputeSlideVisibility();
    window.addEventListener("resize", recomputeSlideVisibility);
    return () =>
      window.removeEventListener("resize", recomputeSlideVisibility);
  }, [recomputeSlideVisibility]);

  useEffect(() => {
    if (!enableScrollListener) return;
    const root = scrollRootRef?.current;
    if (!root) return;
    root.addEventListener("scroll", recomputeSlideVisibility, {
      passive: true,
    });
    return () =>
      root.removeEventListener("scroll", recomputeSlideVisibility);
  }, [enableScrollListener, scrollRootRef, recomputeSlideVisibility]);

  useEffect(() => {
    if (!marqueeAnimating) return;
    let raf = 0;
    const tick = () => {
      recomputeSlideVisibility();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [marqueeAnimating, recomputeSlideVisibility]);

  return { activeSlideIds, setSlideItemRef, recomputeSlideVisibility };
}
