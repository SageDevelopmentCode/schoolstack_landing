"use client";

import type { ReactNode } from "react";
import SlideCanvas, {
  displayStyle,
  PromoSlideTopRow,
  SLIDE,
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "@/components/admin/marketing/slide-frame";
import {
  CAROUSEL_DEMO_INNER_WIDTH,
  CarouselLaptopWindow,
  type CarouselDemoCrop,
} from "@/components/demo/marketing/LaptopBrowserWindow";

/** Slide backing for product slides; demo canvas stays #F8F8F3 for contrast inside laptop chrome. */
export const DEMO_SLIDE_PAPER = "#F0EDE6";

export { CAROUSEL_DEMO_INNER_WIDTH, type CarouselDemoCrop };

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

const DARK_COVER_BODY = "rgba(247, 241, 231, 0.82)";

const DEFAULT_BODY_WIDTH = SLIDE_WIDTH - WINDOW_LEFT + Math.abs(WINDOW_RIGHT_BLEED);
/** Approx flex slot below copy band; refined on layout measure. */
const DEFAULT_BODY_HEIGHT =
  SLIDE_HEIGHT - COPY_TOP_PADDING - 320 - COPY_BOTTOM_PADDING - WINDOW_GAP + Math.abs(WINDOW_BOTTOM_BLEED) - CHROME_BAR_HEIGHT;

const MICROSCHOOL_ACCENT = "Microschool";

function renderCarouselTitle(title: ReactNode, accentColor: string): ReactNode {
  if (typeof title !== "string") {
    return title;
  }
  const index = title.indexOf(MICROSCHOOL_ACCENT);
  if (index === -1) {
    return title;
  }
  return (
    <>
      {title.slice(0, index)}
      <span style={{ color: accentColor }}>{MICROSCHOOL_ACCENT}</span>
      {title.slice(index + MICROSCHOOL_ACCENT.length)}
    </>
  );
}

type CarouselProductSide = "copyLeft" | "copyRight";
type CarouselProductVariant = "default" | "promo";
type CarouselDemoPresentation = "laptop" | "phones";
export type CarouselPromoDensity = "default" | "compact";
export type CarouselSlideTone = "paper" | "forest" | "slate" | "dusk";

type SlideTheme = {
  slideBackground: string;
  titleColor: string;
  bodyColor: string;
  kickerColor: string;
  microschoolAccent: string;
};

function resolveSlideTheme(tone: CarouselSlideTone, background?: string): SlideTheme {
  switch (tone) {
    case "forest":
      return {
        slideBackground: background ?? SLIDE.forest,
        titleColor: SLIDE.white,
        bodyColor: DARK_COVER_BODY,
        kickerColor: SLIDE.white,
        microschoolAccent: SLIDE.wheat,
      };
    case "slate":
      return {
        slideBackground: background ?? SLIDE.coverSlate,
        titleColor: SLIDE.white,
        bodyColor: DARK_COVER_BODY,
        kickerColor: SLIDE.white,
        microschoolAccent: SLIDE.wheat,
      };
    case "dusk":
      return {
        slideBackground: background ?? SLIDE.coverDusk,
        titleColor: SLIDE.white,
        bodyColor: DARK_COVER_BODY,
        kickerColor: SLIDE.white,
        microschoolAccent: SLIDE.wheat,
      };
    case "paper":
    default:
      return {
        slideBackground: background ?? DEMO_SLIDE_PAPER,
        titleColor: SLIDE.ink,
        bodyColor: SLIDE.muted,
        kickerColor: SLIDE.clay,
        microschoolAccent: SLIDE.clay,
      };
  }
}

type CarouselProductSlideProps = {
  title: ReactNode;
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
  /** Right padding of the copy band (logo clearance). */
  copyInsetLeft?: number;
  /** Left padding of the copy band. */
  copyPaddingLeft?: number;
  windowInsetLeft?: number;
  windowInsetRight?: number;
  /** Rendered above the laptop demo (e.g. cover slide callout card). */
  demoOverlay?: ReactNode;
  /** Top offset of the corner logo. */
  logoTop?: number;
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
  copyPaddingLeft = 64,
  windowInsetLeft = WINDOW_LEFT,
  windowInsetRight = WINDOW_RIGHT_BLEED,
  demoOverlay,
  logoTop,
}: CarouselProductSlideProps) {
  const isPromo = variant === "promo";
  const isCompactPromo = isPromo && promoDensity === "compact";
  const showPromoTopRow = isPromo && Boolean(promoSiteLabel);
  const showPhones = isPromo && demoPresentation === "phones";
  const copyPadding = isCompactPromo
    ? `${COPY_TOP_PADDING}px 64px 32px 64px`
    : isPromo
      ? `${COPY_TOP_PADDING}px 64px ${COPY_BOTTOM_PADDING}px 64px`
      : `${COPY_TOP_PADDING}px ${copyInsetLeft}px ${COPY_BOTTOM_PADDING}px ${copyPaddingLeft}px`;
  const textAlign = isPromo ? "center" : "left";

  const promoTheme: SlideTheme = {
    slideBackground: background ?? SLIDE.forest,
    titleColor: SLIDE.white,
    bodyColor: DARK_COVER_BODY,
    kickerColor: SLIDE.white,
    microschoolAccent: SLIDE.wheat,
  };
  const { slideBackground, titleColor, bodyColor, kickerColor, microschoolAccent } = isPromo
    ? promoTheme
    : resolveSlideTheme(tone, background);

  const windowMargins = {
    marginLeft: windowInsetLeft,
    marginRight: windowInsetRight,
    marginBottom: WINDOW_BOTTOM_BLEED,
  };

  const defaultBodyWidth = DEFAULT_BODY_WIDTH;
  const hasDemoOverlay = Boolean(demoOverlay) && !showPhones;

  return (
    <SlideCanvas background={slideBackground} logo={showPromoTopRow ? "none" : "corner"} logoTop={logoTop}>
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
                {renderCarouselTitle(title, microschoolAccent)}
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
              overflow: showPhones || hasDemoOverlay ? "visible" : "hidden",
              ...(showPhones ? { marginLeft: 0, marginRight: 0 } : windowMargins),
            }}
          >
            {showPhones ? (
              <div style={{ position: "absolute", inset: 0, overflow: "visible" }}>{children}</div>
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
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
                {hasDemoOverlay ? (
                  <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                    {demoOverlay}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </SlideCanvas>
  );
}

export { CarouselLaptopWindow };
export type { CarouselLaptopWindowProps } from "@/components/demo/marketing/LaptopBrowserWindow";
