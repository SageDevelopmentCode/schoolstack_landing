import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { CLAMP, EXPO_OUT, FONT, uiSpring } from "../../theme";
import { Backdrop } from "../../components/Backdrop";
import { useLayout } from "../../components/layout";
import { SITE, STORY } from "../../demo/tokens";
import { HIT } from "../timeline";
import { useAdFrame } from "../stage";

export const TAGLINE = "Everything your microschool needs, all in one place.";
export const WEBSITE = "trymudkitchen.com";

// Warm cream card: logo, wordmark, tagline, website. Captions run beneath it.
export const EndCard: React.FC<{ from: number }> = ({ from }) => {
  const f = useAdFrame(from);
  const { fps } = useVideoConfig();
  const L = useLayout();
  const v = L.vertical;

  const wipe = interpolate(f, [HIT.brandIn - 8, HIT.brandIn + 4], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const logoP = uiSpring(f, fps, HIT.logoSting);
  const sting = interpolate(f, [HIT.logoSting + 4, HIT.logoSting + 9, HIT.logoSting + 20], [0, 1, 0], CLAMP);
  const tagP = uiSpring(f, fps, HIT.logoSting + 24);
  const urlP = uiSpring(f, fps, HIT.logoSting + 34);

  const logo = v ? 230 : 170;
  const wordSize = v ? 138 : 112;
  const word = "MudKitchen";
  const wordStart = HIT.logoSting + 8;

  return (
    <AbsoluteFill
      style={{
        clipPath: `inset(${(1 - wipe) * 100}% 0 0 0 round ${(1 - wipe) * 300}px ${(1 - wipe) * 300}px 0 0)`,
      }}
    >
      <Backdrop color={SITE.bg} light vignette={0.25} fog={SITE.bgAlt} fogOpacity={0.55} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: logo, height: logo }}>
          <div
            style={{
              position: "absolute",
              inset: -logo * 0.5,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(197,213,184,${0.6 * sting}) 0%, transparent 65%)`,
            }}
          />
          <Img
            src={staticFile("brand/Logo.png")}
            style={{
              position: "relative",
              width: logo,
              height: logo,
              objectFit: "contain",
              opacity: logoP,
              transform: `translateY(${(1 - logoP) * 40}px) scale(${0.7 + logoP * 0.3 + sting * 0.06})`,
            }}
          />
        </div>
        <div style={{ display: "flex", marginTop: v ? 6 : 0, fontFamily: FONT.display, fontWeight: 500, fontSize: wordSize, color: STORY.primary, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          {word.split("").map((ch, i) => {
            const p = interpolate(f, [wordStart + i * 1.4, wordStart + i * 1.4 + 12], [0, 1], { ...CLAMP, easing: EXPO_OUT });
            return (
              <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 28}px)`, filter: `blur(${(1 - p) * 4}px)` }}>
                {ch}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: v ? 30 : 22,
            maxWidth: v ? 860 : 1200,
            textAlign: "center",
            fontFamily: FONT.ui,
            fontSize: v ? 46 : 36,
            lineHeight: 1.3,
            color: SITE.text,
            opacity: tagP,
            transform: `translateY(${(1 - tagP) * 18}px)`,
          }}
        >
          {TAGLINE}
        </div>
        <div
          style={{
            marginTop: v ? 48 : 34,
            padding: v ? "20px 46px" : "15px 36px",
            borderRadius: 999,
            backgroundColor: STORY.primary,
            color: "#F7F1E7",
            fontFamily: FONT.ui,
            fontWeight: 600,
            fontSize: v ? 46 : 34,
            letterSpacing: "0.01em",
            boxShadow: "0 20px 44px rgba(46,74,60,0.28)",
            opacity: urlP,
            transform: `translateY(${(1 - urlP) * 22}px) scale(${0.92 + urlP * 0.08})`,
          }}
        >
          {WEBSITE}
        </div>
      </div>
    </AbsoluteFill>
  );
};
