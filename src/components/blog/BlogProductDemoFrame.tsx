"use client";

import type { ReactNode } from "react";
import { LaptopBrowserWindow } from "@/components/demo/marketing/LaptopBrowserWindow";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type BlogProductDemoFrameProps = {
  children: ReactNode;
  className?: string;
  contentHeight?: number;
  cropZoom?: number;
  /** Horizontal pan (0–1) on viewports below `sm` so center demo content is visible. */
  mobileCropOriginX?: number;
};

const DEMO_WIDTH = 1100;

export default function BlogProductDemoFrame({
  children,
  className = "",
  contentHeight = 920,
  cropZoom = 0.92,
  mobileCropOriginX = 0.18,
}: BlogProductDemoFrameProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const crop = isMobile
    ? { zoom: cropZoom, originX: mobileCropOriginX }
    : { zoom: cropZoom };

  return (
    <InViewDemoGate className={`w-full ${className}`}>
      <div className="flex w-full justify-center overflow-x-auto overscroll-x-contain">
        <div
          className="relative mx-auto w-full max-w-[1100px] min-h-[520px] shrink-0"
          style={{ height: "min(780px, 80vh)" }}
        >
          <LaptopBrowserWindow
            contentHeight={contentHeight}
            cropFocus="top"
            defaultBodyWidth={DEMO_WIDTH}
            defaultBodyHeight={731}
            crop={crop}
            chromeShadow={false}
          >
            {children}
          </LaptopBrowserWindow>
        </div>
      </div>
    </InViewDemoGate>
  );
}
