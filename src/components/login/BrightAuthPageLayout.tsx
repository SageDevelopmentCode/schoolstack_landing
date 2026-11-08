"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AuthGatePromoPanel,
  AuthHelpButton,
} from "@/components/admissions/AuthGatePromoPanel";
import { AUTH_GATE_PROMO } from "@/lib/site";

type BrightAuthPageLayoutProps = {
  children: ReactNode;
};

/** Shared bright split layout for `/login` and school portal auth gates. */
export default function BrightAuthPageLayout({ children }: BrightAuthPageLayoutProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((index) => (index + 1) % AUTH_GATE_PROMO.slides.length);
    }, AUTH_GATE_PROMO.slideIntervalMs);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:flex-row">
      <AuthGatePromoPanel activeSlide={activeSlide} variant="bright" />

      <div className="relative flex min-h-0 flex-1 flex-col text-[#1d1a16] lg:min-h-dvh">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(420px,55vh)] opacity-90 lg:hidden"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, #A6B89A 35%, transparent), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 20%, color-mix(in srgb, #A05C45 12%, transparent), transparent 65%)",
          }}
        />

        <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-20 sm:px-6 sm:py-8 sm:pb-24 lg:flex lg:items-center lg:justify-center lg:py-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>

      <AuthHelpButton />
    </div>
  );
}
