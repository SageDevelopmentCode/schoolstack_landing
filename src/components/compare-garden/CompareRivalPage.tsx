"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { WordsReveal } from "@/components/garden/motion";
import { Draw, Squiggle, Sun, btnOutline, btnPop } from "@/components/garden/ui";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenFaq from "@/components/home-garden/GardenFaq";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { CompareCellView, SourceLink } from "@/components/features-garden/FeatureSections";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { COMPARE_PATH, COMPARE_RIVAL_IDS, compareFaq, comparePath, compareSummary, getRival, rivalComparison } from "@/lib/marketing/compare";
import { FEATURES_CONTENT_UPDATED, formatContentDate } from "@/lib/marketing/features/rivals";
import type { CompareCell, RivalId, Source } from "@/lib/marketing/features/types";
import { COMPARE_RIVAL_COPY as C, fill } from "./compare-copy";
import { TallyChips } from "./TallyChips";

const linkClass =
  "inline-flex items-center gap-1.5 rounded-full text-sm font-extrabold text-[var(--sf-soft)] hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

/**
 * MudKitchen vs one rival: answer-first summary → where they differ → every capability by
 * feature with sources → FAQ → book a demo. Takes the id, so the data stays client side.
 */
export default function CompareRivalPage({ rivalId }: { rivalId: RivalId }) {
  const comparison = rivalComparison(rivalId);
  const { rival, sections, tally, differences, checked } = comparison;
  const vars = { rival: rival.name, date: checked };

  // Number each distinct source once, in reading order (same as the feature tables).
  const sources: Source[] = [];
  const noteFor = (cell: CompareCell) => {
    if (!cell.source) return undefined;
    const at = sources.findIndex((s) => s.url === cell.source!.url && s.label === cell.source!.label);
    if (at >= 0) return at + 1;
    sources.push(cell.source);
    return sources.length;
  };
  const numbered = sections.map((s) => ({ ...s, rows: s.rows.map((row) => ({ row, note: noteFor(row.rival) })) }));
  const others = COMPARE_RIVAL_IDS.filter((id) => id !== rivalId).map((id) => getRival(id)!);

  return (
    <HomeGardenShell bookDemoHref={BOOK_DEMO_HASH_HREF}>
      {/* Hero: the short answer first, so it can be read (and quoted) on its own. */}
      <section aria-label={`MudKitchen vs ${rival.name}`} className="sf-grid relative overflow-hidden pb-20 pt-32 lg:pb-24 lg:pt-40">
        <Draw className="absolute right-[10%] top-28 hidden w-14 lg:block" delay={0.8}>
          <Sun />
        </Draw>
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <Link href={COMPARE_PATH} className={linkClass}>
            <ArrowLeft size={15} aria-hidden="true" /> {C.backLink}
          </Link>
          <span className="sf-hand mt-8 block text-2xl text-[var(--sf-forest)]" aria-hidden="true">
            {C.note}
          </span>
          <h1 className="sf-display mt-2 text-[11vw] leading-[0.9] text-[var(--sf-ink)] sm:text-6xl lg:text-[4.4rem] xl:text-[5rem]">
            <WordsReveal as="span" text={fill(C.headlineLead, vars)} immediate className="block" />
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={C.headlineAccent} immediate delay={0.25} />
            </span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg font-semibold leading-relaxed text-[var(--sf-ink)]/85">{compareSummary(comparison)}</p>
          <TallyChips tally={tally} className="mt-7" />
          <p className="mt-4 text-sm font-semibold text-[var(--sf-soft)]">
            {C.updated} <time dateTime={FEATURES_CONTENT_UPDATED}>{formatContentDate(FEATURES_CONTENT_UPDATED)}</time>
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {C.bookDemo}
            </a>
            <a href="#feature-by-feature" className={btnOutline}>
              {C.seeTable}
            </a>
          </div>
        </div>
      </section>

      {/* Where they differ */}
      <section className="bg-[var(--sf-peach)]/40 py-24 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <SectionIntro lead={C.differencesLead} accent={C.differencesAccent} align="left" body={<p>{fill(C.differencesBody, vars)}</p>} />
          {differences.length ? (
            <ul className="mt-12 grid gap-5 md:grid-cols-2">
              {differences.map((d, i) => (
                <li
                  key={`${d.feature}-${d.label}`}
                  className="rounded-[26px] border-2 border-[var(--sf-ink)] bg-white p-6 shadow-[0_4px_0_0_var(--sf-ink)]"
                  style={{ rotate: `${i % 2 ? 0.5 : -0.5}deg` }}
                >
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-clay-deep)]">{d.feature}</p>
                  <h3 className="sf-display mt-2 text-2xl leading-[1.05] text-[var(--sf-ink)]">{d.label}</h3>
                  <dl className="mt-4 space-y-3">
                    <div>
                      <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-forest)]">MudKitchen</dt>
                      <dd className="mt-1">
                        <CompareCellView cell={d.mudkitchen} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">{rival.name}</dt>
                      <dd className="mt-1">
                        <CompareCellView cell={d.rival} />
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[var(--sf-soft)]">{fill(C.noDifferences, vars)}</p>
          )}
        </div>
      </section>

      {/* Every capability, by feature */}
      <section id="feature-by-feature" className="scroll-mt-24 bg-[var(--sf-paper)] py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <SectionIntro
            lead={C.tableLead}
            accent={C.tableAccent}
            accentColor="text-[#5e3a78]"
            squiggle="var(--sf-lav)"
            align="left"
            body={<p>{fill(C.tableBody, vars)}</p>}
          />
          <div className="mt-14 space-y-12">
            {numbered.map(({ feature, rows }) => (
              <div key={feature.slug} className="sf-paper overflow-hidden rounded-[30px] border-2 border-[var(--sf-ink)] shadow-[0_6px_0_0_var(--sf-ink)]">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-[var(--sf-ink)] px-5 py-4 sm:px-6">
                  <h3 className="sf-display text-2xl leading-none text-[var(--sf-ink)]">{feature.name}</h3>
                  <Link href={feature.path} className={linkClass}>
                    {fill(C.featureLink, { feature: feature.name })} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                <table className="w-full table-fixed border-collapse text-left">
                  <caption className="sr-only">
                    {feature.name}: MudKitchen compared with {rival.name}
                  </caption>
                  <thead>
                    <tr className="border-b border-dashed border-[var(--sf-ink)]/20">
                      <th scope="col" className="w-[34%] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)] sm:px-6">
                        {C.capability}
                      </th>
                      <th scope="col" className="w-[33%] bg-[var(--sf-mint)]/60 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-forest)]">
                        MudKitchen
                      </th>
                      <th scope="col" className="w-[33%] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">
                        {rival.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ row, note }) => (
                      <tr key={row.label} className="border-b border-dashed border-[var(--sf-ink)]/20 last:border-b-0">
                        <th scope="row" className="px-5 py-4 align-top text-[15px] font-extrabold leading-snug text-[var(--sf-ink)] sm:px-6">
                          {row.label}
                        </th>
                        <td className="bg-[var(--sf-mint)]/40 px-4 py-4 align-top">
                          <CompareCellView cell={row.mudkitchen} />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <CompareCellView cell={row.rival} footnote={note} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="mt-12 text-sm leading-relaxed text-[var(--sf-soft)]">
            <p>{fill(C.checked, vars)}</p>
            {sources.length ? (
              <>
                <h3 className="mt-5 text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--sf-ink)]">{C.sources}</h3>
                <ol className="mt-3 space-y-1.5">
                  {sources.map((s, i) => (
                    <li key={`${s.url}-${i}`} id={`compare-source-${i + 1}`} className="scroll-mt-28">
                      <span className="mr-2 font-extrabold text-[var(--sf-ink)]">{i + 1}.</span>
                      <SourceLink source={s} />
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
            <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-extrabold text-[var(--sf-ink)]">{C.otherComparisons}:</span>
              {others.map((o) => (
                <Link key={o.id} href={comparePath(o.id)} className="font-bold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)]">
                  MudKitchen vs {o.name}
                </Link>
              ))}
            </p>
          </div>
        </div>
      </section>

      <GardenFaq
        items={compareFaq(comparison)}
        copy={{ eyebrow: "FAQ", heading: fill(C.faqHeading, vars), sub: fill(C.checked, vars) }}
        idPrefix={`compare-${rival.id}-faq`}
        className="bg-[var(--sf-lav)]/30"
      />
      <GardenBookDemo />
    </HomeGardenShell>
  );
}
