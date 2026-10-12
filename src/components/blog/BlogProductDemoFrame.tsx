"use client";

import type { ReactNode } from "react";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import { LaptopBrowserWindow } from "@/components/demo/marketing/LaptopBrowserWindow";

type BlogProductDemoFrameProps = {
  children: ReactNode;
  className?: string;
  contentHeight?: number;
  cropZoom?: number;
};

const DEMO_WIDTH = 1100;

export default function BlogProductDemoFrame({
  children,
  className = "",
  contentHeight = 920,
  cropZoom = 0.92,
}: BlogProductDemoFrameProps) {
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
            crop={{ zoom: cropZoom }}
            chromeShadow={false}
          >
            {children}
          </LaptopBrowserWindow>
        </div>
      </div>
    </InViewDemoGate>
  );
}
