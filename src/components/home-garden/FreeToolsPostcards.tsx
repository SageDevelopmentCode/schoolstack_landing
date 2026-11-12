"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FREE_TOOLS_HUB_PATH } from "@/lib/marketing/free-tools";
import { FREE_TOOLS_HUB_TOOLS } from "@/lib/marketing/free-tools-hub-content";
import { Pill } from "@/components/garden/ui";
import { Reveal, WordsReveal } from "@/components/garden/motion";

const COPY = {
  eyebrow: "Free tools",
  heading: "Free tools for microschool founders",
  body: "Three free tools for enrollment, tuition, and operations. No MudKitchen account required.",
  link: "Explore all free tools",
} as const;

const CARD = [
  { tint: "bg-[var(--sf-butter)]", stamp: "bg-[var(--sf-peach)]", tilt: -2 },
  { tint: "bg-[var(--sf-sky)]", stamp: "bg-[var(--sf-mint)]", tilt: 1.5 },
  { tint: "bg-[var(--sf-mint)]", stamp: "bg-[var(--sf-lav)]", tilt: -1 },
];

/** The three free founder tools, as postcards with a dashed stamp corner. */
export default function FreeToolsPostcards({ className = "" }: { className?: string }) {
  return (
    <section className={`py-24 lg:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Pill tint="butter">🧮 {COPY.eyebrow}</Pill>
            <WordsReveal text={COPY.heading} className="sf-display mt-5 text-5xl leading-[0.95] md:text-6xl" />
            <p className="mt-5 text-lg leading-relaxed text-[var(--sf-soft)]">{COPY.body}</p>
          </div>
          <Link
            href={FREE_TOOLS_HUB_PATH}
            className="group inline-flex items-center gap-2 rounded-full px-1 text-base font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-[6px] hover:decoration-[var(--sf-forest)]"
          >
            {COPY.link}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
        <Reveal className="mt-14 grid gap-8 md:grid-cols-3" stagger={0.12} y={50}>
          {FREE_TOOLS_HUB_TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            const c = CARD[i % CARD.length];
            return (
              <div key={tool.id}>
                <Link
                  href={tool.href}
                  className={`group relative flex h-full flex-col rounded-[28px] border-2 border-[var(--sf-ink)] ${c.tint} p-7 shadow-[0_8px_0_0_var(--sf-ink)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1.5 hover:shadow-[0_12px_0_0_var(--sf-ink)] focus-visible:!rotate-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35`}
                  style={{ rotate: `${c.tilt}deg` }}
                >
                  <span className={`absolute right-5 top-5 flex h-16 w-14 items-center justify-center rounded-md border-2 border-dashed border-[var(--sf-ink)]/40 ${c.stamp}`} aria-hidden="true">
                    <Icon size={24} strokeWidth={2.2} className="text-[var(--sf-ink)]" />
                  </span>
                  <span className="sf-hand mb-3 text-xl text-[var(--sf-ink)]/70">{tool.kicker}</span>
                  <h3 className="sf-display max-w-[80%] text-3xl leading-[1] text-[var(--sf-ink)]">{tool.title}</h3>
                  <p className="mt-4 flex-1 leading-relaxed text-[var(--sf-ink)]/75">{tool.description}</p>
                  <p className="mt-4 text-xs font-bold text-[var(--sf-ink)]/55">{tool.timeHint}</p>
                  <span className="mt-6 inline-flex items-center gap-2 border-t-2 border-dashed border-[var(--sf-ink)]/25 pt-4 font-extrabold text-[var(--sf-ink)]">
                    {tool.ctaLabel}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
