"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  CAROUSEL_DEMO_INNER_WIDTH,
  type CarouselDemoCrop,
} from "@/components/admin/marketing/carousels/carousel-product-slide";
import { ShowcaseDesktopEmbedProvider } from "@/components/demo/shared/showcase-desktop-embed";

export const GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT = 340;

type GetStartedShowcaseDemoViewportProps = {
  children: ReactNode;
  contentHeight: number;
  contentWidth?: number;
  /** When set, fills parent flex area instead of fixed GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT */
  fillHeight?: boolean;
  visibleHeight?: number;
  crop?: CarouselDemoCrop;
};

export default function GetStartedShowcaseDemoViewport({
  children,
  contentHeight,
  contentWidth = CAROUSEL_DEMO_INNER_WIDTH,
  fillHeight = false,
  visibleHeight = GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT,
  crop,
}: GetStartedShowcaseDemoViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = (entry?: ResizeObserverEntry) => {
      const width = entry?.contentRect.width ?? element.clientWidth;
      if (width > 0) setContainerWidth(width);
    };

    update();
    const observer = new ResizeObserver((entries) => update(entries[0]));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitScale = containerWidth / contentWidth;
  const scale = fitScale * (crop?.zoom ?? 1);
  const cropOriginX = crop?.originX ?? 0;
  const cropOriginY = crop?.originY ?? 0;

  const croppedFrame = crop
    ? {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        top: -(cropOriginY * contentHeight * scale),
        left: -(cropOriginX * contentWidth * scale),
      }
    : {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        top: 0,
        left: 0,
      };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-bg-alt ${fillHeight ? "h-full min-h-0" : ""}`}
      style={fillHeight ? undefined : { height: visibleHeight }}
    >
      <div
        inert
        data-showcase-desktop-embed="true"
        className="showcase-demo-embed @container pointer-events-none absolute left-0 top-0"
        style={{
          width: contentWidth,
          height: contentHeight,
          ...croppedFrame,
        }}
      >
        <ShowcaseDesktopEmbedProvider>{children}</ShowcaseDesktopEmbedProvider>
      </div>
    </div>
  );
}
