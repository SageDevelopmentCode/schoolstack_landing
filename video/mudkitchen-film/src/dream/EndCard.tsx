import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EXPO_OUT, uiSpring } from "../theme";
import { Backdrop } from "../components/Backdrop";
import { FilmGrain } from "../components/FilmGrain";
import { DREAM_FONT, FOREST, INK, PAPER, PAPER_SHADE } from "./look";

export const END_COPY = {
  customer: "Sage Field.",
  customerLogo: "brand/SageFieldLogo.png",
  you: "your school.",
  tagline: "Run the school you imagined.",
  cta: "Book a demo · trymudkitchen.com",
};

// Full: "Built for [Sage Field → logo → your school.]" then the logo card.
// Short: straight to the logo card.
const FULL = { name: 6, logo: 40, you: 64, out: 118, brand: 124 };
const SHORT = { brand: 0 };

const fadeWindow = (f: number, a: number, b: number) =>
  Math.min(interpolate(f, [a, a + 4], [0, 1], CLAMP), interpolate(f, [b - 4, b], [1, 0], CLAMP));

const Thesis: React.FC<{ f: number }> = ({ f }) => {
  const slot = (from: number, to: number, child: React.ReactNode) => {
    const o = to === Infinity ? interpolate(f, [from, from + 4], [0, 1], CLAMP) : fadeWindow(f, from, to);
    const blur = (1 - interpolate(f, [from, from + 5], [0, 1], CLAMP)) * 6;
    return (
      <span style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center", whiteSpace: "nowrap", opacity: o, filter: `blur(${blur}px)` }}>
        {child}
      </span>
    );
  };
  const out = interpolate(f, [FULL.out - 6, FULL.out], [1, 0], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        top: "45%",
        left: 0,
        right: 0,
        textAlign: "center",
        transform: "translateY(-50%)",
        fontFamily: DREAM_FONT.serif,
        fontWeight: 500,
        fontSize: 84,
        color: INK,
        letterSpacing: "-0.02em",
        opacity: out * interpolate(f, [0, 4], [0, 1], CLAMP),
        lineHeight: 1.15,
      }}
    >
      <div>Built for</div>
      <div style={{ position: "relative", height: 150 }}>
        {slot(FULL.name, FULL.logo, END_COPY.customer)}
        {slot(
          FULL.logo,
          FULL.you,
          <Img src={staticFile(END_COPY.customerLogo)} style={{ height: 140, objectFit: "contain", marginTop: 4 }} />,
        )}
        {slot(FULL.you, Infinity, <span style={{ fontStyle: "italic", color: FOREST }}>{END_COPY.you}</span>)}
      </div>
    </div>
  );
};

const Brand: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const { fps } = useVideoConfig();
  const logoP = uiSpring(f, fps, at);
  const tagP = uiSpring(f, fps, at + 14);
  const ctaP = uiSpring(f, fps, at + 24);
  const word = "MudKitchen";
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
      <Img
        src={staticFile("brand/Logo.png")}
        style={{ width: 210, height: 210, objectFit: "contain", opacity: logoP, transform: `translateY(${(1 - logoP) * 30}px) scale(${0.8 + logoP * 0.2})` }}
      />
      <div style={{ display: "flex", fontFamily: DREAM_FONT.serif, fontWeight: 500, fontSize: 128, color: FOREST, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
        {word.split("").map((ch, i) => {
          const p = interpolate(f, [at + 4 + i * 1.3, at + 16 + i * 1.3], [0, 1], { ...CLAMP, easing: EXPO_OUT });
          return (
            <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 24}px)`, filter: `blur(${(1 - p) * 4}px)` }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: DREAM_FONT.serif,
          fontStyle: "italic",
          fontSize: 58,
          color: INK,
          opacity: tagP,
          transform: `translateY(${(1 - tagP) * 16}px)`,
        }}
      >
        {END_COPY.tagline}
      </div>
      <div
        style={{
          marginTop: 56,
          padding: "22px 46px",
          borderRadius: 999,
          backgroundColor: FOREST,
          color: PAPER,
          fontFamily: DREAM_FONT.ui,
          fontWeight: 600,
          fontSize: 38,
          boxShadow: "0 20px 44px rgba(46,74,60,0.28)",
          opacity: ctaP,
          transform: `translateY(${(1 - ctaP) * 20}px) scale(${0.94 + ctaP * 0.06})`,
        }}
      >
        {END_COPY.cta}
      </div>
    </AbsoluteFill>
  );
};

export const DreamEndCard: React.FC<{ variant: "full" | "short" }> = ({ variant }) => {
  const f = useCurrentFrame();
  const brandAt = variant === "full" ? FULL.brand : SHORT.brand;
  return (
    <AbsoluteFill>
      <Backdrop color={PAPER} light vignette={0.35} fog={PAPER_SHADE} fogOpacity={0.6} />
      {variant === "full" && f < FULL.out ? <Thesis f={f} /> : null}
      {f >= brandAt ? <Brand f={f} at={brandAt} /> : null}
      <FilmGrain opacity={0.12} blend="multiply" />
    </AbsoluteFill>
  );
};
