"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Tape, btnPop } from "@/components/garden/ui";
import type { LegalBlock, LegalDocument } from "@/content/legal/types";
import { GIFT_CARD_PAGE_PATH, GIFT_CARD_TERMS_COPY as COPY } from "@/lib/marketing/gift-card-offer";
import GiftCardSteps from "./GiftCardSteps";

const BOOK_DEMO_HREF = `${GIFT_CARD_PAGE_PATH}#book-demo`;

const focusRing = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

const backLink = `inline-flex items-center gap-1.5 rounded-full text-sm font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:text-[var(--sf-ink)] ${focusRing}`;

const inlineLink = `font-bold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-[3px] transition-colors hover:decoration-[var(--sf-clay)] focus-visible:rounded-sm ${focusRing}`;

const tocLink = `group flex gap-3 rounded-lg px-2 py-1.5 text-[15px] font-bold leading-snug text-[var(--sf-ink)]/75 transition-colors hover:bg-[var(--sf-butter)]/60 hover:text-[var(--sf-ink)] ${focusRing}`;

/** Site paths, our email and Amazon's gift card terms, written as plain text in the legal copy. */
const LINK_PATTERN = /([\w.+-]+@trymudkitchen\.com|trymudkitchen\.com(?:\/[a-z-]+)?|amazon\.com\/gc-legal)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINK_PATTERN).map((part, i) => {
    if (i % 2 === 0) return part;
    if (part.includes("@")) {
      return (
        <a key={i} href={`mailto:${part}`} className={inlineLink}>
          {part}
        </a>
      );
    }
    if (part.startsWith("amazon.com")) {
      return (
        <a key={i} href={`https://www.${part}`} target="_blank" rel="noopener noreferrer" className={inlineLink}>
          {part}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }
    const path = part.slice("trymudkitchen.com".length) || "/";
    return (
      <Link key={i} href={path} className={inlineLink}>
        {part}
      </Link>
    );
  });
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "paragraph") {
    return <p className="whitespace-pre-line">{linkify(block.text)}</p>;
  }
  if (block.type === "list") {
    return (
      <ul className="space-y-2.5">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-[var(--sf-clay)]" />
            <span>{linkify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
        <thead>
          <tr className="border-b-2 border-[var(--sf-ink)]/15">
            {block.headers.map((h) => (
              <th key={h} className="py-2.5 pr-4 font-extrabold text-[var(--sf-ink)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r} className="border-b border-dashed border-[var(--sf-ink)]/15 align-top">
              {row.map((cell, c) => (
                <td key={c} className="py-2.5 pr-4">
                  {linkify(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const sectionNumber = (i: number) => String(i + 1).padStart(2, "0");

/**
 * /gift-card/terms in calm Garden (recipe 32): reading comes first. Header on
 * dot-grid paper, the three conditions as sticky notes, then the full terms on
 * one notebook sheet with a sticky "On this page" card beside it.
 */
export default function GiftCardTermsGardenPage({ document: doc }: { document: LegalDocument }) {
  const sections = doc.sections.map((s, i) => ({ ...s, anchor: s.id ?? `section-${i + 1}` }));

  return (
    <HomeGardenShell bookDemoHref={BOOK_DEMO_HREF}>
      <header className="sf-grid pb-16 pt-32 lg:pb-20 lg:pt-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <Link href={GIFT_CARD_PAGE_PATH} className={backLink}>
            <ArrowLeft size={16} strokeWidth={2.6} aria-hidden />
            {COPY.back}
          </Link>
          <h1 className="sf-display mt-6 max-w-4xl text-[clamp(2.4rem,6vw,4rem)] leading-[0.98] text-[var(--sf-ink)]">{doc.title}</h1>
          <p className="mt-4 text-sm font-bold text-[var(--sf-soft)]">
            {COPY.lastUpdated}: {doc.lastUpdated}
          </p>
          {doc.intro ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--sf-soft)]">{doc.intro}</p> : null}

          <GiftCardSteps label={COPY.glanceLabel} className="mt-20" />
        </div>
      </header>

      <div className="border-t-2 border-dashed border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-[17rem_1fr] lg:gap-14 lg:px-16">
          <nav aria-label={COPY.tocLabel} className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
            <div
              className="relative rounded-[24px] border-2 border-[var(--sf-ink)] bg-white p-5 shadow-[0_4px_0_0_var(--sf-ink)]"
              style={{ rotate: "-1deg" }}
            >
              <p className="px-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--sf-soft)]">{COPY.tocLabel}</p>
              <ol className="mt-3 space-y-0.5">
                {sections.map((s, i) => (
                  <li key={s.anchor}>
                    <a href={`#${s.anchor}`} className={tocLink}>
                      <span aria-hidden="true" className="sf-hand w-6 shrink-0 text-lg leading-tight text-[var(--sf-clay-deep)]">
                        {sectionNumber(i)}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div>
            <article className="sf-paper relative rounded-[32px] border-2 border-[var(--sf-ink)] px-6 py-10 shadow-[0_10px_0_0_var(--sf-ink)] sm:px-10 lg:px-14 lg:py-14">
              <Tape color="var(--sf-butter)" className="-top-3 left-12 w-24 -rotate-3" />
              <div className="divide-y-2 divide-dashed divide-[var(--sf-ink)]/10">
                {sections.map((s, i) => (
                  <section key={s.anchor} id={s.anchor} className="scroll-mt-32 py-9 first:pt-0 last:pb-0">
                    <span aria-hidden="true" className="sf-hand text-xl text-[var(--sf-clay-deep)]">
                      {sectionNumber(i)}
                    </span>
                    <h2 className="sf-display mt-1 text-2xl leading-[1.1] text-[var(--sf-ink)] sm:text-[1.75rem]">{s.title}</h2>
                    <div className="mt-4 space-y-4 text-[16.5px] leading-relaxed text-[var(--sf-ink)]/80">
                      {s.blocks.map((block, b) => (
                        <Block key={b} block={block} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>

            <div
              className="sf-paper relative mx-auto mt-16 max-w-2xl rounded-[30px] border-2 border-[var(--sf-ink)] p-8 text-center shadow-[0_8px_0_0_var(--sf-ink)] sm:p-10"
              style={{ rotate: "-0.8deg" }}
            >
              <Tape color="var(--sf-peach)" className="-top-3 left-1/2 w-24 -translate-x-1/2 rotate-2" />
              <h2 className="sf-display text-3xl leading-[1.05] text-[var(--sf-ink)] sm:text-4xl">{COPY.closingHeading}</h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-[var(--sf-soft)]">{COPY.closingBody}</p>
              <a href={BOOK_DEMO_HREF} className={`${btnPop} mt-8`}>
                {COPY.closingCta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </HomeGardenShell>
  );
}
