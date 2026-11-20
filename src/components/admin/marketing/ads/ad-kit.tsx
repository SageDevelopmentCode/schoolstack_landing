"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { CSSProperties, ReactNode } from "react";
import { gardenFontVariables } from "@/components/garden/fonts";
import SlideCanvas, { useAdOffer, useSlideSize } from "@/components/admin/marketing/slide-frame";
import type { PatternKind } from "@/components/admin/marketing/sticker";
import { CarouselLaptopWindow, type CarouselDemoCrop } from "@/components/admin/marketing/carousels/carousel-product-slide";
import { Mascot, type MascotName, type MascotView } from "@/components/admin/marketing/mascot/Mascot";
import { CtaButton, FONT, G, Hand, Headline, SITE_LABEL } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import { GIFT_CARD_OFFER } from "@/lib/marketing/gift-card-offer";

// Paid-ad kit: one layout that works at 4:5 feed (1080×1350) and 9:16 story (1080×1920).
// Everything that matters sits on a ~1330px "stage". In story size the stage starts below Meta's top
// safe zone (250px) and ends above the bottom one (340px); the bands outside it are decor only.

/** In-image offer strings. They come from the /gift-card offer so the ads, landing page and terms agree. */
export const OFFER = {
  amount: GIFT_CARD_OFFER.amount,
  chip: GIFT_CARD_OFFER.chip,
  line: GIFT_CARD_OFFER.line,
  fine: GIFT_CARD_OFFER.fine,
} as const;

const STORY_TOP = 250;
const STORY_STAGE = 1330;

export const SNOW = "#FFFFFF";
export const BERRY = "#C2563F";
export const PINE = "#3F6B4F";

/** Stage box (slide coordinates) for the current size. */
export function useAdStage() {
  const { size, width, height } = useSlideSize();
  const isStory = size === "story";
  const top = isStory ? STORY_TOP : 0;
  const stageHeight = isStory ? STORY_STAGE : height;
  return { isStory, width, height, top, stageHeight };
}

// ---------------------------------------------------------------- frame

type AdFrameProps = {
  background?: string;
  /** Text colour family: light backgrounds use ink, dark use cream. */
  tone?: "light" | "dark";
  /** Story-only ground band colour under the stage. */
  ground?: string;
  snow?: boolean;
  garland?: boolean;
  /** Right side of the header row. */
  tag?: ReactNode;
  /** Who the ad is for, shown inside the logo pill ("MudKitchen | for microschools"). `false` hides it. */
  audience?: string | false;
  /** Background pattern override ("none" for plain). */
  pattern?: PatternKind | "none";
  padding?: string;
  children: ReactNode;
};

export function AdFrame({
  background = G.cream,
  tone = "light",
  ground,
  snow = false,
  garland = false,
  tag,
  audience = DEFAULT_AD_AUDIENCE,
  padding = "0 64px 52px",
  pattern,
  children,
}: AdFrameProps) {
  const { isStory, top, stageHeight, height } = useAdStage();
  const groundColor = ground ?? (tone === "dark" ? "rgba(0,0,0,.2)" : "rgba(46,74,60,.1)");
  return (
    <SlideCanvas background={background} logo="none" pattern={pattern}>
      <div className={gardenFontVariables} style={{ position: "absolute", inset: 0, fontFamily: FONT.body, color: tone === "dark" ? G.cream : G.ink }}>
        {snow ? <Snowfall height={height} tone={tone} /> : null}
        {isStory ? (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: -120,
              right: -120,
              top: top + stageHeight - 30,
              bottom: 0,
              background: groundColor,
              borderRadius: "50% 50% 0 0 / 110px 110px 0 0",
            }}
          />
        ) : null}
        {garland ? <Garland top={isStory ? top - 150 : -36} /> : null}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top,
            height: stageHeight,
            boxSizing: "border-box",
            padding,
            display: "flex",
            flexDirection: "column",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, height: 140, flexShrink: 0, paddingTop: garland && !isStory ? 36 : 0 }}>
            <AdLogo tone={tone} audience={audience} />
            {tag}
          </div>
          {children}
        </div>
      </div>
    </SlideCanvas>
  );
}

/** Default audience line on every paid ad; founder-voice sets pass "for microschool founders". */
export const DEFAULT_AD_AUDIENCE = "for microschools";

function AdLogo({ tone, audience }: { tone: "light" | "dark"; audience: string | false }) {
  const dark = tone === "dark";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 24px 10px 14px",
        borderRadius: 999,
        background: dark ? "rgba(255,250,244,.12)" : "#FFFAF4",
        border: dark ? "4px solid rgba(255,250,244,.85)" : "4px solid #FFFFFF",
        boxShadow: dark ? "0 6px 0 0 rgba(0,0,0,.25)" : "0 6px 0 0 rgba(43,36,29,.2)",
        whiteSpace: "nowrap",
      }}
    >
      <img src="/images/Logo.png" alt="" style={{ height: 46, width: 46, objectFit: "contain", display: "block", transform: "rotate(-6deg)" }} />
      <span style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.035em", color: dark ? G.cream : G.ink }}>
        MudKitchen
      </span>
      {audience ? (
        <>
          <span aria-hidden style={{ width: 3, height: 30, borderRadius: 2, background: dark ? "rgba(255,250,244,.4)" : "rgba(43,36,29,.18)", margin: "0 4px" }} />
          <span style={{ fontFamily: FONT.display, fontSize: 26, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", color: dark ? G.butter : G.clayDeep }}>
            {audience}
          </span>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- copy

/** Headline block: the headline, then a plain sub line and/or a hand-written aside. (No eyebrow badge on ads.) */
export function AdCopy({
  title,
  sub,
  hand,
  size = 84,
  tone = "light",
  align = "left",
  maxWidth = 952,
  handColor,
}: {
  title: ReactNode;
  sub?: ReactNode;
  hand?: ReactNode;
  size?: number;
  tone?: "light" | "dark";
  align?: "left" | "center";
  maxWidth?: number;
  handColor?: string;
}) {
  const dark = tone === "dark";
  return (
    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", textAlign: align, position: "relative", zIndex: 4 }}>
      <Headline size={size} color={dark ? G.cream : G.ink} style={{ maxWidth }}>
        {title}
      </Headline>
      {sub ? (
        <p style={{ margin: "20px 0 0", maxWidth, fontFamily: FONT.body, fontWeight: 700, fontSize: 34, lineHeight: 1.28, color: dark ? "rgba(247,241,231,.84)" : G.soft, textWrap: "pretty" }}>{sub}</p>
      ) : null}
      {hand ? (
        <Hand size={44} color={handColor ?? (dark ? G.butter : G.forest)} rotate={-2} style={{ marginTop: 16, maxWidth }}>
          {hand}
        </Hand>
      ) : null}
    </div>
  );
}

/** Flexible middle area: fills the space between copy and footer; children position against it. */
export function Scene({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div style={{ position: "relative", flex: 1, minHeight: 0, ...style }}>{children}</div>;
}

// ---------------------------------------------------------------- footer + offer

/** CTA row: "Book a demo", the gift-card chip (when the offer is on), site and fine print. */
export function AdFooter({
  tone = "light",
  align = "left",
  chip = true,
  variant = "cta",
  ctaLabel,
  siteLabel = SITE_LABEL,
}: {
  tone?: "light" | "dark";
  align?: "left" | "center";
  chip?: boolean;
  /** "site" = organic posts: just the website, no button or offer. */
  variant?: "cta" | "site";
  /** Button text. Defaults to the kit's "Book a demo". */
  ctaLabel?: string;
  /** Site line (e.g. a landing-page path). Defaults to `SITE_LABEL`. */
  siteLabel?: string;
}) {
  const offer = useAdOffer();
  const dark = tone === "dark";
  if (variant === "site") {
    return (
      <div style={{ flexShrink: 0, display: "flex", justifyContent: align === "center" ? "center" : "flex-start", position: "relative", zIndex: 6 }}>
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: dark ? G.mint : G.forest }}>{siteLabel}</span>
      </div>
    );
  }
  return (
    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: 18, position: "relative", zIndex: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start" }}>
        <CtaButton bg={dark ? G.butter : G.clay} color={dark ? G.forestDeep : "#FFFFFF"} shadow={dark ? "#14241B" : G.clayDeep}>
          {ctaLabel}
        </CtaButton>
        {offer && chip ? <OfferChip /> : (
          <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: dark ? G.mint : G.forest }}>{siteLabel}</span>
        )}
      </div>
      {offer ? (
        <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: dark ? "rgba(247,241,231,.62)" : "rgba(43,36,29,.5)" }}>
          *{OFFER.fine}
        </p>
      ) : null}
    </div>
  );
}

function GiftIcon({ size = 30, color = G.clayDeep }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

export function OfferChip({ text = `+ ${OFFER.chip}*`, rotate = -2 }: { text?: string; rotate?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 24px 14px 18px",
        borderRadius: 999,
        background: G.butter,
        border: `3px solid ${G.ink}`,
        boxShadow: `0 6px 0 ${G.ink}`,
        transform: `rotate(${rotate}deg)`,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: 30,
        color: G.ink,
        whiteSpace: "nowrap",
      }}
    >
      <GiftIcon />
      {text}
    </span>
  );
}

/** Big gift tag with the offer, for offer-led ads. */
export function GiftTag({ rotate = -6, width = 430, style, to = "for your microschool" }: { rotate?: number; width?: number; style?: CSSProperties; to?: string }) {
  return (
    <div style={{ position: "relative", width, transform: `rotate(${rotate}deg)`, ...style }}>
      <div
        style={{
          position: "relative",
          boxSizing: "border-box",
          width,
          padding: "34px 40px 34px 92px",
          background: G.butter,
          border: `5px solid ${G.ink}`,
          borderRadius: "28px 28px 28px 28px",
          clipPath: "polygon(16% 0, 100% 0, 100% 100%, 16% 100%, 0 50%)",
          boxShadow: `0 10px 0 ${G.ink}`,
        }}
      >
        <span aria-hidden style={{ position: "absolute", left: 46, top: "50%", marginTop: -15, width: 30, height: 30, borderRadius: 999, background: G.cream, border: `5px solid ${G.ink}`, boxSizing: "border-box" }} />
        <Hand size={Math.round(width * 0.068)} color={G.clayDeep} rotate={0}>
          {to}
        </Hand>
        <p style={{ margin: "2px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: Math.round(width * 0.28), lineHeight: 0.95, letterSpacing: "-0.04em", color: G.ink }}>{OFFER.amount}</p>
        <p style={{ margin: "6px 0 0", fontFamily: FONT.body, fontWeight: 800, fontSize: Math.round(width * 0.07), lineHeight: 1.15, color: G.ink }}>Amazon gift card when you sign up*</p>
      </div>
      {/* the outline is clipped by clip-path; redraw the pointed edge */}
      <svg aria-hidden width={width} height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
        <polyline points="16,0.8 0.9,50 16,99.2" fill="none" stroke={G.ink} strokeWidth="5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <span aria-hidden style={{ position: "absolute", left: -110, top: "48%", width: 130, height: 5, background: BERRY, borderRadius: 4, transform: "rotate(-18deg)", transformOrigin: "right center" }} />
    </div>
  );
}

// ---------------------------------------------------------------- characters

export function Crew({ name, view = "happy", width = 320, flip, ground = true, style }: { name: MascotName; view?: MascotView; width?: number; flip?: boolean; ground?: boolean; style?: CSSProperties }) {
  return <Mascot name={name} view={view} width={width} flip={flip} ground={ground} style={style} />;
}

/** Absolutely positioned helper inside a Scene. */
export function Pin({ children, left, right, top, bottom, z = 3, rotate, style }: { children: ReactNode; left?: number | string; right?: number | string; top?: number | string; bottom?: number | string; z?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", left, right, top, bottom, zIndex: z, transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- winter decor (CSS only: no filters, no noise)

// Fixed pseudo-random flakes so every export is identical.
const FLAKES = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 100, y: r(2) * 100, s: 6 + Math.round(r(3) * 12), o: 0.35 + r(4) * 0.5 };
});

function Snowfall({ height, tone }: { height: number; tone: "light" | "dark" }) {
  const color = tone === "dark" ? "255,250,244" : "160,184,200";
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, height }}>
      {FLAKES.map((flake, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${flake.x}%`,
            top: `${flake.y}%`,
            width: flake.s,
            height: flake.s,
            borderRadius: 999,
            background: `rgba(${color},${tone === "dark" ? flake.o : flake.o * 0.7})`,
          }}
        />
      ))}
    </div>
  );
}

const BULB_COLORS = [G.butter, BERRY, "#7FB3D5", "#8DBF7A", G.peach];

type Point = [number, number];
const quad = (p0: Point, p1: Point, p2: Point, t: number): Point => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1],
];
// Two swags of lights: (-20,20) → (540,20) → (1100,20), each sagging through a control point at y=130.
const SWAGS: Array<[Point, Point, Point]> = [
  [[-20, 20], [260, 130], [540, 20]],
  [[540, 20], [820, 130], [1100, 20]],
];
const BULBS = SWAGS.flatMap((swag) => [0.1, 0.27, 0.44, 0.61, 0.78, 0.95].map((t) => quad(...swag, t)));

/** String of lights hanging across the top. */
export function Garland({ top = -18 }: { top?: number }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top, height: 140, zIndex: 1 }}>
      <svg width="1080" height="140" viewBox="0 0 1080 140" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M-20 20 Q 260 130 540 20 Q 820 130 1100 20" fill="none" stroke={PINE} strokeWidth="5" strokeLinecap="round" />
      </svg>
      {BULBS.map(([x, y], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: x - 13,
            top: y - 4,
            width: 26,
            height: 36,
            borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
            background: BULB_COLORS[i % BULB_COLORS.length],
            border: `3px solid ${G.ink}`,
            boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
}

/** Wrapped present with a ribbon, bow and optional label tag. */
export function GiftBox({ width = 200, color = BERRY, ribbon = G.butter, label, rotate = 0, style }: { width?: number; color?: string; ribbon?: string; label?: string; rotate?: number; style?: CSSProperties }) {
  const h = Math.round(width * 0.8);
  const lid = Math.round(width * 0.2);
  const band = Math.round(width * 0.14);
  return (
    <div style={{ position: "relative", width, height: h + lid * 0.6 + width * 0.22, transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}>
      {/* bow */}
      <span aria-hidden style={{ position: "absolute", left: width / 2 - width * 0.24, top: 0, width: width * 0.24, height: width * 0.2, borderRadius: "60% 20% 60% 60%", background: ribbon, border: `4px solid ${G.ink}`, boxSizing: "border-box", transform: "rotate(-14deg)" }} />
      <span aria-hidden style={{ position: "absolute", left: width / 2, top: 0, width: width * 0.24, height: width * 0.2, borderRadius: "20% 60% 60% 60%", background: ribbon, border: `4px solid ${G.ink}`, boxSizing: "border-box", transform: "rotate(14deg)" }} />
      {/* box */}
      <div style={{ position: "absolute", left: width * 0.04, right: width * 0.04, bottom: 0, height: h, background: color, border: `4px solid ${G.ink}`, borderRadius: 12, boxSizing: "border-box", overflow: "hidden" }}>
        <span style={{ position: "absolute", left: "50%", marginLeft: -band / 2, top: 0, bottom: 0, width: band, background: ribbon, borderLeft: `3px solid ${G.ink}`, borderRight: `3px solid ${G.ink}` }} />
      </div>
      {/* lid */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: h - lid * 0.4, height: lid, background: color, border: `4px solid ${G.ink}`, borderRadius: 10, boxSizing: "border-box", overflow: "hidden" }}>
        <span style={{ position: "absolute", left: "50%", marginLeft: -band / 2, top: 0, bottom: 0, width: band, background: ribbon, borderLeft: `3px solid ${G.ink}`, borderRight: `3px solid ${G.ink}` }} />
      </div>
      {label ? (
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: h * 0.18,
            transform: "translateX(-50%) rotate(-4deg)",
            padding: "8px 16px",
            background: "#FFFFFF",
            border: `3px solid ${G.ink}`,
            borderRadius: 10,
            fontFamily: FONT.body,
            fontWeight: 800,
            fontSize: Math.max(20, Math.round(width * 0.12)),
            color: G.ink,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- cards

/** White card with a thick ink outline and a hard drop shadow (Garden "sticker" style). */
export function InkCard({ children, bg = "#FFFFFF", rotate = 0, width, style }: { children: ReactNode; bg?: string; rotate?: number; width?: number | string; style?: CSSProperties }) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        padding: "30px 36px",
        background: bg,
        border: `4px solid ${G.ink}`,
        borderRadius: 32,
        boxShadow: `0 10px 0 ${G.ink}`,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type CheckRow = { label: ReactNode; done?: boolean; note?: ReactNode; highlight?: boolean };

/** Checklist rows with ink checkboxes. */
export function CheckList({ rows, size = 36 }: { rows: CheckRow[]; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: row.highlight ? "12px 18px" : "0 18px",
            margin: row.highlight ? "0 -18px" : "0 -18px",
            borderRadius: 18,
            background: row.highlight ? G.butter : "transparent",
          }}
        >
          <span
            style={{
              width: size + 8,
              height: size + 8,
              flexShrink: 0,
              borderRadius: 10,
              border: `4px solid ${G.ink}`,
              boxSizing: "border-box",
              background: row.done ? G.forest : "#FFFFFF",
              display: "grid",
              placeItems: "center",
            }}
          >
            {row.done ? (
              <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : null}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: size, lineHeight: 1.15, color: G.ink }}>{row.label}</span>
            {row.note ? <span style={{ fontFamily: FONT.hand, fontSize: Math.round(size * 0.85), color: G.clay, lineHeight: 1.1 }}>{row.note}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Real product screen in the laptop chrome. Fills its parent; width/height are first-paint guesses. */
export function ProductWindow({ width = 952, height = 560, crop, contentHeight = 920, children }: { width?: number; height?: number; crop?: CarouselDemoCrop; contentHeight?: number; children: ReactNode }) {
  return (
    <div data-demo-window style={{ position: "absolute", inset: 0 }}>
      <CarouselLaptopWindow contentHeight={contentHeight} cropFocus="top" crop={crop} defaultBodyWidth={width} defaultBodyHeight={height}>
        {children}
      </CarouselLaptopWindow>
    </div>
  );
}

export { Accent, Hand, Headline, SpeechBubble, StickyNote, NotificationCard, Tape, PaperSheet, FONT, G } from "@/components/admin/marketing/mascot/mascot-slide-kit";
