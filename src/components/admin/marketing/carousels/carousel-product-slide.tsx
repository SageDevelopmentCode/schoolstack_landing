"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import SlideCanvas, {
  displayStyle,
  PromoSlideTopRow,
  SLIDE,
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "@/components/admin/marketing/slide-frame";

/** Slide backing for product slides; demo canvas stays #F8F8F3 for contrast inside laptop chrome. */
export const DEMO_SLIDE_PAPER = "#F0EDE6";

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
export type CarouselPromoDensity = "default" | "compact";
export type CarouselSlideTone = "paper" | "forest";

export type CarouselDemoCrop = {
  zoom?: number;
  originX?: number;
  /** Demo point that sits on the top edge of the laptop. 0 is the top; negative shifts the demo down. */
  originY?: number;
};

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
  crop?: CarouselDemoCrop;
  tone?: CarouselSlideTone;
  footer?: ReactNode;
  promoSiteLabel?: string;
  promoDensity?: CarouselPromoDensity;
  /** Left padding of the copy band; default matches logo gutter. */
  copyInsetLeft?: number;
  windowInsetLeft?: number;
  windowInsetRight?: number;
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
  crop,
  tone = "paper",
  footer,
  promoSiteLabel,
  promoDensity = "default",
  copyInsetLeft = COPY_LOGO_GUTTER,
  windowInsetLeft = WINDOW_LEFT,
  windowInsetRight = WINDOW_RIGHT_BLEED,
}: CarouselProductSlideProps) {
  const isPromo = variant === "promo";
  const isForest = isPromo || tone === "forest";
  const isCompactPromo = isPromo && promoDensity === "compact";
  const showPromoTopRow = isPromo && Boolean(promoSiteLabel);
  const showPhones = isPromo && demoPresentation === "phones";
  const copyPadding = isCompactPromo
    ? `${COPY_TOP_PADDING}px 64px 32px 64px`
    : isPromo
      ? `${COPY_TOP_PADDING}px 64px ${COPY_BOTTOM_PADDING}px 64px`
      : `${COPY_TOP_PADDING}px ${copyInsetLeft}px ${COPY_BOTTOM_PADDING}px 64px`;
  const textAlign = isPromo ? "center" : "left";
  const slideBackground = background ?? (isForest ? SLIDE.forest : DEMO_SLIDE_PAPER);
  const titleColor = isForest ? SLIDE.white : SLIDE.ink;
  const bodyColor = isForest ? "rgba(247, 241, 231, 0.82)" : SLIDE.muted;
  const kickerColor = isForest ? SLIDE.white : SLIDE.clay;

  const windowMargins = {
    marginLeft: windowInsetLeft,
    marginRight: windowInsetRight,
    marginBottom: WINDOW_BOTTOM_BLEED,
  };

  const defaultBodyWidth = DEFAULT_BODY_WIDTH;

  return (
    <SlideCanvas background={slideBackground} logo={showPromoTopRow ? "none" : "corner"}>
      {showPromoTopRow && promoSiteLabel ? <PromoSlideTopRow siteLabel={promoSiteLabel} /> : null}
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
                marginLeft: isPromo ? "auto" : undefined,
                marginRight: isPromo ? "auto" : undefined,
              }}
            >
              {kicker ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: kickerColor,
                  }}
                >
                  {kicker}
                </p>
              ) : null}
              <h1
                style={{
                  ...displayStyle(isCompactPromo ? 68 : 80, titleColor),
                  marginTop: kicker ? 14 : 0,
                }}
              >
                {title}
              </h1>
              {body ? (
                <p
                  style={{
                    margin: isCompactPromo ? "20px 0 0" : "18px 0 0",
                    maxWidth: BODY_MAX_WIDTH,
                    fontSize: isCompactPromo ? 32 : 36,
                    lineHeight: 1.28,
                    color: bodyColor,
                    marginLeft: isPromo ? "auto" : undefined,
                    marginRight: isPromo ? "auto" : undefined,
                  }}
                >
                  {body}
                </p>
              ) : null}
              {footer ? (
                <div style={{ display: "flex", justifyContent: isPromo ? "center" : "flex-start" }}>
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              marginTop: showPhones ? (isCompactPromo ? 124 : 72) : WINDOW_GAP,
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
                  crop={crop}
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
  crop,
  defaultBodyWidth,
}: {
  children: ReactNode;
  contentHeight: number;
  cropFocus: "top" | "center";
  crop?: CarouselDemoCrop;
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

  const fitScale = Math.max(
    bodySize.width / CAROUSEL_DEMO_INNER_WIDTH,
    bodySize.height / contentHeight,
  );
  const scale = fitScale * (crop?.zoom ?? 1);
  const cropOriginX = crop?.originX ?? 0;
  const cropOriginY = crop?.originY ?? 0;

  const originY = cropFocus === "center" ? "center" : "top";
  const scaledOriginY = cropFocus === "center" ? "50%" : "0";
  const croppedFrame = crop
    ? {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        top: -(cropOriginY * contentHeight * scale),
        left: -(cropOriginX * CAROUSEL_DEMO_INNER_WIDTH * scale),
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
  return <span style={{ width: 14, height: 14, borderRadius: 999, background: color, display: "block" }} />;
}
