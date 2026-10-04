"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import SlideCanvas, { displayStyle, SLIDE, SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";

/** Slide backing for product slides; demo canvas stays #F8F8F3 for contrast inside laptop chrome. */
export const DEMO_SLIDE_PAPER = "#E4DDD0";

export const CAROUSEL_DEMO_INNER_WIDTH = 1100;

const CHROME_BAR_HEIGHT = 49;
const CONTENT_TOP_INSET = 128;
const COPY_TOP_PADDING = 56;
const COPY_BOTTOM_PADDING = 14;
const COPY_LOGO_GUTTER = 140;
const COPY_MAX_WIDTH = 1000;
const BODY_MAX_WIDTH = 980;
const WINDOW_GAP = 48;
const WINDOW_CHROME_SCALE = 1;
const WINDOW_LEFT = 48;
const WINDOW_RIGHT_BLEED = -100;
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
type CarouselProductVariant = "default" | "promo";
type CarouselDemoPresentation = "laptop" | "phones";

type CarouselProductSlideProps = {
  title: string;
  body: string;
  children: ReactNode;
  kicker?: string;
  background?: string;
  contentHeight?: number;
  side?: CarouselProductSide;
  variant?: CarouselProductVariant;
  demoPresentation?: CarouselDemoPresentation;
  cropFocus?: "top" | "center";
  footer?: ReactNode;
};

export function CarouselProductSlide({
  title,
  body,
  children,
  kicker,
  background,
  contentHeight = 860,
  side = "copyLeft",
  variant = "default",
  demoPresentation = "laptop",
  cropFocus = "top",
  footer,
}: CarouselProductSlideProps) {
  const isPromo = variant === "promo";
  const showPhones = isPromo && demoPresentation === "phones";
  const copyOnRight = !isPromo && side === "copyRight";
  const copyPadding = isPromo
    ? `${COPY_TOP_PADDING}px 64px ${COPY_BOTTOM_PADDING}px 64px`
    : copyOnRight
      ? `${COPY_TOP_PADDING}px 64px ${COPY_BOTTOM_PADDING}px ${COPY_LOGO_GUTTER}px`
      : `${COPY_TOP_PADDING}px ${COPY_LOGO_GUTTER}px ${COPY_BOTTOM_PADDING}px 64px`;
  const textAlign = isPromo ? "center" : copyOnRight ? "right" : "left";
  const slideBackground = background ?? (isPromo ? SLIDE.forest : DEMO_SLIDE_PAPER);
  const titleColor = isPromo ? SLIDE.white : SLIDE.ink;
  const bodyColor = isPromo ? "rgba(247, 241, 231, 0.82)" : SLIDE.muted;

  const windowMargins = {
    marginLeft: WINDOW_LEFT,
    marginRight: WINDOW_RIGHT_BLEED,
    marginBottom: WINDOW_BOTTOM_BLEED,
  };

  const defaultBodyWidth = DEFAULT_BODY_WIDTH;

  return (
    <SlideCanvas background={slideBackground}>
      <div
        style={{
          height: SLIDE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div aria-hidden style={{ flexShrink: 0, minHeight: CONTENT_TOP_INSET }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
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
            <div
              style={{
                maxWidth: COPY_MAX_WIDTH,
                marginLeft: isPromo ? "auto" : copyOnRight ? "auto" : undefined,
                marginRight: isPromo ? "auto" : copyOnRight ? 0 : undefined,
              }}
            >
              {isPromo && kicker ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: SLIDE.white,
                  }}
                >
                  {kicker}
                </p>
              ) : null}
              <h1 style={{ ...displayStyle(80, titleColor), marginTop: isPromo && kicker ? 14 : 0 }}>{title}</h1>
              {body ? (
                <p
                  style={{
                    margin: "18px 0 0",
                    maxWidth: BODY_MAX_WIDTH,
                    fontSize: 36,
                    lineHeight: 1.28,
                    color: bodyColor,
                    marginLeft: isPromo || copyOnRight ? "auto" : undefined,
                    marginRight: isPromo ? "auto" : undefined,
                  }}
                >
                  {body}
                </p>
              ) : null}
              {footer ? (
                <div style={{ display: "flex", justifyContent: isPromo ? "center" : copyOnRight ? "flex-end" : "flex-start" }}>
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              marginTop: WINDOW_GAP,
              position: "relative",
              zIndex: 1,
              overflow: showPhones ? "visible" : "hidden",
              ...(showPhones ? { marginLeft: 0, marginRight: 0 } : windowMargins),
            }}
          >
            {showPhones ? (
              <div style={{ position: "absolute", inset: 0, overflow: "visible" }}>{children}</div>
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  ...(WINDOW_CHROME_SCALE !== 1
                    ? { transform: `scale(${WINDOW_CHROME_SCALE})`, transformOrigin: "top center" }
                    : {}),
                }}
              >
                <CarouselLaptopWindow
                  contentHeight={contentHeight}
                  cropFocus={cropFocus}
                  defaultBodyWidth={defaultBodyWidth}
                >
                  {children}
                </CarouselLaptopWindow>
              </div>
            )}
          </div>
        </div>
      </div>
    </SlideCanvas>
  );
}

function CarouselLaptopWindow({
  children,
  contentHeight,
  cropFocus,
  defaultBodyWidth,
}: {
  children: ReactNode;
  contentHeight: number;
  cropFocus: "top" | "center";
  defaultBodyWidth: number;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodySize, setBodySize] = useState({ width: defaultBodyWidth, height: DEFAULT_BODY_HEIGHT });

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
