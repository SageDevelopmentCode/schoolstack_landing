"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Minus } from "lucide-react";
import type { CompareCell, Feature, Source } from "@/lib/marketing/features/types";
import { FEATURE_PAGE_LABELS as L } from "@/lib/marketing/features/features-copy";
import { FEATURES_PATH } from "@/lib/marketing/features/paths";
import { COMPARISONS_CHECKED, RIVALS } from "@/lib/marketing/features/rivals";
import { getFeature } from "@/lib/marketing/features";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Leaf, Squiggle, Sun, Tape, Tick, btnOutline, btnPop } from "@/components/garden/ui";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { TAPES } from "@/components/home-garden/assets";
import FeatureCard from "./FeatureCard";
import { IconStamp, MobileShotCard, PlatformChips, ROLE_META, TINT_WASH, WebShotFrame, featureCoverShots } from "./feature-ui";

const NOTE_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-lav)]"];
const NOTE_TILTS = [-2, 1.5, -1, 2];

/* ---------------------------------------------------------------- Hero */

export function FeatureHero({ feature }: { feature: Feature }) {
  const { web, mobile } = featureCoverShots(feature);
  const heroPill = feature.roles.map((r) => ROLE_META[r].short).join(" · ");
  return (
    <section aria-label={feature.name} className="sf-grid relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <Draw className="absolute left-[44%] top-28 hidden w-14 lg:block" delay={0.8}>
        <Sun />
      </Draw>
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:px-12">
        <div className="relative z-10">
          <Link
            href={FEATURES_PATH}
            className="inline-flex items-center gap-1.5 rounded-full text-sm font-extrabold text-[var(--sf-soft)] hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
          >
            <ArrowLeft size={15} aria-hidden="true" /> {L.allFeatures}
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <IconStamp feature={feature} />
            <div className="min-w-0">
              <p className="sf-display text-2xl leading-none text-[var(--sf-ink)]">{feature.name}</p>
              <p className="mt-1.5 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--sf-clay-deep)]">For {heroPill}</p>
            </div>
          </div>
          <h1 className="sf-display mt-8 text-[11vw] leading-[0.9] text-[var(--sf-ink)] sm:text-6xl lg:text-[4rem] xl:text-[4.6rem]">
            <WordsReveal as="span" text={feature.hero.lead} immediate />{" "}
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={feature.hero.accent} immediate delay={0.25} />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{feature.hero.body}</p>
          <PlatformChips platforms={feature.platforms} className="mt-6" />
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {L.bookDemo}
            </a>
            <a href="#what-you-can-do" className={btnOutline}>
              See what it does
            </a>
          </div>
        </div>

        <div className="relative pb-10 lg:pb-0">
          {web ? (
            <WebShotFrame shot={web} label={`MudKitchen · ${feature.name}`} tilt={1.2} tape="var(--sf-sky)" preload className="lg:mr-16" />
          ) : null}
          {mobile ? (
            <MobileShotCard
              shot={mobile}
              tilt={-4}
              tape="var(--sf-butter)"
              sizes="(min-width: 1024px) 200px, 40vw"
              preload={!web}
              className={
                web
                  ? "absolute -bottom-4 right-0 hidden w-[30%] max-w-[210px] sm:block lg:-bottom-10"
                  : "mx-auto w-[min(280px,70vw)]"
              }
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Use cases */

export function FeatureUseCases({ feature }: { feature: Feature }) {
  if (!feature.useCases.length) return null;
  return (
    <section className={`py-24 lg:py-32 ${TINT_WASH[feature.tint]}`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro lead={L.useCasesLead} accent={L.useCasesAccent} accentColor="text-[var(--sf-forest)]" squiggle="var(--sf-mint)" />
        <Reveal as="ol" className="mt-16 grid gap-8 md:grid-cols-2" stagger={0.1} y={44}>
          {feature.useCases.map((u, i) => (
            <li
              key={u.title}
              className={`relative rounded-md ${NOTE_TINTS[i % NOTE_TINTS.length]} p-7 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 lg:p-8`}
              style={{ rotate: `${NOTE_TILTS[i % NOTE_TILTS.length]}deg` }}
            >
              <Tape color={TAPES[(i + 1) % TAPES.length]} className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
              <span className="sf-hand text-xl text-[var(--sf-ink)]/60" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="sf-display mt-1 text-3xl leading-[1.02] text-[var(--sf-ink)]">{u.title}</h3>
              <p className="mt-4 leading-relaxed text-[var(--sf-ink)]/80">{u.scenario}</p>
              <p className="mt-5 flex items-start gap-3 border-t-2 border-dashed border-[var(--sf-ink)]/20 pt-5 font-bold leading-relaxed text-[var(--sf-ink)]">
                <Tick className="mt-0.5 h-6 w-6" />
                <span>{u.outcome}</span>
              </p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Evidence */

/** Short stats ("72%") stay one big line; longer ones ("On request") get smaller and may wrap. */
const STAT_SIZE = {
  short: "whitespace-nowrap text-[clamp(3.2rem,5.5vw,4.6rem)]",
  long: "break-words text-[clamp(2.4rem,3.4vw,3.1rem)]",
} as const;

function SourceLink({ source, className = "" }: { source: Source; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-start gap-1 rounded-sm font-bold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 ${className}`}
    >
      <span>
        {source.label}
        {source.year ? `, ${source.year}` : ""}
      </span>
      <ArrowUpRight size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function FeatureEvidence({ feature }: { feature: Feature }) {
  if (!feature.evidence.length) return null;
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro lead={L.evidenceLead} accent={L.evidenceAccent} align="left" />
        <Reveal className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1} y={40}>
          {feature.evidence.map((e, i) => (
            <figure
              key={e.claim}
              className="flex h-full min-w-0 flex-col rounded-[30px] border-2 border-[var(--sf-ink)] bg-white p-7 shadow-[0_6px_0_0_var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0"
              style={{ rotate: `${i % 2 ? 0.8 : -0.8}deg` }}
            >
              <p className={`sf-display leading-none text-[var(--sf-clay)] ${STAT_SIZE[e.stat.length > 5 ? "long" : "short"]}`}>{e.stat}</p>
              <blockquote className="mt-4 flex-1 text-[16px] font-semibold leading-relaxed text-[var(--sf-ink)]/85">{e.claim}</blockquote>
              <figcaption className="mt-5 border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-4 text-sm text-[var(--sf-soft)]">
                {L.sourceLabel}: <SourceLink source={e.source} />
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Comparison */

function Mark({ mark }: { mark?: CompareCell["mark"] }) {
  if (mark === "yes") return <Tick className="h-6 w-6" fill="var(--sf-mint)" />;
  if (mark === "partial")
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sf-butter)]" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--sf-ink)]/70" />
      </span>
    );
  if (mark === "no" || mark === "unknown")
    return (
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${mark === "no" ? "bg-[var(--sf-peach)]" : "bg-[var(--sf-ink)]/8"}`} aria-hidden="true">
        <Minus size={13} strokeWidth={3} className="text-[var(--sf-ink)]/60" />
      </span>
    );
  return null;
}

function Cell({ cell, footnote }: { cell: CompareCell; footnote?: number }) {
  return (
    <span className="flex items-start gap-2.5">
      <Mark mark={cell.mark} />
      <span className="text-[15px] leading-snug text-[var(--sf-ink)]/85">
        {cell.value}
        {footnote ? (
          <sup className="ml-0.5">
            <a href={`#compare-source-${footnote}`} className="font-bold text-[var(--sf-forest)] hover:underline" aria-label={`Source ${footnote}`}>
              {footnote}
            </a>
          </sup>
        ) : null}
      </span>
    </span>
  );
}

export function FeatureCompare({ feature }: { feature: Feature }) {
  // Only rows where MudKitchen has the capability (a green tick, or a plain text row like "Built for").
  const shown = feature.comparison.filter((row) => row.mudkitchen.mark === undefined || row.mudkitchen.mark === "yes");
  if (!shown.length) return null;

  // Number every distinct source once, in reading order.
  const sources: Source[] = [];
  const noteFor = (cell: CompareCell) => {
    if (!cell.source) return undefined;
    const at = sources.findIndex((s) => s.url === cell.source!.url && s.label === cell.source!.label);
    if (at >= 0) return at + 1;
    sources.push(cell.source);
    return sources.length;
  };
  const rows = shown.map((row) => ({
    row,
    notes: {
      mudkitchen: noteFor(row.mudkitchen),
      toolStack: noteFor(row.toolStack),
      rivals: Object.fromEntries(RIVALS.map((r) => [r.id, noteFor(row.rivals[r.id])])) as Record<string, number | undefined>,
    },
  }));
  const toolStackLabel = feature.toolStack.names.slice(0, 3).join(", ");

  return (
    <section className="bg-[var(--sf-paper)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
        <SectionIntro lead={L.compareLead} accent={L.compareAccent} accentColor="text-[#5e3a78]" squiggle="var(--sf-lav)" />

        {/* Desktop: one paper table */}
        <div className="sf-paper relative mt-16 hidden overflow-hidden rounded-[30px] border-2 border-[var(--sf-ink)] shadow-[0_8px_0_0_var(--sf-ink)] lg:block">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">
              {feature.name}: MudKitchen compared with {toolStackLabel}, {RIVALS.map((r) => r.name).join(", ")}
            </caption>
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[19%]" />
              <col className="w-[16%]" />
              {RIVALS.map((r) => (
                <col key={r.id} className="w-[16%]" />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b-2 border-[var(--sf-ink)]">
                <th scope="col" className="px-5 py-5 text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">
                  <span className="sr-only">Capability</span>
                </th>
                <th scope="col" className="bg-[var(--sf-mint)] px-5 py-5 align-bottom">
                  <span className="sf-display text-2xl leading-none text-[var(--sf-forest)]">MudKitchen</span>
                </th>
                <th scope="col" className="px-5 py-5 align-bottom">
                  <span className="block text-[15px] font-extrabold leading-tight text-[var(--sf-ink)]">{L.compareToolStack}</span>
                  <span className="mt-1 block text-xs font-bold leading-snug text-[var(--sf-soft)]">{toolStackLabel}</span>
                </th>
                {RIVALS.map((r) => (
                  <th key={r.id} scope="col" className="px-5 py-5 align-bottom">
                    <span className="block text-[15px] font-extrabold leading-tight text-[var(--sf-ink)]">{r.name}</span>
                    <span className="mt-1 block text-xs font-bold leading-snug text-[var(--sf-soft)]">{r.builtFor}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ row, notes }) => (
                <tr key={row.label} className="border-b border-dashed border-[var(--sf-ink)]/20 last:border-b-0">
                  <th scope="row" className="px-5 py-5 align-top text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                    {row.label}
                  </th>
                  <td className="bg-[var(--sf-mint)]/60 px-5 py-5 align-top">
                    <Cell cell={row.mudkitchen} footnote={notes.mudkitchen} />
                  </td>
                  <td className="px-5 py-5 align-top">
                    <Cell cell={row.toolStack} footnote={notes.toolStack} />
                  </td>
                  {RIVALS.map((r) => (
                    <td key={r.id} className="px-5 py-5 align-top">
                      <Cell cell={row.rivals[r.id]} footnote={notes.rivals[r.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phones and tablets: a card per row */}
        <ul className="mt-12 space-y-6 lg:hidden">
          {rows.map(({ row, notes }, i) => (
            <li key={row.label} className="sf-paper rounded-[26px] border-2 border-[var(--sf-ink)] p-6 shadow-[0_5px_0_0_var(--sf-ink)]" style={{ rotate: `${i % 2 ? 0.6 : -0.6}deg` }}>
              <h3 className="sf-display text-2xl leading-[1.05] text-[var(--sf-ink)]">{row.label}</h3>
              <dl className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[var(--sf-mint)] p-3">
                  <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-forest)]">MudKitchen</dt>
                  <dd className="mt-1.5">
                    <Cell cell={row.mudkitchen} footnote={notes.mudkitchen} />
                  </dd>
                </div>
                <div className="px-3">
                  <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">{L.compareToolStack}</dt>
                  <dd className="mt-1.5">
                    <Cell cell={row.toolStack} footnote={notes.toolStack} />
                  </dd>
                </div>
                {RIVALS.map((r) => (
                  <div key={r.id} className="px-3">
                    <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">{r.name}</dt>
                    <dd className="mt-1.5">
                      <Cell cell={row.rivals[r.id]} footnote={notes.rivals[r.id]} />
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        <div className="mt-10 max-w-4xl text-sm leading-relaxed text-[var(--sf-soft)]">
          <p>{L.compareChecked.replace("{date}", COMPARISONS_CHECKED)}</p>
          {sources.length ? (
            <>
              <h3 className="mt-5 text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--sf-ink)]">{L.compareSources}</h3>
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
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Related */

export function FeatureRelated({ feature }: { feature: Feature }) {
  const related = feature.related.map((slug) => getFeature(slug)).filter((f): f is Feature => Boolean(f));
  if (!related.length) return null;
  return (
    <section className="relative py-24 lg:py-32">
      <Draw className="absolute right-[8%] top-24 hidden w-12 lg:block" delay={0.4}>
        <Leaf />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro lead={L.relatedLead} accent={L.relatedAccent} accentColor="text-[#24507a]" squiggle="var(--sf-sky)" align="left" />
          <Link
            href={FEATURES_PATH}
            className="inline-flex items-center gap-2 rounded-full px-1 text-base font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-[6px] hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
          >
            {L.allFeatures} →
          </Link>
        </div>
        <Reveal className="mt-14 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1} y={40}>
          {related.slice(0, 3).map((f, i) => (
            <div key={f.slug}>
              <FeatureCard feature={f} index={i} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
