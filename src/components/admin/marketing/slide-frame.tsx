"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import { Link2 } from "lucide-react";
import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { gardenFontVariables } from "@/components/garden/fonts";

type MarketingSlideChromeState = {
  hideCornerLogo: boolean;
};

const MarketingSlideChromeContext = createContext<MarketingSlideChromeState>({
  hideCornerLogo: false,
});

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;

export const SLIDE = {
  paper: "#F7F1E7",
  ink: "#2B241D",
  muted: "#6D6257",
  white: "#FFFAF4",
  forest: "#2E4A3C",
  forestDeep: "#233B2F",
  line: "#E4D8C8",
  clay: "#A05C45",
  wheat: "#E8D4A8",
  blushRail: "#E7C2C2",
  coverSlate: "#384956",
  coverDusk: "#4A3F52",
} as const;

export const DEFAULT_CAROUSEL_AUDIENCE_BANNER = "Built for microschools";

const AUDIENCE_BANNER_HEIGHT = 48;

/** Last word of the banner text gets the clay accent ("Built for **microschools**"). */
function splitAccent(text: string): [string, string] {
  const index = text.trimEnd().lastIndexOf(" ");
  return index === -1 ? ["", text] : [text.slice(0, index + 1), text.slice(index + 1)];
}

/** First-slide audience banner: a floating Garden pill (matches the corner badge and the mobile login badge). */
export function CarouselAudienceBanner({ text }: { text: string }) {
  const [lead, accent] = splitAccent(text);
  return (
    <div
      style={{
        position: "absolute",
        top: 22,
        left: 0,
        right: 0,
        zIndex: 6,
        height: AUDIENCE_BANNER_HEIGHT + 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        className={gardenFontVariables}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "9px 26px 9px 14px",
          borderRadius: 999,
          background: "rgba(255, 250, 244, 0.92)",
          border: "2px solid rgba(43, 36, 29, 0.10)",
          boxShadow: "0 10px 22px rgba(43, 36, 29, 0.14)",
        }}
      >
        <img
          src="/images/Logo.png"
          alt=""
          style={{ height: 40, width: 40, objectFit: "contain", display: "block", transform: "rotate(-6deg)" }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sf-display), 'Bricolage Grotesque', 'Avenir Next', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: SLIDE.ink,
            whiteSpace: "nowrap",
          }}
        >
          {lead}
          <span style={{ color: SLIDE.clay }}>{accent}</span>
        </p>
      </div>
    </div>
  );
}

type MarketingSlideShellProps = {
  children: ReactNode;
  audienceBanner?: string;
};

export function MarketingSlideShell({ children, audienceBanner }: MarketingSlideShellProps) {
  const hideCornerLogo = Boolean(audienceBanner);

  return (
    <MarketingSlideChromeContext.Provider value={{ hideCornerLogo }}>
      <div
        style={{
          position: "relative",
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          overflow: "hidden",
        }}
      >
        {children}
        {audienceBanner ? <CarouselAudienceBanner text={audienceBanner} /> : null}
      </div>
    </MarketingSlideChromeContext.Provider>
  );
}

type SlideCanvasProps = {
  children: ReactNode;
  background?: string;
  logo?: "corner" | "none";
  logoTop?: number;
};

export default function SlideCanvas({
  children,
  background = SLIDE.paper,
  logo = "corner",
  logoTop = 28,
}: SlideCanvasProps) {
  const { hideCornerLogo } = useContext(MarketingSlideChromeContext);
  const showCornerLogo = logo === "corner" && !hideCornerLogo;

  return (
    <article
      className={gardenFontVariables}
      style={{
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        background,
        color: SLIDE.ink,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-sf-body), Nunito, 'Avenir', sans-serif",
      }}
    >
      {children}
      {showCornerLogo ? <CornerLogo top={logoTop} /> : null}
    </article>
  );
}

/** Garden logo pill, matching the mobile login badge (apps/mobile/src/components/mudkitchen-logo.tsx). */
function CornerLogoPill() {
  return (
    <div
      className={gardenFontVariables}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 24px 10px 14px",
        borderRadius: 999,
        background: "rgba(255, 250, 244, 0.92)",
        border: "2px solid rgba(43, 36, 29, 0.10)",
        boxShadow: "0 10px 22px rgba(43, 36, 29, 0.14)",
      }}
    >
      <img
        src="/images/Logo.png"
        alt=""
        style={{ height: 46, width: 46, objectFit: "contain", display: "block", transform: "rotate(-6deg)" }}
      />
      <span
        style={{
          fontFamily: "var(--font-sf-display), 'Bricolage Grotesque', 'Avenir Next', sans-serif",
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.035em",
          color: SLIDE.ink,
        }}
      >
        MudKitchen
      </span>
    </div>
  );
}

function CornerLogo({ top = 28 }: { top?: number }) {
  return (
    <div style={{ position: "absolute", top, right: 28, zIndex: 5 }}>
      <CornerLogoPill />
    </div>
  );
}

export function PromoSlideTopRow({ siteLabel }: { siteLabel: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 28,
        right: 28,
        zIndex: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "rgba(247, 241, 231, 0.82)",
          minWidth: 0,
        }}
      >
        <Link2 size={28} strokeWidth={2.25} aria-hidden />
        <p style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>{siteLabel}</p>
      </div>
      <CornerLogoPill />
    </div>
  );
}

export function displayStyle(size: number, color: string = SLIDE.ink): CSSProperties {
  return {
    margin: 0,
    fontFamily: "var(--font-sf-display), 'Bricolage Grotesque', 'Avenir Next', sans-serif",
    fontSize: size,
    fontWeight: 800,
    lineHeight: 1.02,
    letterSpacing: "-0.03em",
    color,
  };
}
