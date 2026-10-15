"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

export const MARKETING_LAPTOP_DEMO_WIDTH = 1100;

/** @deprecated Use MARKETING_LAPTOP_DEMO_WIDTH */
export const CAROUSEL_DEMO_INNER_WIDTH = MARKETING_LAPTOP_DEMO_WIDTH;

const CHROME_BAR_HEIGHT = 49;
const DEFAULT_FALLBACK_BODY_HEIGHT = 700;

function readChromeBodySize(element: HTMLElement) {
  const width = element.clientWidth;
  const height = element.clientHeight;
  if (width > 0 && height > 0) {
    return { width, height };
  }
  return null;
}

export type LaptopBrowserCrop = {
  zoom?: number;
  originX?: number;
  /** Demo point on the top edge; negative shifts the demo down. */
  originY?: number;
};

/** @deprecated Use LaptopBrowserCrop */
export type CarouselDemoCrop = LaptopBrowserCrop;

export type LaptopBrowserWindowProps = {
  children: ReactNode;
  contentHeight: number;
  cropFocus: "top" | "center";
  crop?: LaptopBrowserCrop;
  defaultBodyWidth: number;
  defaultBodyHeight?: number;
  /** Drop shadow on the browser chrome (off for flat blog embeds). */
  chromeShadow?: boolean;
};

export function LaptopBrowserWindow({
  children,
  contentHeight,
  cropFocus,
  crop,
  defaultBodyWidth,
  defaultBodyHeight = DEFAULT_FALLBACK_BODY_HEIGHT,
  chromeShadow = true,
}: LaptopBrowserWindowProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodySize, setBodySize] = useState({
    width: defaultBodyWidth,
    height: defaultBodyHeight,
  });

  useLayoutEffect(() => {
    const element = bodyRef.current;
    if (!element) return;

    const update = (entry?: ResizeObserverEntry) => {
      const fromObserver = entry?.contentRect;
      const width = fromObserver?.width ?? element.clientWidth;
      const height = fromObserver?.height ?? element.clientHeight;
      if (width > 0 && height > 0) {
        setBodySize({ width, height });
        return;
      }
      const fallback = readChromeBodySize(element);
      if (fallback) setBodySize(fallback);
    };

    update();
    const observer = new ResizeObserver((entries) => update(entries[0]));
    observer.observe(element);
    return () => observer.disconnect();
  }, [defaultBodyWidth, defaultBodyHeight]);

  const zoom = crop?.zoom ?? 1;
  const fitScale = Math.max(
    bodySize.width / (MARKETING_LAPTOP_DEMO_WIDTH * zoom),
    bodySize.height / (contentHeight * zoom),
  );
  const scale = fitScale * zoom;
  const cropOriginX = crop?.originX ?? 0;
  const cropOriginY = crop?.originY ?? 0;

  const originY = cropFocus === "center" ? "center" : "top";
  const scaledOriginY = cropFocus === "center" ? "50%" : "0";
  const croppedFrame = crop
    ? {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        top: -(cropOriginY * contentHeight * scale),
        left: -(cropOriginX * MARKETING_LAPTOP_DEMO_WIDTH * scale),
        marginTop: 0,
      }
    : {
        transform: `scale(${scale})`,
        transformOrigin: cropFocus === "center" ? `left ${originY}` : "top left",
        top: scaledOriginY,
        left: 0,
        marginTop: cropFocus === "center" ? -(contentHeight * scale) / 2 : 0,
      };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: "22px 22px 0 0",
        background: "#FFFFFF",
        border: "1px solid #E4E8E1",
        boxShadow: chromeShadow ? "0 28px 70px rgba(43, 36, 29, 0.14)" : "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          height: CHROME_BAR_HEIGHT,
          flexShrink: 0,
          boxSizing: "border-box",
          borderBottom: "1px solid #E4E8E1",
          background: "#FAFAF8",
        }}
      >
        <WindowDot color="#FF5F57" />
        <WindowDot color="#FEBC2E" />
        <WindowDot color="#28C840" />
        {/* eslint-disable-next-line @next/next/no-img-element -- matches carousel PNG export */}
        <img
          src="/images/Logo.png"
          alt=""
          style={{ height: 30, width: "auto", marginLeft: 6, display: "block" }}
        />
      </div>
      <div ref={bodyRef} style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            width: MARKETING_LAPTOP_DEMO_WIDTH,
            height: contentHeight,
            position: "absolute",
            ...croppedFrame,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function WindowDot({ color }: { color: string }) {
  return (
    <span
      style={{ width: 14, height: 14, borderRadius: 999, background: color, display: "block" }}
    />
  );
}

/** @deprecated Use LaptopBrowserWindow */
export type CarouselLaptopWindowProps = LaptopBrowserWindowProps;

/** @deprecated Use LaptopBrowserWindow */
export const CarouselLaptopWindow = LaptopBrowserWindow;
