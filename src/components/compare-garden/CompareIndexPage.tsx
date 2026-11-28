"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Squiggle, Star, Tape } from "@/components/garden/ui";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import { TAPES } from "@/components/home-garden/assets";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { COMPARE_RIVAL_IDS, comparePath, compareSummary, rivalComparison } from "@/lib/marketing/compare";
import { FEATURES_PATH } from "@/lib/marketing/features/paths";
import { COMPARE_INDEX_COPY as C } from "./compare-copy";
import { TallyChips } from "./TallyChips";

const CARD_TINTS = ["bg-[var(--sf-sky)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-lav)]"];

/** /compare: one card per rival with its tally and the short answer, linking to the full page. */
export default function CompareIndexPage() {
  const comparisons = COMPARE_RIVAL_IDS.map((id) => rivalComparison(id));
  return (
    <HomeGardenShell bookDemoHref={BOOK_DEMO_HASH_HREF}>
      <section aria-label="Microschool software compared" className="sf-grid relative overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-40">
        <Draw className="absolute left-[6%] top-[40%] hidden w-10 lg:block" delay={1}>
          <Star color="var(--sf-forest)" />
        </Draw>
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-10">
          <span className="sf-hand text-2xl text-[var(--sf-forest)]" aria-hidden="true">
            {C.note}
          </span>
          <h1 className="sf-display mt-3 text-[11vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[5.2rem]">
            <WordsReveal as="span" text={C.headlineLead} immediate className="block" />
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={C.headlineAccent} immediate delay={0.25} />
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-[var(--sf-soft)]">{C.body}</p>
        </div>

        <Reveal as="ul" className="mx-auto mt-16 grid max-w-7xl gap-8 px-6 sm:px-10 lg:grid-cols-3 lg:px-16" stagger={0.1} y={40}>
          {comparisons.map((comparison, i) => (
            <li
              key={comparison.rival.id}
              className={`relative flex flex-col rounded-[30px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_6px_0_0_var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 ${CARD_TINTS[i % CARD_TINTS.length]}`}
              style={{ rotate: `${i % 2 ? 0.8 : -0.8}deg` }}
            >
              <Tape color={TAPES[i % TAPES.length]} className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
              <h2 className="sf-display text-3xl leading-[1.02] text-[var(--sf-ink)]">MudKitchen vs {comparison.rival.name}</h2>
              <p className="mt-1 text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/70">{comparison.rival.builtFor}</p>
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-[var(--sf-ink)]/80">{compareSummary(comparison)}</p>
              <TallyChips tally={comparison.tally} className="mt-5" />
              <Link
                href={comparePath(comparison.rival.id)}
                className="mt-6 inline-flex items-center gap-1.5 self-start rounded-full font-extrabold text-[var(--sf-ink)] underline decoration-[var(--sf-ink)]/30 decoration-2 underline-offset-4 hover:decoration-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                {C.cardCta}
                <span className="sr-only">: MudKitchen vs {comparison.rival.name}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </Reveal>

        <p className="mt-14 text-center">
          <Link
            href={FEATURES_PATH}
            className="rounded-full font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
          >
            {C.featuresLink}
          </Link>
        </p>
      </section>
      <GardenBookDemo />
    </HomeGardenShell>
  );
}
