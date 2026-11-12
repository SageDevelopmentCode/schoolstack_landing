"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import HomePageMain from "@/components/sections/HomePageMain";
import SectionFallback from "@/components/ui/SectionFallback";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import GardenNavbar from "./GardenNavbar";
import SmoothScroll from "./SmoothScroll";

const Footer = dynamic(() => import("@/components/sections/Footer"), {
  loading: () => <SectionFallback minHeight="12rem" />,
});
const FloatingQuestionButton = dynamic(() => import("@/components/sections/FloatingQuestionButton"), {
  loading: () => null,
});

/**
 * Page chrome for the Garden home options: Lenis smooth scroll, the Garden
 * navbar, the shared #book-demo hash handling, the existing footer and the
 * floating "Questions?" button.
 */
export default function HomeGardenShell({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <div className="overflow-x-clip">
        <GardenNavbar />
        <HomePageMain>{children}</HomePageMain>
        <InViewSectionGate minHeight="12rem">
          <Footer />
        </InViewSectionGate>
      </div>
      <FloatingQuestionButton />
    </SmoothScroll>
  );
}
