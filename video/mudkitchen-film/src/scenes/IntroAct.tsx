import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { HIT } from "../timeline";
import { C, CLAMP, EXPO_IN, EXPO_OUT, FONT, SOFT_IN_OUT, slamSpring, uiSpring } from "../theme";
import { ToolLogo } from "../components/HubParts";
import type { Layout } from "../components/layout";

// Act I (frames 0-360): one idea per beat, every change lands on a VO clip.
//   0-96    kicker + "Too many tools. / Too many tabs." while the ring builds
//   96-236  evidence card at the center; one tool group lights per VO clip
//   236-360 push-in, hook type, recede into the Act II pull-back

const CARD_W = 560;
const CARD_H = 330;
// The hook's recede overlaps the Act II pull-back (f360-382) so no frame is empty.
const HOOK_GONE = 366;

// Tool groups lit during the evidence beat, in HIT.evidence order.
export const EVIDENCE_GROUPS: string[][] = [
  ["Google Forms", "DocuSign", "Calendly"],
  ["Gmail"],
  ["Google Sheets", "Google Docs", "Google Drive"],
];

const evidenceEnd = (g: number) => (g + 1 < HIT.evidence.length ? HIT.evidence[g + 1] : HIT.pileUp);

// Shared push-in (f236-248): ring and card scale 1 -> 1.25, fade, max 4px blur.
export function introPush(f: number) {
  const t = interpolate(f, [HIT.pushIn, HIT.pushIn + 12], [0, 1], { ...CLAMP, easing: EXPO_IN });
  return { t, scale: 1 + t * 0.25, blur: t * 4, opacity: 1 - t };
}

// Per-pill focus for the evidence beat and the badge pile-up. Neutral outside Act I.
export function introFocus(f: number, tool: string, rank: number, count: number) {
  if (f >= 360) return { lit: 0, dim: 1, badge: 0 };
  let lit = 0;
  EVIDENCE_GROUPS.forEach((group, g) => {
    if (!group.includes(tool)) return;
    const s = HIT.evidence[g];
    const e = evidenceEnd(g);
    lit = Math.max(lit, interpolate(f, [s, s + 6, e - 4, e], [0, 1, 1, 0], CLAMP));
  });
  const stagger = 15 / count;
  const badgeAt = HIT.pileUp + rank * stagger;
  const badge = interpolate(f, [badgeAt, badgeAt + 3], [0, 1], CLAMP);
  lit = Math.max(lit, badge);
  const focusOn = interpolate(f, [HIT.evidence[0], HIT.evidence[0] + 6, HIT.pileUp - 4, HIT.pileUp], [0, 1, 1, 0], CLAMP);
  const dim = 1 - focusOn * 0.45 * (1 - lit);
  return { lit, dim, badge };
}

// "SCATTERED TODAY": assembles in place at the top and holds. One font, no scatter.
const Kicker: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const text = "SCATTERED TODAY";
  const size = L.vertical ? 28 : 22;
  const top = L.vertical ? L.safeTop + 40 : 84;
  const out = interpolate(f, [HIT.pushIn, HIT.pushIn + 10], [1, 0], CLAMP);
  if (out <= 0) return null;
  const dotColors = [C.sage, C.clay, C.sageLight, C.clayHighlight];
  const dot = (k: number, side: -1 | 1) => {
    // Outer dots first, inner dots last, so the row "closes in" on the word.
    const p = interpolate(f, [10 + (3 - k) * 2, 22 + (3 - k) * 2], [0, 1], { ...CLAMP, easing: EXPO_OUT });
    return (
      <div
        key={`${side}${k}`}
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          margin: `0 ${size * 0.42}px`,
          backgroundColor: dotColors[(k + (side > 0 ? 2 : 0)) % dotColors.length],
          opacity: p,
          transform: `scale(${0.4 + p * 0.6})`,
        }}
      />
    );
  };
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        transform: "translateY(-50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: out,
      }}
    >
      {[3, 2, 1, 0].map((k) => dot(k, -1))}
      <div style={{ width: size * 0.8 }} />
      <div style={{ display: "flex", fontFamily: FONT.ui, fontWeight: 500, fontSize: size, color: C.sage }}>
        {text.split("").map((ch, i) => {
          const p = interpolate(f, [2 + i * 1.5, 12 + i * 1.5], [0, 1], { ...CLAMP, easing: EXPO_OUT });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: ch === " " ? size * 0.6 : undefined,
                marginRight: i === text.length - 1 ? 0 : size * 0.32,
                opacity: p,
                transform: `translateY(${(1 - p) * 14}px)`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{ width: size * 0.8 }} />
      {[0, 1, 2, 3].map((k) => dot(k, 1))}
    </div>
  );
};

// Centered serif line: "Too many tools." then "Too many tabs." Never on screen together.
const CenterLine: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const size = L.vertical ? 96 : 100;
  const lines = [
    { lead: "Too many", word: "tools.", inAt: 12, outAt: 42 },
    { lead: "Too many", word: "tabs.", inAt: 50, outAt: 86 },
  ];
  return (
    <>
      {lines.map((l) => {
        if (f < l.inAt || f > l.outAt + 8) return null;
        const pin = interpolate(f, [l.inAt, l.inAt + 12], [0, 1], { ...CLAMP, easing: EXPO_OUT });
        const pout = interpolate(f, [l.outAt, l.outAt + 8], [0, 1], { ...CLAMP, easing: EXPO_IN });
        return (
          <div
            key={l.word}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: L.cy,
              textAlign: "center",
              fontFamily: FONT.display,
              fontWeight: 500,
              fontSize: size,
              lineHeight: 1,
              letterSpacing: "-0.025em",
              color: C.cream,
              whiteSpace: "nowrap",
              opacity: pin * (1 - pout),
              transform: `translateY(calc(-50% + ${(1 - pin) * 30 - pout * 30}px))`,
              filter: `blur(${(1 - pin) * 6 + pout * 4}px)`,
            }}
          >
            {l.lead} <span style={{ fontStyle: "italic", color: C.sageLight }}>{l.word}</span>
          </div>
        );
      })}
    </>
  );
};

// The missing hub: an empty dashed slot the evidence card drops into.
const Anchor: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const r = L.vertical ? 170 : 140;
  const p = interpolate(f, [84, 96], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const out = interpolate(f, [HIT.evidence[0] + 4, HIT.evidence[0] + 14], [1, 0], CLAMP);
  if (p <= 0 || out <= 0) return null;
  return (
    <svg
      width={r * 2 + 8}
      height={r * 2 + 8}
      style={{
        position: "absolute",
        left: L.cx - r - 4,
        top: L.cy - r - 4,
        opacity: p * out * 0.8,
        transform: `scale(${0.85 + p * 0.15}) rotate(${f * 0.6}deg)`,
      }}
    >
      <circle cx={r + 4} cy={r + 4} r={r} fill="none" stroke={C.sageLight} strokeWidth={2} strokeDasharray="6 14" strokeLinecap="round" />
    </svg>
  );
};

const CardHeader: React.FC<{
  logo: string;
  title: string;
  crop?: { x: number; y: number; w: number };
  right?: React.ReactNode;
}> = ({ logo, title, crop, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, height: 36 }}>
    <ToolLogo logo={logo} size={28} crop={crop} />
    <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 21, color: C.forest, flex: 1, whiteSpace: "nowrap" }}>{title}</div>
    {right}
  </div>
);

const FormContent: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
    <CardHeader
      logo="brand/competitors/GoogleForms.png"
      title="Enrollment inquiry"
      right={<div style={{ fontFamily: FONT.ui, fontWeight: 500, fontSize: 16, color: C.clay }}>Response 37 of ?</div>}
    />
    {[
      ["Student", 0.55],
      ["Start date", 0.32],
      ["Tuition plan", 0.44],
    ].map(([label, w]) => (
      <div key={label as string} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 500, color: C.forestMuted }}>{label}</div>
        <div style={{ height: 30, borderRadius: 9, backgroundColor: "rgba(46,74,60,0.07)", padding: "9px 12px" }}>
          <div style={{ height: 12, width: `${(w as number) * 100}%`, borderRadius: 99, backgroundColor: "rgba(46,74,60,0.2)" }} />
        </div>
      </div>
    ))}
    <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
      {[
        { logo: "brand/competitors/DocuSign.png", label: "Sign here" },
        { logo: "brand/competitors/Calendly.webp", label: "Book a tour", crop: { x: 0.07, y: 0.405, w: 0.175 } },
      ].map((c) => (
        <div
          key={c.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px 6px 10px",
            borderRadius: 99,
            backgroundColor: "#fff",
            border: "1px solid rgba(46,74,60,0.12)",
            fontFamily: FONT.ui,
            fontWeight: 500,
            fontSize: 15,
            color: C.forest,
          }}
        >
          <ToolLogo logo={c.logo} size={20} crop={c.crop} />
          {c.label}
        </div>
      ))}
    </div>
  </div>
);

const TextsContent: React.FC<{ f: number; start: number }> = ({ f, start }) => {
  const { fps } = useVideoConfig();
  const bubbles = ["Is pickup at 3 or 3:30 today?", "Did anyone get the form link?", "Reminder: tuition is due Friday"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <CardHeader
        logo="brand/competitors/Gmail.png"
        title="Parents group"
        right={
          <div
            style={{
              minWidth: 34,
              height: 28,
              borderRadius: 99,
              backgroundColor: C.clay,
              color: "#fff",
              fontFamily: FONT.ui,
              fontWeight: 600,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 10px",
            }}
          >
            47
          </div>
        }
      />
      {bubbles.map((b, k) => {
        const p = uiSpring(f, fps, start + 6 + k * 5);
        const right = k % 2 === 1;
        return (
          <div
            key={b}
            style={{
              alignSelf: right ? "flex-end" : "flex-start",
              maxWidth: "78%",
              padding: "10px 16px",
              borderRadius: 18,
              borderBottomLeftRadius: right ? 18 : 6,
              borderBottomRightRadius: right ? 6 : 18,
              backgroundColor: right ? C.badge : "#fff",
              border: "1px solid rgba(46,74,60,0.1)",
              fontFamily: FONT.body,
              fontSize: 18,
              color: C.forest,
              opacity: p,
              transform: `translateY(${(1 - p) * 14}px) scale(${0.94 + p * 0.06})`,
              transformOrigin: right ? "right bottom" : "left bottom",
            }}
          >
            {b}
          </div>
        );
      })}
    </div>
  );
};

const SheetContent: React.FC = () => {
  const cols = ["", "A", "B", "C", "D", "E"];
  const fills: Record<string, number> = { "1-1": 0.7, "1-2": 0.5, "2-1": 0.6, "2-4": 0.4, "3-2": 0.8, "3-5": 0.5, "4-1": 0.55, "4-3": 0.3 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
      <CardHeader logo="brand/competitors/GoogleSheets.png" title="Roster (FINAL) (2).xlsx" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 30,
          borderRadius: 8,
          backgroundColor: "rgba(46,74,60,0.06)",
          padding: "0 12px",
          fontFamily: FONT.body,
          fontSize: 15,
          color: C.forest,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontStyle: "italic", color: C.forestMuted }}>fx</span>
        =VLOOKUP(B2, Sheet3!A:F, 4, FALSE)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "34px repeat(5, 1fr)", borderTop: "1px solid rgba(46,74,60,0.14)", borderLeft: "1px solid rgba(46,74,60,0.14)" }}>
        {Array.from({ length: 5 }).flatMap((_, r) =>
          cols.map((c, ci) => {
            const head = r === 0 || ci === 0;
            const selected = r === 2 && ci === 3;
            const fill = fills[`${r}-${ci}`];
            return (
              <div
                key={`${r}-${ci}`}
                style={{
                  height: 31,
                  borderRight: "1px solid rgba(46,74,60,0.14)",
                  borderBottom: "1px solid rgba(46,74,60,0.14)",
                  backgroundColor: head ? "rgba(46,74,60,0.05)" : "#fff",
                  outline: selected ? `2.5px solid ${C.clay}` : undefined,
                  outlineOffset: -2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: head ? "center" : "flex-start",
                  padding: head ? 0 : "0 8px",
                  fontFamily: FONT.ui,
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.forestMuted,
                }}
              >
                {r === 0 ? c : ci === 0 ? r : fill ? (
                  <div style={{ height: 10, width: `${fill * 100}%`, borderRadius: 99, backgroundColor: "rgba(46,74,60,0.18)" }} />
                ) : null}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};

// Persistent card: enters once from the Forms pill, then content slides in from
// the side of the tool that owns it (Gmail right, Sheets left), then holds on the sheet.
const EvidenceCard: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const { fps } = useVideoConfig();
  const [s0, s1, s2] = HIT.evidence;
  const push = introPush(f);
  if (f < s0 || push.opacity <= 0) return null;

  const enter = uiSpring(f, fps, s0);
  const k = L.vertical ? 1.2 : 1;
  const slide = (at: number) => interpolate(f, [at, at + 10], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const a = slide(s1);
  const b = slide(s2);
  const panes = [
    { key: "forms", x: -a * CARD_W, show: a < 1, node: <FormContent /> },
    { key: "texts", x: (1 - a) * CARD_W + b * CARD_W, show: f >= s1 && b < 1, node: <TextsContent f={f} start={s1} /> },
    { key: "sheet", x: -(1 - b) * CARD_W, show: f >= s2, node: <SheetContent /> },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: L.cx - CARD_W / 2,
        top: L.cy - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 26,
        backgroundColor: C.cream,
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        overflow: "hidden",
        opacity: Math.min(1, enter * 1.5) * push.opacity,
        transform: `translateY(${(1 - enter) * -140}px) scale(${k * (0.92 + enter * 0.08) * push.scale})`,
        filter: push.blur > 0.2 ? `blur(${push.blur}px)` : undefined,
      }}
    >
      {panes.map((p) =>
        p.show ? (
          <div key={p.key} style={{ position: "absolute", inset: 0, padding: 26, transform: `translateX(${p.x}px)` }}>
            {p.node}
          </div>
        ) : null,
      )}
    </div>
  );
};

// Hook: word-by-word reveal (rise + blur, no scale) so words never overlap.
const Hook: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const { fps } = useVideoConfig();
  if (f < HIT.hookLine1 || f >= HOOK_GONE) return null;
  const line1 = L.vertical
    ? ["When your school", "runs in five", "different places,"]
    : ["When your school runs", "in five different places,"];
  const line2 = L.vertical ? ["everything", "feels harder."] : ["everything feels harder."];
  const s1 = 96;
  const s2 = L.vertical ? 124 : 128;

  const swipe = interpolate(f, [HIT.hookLine2, HIT.hookLine2 + 8], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const land = slamSpring(f, fps, HIT.hookLine2 + 4);
  const landO = interpolate(f, [HIT.hookLine2 + 4, HIT.hookLine2 + 8], [0, 1], CLAMP);
  const kick = interpolate(f, [HIT.hookLine2 + 4, HIT.hookLine2 + 6, HIT.hookLine2 + 14], [0, 1, 0], CLAMP);
  const shake = kick * 2;
  const hold = interpolate(f, [HIT.hookLine1, HIT.hookOut], [1, 1.02], CLAMP);
  const exit = interpolate(f, [HIT.hookOut, HOOK_GONE], [0, 1], { ...CLAMP, easing: SOFT_IN_OUT });

  let wi = 0;
  const word = (w: string, j: number, last: boolean) => {
    const d = HIT.hookLine1 + wi++ * 5;
    const o = interpolate(f, [d, d + 8], [0, 1], CLAMP);
    const r = interpolate(f, [d, d + 12], [0, 1], { ...CLAMP, easing: EXPO_OUT });
    return (
      <span
        key={j}
        style={{
          display: "inline-block",
          marginRight: last ? 0 : "0.22em",
          opacity: o,
          transform: `translateY(${(1 - r) * 24}px)`,
          filter: r < 0.98 ? `blur(${(1 - r) * 8}px)` : undefined,
        }}
      >
        {w}
      </span>
    );
  };

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - exit,
        filter: exit > 0.02 ? `blur(${exit * 6}px)` : undefined,
        transform: `scale(${hold * (1 - exit * 0.15)}) translate(${Math.sin(f * 3) * shake}px, ${Math.cos(f * 2.3) * shake}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {line1.map((l, i) => (
          <div
            key={`a${i}`}
            style={{
              fontFamily: FONT.display,
              fontSize: s1,
              color: C.cream,
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              whiteSpace: "nowrap",
            }}
          >
            {l.split(" ").map((w, j, all) => word(w, j, j === all.length - 1))}
          </div>
        ))}
        <div style={{ height: 22 }} />
        {/* Cream highlighter first, then the line lands on it (clay italic stays >= 4.5:1). */}
        <div style={{ position: "relative", padding: `${s2 * 0.04}px ${s2 * 0.3}px ${s2 * 0.14}px` }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              backgroundColor: C.cream,
              transform: `scaleX(${swipe}) rotate(-0.6deg)`,
              transformOrigin: "left center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            }}
          />
          <div
            style={{
              position: "relative",
              opacity: landO,
              transform: `scale(${interpolate(land, [0, 1], [1.12, 1])})`,
            }}
          >
            {line2.map((l) => (
              <div
                key={l}
                style={{
                  fontFamily: FONT.display,
                  fontStyle: "italic",
                  fontSize: s2,
                  color: C.clay,
                  lineHeight: 1.02,
                  letterSpacing: "-0.025em",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const IntroAct: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  if (f >= HOOK_GONE) return null;
  return (
    <>
      <Kicker f={f} L={L} />
      <CenterLine f={f} L={L} />
      <Anchor f={f} L={L} />
      <EvidenceCard f={f} L={L} />
      <Hook f={f} L={L} />
    </>
  );
};
