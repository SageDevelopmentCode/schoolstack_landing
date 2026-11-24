"use client";

import { useMemo, useState } from "react";
import GardenRoot from "@/components/garden/GardenRoot";
import type { LetterBulkCard } from "@/lib/admin-crm/letter-bulk-cards";
import { LetterQrCard } from "./LetterPrintSheet";

/** The card is 4.25 × 5.5 in, a quarter of US Letter: 2 per row, 2 rows, edge to edge. */
const CARDS_PER_SHEET = 4;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Keeps the left-out schools in `?skip=` so a reload keeps the selection. */
function writeSkipToUrl(skipped: Set<string>) {
  const url = new URL(window.location.href);
  if (skipped.size) url.searchParams.set("skip", [...skipped].join(","));
  else url.searchParams.delete("skip");
  window.history.replaceState(null, "", url);
}

/**
 * Every school's letter QR card on shared US Letter sheets, four to a page, for one print job.
 * Untick a school to leave its card out (e.g. already mailed). Print CSS hides the admin chrome and
 * lets the sheets flow onto as many pages as needed.
 */
export function LetterBulkPrintSheets({ cards, initialSkip = [] }: { cards: LetterBulkCard[]; initialSkip?: string[] }) {
  const [skipped, setSkipped] = useState(() => new Set(initialSkip.filter((slug) => cards.some((c) => c.slug === slug))));

  const selected = useMemo(() => cards.filter((card) => !skipped.has(card.slug)), [cards, skipped]);
  const sheets = useMemo(() => chunk(selected, CARDS_PER_SHEET), [selected]);

  function update(next: Set<string>) {
    setSkipped(next);
    writeSkipToUrl(next);
  }

  function toggle(slug: string) {
    const next = new Set(skipped);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    update(next);
  }

  const summary = `${selected.length} of ${cards.length} card${cards.length === 1 ? "" : "s"} · ${sheets.length} sheet${sheets.length === 1 ? "" : "s"}`;

  return (
    <GardenRoot className="letter-bulk-print-area !bg-transparent">
      <style>{`
        .letter-bulk-print-area { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          @page { size: letter portrait; margin: 0; }
          html, body { background: #fff !important; }
          .admin-app { padding-top: 0 !important; min-height: 0 !important; background: #fff !important; }
          .admin-app > :not(main) { display: none !important; }
        }
      `}</style>

      <section
        className="mb-6 rounded-3xl border-2 border-[var(--sf-ink)] bg-white p-4 text-[var(--sf-ink)] shadow-[0_4px_0_0_var(--sf-ink)] print:hidden"
        data-testid="letter-bulk-picker"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-sm font-extrabold" data-testid="letter-bulk-summary">
            {summary}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update(new Set())}
              disabled={skipped.size === 0}
              className="rounded-full border-2 border-[var(--sf-ink)] px-3 py-1 text-xs font-extrabold disabled:opacity-40"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => update(new Set(cards.map((c) => c.slug)))}
              disabled={selected.length === 0}
              className="rounded-full border-2 border-[var(--sf-ink)] px-3 py-1 text-xs font-extrabold disabled:opacity-40"
            >
              Select none
            </button>
          </div>
        </div>
        <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-x-4 gap-y-1 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.slug}>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
                <input
                  type="checkbox"
                  checked={!skipped.has(card.slug)}
                  onChange={() => toggle(card.slug)}
                  className="h-4 w-4 accent-[var(--sf-forest)]"
                  data-testid={`letter-bulk-toggle-${card.slug}`}
                />
                <span className="truncate">{card.schoolName}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {sheets.length === 0 ? (
        <p className="m-0 text-center text-sm font-semibold text-[var(--sf-soft)] print:hidden">No cards selected.</p>
      ) : (
        <div className="flex flex-col gap-8 overflow-x-auto pb-2 print:block print:overflow-visible print:pb-0" data-testid="letter-bulk-sheets">
          {sheets.map((sheet, index) => (
            <div key={sheet.map((c) => c.slug).join("|")} className="mx-auto w-[8.5in] shrink-0 print:contents">
              <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)] print:hidden">
                Sheet {index + 1} of {sheets.length}
              </p>
              <div
                className={`letter-bulk-sheet grid h-[11in] w-[8.5in] grid-cols-2 grid-rows-2 overflow-hidden bg-white shadow-[0_6px_24px_rgba(43,36,29,0.18)] print:shadow-none ${index < sheets.length - 1 ? "[break-after:page]" : ""}`}
                data-testid="letter-bulk-sheet"
              >
                {sheet.map((card) => (
                  <LetterQrCard
                    key={card.slug}
                    letter={card.letter}
                    schoolShortName={card.schoolShortName}
                    qrSvg={card.qrSvg}
                    shortUrlLabel={card.shortUrlLabel}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </GardenRoot>
  );
}
