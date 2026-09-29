import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowRight, ClipboardList, Home, LayoutDashboard, type LucideIcon } from "lucide-react";
import { ACTS, HIT } from "../timeline";
import { C, CLAMP, EXPO_IN, EXPO_OUT, FONT, uiSpring } from "../theme";
import { Backdrop } from "../components/Backdrop";
import { LogoMark } from "../components/HubParts";
import { useLayout } from "../components/layout";

const F0 = ACTS.VI.from;
const FOLD = HIT.lockup - F0; // 45
const STING = HIT.logoSting - F0; // 63

const ORBS: { label: string; icon: LucideIcon; bg: string; fg: string; border: string }[] = [
  { label: "Parent", icon: Home, bg: C.cream, fg: C.forest, border: "rgba(247,241,231,0.4)" },
  { label: "School Admin", icon: LayoutDashboard, bg: C.forestDeep, fg: C.clayHighlight, border: "rgba(247,241,231,0.22)" },
  { label: "Teacher", icon: ClipboardList, bg: C.forest, fg: C.sageLight, border: "rgba(197,213,184,0.6)" },
];

export const FinaleAct: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const hubIn = uiSpring(f, fps, 0);
  const fold = interpolate(f, [FOLD, FOLD + 14], [0, 1], { ...CLAMP, easing: EXPO_IN });
  const rx = (L.vertical ? 330 : 420) * (1 - fold);
  const ry = (L.vertical ? 420 : 230) * (1 - fold);
  const spin = f * 0.035 + fold * 2.2;

  const sting = interpolate(f, [STING - 2, STING + 2, STING + 14], [0, 1, 0], CLAMP);
  const lift = interpolate(f, [STING + 2, STING + 22], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const logoSize = L.vertical ? 190 : 150;
  const logoY = L.cy + interpolate(lift, [0, 1], [0, L.vertical ? -330 : -250]);
  const logoScale = interpolate(hubIn, [0, 1], [0.6, 1]) * (1 + sting * 0.18) * interpolate(lift, [0, 1], [1, 0.82]);

  // Loader-dot ring left behind by the orbs; collapses into the bowl on the sting.
  const ringP = interpolate(f, [FOLD + 6, FOLD + 12, STING - 2, STING + 1], [0, 1, 1, 0], CLAMP);
  const ringR = interpolate(f, [STING - 6, STING + 1], [logoSize * 0.85, logoSize * 0.2], CLAMP);

  const word = "MudKitchen";
  const wordStart = STING + 8;
  const subP = uiSpring(f, fps, STING + 26);
  const ctaP = uiSpring(f, fps, STING + 36);
  const tagP = interpolate(f, [STING + 52, STING + 66], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const glint = interpolate(f, [STING + 44, STING + 64], [-0.4, 1.4], CLAMP);

  return (
    <AbsoluteFill>
      <Backdrop color={C.forest} fog={C.sage} fogOpacity={0.2} vignette={0.45} />

      {fold < 1 ? (
        <svg
          width={L.W}
          height={L.H}
          viewBox={`${-L.cx} ${-L.cy} ${L.W} ${L.H}`}
          style={{ position: "absolute", inset: 0, opacity: hubIn * (1 - fold) }}
        >
          <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={C.sage} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="6 18" strokeDashoffset={-f * 0.8} />
          {ORBS.map((o, i) => {
            const a = spin + (i / 3) * Math.PI * 2 - Math.PI / 2;
            return (
              <line
                key={o.label}
                x1={0}
                y1={0}
                x2={Math.cos(a) * rx}
                y2={Math.sin(a) * ry}
                stroke={C.sageLight}
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeDasharray="6 30"
                strokeDashoffset={f * 0.9}
              />
            );
          })}
        </svg>
      ) : null}

      {ORBS.map((o, i) => {
        if (fold >= 1) return null;
        const a = spin + (i / 3) * Math.PI * 2 - Math.PI / 2;
        const p = uiSpring(f, fps, 4 + i * 4);
        const size = (L.vertical ? 150 : 124) * (1 - fold * 0.8);
        const Icon = o.icon;
        return (
          <div
            key={o.label}
            style={{
              position: "absolute",
              left: L.cx + Math.cos(a) * rx,
              top: L.cy + Math.sin(a) * ry,
              transform: `translate(-50%, -50%) scale(${p})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: 1 - fold,
            }}
          >
            <div
              style={{
                width: size,
                height: size,
                borderRadius: 999,
                backgroundColor: o.bg,
                border: `2px solid ${o.border}`,
                boxShadow: "0 0 50px rgba(197,213,184,0.35), 0 20px 40px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={size * 0.42} color={o.fg} />
            </div>
            <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: L.vertical ? 30 : 22, color: C.cream, whiteSpace: "nowrap" }}>{o.label}</div>
          </div>
        );
      })}

      {ringP > 0
        ? Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + f * 0.12;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: L.cx + Math.cos(a) * ringR,
                  top: L.cy + Math.sin(a) * ringR,
                  width: 12,
                  height: 12,
                  marginLeft: -6,
                  marginTop: -6,
                  borderRadius: 99,
                  backgroundColor: [C.sage, C.clay, C.sageLight, C.clayHighlight, C.cream][i % 5],
                  opacity: ringP * (0.4 + 0.6 * ((i + Math.floor(f / 2)) % 10) / 10),
                }}
              />
            );
          })
        : null}

      <div style={{ position: "absolute", left: L.cx, top: logoY, transform: `translate(-50%, -50%) scale(${logoScale})` }}>
        <LogoMark size={logoSize} bloom={0.8 + sting * 1.2} />
      </div>

      {sting > 0 ? (
        <div
          style={{
            position: "absolute",
            left: L.cx - 200,
            top: L.cy - 200,
            width: 400,
            height: 400,
            borderRadius: 999,
            border: `2px solid ${C.clayHighlight}`,
            opacity: sting * 0.5,
            transform: `scale(${1.6 - sting * 0.6})`,
          }}
        />
      ) : null}

      {f >= wordStart ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: L.vertical ? 140 : 110 }}>
            <div style={{ display: "flex", fontFamily: FONT.display, fontSize: L.vertical ? 150 : 132, color: C.cream, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {word.split("").map((ch, i) => {
                const p = interpolate(f, [wordStart + i * 1.4, wordStart + i * 1.4 + 12], [0, 1], { ...CLAMP, easing: EXPO_OUT });
                return (
                  <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 10}px)` }}>
                    {ch}
                  </span>
                );
              })}
            </div>
            <div
              style={{
                marginTop: L.vertical ? 34 : 24,
                fontFamily: FONT.ui,
                fontSize: L.vertical ? 40 : 30,
                lineHeight: 1.35,
                color: C.creamMuted,
                textAlign: "center",
                maxWidth: L.vertical ? 820 : 1200,
                opacity: subP,
                transform: `translateY(${(1 - subP) * 20}px)`,
              }}
            >
              Enrollment, billing & school operations — in one place.
            </div>
            <div
              style={{
                marginTop: L.vertical ? 60 : 44,
                display: "flex",
                flexDirection: L.vertical ? "column" : "row",
                alignItems: "center",
                gap: L.vertical ? 22 : 28,
                opacity: ctaP,
                transform: `translateY(${(1 - ctaP) * 30}px) scale(${0.9 + ctaP * 0.1})`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: L.vertical ? "26px 52px" : "20px 42px",
                  borderRadius: 999,
                  backgroundColor: C.clay,
                  color: "#fff",
                  fontFamily: FONT.ui,
                  fontWeight: 600,
                  fontSize: L.vertical ? 40 : 32,
                  boxShadow: "0 20px 50px rgba(160,92,69,0.4)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "35%",
                    left: `${glint * 100}%`,
                    background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.28), transparent)",
                  }}
                />
                Book a demo
                <ArrowRight size={L.vertical ? 40 : 32} color="#fff" />
              </div>
              <div style={{ fontFamily: FONT.ui, fontWeight: 500, fontSize: L.vertical ? 36 : 28, color: C.clayHighlight }}>
                trymudkitchen.com/get-started
              </div>
            </div>
            <div
              style={{
                marginTop: L.vertical ? 70 : 48,
                fontFamily: FONT.ui,
                fontWeight: 500,
                fontSize: L.vertical ? 24 : 18,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: C.sage,
                opacity: tagP,
              }}
            >
              Built inside a real microschool.
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
