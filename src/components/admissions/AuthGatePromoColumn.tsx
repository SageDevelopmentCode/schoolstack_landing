"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AUTH_GATE_PROMO } from "@/lib/site";

const ApplyAuthPromoNoteLazy = dynamic(
  () => import("@/components/admissions/garden/ApplyAuthPromoNote"),
  { ssr: false, loading: () => <AuthGatePromoNotePlaceholder /> },
);

/**
 * Same footprint as the promo note, so the gate doesn't jump when it loads.
 * Kept in this module (not the lazy one) so it paints immediately.
 */
function AuthGatePromoNotePlaceholder() {
  return (
    <div
      className="hidden min-w-0 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] lg:block xl:p-6"
      aria-hidden
    >
      <div className="aspect-[16/10] animate-pulse rounded-[16px] bg-[var(--sf-ink)]/[0.06]" />
      <div className="mt-5 min-h-[168px] space-y-3">
        <div className="h-3 w-28 animate-pulse rounded-full bg-[var(--sf-ink)]/[0.06]" />
        <div className="h-6 w-4/5 animate-pulse rounded-full bg-[var(--sf-ink)]/[0.06]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-[var(--sf-ink)]/[0.06]" />
        <div className="h-4 w-11/12 animate-pulse rounded-full bg-[var(--sf-ink)]/[0.06]" />
      </div>
      <div className="mt-4 h-[37px] border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12" />
    </div>
  );
}

/**
 * Desktop-only MudKitchen promo beside the apply sign-in gate: a calm paper
 * note inside the school's Garden frame (needs a `.sf-garden` ancestor:
 * `ApplyAuthGardenFrame`). Hidden below `lg`.
 */
type AuthGatePromoColumnProps = {
  /** When true, show promo images on desktop immediately (for loading skeletons). */
  immediate?: boolean;
};

export default function AuthGatePromoColumn({
  immediate = false,
}: AuthGatePromoColumnProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showPromo, setShowPromo] = useState(() => {
    if (typeof window === "undefined" || !immediate) return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [carouselActive, setCarouselActive] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop || immediate) {
      return;
    }

    const enablePromo = () => setShowPromo(true);

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(enablePromo, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }

    const id = window.setTimeout(enablePromo, 1000);
    return () => window.clearTimeout(id);
  }, [immediate]);

  useEffect(() => {
    if (!showPromo) return;

    const id = window.setTimeout(() => {
      setCarouselActive(true);
    }, AUTH_GATE_PROMO.slideIntervalMs);

    return () => window.clearTimeout(id);
  }, [showPromo]);

  useEffect(() => {
    if (!carouselActive) return;

    const id = setInterval(() => {
      setActiveSlide((index) => (index + 1) % AUTH_GATE_PROMO.slides.length);
    }, AUTH_GATE_PROMO.slideIntervalMs);

    return () => clearInterval(id);
  }, [carouselActive]);

  if (showPromo) {
    return <ApplyAuthPromoNoteLazy activeSlide={activeSlide} />;
  }

  return <AuthGatePromoNotePlaceholder />;
}
