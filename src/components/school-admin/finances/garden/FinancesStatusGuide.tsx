"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { GChip, G_FOCUS } from "@/components/school-parent/garden/ui";
import { PAYMENT_STATUS_GUIDE } from "./payment-display";

/** "What these statuses mean" disclosure under the ledger filters. */
export default function FinancesStatusGuide() {
  return (
    <details className="group rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]" data-testid="finances-status-guide">
      <summary
        className={`flex cursor-pointer list-none items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-[13px] font-extrabold text-[var(--sf-ink)]/80 hover:text-[var(--sf-ink)] [&::-webkit-details-marker]:hidden ${G_FOCUS}`}
      >
        <HelpCircle className="h-4 w-4 text-[var(--sf-soft)]" aria-hidden />
        What these statuses mean
        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <dl className="m-0 grid gap-x-6 gap-y-2.5 px-3.5 pb-3.5 pt-1 sm:grid-cols-2">
        {PAYMENT_STATUS_GUIDE.map((entry) => (
          <div key={entry.label} className="flex items-start gap-2.5">
            <dt className="w-[92px] shrink-0">
              <GChip tone={entry.tone}>{entry.label}</GChip>
            </dt>
            <dd className="m-0 text-[12.5px] font-semibold leading-snug text-[var(--sf-ink)]/75">{entry.meaning}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
