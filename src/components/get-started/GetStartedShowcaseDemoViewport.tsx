"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  CAROUSEL_DEMO_INNER_WIDTH,
  type CarouselDemoCrop,
} from "@/components/admin/marketing/carousels/carousel-product-slide";
import { ShowcaseDesktopEmbedProvider } from "@/components/demo/shared/showcase-desktop-embed";

/** Demo band height at default card width (340px); matches scaled typical portal slides. */
export const GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT = 272;
/** Demo band height at sm+ card width (400px). */
export const GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT_SM = 300;

const SHOWCASE_VIEWPORT_HEIGHT_CLASS = "h-[272px] sm:h-[300px]";

/** Matches marketing `DemoCanvas` paper tone. */
const SHOWCASE_DEMO_CANVAS_BG = "#F8F8F3";

function fallbackViewportHeight(containerWidth: number): number {
  return containerWidth >= 400
    ? GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT_SM
    : GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT;
}

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
  const [containerSize, setContainerSize] = useState({
    width: 400,
    height: GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT_SM,
  });

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = (entry?: ResizeObserverEntry) => {
      const rect = entry?.contentRect;
      const width = rect?.width ?? element.clientWidth;
      const height = rect?.height ?? element.clientHeight;
      if (width > 0) {
        setContainerSize({
          width,
          height:
            height > 0 ? height : fallbackViewportHeight(width),
        });
      }
    };

    update();
    const observer = new ResizeObserver((entries) => update(entries[0]));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const containerHeight =
    containerSize.height > 0
      ? containerSize.height
      : fallbackViewportHeight(containerSize.width);

  const scaleW = containerSize.width / contentWidth;
  const scaleH = containerHeight / contentHeight;
  const fitScale = Math.max(scaleW, scaleH);
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

  const useDefaultResponsiveHeight =
    !fillHeight && visibleHeight === GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${
        fillHeight
          ? "h-full min-h-0"
          : useDefaultResponsiveHeight
            ? SHOWCASE_VIEWPORT_HEIGHT_CLASS
            : ""
      }`}
      style={{
        backgroundColor: SHOWCASE_DEMO_CANVAS_BG,
        ...(fillHeight || useDefaultResponsiveHeight
          ? undefined
          : { height: visibleHeight }),
      }}
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
