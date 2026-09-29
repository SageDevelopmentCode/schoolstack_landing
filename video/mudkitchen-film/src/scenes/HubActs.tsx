import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import {
  BarChart2,
  ClipboardCheck,
  CreditCard,
  FilePen,
  Globe,
  GraduationCap,
  LayoutGrid,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PAIRS, hubLayout, pillEdge, spiralPoint, type HubPair, type PlacedPair } from "../data/hub";
import { HIT } from "../timeline";
import { C, CLAMP, EXPO_IN_OUT, EXPO_OUT, FONT, uiSpring } from "../theme";
import { Backdrop } from "../components/Backdrop";
import { Connector, FeatureChip, GlassPill, LogoMark } from "../components/HubParts";
import { useLayout, type Layout } from "../components/layout";
import { IntroAct, introFocus, introPush } from "./IntroAct";

// Acts I + II (frames 0-660) as one continuous shot so the ring never "resets".
// Z-order: backdrop > parallax rings > connectors > trails > pills > ring chips > core (card + docked chips) > intro type/card.

const TRAIL_FRAMES = 14;
const BADGE_COUNTS = ["12", "3", "8", "47", "2", "5", "9", "4", "21", "6"];

// "enrollment, billing, messaging, calendar, files" in VO order; each docks on its word.
const LIST = ["Enrollment", "Billing", "Messaging", "Calendar", "Files"];
const DOCK_FLIGHT = 8;
const rowScale = (L: Layout) => (L.vertical ? 1.08 : 1.25);
const FLIP_STEP = 1.5;
const MORE_FLIP: { label: string; icon: LucideIcon; color: string }[] = [
  { label: "Payments", icon: CreditCard, color: "#059669" },
  { label: "Contracts", icon: FilePen, color: "#4F46E5" },
  { label: "Staff", icon: Users, color: "#0D9488" },
  { label: "Reports", icon: BarChart2, color: "#4338CA" },
  { label: "Website", icon: Globe, color: "#A05C45" },
  { label: "Attendance", icon: ClipboardCheck, color: "#DC2626" },
  { label: "Admissions", icon: GraduationCap, color: "#2563EB" },
];

// One workspace card: header + a 2x3 grid of module slots (5 spoken features + "more").
function workspaceGeom(L: Layout) {
  const w = L.vertical ? 560 : 520;
  const h = L.vertical ? 440 : 380;
  const pad = L.vertical ? 30 : 28;
  const header = L.vertical ? 84 : 72;
  const gap = 14;
  const cellW = (w - pad * 2 - gap) / 2;
  const cellH = (h - header - pad - gap * 2) / 3;
  const slots = Array.from({ length: 6 }, (_, k) => ({
    x: -w / 2 + pad + (k % 2) * (cellW + gap) + cellW / 2,
    y: -h / 2 + header + Math.floor(k / 2) * (cellH + gap) + cellH / 2,
  }));
  return { w, h, pad, header, cellW, cellH, slots };
}

// Where a chip waits once its tool has collapsed: the tool's own ring spot
// (pushed wider in 9:16 so the chips clear the card).
const dockSpot = (p: PlacedPair, L: Layout) => (L.vertical ? { x: p.o.x * 1.2, y: p.o.y * 1.1 } : p.o);

// Chips named in the list fly to their slot on their word; the rest rush the "more" slot.
const flightAt = (p: HubPair) => {
  const k = LIST.indexOf(p.feature);
  return k >= 0 ? HIT.listWords[k] - DOCK_FLIGHT / 2 : HIT.listMore - 2;
};

const pillHalf = (p: PlacedPair, font: number) => ({
  rx: (p.tool.length * font * 0.56 + font * 2.6) / 2,
  ry: font * 1.1,
});

function hubCamera(f: number) {
  // Act I: locked off, then the shared push-in; hidden during the hook.
  if (f < 360) {
    const push = introPush(f);
    return { scale: push.scale, blur: push.blur, opacity: push.opacity };
  }
  const t = interpolate(f, [360, 382], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  return { scale: 2.4 - 1.4 * t, blur: (1 - t) * 10, opacity: t };
}

const ParallaxRings: React.FC<{ f: number; L: Layout; rx: number; ry: number }> = ({ f, L, rx, ry }) => {
  const drift = interpolate(f, [0, 660], [30, -30]);
  const o = interpolate(f, [0, 60, 540, 600], [0, 0.5, 0.5, 0], CLAMP);
  return (
    <svg
      width={L.W}
      height={L.H}
      viewBox={`${-L.cx} ${-L.cy} ${L.W} ${L.H}`}
      style={{ position: "absolute", inset: 0, opacity: o }}
    >
      {[1.35, 1.7, 2.1].map((k, i) => (
        <ellipse
          key={k}
          cx={drift * (i + 1) * 0.4}
          cy={0}
          rx={rx * k}
          ry={ry * k}
          fill="none"
          stroke={C.sage}
          strokeOpacity={0.09 - i * 0.02}
          strokeWidth={1.5}
          strokeDasharray={i === 1 ? "2 14" : undefined}
        />
      ))}
    </svg>
  );
};

// Act I spreads the site's 0-1.0s pop wave over 0-2.0s so the ring builds calmly.
const introDelay = (p: PlacedPair) => Math.round(p.delay * 60);

// Tool pills: pop-in on the site's delay wave, drift, fire, then detach + merge.
// Act I keeps them steady (4px drift, no breathing); Act II motion is unchanged.
function pillState(p: PlacedPair, idx: number, f: number, fps: number) {
  const d = Math.round(p.delay * 30);
  const pop = uiSpring(f, fps, HIT.ringIn + introDelay(p));
  const breathe = f > 360 ? 0.75 + 0.25 * (0.5 - 0.5 * Math.cos(((f / fps - p.delay) / 3.5) * Math.PI * 2)) : 1;
  const amp = f > 360 ? 8 : 4;
  const drift = {
    x: Math.sin(f / 38 + idx * 1.7) * amp,
    y: Math.cos(f / 51 + idx * 1.3) * amp * 0.7,
  };
  const fired = f >= HIT.trailsStart + Math.round(p.delay * 30);
  const dim = fired ? interpolate(f, [HIT.trailsStart + d, HIT.trailsStart + d + 12], [1, 0.62], CLAMP) : 1;

  const detachStart = HIT.collapse + Math.round(p.delay * 12);
  const t = interpolate(f, [detachStart, detachStart + 30], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const pos = t > 0 ? spiralPoint(p.o, t, 0.4) : { x: p.o.x + drift.x, y: p.o.y + drift.y };
  const scale = interpolate(t, [0, 1], [1, 0.12]) * interpolate(pop, [0, 1], [0.55, 1]);
  const opacity = pop * breathe * dim * interpolate(t, [0, 0.75, 1], [1, 0.9, 0]);
  return { pos, scale, opacity, t, detachStart };
}

// Feature chip: pops in on the inner ring, glides out to its tool's spot during the
// collapse, then flies into the workspace card on its spoken word.
function chipState(p: PlacedPair, idx: number, f: number, fps: number, H: ReturnType<typeof hubLayout>, L: Layout) {
  const arrive = HIT.trailsStart + Math.round(p.delay * 30) + TRAIL_FRAMES;
  const pop = uiSpring(f, fps, arrive);
  const a = Math.atan2(p.i.y / H.innerRy, p.i.x / H.innerRx);
  const drift = { x: Math.sin(f / 40 + idx * 1.7) * 4, y: Math.cos(f / 53 + idx * 1.3) * 3 };
  const out = interpolate(f, [HIT.collapse + 6, HIT.collapse + 36], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const dock = dockSpot(p, L);
  const ring = {
    x: Math.cos(a) * H.innerRx + (dock.x - Math.cos(a) * H.innerRx) * out + drift.x,
    y: Math.sin(a) * H.innerRy + (dock.y - Math.sin(a) * H.innerRy) * out + drift.y,
  };
  const listed = LIST.includes(p.feature);
  const slot = workspaceGeom(L).slots[listed ? LIST.indexOf(p.feature) : 5];
  const start = flightAt(p);
  const k = interpolate(f, [start, start + DOCK_FLIGHT], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const land = interpolate(f, [start + DOCK_FLIGHT, start + DOCK_FLIGHT + 3, start + DOCK_FLIGHT + 9], [1, 1.12, 1], CLAMP);
  return {
    pos: {
      x: ring.x + (slot.x - ring.x) * k,
      y: ring.y + (slot.y - ring.y) * k - Math.sin(k * Math.PI) * 40,
    },
    scale: interpolate(pop, [0, 1], [0.4, 1]) * (listed ? land * (1 + (rowScale(L) - 1) * k) : 1 - k * 0.5),
    opacity: pop * (listed ? 1 : interpolate(k, [0.6, 1], [1, 0], CLAMP)),
    flying: f >= start,
    docked: k >= 1,
    visible: f >= arrive - 1 && (listed || k < 1),
  };
}

const HubLayer: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const { fps } = useVideoConfig();
  const H = hubLayout(L.vertical);
  const connectorsOn = interpolate(f, [HIT.ringIn + 10, HIT.ringIn + 40, HIT.collapse, HIT.collapse + 14], [0, 1, 1, 0], CLAMP);
  const clockwise = (a: number) => (a + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const ringOrder = [...H.pairs].sort((a, b) => clockwise(a.angle) - clockwise(b.angle)).map((p) => p.tool);
  const focus = (p: PlacedPair) => introFocus(f, p.tool, ringOrder.indexOf(p.tool), H.pairs.length);

  return (
    <>
      <svg
        width={L.W}
        height={L.H}
        viewBox={`${-L.cx} ${-L.cy} ${L.W} ${L.H}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {H.pairs.map((p) => {
          const half = pillHalf(p, H.pillFont);
          const start = pillEdge(p.o, p.i, half.rx, half.ry);
          const d = Math.round(p.delay * 30);
          // Act I: energy pulls inward but stops short. Act II: reaches the chip once the trail lands.
          const di = introDelay(p);
          const reachI = interpolate(f, [HIT.ringIn + di + 6, HIT.ringIn + di + 40], [0, 0.72], { ...CLAMP, easing: EXPO_OUT });
          const land = HIT.trailsStart + d + TRAIL_FRAMES;
          const reach = f < 360 ? reachI : interpolate(f, [HIT.trailsStart + d, land], [0.72, 1], { ...CLAMP, easing: EXPO_IN_OUT });
          const fo = focus(p);
          return (
            <Connector
              key={p.tool}
              x1={start.x}
              y1={start.y}
              x2={p.i.x}
              y2={p.i.y}
              frame={f}
              delayFrames={d}
              reach={reach}
              opacity={connectorsOn * fo.dim}
              dashColor={fo.lit > 0.5 ? C.clayHighlight : undefined}
              staticColor={fo.lit > 0.5 ? C.clayHighlight : undefined}
            />
          );
        })}
        {/* Light trails: tool -> feature, wave around the ring */}
        {H.pairs.map((p) => {
          const d = Math.round(p.delay * 30);
          const s = HIT.trailsStart + d;
          if (f < s || f > s + TRAIL_FRAMES + 6) return null;
          const half = pillHalf(p, H.pillFont);
          const a = pillEdge(p.o, p.i, half.rx, half.ry);
          const t = interpolate(f, [s, s + TRAIL_FRAMES], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
          const tail = Math.max(0, t - 0.35);
          const fade = interpolate(f, [s + TRAIL_FRAMES, s + TRAIL_FRAMES + 6], [1, 0], CLAMP);
          const P = (k: number) => ({ x: a.x + (p.i.x - a.x) * k, y: a.y + (p.i.y - a.y) * k });
          const head = P(t);
          const tl = P(tail);
          return (
            <g key={`trail-${p.tool}`} filter="url(#trailGlow)" opacity={fade}>
              <line x1={tl.x} y1={tl.y} x2={head.x} y2={head.y} stroke="#F7F1E7" strokeWidth={4} strokeLinecap="round" strokeOpacity={0.9} />
              <circle cx={head.x} cy={head.y} r={7} fill="#fff" />
            </g>
          );
        })}
        {/* Particle stream behind detaching pills (merge, not explosion) */}
        {H.pairs.map((p, idx) => {
          const st = pillState(p, idx, f, fps);
          if (st.t <= 0 || st.t >= 1) return null;
          return Array.from({ length: 7 }).map((_, k) => {
            const tk = Math.max(0, st.t - (k + 1) * 0.045);
            const pt = spiralPoint(p.o, tk, 0.4);
            return (
              <circle
                key={`${p.tool}-${k}`}
                cx={pt.x + (random(`${p.tool}${k}x`) - 0.5) * 10}
                cy={pt.y + (random(`${p.tool}${k}y`) - 0.5) * 10}
                r={4.5 - k * 0.5}
                fill={k % 2 ? C.sageLight : C.clayHighlight}
                opacity={(1 - k / 7) * 0.8 * (1 - st.t * 0.6)}
              />
            );
          });
        })}
      </svg>

      {H.pairs.map((p, idx) => {
        const st = pillState(p, idx, f, fps);
        if (f < HIT.ringIn || st.opacity <= 0.001) return null;
        const fo = focus(p);
        const litStyle: React.CSSProperties | undefined =
          fo.lit > 0
            ? {
                border: `1.5px solid rgba(232,213,200,${0.42 + fo.lit * 0.58})`,
                background: `linear-gradient(180deg, rgba(160,92,69,${0.45 * fo.lit}), rgba(160,92,69,${0.25 * fo.lit})), linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.12))`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.22), 0 0 ${26 * fo.lit}px rgba(160,92,69,${0.55 * fo.lit}), inset 0 1px 0 rgba(255,255,255,0.35)`,
              }
            : undefined;
        return (
          <div
            key={p.tool}
            style={{
              position: "absolute",
              left: L.cx + st.pos.x,
              top: L.cy + st.pos.y,
              transform: `translate(-50%, -50%) scale(${st.scale * (1 + fo.lit * 0.08)})`,
              opacity: st.opacity * fo.dim,
            }}
          >
            <GlassPill logo={p.logo} name={p.tool} font={H.pillFont} crop={p.logoCrop} style={litStyle} />
            {fo.badge > 0 ? (
              <div
                style={{
                  position: "absolute",
                  top: -H.pillFont * 0.45,
                  right: -H.pillFont * 0.35,
                  minWidth: H.pillFont * 1.15,
                  height: H.pillFont * 1.15,
                  padding: `0 ${H.pillFont * 0.3}px`,
                  borderRadius: 99,
                  backgroundColor: C.clay,
                  border: `2px solid ${C.forest}`,
                  color: "#fff",
                  fontFamily: FONT.ui,
                  fontWeight: 600,
                  fontSize: H.pillFont * 0.62,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${fo.badge})`,
                }}
              >
                {BADGE_COUNTS[idx % BADGE_COUNTS.length]}
              </div>
            ) : null}
          </div>
        );
      })}

      <Chips f={f} L={L} phase="ring" />
    </>
  );
};

// Ring chips render in the hub layer; once a chip starts its flight it moves above the card.
const Chips: React.FC<{ f: number; L: Layout; phase: "ring" | "flight" }> = ({ f, L, phase }) => {
  const { fps } = useVideoConfig();
  const H = hubLayout(L.vertical);
  return (
    <>
      {H.pairs.map((p, idx) => {
        const st = chipState(p, idx, f, fps, H, L);
        if (!st.visible || st.flying !== (phase === "flight")) return null;
        return (
          <div
            key={p.feature}
            style={{
              position: "absolute",
              left: L.cx + st.pos.x,
              top: L.cy + st.pos.y,
              transform: `translate(-50%, -50%) scale(${st.scale})`,
              opacity: st.opacity,
            }}
          >
            <FeatureChip icon={p.icon} iconColor={p.iconColor} label={p.feature} font={H.chipFont} />
          </div>
        );
      })}
    </>
  );
};

// Center: bowl bloom -> absorb pulse -> clay "One workspace" card that fills one
// module per spoken feature -> "and more" flip -> punch-through.
const Core: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const { fps } = useVideoConfig();
  const H = hubLayout(L.vertical);
  const G = workspaceGeom(L);
  const logoSize = L.vertical ? 170 : 144;
  const bloomIn = uiSpring(f, fps, HIT.logoBloom);
  const absorb = interpolate(f, [HIT.collapse + 20, HIT.lockIn - 3, HIT.lockIn + 6], [0, 1, 0], CLAMP);
  const cardP = uiSpring(f, fps, HIT.lockIn - 2);
  const wordmarkO = interpolate(f, [HIT.logoBloom + 8, HIT.logoBloom + 22, HIT.lockIn - 10, HIT.lockIn], [0, 0.6, 0.6, 0], CLAMP);
  if (f < HIT.logoBloom) return null;

  const shock = interpolate(f, [HIT.lockIn, HIT.lockIn + 20], [0, 1], CLAMP);
  const sweep = interpolate(f, [HIT.lockIn + 2, HIT.lockIn + 22], [-1, 1.4], { ...CLAMP, easing: EXPO_IN_OUT });
  const punch = interpolate(f, [HIT.adminExpand, 660], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const logoScale = interpolate(bloomIn, [0, 1], [0, 1]) * (1 + absorb * 0.22) * (1 - punch * 0.6);
  const cardVisible = f >= HIT.lockIn - 2;

  // The bowl shrinks into the card header at lock-in.
  const headerLogo = L.vertical ? 50 : 42;
  const dockP = cardVisible ? cardP : 0;
  const logoX = (-G.w / 2 + G.pad + headerLogo / 2) * dockP;
  const logoY = (-G.h / 2 + G.header / 2 + 4) * dockP;
  const logoK = 1 + (headerLogo / logoSize - 1) * dockP;
  const titleO = interpolate(f, [HIT.lockIn + 4, HIT.lockIn + 14], [0, 1], CLAMP);
  const slotsO = interpolate(f, [HIT.lockIn + 6, HIT.lockIn + 14], [0, 1], CLAMP);

  // 9:16 shows six tools, so Billing and Files have no chip to fly in; they pop in place.
  const onScreen = new Set(H.pairs.map((p) => p.feature));
  const flipFrom = HIT.listMore - 2;
  const flipIdx = Math.floor((f - flipFrom) / FLIP_STEP);
  const flip = f >= flipFrom ? MORE_FLIP[flipIdx] ?? { label: "+ 12 more", icon: LayoutGrid, color: C.clay } : null;
  const slotChip = (key: string, k: number, scale: number, chip: React.ReactNode) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: L.cx + G.slots[k].x,
        top: L.cy + G.slots[k].y,
        transform: `translate(-50%, -50%) scale(${scale * rowScale(L)})`,
      }}
    >
      {chip}
    </div>
  );

  return (
    <>
      {shock > 0 && shock < 1 ? (
        <div
          style={{
            position: "absolute",
            left: L.cx,
            top: L.cy,
            width: 300,
            height: 300,
            marginLeft: -150,
            marginTop: -150,
            borderRadius: "50%",
            border: `2px solid ${C.clayHighlight}`,
            transform: `scale(${0.6 + shock * 3.2})`,
            opacity: (1 - shock) * 0.55,
          }}
        />
      ) : null}

      {cardVisible ? (
        <div
          style={{
            position: "absolute",
            left: L.cx - G.w / 2,
            top: L.cy - G.h / 2,
            width: G.w,
            height: G.h,
            borderRadius: 30,
            backgroundColor: C.clayFill,
            border: `1.5px solid ${C.clayBorder}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
            overflow: "hidden",
            transform: `scale(${cardP})`,
            opacity: Math.min(1, cardP * 1.5),
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              left: `${sweep * 100}%`,
              background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.18), transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: G.pad + headerLogo + 14,
              top: G.header / 2 + 4,
              transform: "translateY(-50%)",
              fontFamily: FONT.ui,
              fontWeight: 600,
              fontSize: L.vertical ? 30 : 25,
              color: C.clayHighlight,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              opacity: titleO,
            }}
          >
            One workspace
          </div>
          {G.slots.map((s, k) => {
            const filledAt = k < LIST.length ? HIT.listWords[k] + DOCK_FLIGHT / 2 : HIT.listMore;
            const fill = interpolate(f, [filledAt, filledAt + 6], [0, 1], CLAMP);
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: G.w / 2 + s.x - G.cellW / 2,
                  top: G.h / 2 + s.y - G.cellH / 2,
                  width: G.cellW,
                  height: G.cellH,
                  borderRadius: 18,
                  border: `1.5px dashed rgba(232,213,200,${0.34 * (1 - fill)})`,
                  backgroundColor: `rgba(247,241,231,${0.09 * fill})`,
                  opacity: slotsO,
                }}
              />
            );
          })}
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: L.cx + logoX,
          top: L.cy + logoY,
          transform: `translate(-50%, -50%) scale(${logoScale * logoK})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <LogoMark size={logoSize} bloom={bloomIn * (0.7 + absorb * 0.6) * (1 - punch) * (1 - dockP * 0.8)} />
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: L.vertical ? 34 : 28,
            color: C.cream,
            opacity: wordmarkO,
            height: 0,
            overflow: "visible",
            whiteSpace: "nowrap",
          }}
        >
          MudKitchen
        </div>
      </div>

      <Chips f={f} L={L} phase="flight" />
      {LIST.map((name, k) => {
        const at = HIT.listWords[k];
        const pair = PAIRS.find((p) => p.feature === name);
        if (onScreen.has(name) || f < at || !pair) return null;
        return slotChip(name, k, uiSpring(f, fps, at), (
          <FeatureChip icon={pair.icon} iconColor={pair.iconColor} label={name} font={H.chipFont} />
        ));
      })}
      {flip
        ? slotChip("more", 5, uiSpring(f, fps, flipFrom), (
            <FeatureChip icon={flip.icon} iconColor={flip.color} label={flip.label} font={H.chipFont} />
          ))
        : null}

      {punch > 0 ? (
        <div
          style={{
            position: "absolute",
            left: L.cx,
            top: L.cy,
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#FFFAF4",
            zIndex: 5,
            transform: `translate(-50%, -50%) scale(${punch * Math.hypot(L.W, L.H) / 10 * 1.05})`,
          }}
        />
      ) : null}
    </>
  );
};

export const HubActs: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  const H = hubLayout(L.vertical);
  const cam = hubCamera(f);
  const blurWindow = f >= HIT.collapse + 6 && f <= HIT.lockIn - 4;

  const hub = (
    <AbsoluteFill
      style={{
        transform: `scale(${cam.scale})`,
        filter: cam.blur > 0.2 ? `blur(${cam.blur}px)` : undefined,
        opacity: cam.opacity,
      }}
    >
      <HubLayer f={f} L={L} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill>
      <Backdrop color={C.forest} fog={C.sage} fogOpacity={0.16} vignette={0.42} />
      <ParallaxRings f={f} L={L} rx={H.outerRx} ry={H.outerRy} />
      {blurWindow ? (
        <CameraMotionBlur shutterAngle={200} samples={6}>
          {hub}
        </CameraMotionBlur>
      ) : (
        hub
      )}
      <Core f={f} L={L} />
      <IntroAct f={f} L={L} />
    </AbsoluteFill>
  );
};