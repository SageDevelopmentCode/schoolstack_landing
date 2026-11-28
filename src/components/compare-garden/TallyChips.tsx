import type { RivalTally } from "@/lib/marketing/compare";
import { COMPARE_INDEX_COPY as C, fill } from "./compare-copy";

const CHIPS = [
  { key: "yes", label: C.tallyYes, className: "bg-[var(--sf-mint)]" },
  { key: "partial", label: C.tallyPartial, className: "bg-[var(--sf-butter)]" },
  { key: "no", label: C.tallyNo, className: "bg-[var(--sf-peach)]" },
  { key: "unknown", label: C.tallyUnknown, className: "bg-white" },
] as const;

/** How many of the compared capabilities a rival offers, as four count chips. */
export function TallyChips({ tally, className = "" }: { tally: RivalTally; className?: string }) {
  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-2.5">
        {CHIPS.map((chip) => (
          <li
            key={chip.key}
            className={`inline-flex items-baseline gap-1.5 rounded-full border-2 border-[var(--sf-ink)] px-3.5 py-1.5 text-sm font-extrabold text-[var(--sf-ink)] ${chip.className}`}
          >
            <span className="sf-display text-lg leading-none">{tally[chip.key]}</span> {chip.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm font-semibold text-[var(--sf-soft)]">{fill(C.outOf, { total: tally.total })}</p>
    </div>
  );
}
