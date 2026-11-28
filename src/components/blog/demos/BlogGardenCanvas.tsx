"use client";

import type { ReactNode } from "react";
import GardenRoot from "@/components/garden/GardenRoot";
import { CAROUSEL_DEMO_INNER_WIDTH } from "@/components/demo/marketing/LaptopBrowserWindow";

/**
 * The 1100px Garden canvas a live blog demo renders into (same as the marketing studio's demo windows).
 * Each live demo sets its own Luff Learning demo runtime before rendering, so posts always show one brand.
 */
export default function BlogGardenCanvas({ children, contentHeight }: { children: ReactNode; contentHeight: number }) {
  return (
    <GardenRoot>
      <div
        style={{
          width: CAROUSEL_DEMO_INNER_WIDTH,
          height: contentHeight,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "var(--sf-cream, #F7F1E7)",
        }}
      >
        {children}
      </div>
    </GardenRoot>
  );
}
