"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PAIRS } from "@/components/sections/PainSection";

const W = 1000;
const H = 680;
const CARD = { l: 310, t: 200, w: 380, h: 280 };
const OUTER_PILL_RX = 38;
const OUTER_PILL_RY = 11;

type Pair = (typeof PAIRS)[number];

function pillEdge(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return from;
  const nx = dx / len;
  const ny = dy / len;
  const scale = 1 / Math.sqrt((nx / OUTER_PILL_RX) ** 2 + (ny / OUTER_PILL_RY) ** 2);
  return { x: from.x + nx * scale, y: from.y + ny * scale };
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const TONE = {
  light: {
    tool: "bg-white border border-border text-text-muted shadow-xs",
    feature: "bg-white border border-sage-200 text-accent shadow-md",
    ring: "bg-sage-100/70 border border-sage-200",
    line: "#7FA888",
    dash: "#4a7c59",
    logoLabel: "text-accent/70",
    row: "bg-white border border-border",
    rowText: "text-text",
    arrow: "text-accent-soft",
    hubCard: "bg-white border border-sage-200 shadow-sm",
    hubLabel: "text-accent",
    hubSub: "text-text-muted",
  },
} as const;

type Tone = keyof typeof TONE;

function FeatureChip({ pair, className }: { pair: Pair; className: string }) {
  const Icon = pair.icon;
  return (
    <span
      className={`flex items-center gap-1 whitespace-nowrap rounded-pill px-1.5 py-0.5 text-[8px] font-semibold md:px-2.5 md:py-1 md:text-[10px] lg:px-3 lg:text-[11px] ${className}`}
    >
      <Icon size={11} className="shrink-0" style={{ color: pair.iconColor }} />
      {pair.feature}
    </span>
  );
}

function ToolChip({ pair, className }: { pair: Pair; className: string }) {
  return (
    <span
      className={`flex items-center gap-1 whitespace-nowrap rounded-pill px-2 py-0.5 text-[9px] md:gap-1.5 md:px-3 md:py-1.5 md:text-[11px] ${className}`}
    >
      <Image src={pair.logo} alt={pair.tool} width={14} height={14} className="shrink-0 object-contain" />
      {pair.tool}
    </span>
  );
}

function HubLogo({ tone }: { tone: Tone }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Image src="/images/Logo.webp" alt="MudKitchen" width={60} height={60} className="object-contain" />
      <span
        className={`font-display whitespace-nowrap text-[clamp(9px,1.2vw,15px)] tracking-tight ${TONE[tone].logoLabel}`}
      >
        MudKitchen
      </span>
    </div>
  );
}

function MobileList({ tone, scatteredLabel, unifiedLabel }: { tone: Tone; scatteredLabel: string; unifiedLabel: string }) {
  const t = TONE[tone];
  return (
    <div className="mx-auto w-full max-w-[400px] px-1 md:hidden">
      <p className={`mb-4 text-center text-[11px] font-medium uppercase tracking-widest ${t.arrow}`}>
        {scatteredLabel}
      </p>
      <div className="flex flex-col gap-2">
        {PAIRS.map((p, i) => (
          <motion.div
            key={p.tool}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${t.row}`}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <Image src={p.logo} alt={p.tool} width={18} height={18} className="shrink-0 object-contain" />
              <span className={`truncate text-[13px] ${t.rowText}`}>{p.tool}</span>
            </span>
            <ArrowRight size={14} className={`shrink-0 ${t.arrow}`} aria-hidden="true" />
            <span className="flex shrink-0 items-center gap-1 rounded-pill bg-white px-2.5 py-1 shadow-xs">
              <p.icon size={12} className="shrink-0" style={{ color: p.iconColor }} />
              <span className="whitespace-nowrap text-[11px] font-semibold text-accent">{p.feature}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <div className={`mt-6 flex w-full flex-col items-center gap-2 rounded-2xl px-8 py-5 ${t.hubCard}`}>
        <Image src="/images/Logo.webp" alt="MudKitchen" width={52} height={52} className="object-contain" />
        <span className={`font-display text-[15px] tracking-tight ${t.hubLabel}`}>MudKitchen</span>
        <p className={`text-center text-[13px] leading-snug ${t.hubSub}`}>{unifiedLabel}</p>
      </div>
    </div>
  );
}

function ConvergeNode({ pair, index, progress, tone }: { pair: Pair; index: number; progress: MotionValue<number>; tone: Tone }) {
  const t = TONE[tone];
  const spread = 1.08;
  const ox = 500 + (pair.outer.x - 500) * spread;
  const oy = 340 + (pair.outer.y - 340) * spread;
  const left = useTransform(progress, (v) => pct(ox + (pair.inner.x - ox) * v, W));
  const top = useTransform(progress, (v) => pct(oy + (pair.inner.y - oy) * v, H));
  const startRotate = ((index * 37) % 13) - 6;
  const rotate = useTransform(progress, [0, 1], [startRotate, 0]);
  const toolOpacity = useTransform(progress, [0.55, 0.8], [1, 0]);
  const featureOpacity = useTransform(progress, [0.55, 0.8], [0, 1]);

  return (
    <motion.div className="absolute z-20" style={{ left, top, x: "-50%", y: "-50%", rotate }}>
      <motion.div style={{ opacity: toolOpacity }}>
        <ToolChip pair={pair} className={t.tool} />
      </motion.div>
      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: featureOpacity }}>
        <FeatureChip pair={pair} className={t.feature} />
      </motion.div>
    </motion.div>
  );
}

function ConvergeHub({ tone, progress }: { tone: Tone; progress: MotionValue<number> }) {
  const t = TONE[tone];
  const ringOpacity = useTransform(progress, [0.5, 1], [0, 1]);
  const ringScale = useTransform(progress, [0.5, 1], [0.6, 1]);
  const logoOpacity = useTransform(progress, [0.45, 0.9], [0, 1]);
  const logoScale = useTransform(progress, [0.45, 0.9], [0.7, 1]);
  const ghostOpacity = useTransform(progress, [0.7, 1], [0, 0.5]);

  return (
    <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={{ opacity: ghostOpacity }}
      >
        {PAIRS.map((p) => {
          const edge = pillEdge(p.outer, p.inner);
          return (
            <line
              key={p.tool}
              x1={edge.x}
              y1={edge.y}
              x2={p.inner.x}
              y2={p.inner.y}
              stroke={t.line}
              strokeWidth={1.25}
              strokeDasharray="3 6"
            />
          );
        })}
      </motion.svg>
      {PAIRS.map((p) => (
        <motion.div
          key={p.tool}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 grayscale"
          style={{ left: pct(p.outer.x, W), top: pct(p.outer.y, H), opacity: ghostOpacity }}
          aria-hidden="true"
        >
          <ToolChip pair={p} className={`${t.tool} line-through decoration-1`} />
        </motion.div>
      ))}
      <motion.div
        className={`absolute rounded-[50%] ${t.ring}`}
        style={{
          left: pct(CARD.l - 20, W),
          top: pct(CARD.t - 10, H),
          width: pct(CARD.w + 40, W),
          height: pct(CARD.h + 20, H),
          opacity: ringOpacity,
          scale: ringScale,
        }}
        aria-hidden="true"
      />
      <motion.div className="absolute inset-0 z-10 flex items-center justify-center" style={{ opacity: logoOpacity, scale: logoScale }}>
        <HubLogo tone={tone} />
      </motion.div>
      {PAIRS.map((p, i) => (
        <ConvergeNode key={p.tool} pair={p} index={i} progress={progress} tone={tone} />
      ))}
    </div>
  );
}

type ToolHubProps = {
  tone?: Tone;
  scatteredLabel: string;
  unifiedLabel: string;
  progress: MotionValue<number>;
  className?: string;
};

/** Mobile list below `md`; on larger screens the tools converge as `progress` goes 0 to 1. */
export default function ToolHub({ tone = "light", scatteredLabel, unifiedLabel, progress, className = "" }: ToolHubProps) {
  return (
    <div className={`select-none ${className}`}>
      <MobileList tone={tone} scatteredLabel={scatteredLabel} unifiedLabel={unifiedLabel} />
      <div className="hidden md:block">
        <ConvergeHub tone={tone} progress={progress} />
      </div>
    </div>
  );
}
