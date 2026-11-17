"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AuthGatePromoPanel,
  AuthHelpButton,
} from "@/components/admissions/AuthGatePromoPanel";
import { gardenFontVariables } from "@/components/garden/fonts";
import { gardenScopeStyle } from "@/components/school-parent/garden/ParentGardenFrame";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { AUTH_GATE_PROMO } from "@/lib/site";
import "@/components/garden/garden.css";

type BrightAuthPageLayoutProps = {
  children: ReactNode;
  /**
   * The school's theme when a school is known. Its accent replaces Garden clay
   * on the form side only; the MudKitchen promo panel keeps MudKitchen clay.
   */
  theme?: ParentThemeTokens | null;
};

/** Calm Garden split layout for `/login` and school portal auth gates. */
export default function BrightAuthPageLayout({ children, theme }: BrightAuthPageLayoutProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((index) => (index + 1) % AUTH_GATE_PROMO.slides.length);
    }, AUTH_GATE_PROMO.slideIntervalMs);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`${gardenFontVariables} sf-garden flex min-h-dvh flex-col bg-[var(--sf-cream)] text-[var(--sf-ink)] lg:flex-row`}
    >
      <AuthGatePromoPanel activeSlide={activeSlide} variant="bright" />

      <div
        className="relative flex min-h-0 flex-1 flex-col lg:min-h-dvh"
        style={theme ? gardenScopeStyle(theme) : undefined}
      >
        <div
          className="sf-grid pointer-events-none absolute inset-x-0 top-0 h-[min(420px,55vh)] opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)] lg:hidden"
          aria-hidden
        />

        <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-4 py-8 pb-24 sm:px-6 sm:py-10 sm:pb-28 lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>

      <AuthHelpButton />
    </div>
  );
}
