"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import HomePageMain from "@/components/sections/HomePageMain";
import SectionFallback from "@/components/ui/SectionFallback";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import { useCaptureFirstTouch } from "@/hooks/useCaptureFirstTouch";
import GardenNavbar from "./GardenNavbar";
import SmoothScroll from "./SmoothScroll";

const Footer = dynamic(() => import("@/components/sections/Footer"), {
  loading: () => <SectionFallback minHeight="12rem" />,
});
const FloatingQuestionButton = dynamic(() => import("@/components/sections/FloatingQuestionButton"), {
  loading: () => null,
});
const LeadMagnetPopup = dynamic(() => import("@/components/lead-magnets/LeadMagnetPopup"), {
  ssr: false,
  loading: () => null,
});

/**
 * Page chrome for the Garden home options: Lenis smooth scroll, the Garden
 * navbar, the shared #book-demo hash handling, the existing footer and the
 * floating "Questions?" button.
 */
export default function HomeGardenShell({
  children,
  bookDemoHref,
  mobileBottomBar,
}: {
  children: ReactNode;
  /** Overrides the navbar's "Book a Demo" link (defaults to /get-started). */
  bookDemoHref?: string;
  /**
   * A fixed bar for phones (below md). When set it replaces the "Questions?"
   * button on phones (desktop keeps it) and the footer gets room underneath.
   */
  mobileBottomBar?: ReactNode;
}) {
  useCaptureFirstTouch();

  return (
    <SmoothScroll>
      <div className="overflow-x-clip">
        <GardenNavbar bookDemoHref={bookDemoHref} />
        <HomePageMain>{children}</HomePageMain>
        <InViewSectionGate minHeight="12rem">
          <Footer />
        </InViewSectionGate>
        {mobileBottomBar ? <div className="h-24 md:hidden" aria-hidden="true" /> : null}
      </div>
      {mobileBottomBar ? (
        <>
          <div className="hidden md:block">
            <FloatingQuestionButton />
          </div>
          {mobileBottomBar}
        </>
      ) : (
        <FloatingQuestionButton />
      )}
      <LeadMagnetPopup />
    </SmoothScroll>
  );
}
