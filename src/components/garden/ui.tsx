"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, MQ_MOTION } from "./gsap";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sf-cream)]";

/** Clay primary "toy" button. */
export const btnPop = `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sf-clay)] px-7 py-4 text-base font-extrabold text-white shadow-[0_6px_0_0_var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_var(--sf-clay-deep)] active:translate-y-1 active:shadow-[0_2px_0_0_var(--sf-clay-deep)] cursor-pointer ${focusRing} focus-visible:ring-[var(--sf-clay)]/40`;
/** Forest secondary "toy" button. */
export const btnForest = `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sf-forest)] px-7 py-4 text-base font-extrabold text-white shadow-[0_6px_0_0_var(--sf-forest-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_var(--sf-forest-deep)] active:translate-y-1 active:shadow-[0_2px_0_0_var(--sf-forest-deep)] cursor-pointer ${focusRing} focus-visible:ring-[var(--sf-forest)]/40`;
/** Ink outline "toy" button. */
export const btnOutline = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-ink)] bg-white px-7 py-[14px] text-base font-extrabold text-[var(--sf-ink)] shadow-[0_6px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_var(--sf-ink)] active:translate-y-1 active:shadow-[0_2px_0_0_var(--sf-ink)] cursor-pointer ${focusRing} focus-visible:ring-[var(--sf-ink)]/30`;
/** Butter button for dark panels. */
export const btnButter = `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sf-butter)] px-7 py-4 text-base font-extrabold text-[var(--sf-ink)] shadow-[0_6px_0_0_#d9b94a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_#d9b94a] active:translate-y-1 active:shadow-[0_2px_0_0_#d9b94a] cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50`;

/** Highlighted phrase: marker swipe under the words. */
export const MARK = {
  butter: "font-extrabold text-[var(--sf-ink)] bg-[linear-gradient(transparent_60%,var(--sf-butter)_60%)] box-decoration-clone",
  peach: "font-extrabold text-[var(--sf-ink)] bg-[linear-gradient(transparent_60%,var(--sf-peach)_60%)] box-decoration-clone",
  mint: "font-extrabold text-[var(--sf-ink)] bg-[linear-gradient(transparent_60%,var(--sf-mint)_60%)] box-decoration-clone",
  sky: "font-extrabold text-[var(--sf-ink)] bg-[linear-gradient(transparent_60%,var(--sf-sky)_60%)] box-decoration-clone",
} as const;

const TINTS = {
  clay: "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
  forest: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  butter: "bg-[var(--sf-butter)] text-[#6b4f00]",
  sky: "bg-[var(--sf-sky)] text-[#24507a]",
  lav: "bg-[var(--sf-lav)] text-[#5e3a78]",
  ink: "bg-white/10 text-white",
} as const;
export type Tint = keyof typeof TINTS;

export function Pill({ children, tint = "clay", className = "" }: { children: ReactNode; tint?: Tint; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-extrabold ${TINTS[tint]} ${className}`}>
      {children}
    </span>
  );
}

/** Pastel washi-tape strip. Position it with className. */
export function Tape({ color = "var(--sf-butter)", className = "" }: { color?: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 h-6 w-20 rounded-sm opacity-90 shadow-[0_2px_6px_rgba(0,0,0,0.06)] ${className}`}
      style={{ background: color }}
    />
  );
}

/** Wrap hand-drawn SVGs: every [data-draw] path draws itself when it scrolls into view. */
export function Draw({
  children,
  className = "",
  delay = 0,
  duration = 1.4,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        const paths = ref.current!.querySelectorAll<SVGPathElement>("[data-draw]");
        paths.forEach((p) => {
          p.setAttribute("pathLength", "1");
          p.style.strokeDasharray = "1 2";
        });
        gsap.fromTo(
          paths,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration,
            delay,
            stagger: 0.15,
            ease: "power2.inOut",
            scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <span ref={ref} className={className || "inline-block"} aria-hidden="true">
      {children}
    </span>
  );
}

export const Squiggle = ({ className = "", color = "var(--sf-clay)" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 300 24" className={className} fill="none" preserveAspectRatio="none">
    <path
      data-draw
      d="M3 15 C 30 3, 50 3, 75 13 S 120 23, 150 12 S 200 2, 225 12 S 270 22, 297 9"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

export const Sun = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="#e8b33a" strokeWidth="4" strokeLinecap="round">
    <path data-draw d="M50 30 a20 20 0 1 0 0.1 0" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      const x1 = 50 + Math.cos(a) * 30;
      const y1 = 50 + Math.sin(a) * 30;
      const x2 = 50 + Math.cos(a) * 42;
      const y2 = 50 + Math.sin(a) * 42;
      return <path key={i} data-draw d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`} />;
    })}
  </svg>
);

export const Leaf = ({ className = "", color = "var(--sf-forest)" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path data-draw d="M20 80 C 20 40, 50 18, 85 15 C 82 50, 60 80, 20 80 Z" />
    <path data-draw d="M20 80 C 40 60, 55 45, 70 32" />
  </svg>
);

export const Arrow = ({ className = "", color = "var(--sf-ink)" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 120 80" className={className} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path data-draw d="M6 12 C 40 4, 80 18, 92 60" />
    <path data-draw d="M78 52 L92 62 L100 46" />
  </svg>
);

export const Star = ({ className = "", color = "var(--sf-clay)" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round">
    <path data-draw d="M50 8 L61 38 L93 39 L67 58 L77 90 L50 71 L23 90 L33 58 L7 39 L39 38 Z" />
  </svg>
);

/** Hand-drawn circle, for ringing a word or number. */
export const Ring = ({ className = "", color = "var(--sf-clay)" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 220 90" className={className} fill="none" preserveAspectRatio="none">
    <path
      data-draw
      d="M120 6 C 60 2, 8 18, 8 46 C 8 76, 80 86, 130 82 C 186 78, 214 62, 212 40 C 210 16, 160 4, 96 10"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

/** Small hand-drawn check, used for ticked lists. Pass data-tick for scroll ticking. */
export function Tick({ className = "h-6 w-6", color = "var(--sf-forest)", fill = "#fff", tick = false }: { className?: string; color?: string; fill?: string; tick?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill={fill} opacity="0.85" />
      <path
        {...(tick ? { "data-tick": "" } : {})}
        pathLength={1}
        strokeDasharray="1 2"
        d="M6.5 12.5 L10.5 16.5 L17.5 7.5"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
