"use client";

import { Reveal } from "@/components/garden/motion";
import { Arrow, Draw, Leaf } from "@/components/garden/ui";
import { GIFT_CARD_STEPS } from "@/lib/marketing/gift-card-offer";

const STEP_NOTES = [
  { tint: "bg-[var(--sf-butter)]", tilt: -2 },
  { tint: "bg-[var(--sf-sky)]", tilt: 1.5 },
  { tint: "bg-[var(--sf-clay)] text-white", tilt: -1 },
] as const;

/** The gift card's three conditions as sticky notes joined by drawn arrows (recipe 7). Used on /gift-card and its terms page. */
export default function GiftCardSteps({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <h2 className="text-center text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--sf-soft)]">{label}</h2>
      <div className="relative mt-12">
        <Draw className="pointer-events-none absolute left-[29%] top-[-2.5rem] hidden w-28 lg:block" delay={0.4}>
          <Arrow color="var(--sf-forest)" />
        </Draw>
        <Draw className="pointer-events-none absolute left-[63%] top-[-2.5rem] hidden w-28 lg:block" delay={0.9}>
          <Arrow color="var(--sf-forest)" />
        </Draw>
        <Reveal as="ol" className="grid gap-8 md:grid-cols-3 md:gap-7" stagger={0.15} y={50}>
          {GIFT_CARD_STEPS.map((s, i) => {
            const n = STEP_NOTES[i];
            const dark = i === 2;
            return (
              <li
                key={s.n}
                className={`sf-wiggle relative overflow-hidden rounded-md p-7 pt-9 shadow-[0_18px_34px_-18px_rgba(43,36,29,0.55)] ${n.tint}`}
                style={{ rotate: `${n.tilt}deg` }}
              >
                <span className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 rotate-2 rounded-b-sm bg-white/70" aria-hidden="true" />
                {dark ? (
                  <Draw className="absolute -bottom-6 -right-6 w-28 opacity-40">
                    <Leaf color="#fff" />
                  </Draw>
                ) : null}
                <span aria-hidden="true" className={`sf-hand text-xl ${dark ? "text-white/85" : "text-[var(--sf-ink)]/60"}`}>
                  step {s.n}
                </span>
                <h3 className={`sf-display mt-2 text-[1.9rem] leading-[1.02] ${dark ? "text-white" : "text-[var(--sf-ink)]"}`}>{s.title}</h3>
                <p className={`mt-4 leading-relaxed ${dark ? "text-white/90" : "text-[var(--sf-ink)]/75"}`}>{s.body}</p>
              </li>
            );
          })}
        </Reveal>
      </div>
    </div>
  );
}
