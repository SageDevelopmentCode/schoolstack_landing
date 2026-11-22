/**
 * Garden tint per build phase. Literal class strings only (Tailwind can't see
 * dynamically built names). Phases cycle through the pastels by number.
 */

export type PhaseTint = {
  /** Phase pill background + readable text. */
  pill: string;
  /** Timeline dot fill. */
  dot: string;
  /** Soft wash for the highlight ticks. */
  tickFill: string;
  tickStroke: string;
};

const PHASE_TINTS: PhaseTint[] = [
  {
    pill: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
    dot: "bg-[var(--sf-mint)]",
    tickFill: "var(--sf-mint)",
    tickStroke: "var(--sf-forest)",
  },
  {
    pill: "bg-[var(--sf-sky)] text-[#24507a]",
    dot: "bg-[var(--sf-sky)]",
    tickFill: "var(--sf-sky)",
    tickStroke: "#24507a",
  },
  {
    pill: "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
    dot: "bg-[var(--sf-peach)]",
    tickFill: "var(--sf-peach)",
    tickStroke: "var(--sf-clay-deep)",
  },
  {
    pill: "bg-[var(--sf-lav)] text-[#5e3a78]",
    dot: "bg-[var(--sf-lav)]",
    tickFill: "var(--sf-lav)",
    tickStroke: "#5e3a78",
  },
  {
    pill: "bg-[var(--sf-butter)] text-[#6b4f00]",
    dot: "bg-[var(--sf-butter)]",
    tickFill: "var(--sf-butter)",
    tickStroke: "#6b4f00",
  },
];

export function phaseTint(phaseNumber: string): PhaseTint {
  const n = Number.parseInt(phaseNumber, 10);
  const index = Number.isFinite(n) && n > 0 ? (n - 1) % PHASE_TINTS.length : 0;
  return PHASE_TINTS[index];
}
