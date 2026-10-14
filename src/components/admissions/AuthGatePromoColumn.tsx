"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AUTH_GATE_PROMO } from "@/lib/site";
import { AuthGatePromoPlaceholder } from "@/components/admissions/AuthGatePromoPanel";

const AuthGatePromoPanelLazy = dynamic(
  () =>
    import("@/components/admissions/AuthGatePromoPanel").then((mod) => ({
      default: mod.AuthGatePromoPanel,
    })),
  { ssr: false },
);

type AuthGatePromoColumnProps = {
  /** When true, show promo images on desktop immediately (for loading skeletons). */
  immediate?: boolean;
};

export default function AuthGatePromoColumn({
  immediate = false,
}: AuthGatePromoColumnProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showPromo, setShowPromo] = useState(false);
  const [carouselActive, setCarouselActive] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      return;
    }

    if (immediate) {
      setShowPromo(true);
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
    return <AuthGatePromoPanelLazy activeSlide={activeSlide} />;
  }

  return <AuthGatePromoPlaceholder />;
}
