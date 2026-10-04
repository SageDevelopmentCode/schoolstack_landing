"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import SlideCanvas, { displayStyle, SLIDE, SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";

export const DEMO_SLIDE_PAPER = "#F8F8F3";

export const CAROUSEL_DEMO_INNER_WIDTH = 1100;

const CHROME_BAR_HEIGHT = 49;
const COPY_TOP_PADDING = 96;
const COPY_BOTTOM_PADDING = 14;
const WINDOW_GAP = 24;
const WINDOW_LEFT = 36;
const WINDOW_RIGHT_BLEED = -120;
const WINDOW_BOTTOM_BLEED = -72;

const DEFAULT_BODY_WIDTH = SLIDE_WIDTH - WINDOW_LEFT + Math.abs(WINDOW_RIGHT_BLEED);
/** Approx flex slot below copy band; refined on layout measure. */
const DEFAULT_BODY_HEIGHT =
  SLIDE_HEIGHT - COPY_TOP_PADDING - 320 - COPY_BOTTOM_PADDING - WINDOW_GAP + Math.abs(WINDOW_BOTTOM_BLEED) - CHROME_BAR_HEIGHT;

function readChromeBodySize(element: HTMLElement) {
  const width = element.clientWidth;
  const height = element.clientHeight;
  if (width > 0 && height > 0) {
    return { width, height };
  }
  return null;
}

type CarouselProductSide = "copyLeft" | "copyRight";

type CarouselProductSlideProps = {
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
  background?: string;
  contentHeight?: number;
  side?: CarouselProductSide;
  cropFocus?: "top" | "center";
  footer?: ReactNode;
};

export function CarouselProductSlide({
  kicker,
  title,
  body,
  children,
  background = DEMO_SLIDE_PAPER,
  contentHeight = 860,
  side = "copyLeft",
  cropFocus = "top",
  footer,
}: CarouselProductSlideProps) {
  const copyOnRight = side === "copyRight";
  const copyPadding = copyOnRight
    ? `${COPY_TOP_PADDING}px 64px ${COPY_BOTTOM_PADDING}px 200px`
    : `${COPY_TOP_PADDING}px 200px ${COPY_BOTTOM_PADDING}px 64px`;
  const textAlign = copyOnRight ? "right" : "left";

  return (
    <SlideCanvas background={background}>
      <div
        style={{
          height: SLIDE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            zIndex: 2,
            boxSizing: "border-box",
            padding: copyPadding,
            textAlign,
          }}
        >
          <div style={{ maxWidth: 900, marginLeft: copyOnRight ? "auto" : undefined, marginRight: copyOnRight ? 0 : undefined }}>
            <p
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: SLIDE.forest,
              }}
            >
              {kicker}
            </p>
            <h1 style={{ ...displayStyle(80), marginTop: 14 }}>{title}</h1>
            {body ? (
              <p
                style={{
                  margin: "18px 0 0",
                  maxWidth: 820,
                  fontSize: 36,
                  lineHeight: 1.28,
                  color: SLIDE.muted,
                  marginLeft: copyOnRight ? "auto" : undefined,
                }}
              >
                {body}
              </p>
            ) : null}
            {footer ? (
              <div style={{ display: "flex", justifyContent: copyOnRight ? "flex-end" : "flex-start" }}>{footer}</div>
            ) : null}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginTop: WINDOW_GAP,
            marginLeft: WINDOW_LEFT,
            marginRight: WINDOW_RIGHT_BLEED,
            marginBottom: WINDOW_BOTTOM_BLEED,
            position: "relative",
            zIndex: 1,
          }}
        >
          <CarouselLaptopWindow contentHeight={contentHeight} cropFocus={cropFocus}>
            {children}
          </CarouselLaptopWindow>
        </div>
      </div>
    </SlideCanvas>
  );
}

function CarouselLaptopWindow({
  children,
  contentHeight,
  cropFocus,
}: {
  children: ReactNode;
  contentHeight: number;
  cropFocus: "top" | "center";
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodySize, setBodySize] = useState({ width: DEFAULT_BODY_WIDTH, height: DEFAULT_BODY_HEIGHT });

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
  }, []);

  const scale = Math.max(bodySize.width / CAROUSEL_DEMO_INNER_WIDTH, bodySize.height / contentHeight);

  const originY = cropFocus === "center" ? "center" : "top";
  const scaledOriginY = cropFocus === "center" ? "50%" : "0";

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
        boxShadow: "0 28px 70px rgba(43, 36, 29, 0.14)",
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
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img src="/images/Logo.png" alt="" style={{ height: 30, width: "auto", marginLeft: 6, display: "block" }} />
      </div>
      <div ref={bodyRef} style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            width: CAROUSEL_DEMO_INNER_WIDTH,
            height: contentHeight,
            transform: `scale(${scale})`,
            transformOrigin: cropFocus === "center" ? `left ${originY}` : "top left",
            position: "absolute",
            top: scaledOriginY,
            left: 0,
            marginTop: cropFocus === "center" ? -(contentHeight * scale) / 2 : 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function WindowDot({ color }: { color: string }) {
  return <span style={{ width: 14, height: 14, borderRadius: 999, background: color, display: "block" }} />;
}
