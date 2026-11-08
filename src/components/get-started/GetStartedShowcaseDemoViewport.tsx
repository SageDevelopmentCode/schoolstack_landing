"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  CAROUSEL_DEMO_INNER_WIDTH,
  type CarouselDemoCrop,
} from "@/components/admin/marketing/carousels/carousel-product-slide";
import { ShowcaseDesktopEmbedProvider } from "@/components/demo/shared/showcase-desktop-embed";
import ShowcaseBrowserChrome from "@/components/get-started/ShowcaseBrowserChrome";

/** Demo band height at default card width (340px); matches scaled typical portal slides. */
export const GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT = 288;
/** Demo band height at sm+ card width (400px). */
export const GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT_SM = 320;

const SHOWCASE_VIEWPORT_HEIGHT_CLASS = "h-[288px] sm:h-[320px]";

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
  wellColor?: string;
  showBrowserChrome?: boolean;
};

export default function GetStartedShowcaseDemoViewport({
  children,
  contentHeight,
  contentWidth = CAROUSEL_DEMO_INNER_WIDTH,
  fillHeight = false,
  visibleHeight = GET_STARTED_SHOWCASE_VIEWPORT_HEIGHT,
  crop,
  wellColor,
  showBrowserChrome = true,
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

  const canvasBg = wellColor ?? SHOWCASE_DEMO_CANVAS_BG;

  return (
    <div
      className={`flex w-full flex-col overflow-hidden ${
        fillHeight
          ? "h-full min-h-0"
          : useDefaultResponsiveHeight
            ? SHOWCASE_VIEWPORT_HEIGHT_CLASS
            : ""
      }`}
      style={{
        backgroundColor: canvasBg,
        ...(fillHeight || useDefaultResponsiveHeight
          ? undefined
          : { height: visibleHeight }),
      }}
    >
      {showBrowserChrome ? <ShowcaseBrowserChrome /> : null}
      <div
        ref={containerRef}
        className="relative min-h-0 w-full flex-1 overflow-hidden rounded-b-[16px]"
        style={{ backgroundColor: wellColor ? "#FFFFFF" : SHOWCASE_DEMO_CANVAS_BG }}
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
    </div>
  );
}
