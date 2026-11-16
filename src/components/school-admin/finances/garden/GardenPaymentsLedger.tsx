"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { GChip, G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import { PAYMENT_TYPE_LABELS, type PaymentRecordDisplayRow } from "@/lib/admissions/payment-records";
import { G_TABLE, G_TD, G_TH, GardenRefetchVeil, gRowClass } from "@/components/school-admin/garden/blocks";
import {
  applicationHref,
  paymentChargedLine,
  paymentMethod,
  paymentPayer,
  paymentStatusChip,
  paymentTitle,
  paymentWhen,
} from "./payment-display";

const HEADINGS = ["Date", "Payment", "Payer", "Type", "Method", "Status", "Amount", "Application"];

function stop(event: MouseEvent) {
  event.stopPropagation();
}

/**
 * Garden payment ledger shared by Finances → Transactions and Revenue.
 * Table from `md` (scrolls inside its card), stacked tappable cards below.
 * Every row opens the payment drawer through `onSelect`.
 */
export default function GardenPaymentsLedger({
  rows,
  orgSlug,
  selectedId,
  onSelect,
  refetching = false,
  caption,
}: {
  rows: PaymentRecordDisplayRow[];
  orgSlug: string;
  selectedId: string | null;
  onSelect: (row: PaymentRecordDisplayRow) => void;
  refetching?: boolean;
  caption: string;
}) {
  return (
    <GardenRefetchVeil active={refetching}>
      {/* Phones: stacked cards */}
      <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const status = paymentStatusChip(row);
          const selected = row.id === selectedId;
          return (
            <li
              key={row.id}
              className={`overflow-hidden rounded-[16px] border-[1.5px] bg-white transition-colors ${
                selected ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]" : "border-[var(--sf-ink)]/10"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(row)}
                aria-label={`${paymentTitle(row)}, ${formatFeeAmount(row.amountCents)}, ${status.label}. Open details`}
                className={`flex w-full items-start justify-between gap-3 px-4 pb-2 pt-3 text-left ${G_FOCUS} focus-visible:ring-inset`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                    {paymentTitle(row)}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-semibold text-[var(--sf-soft)]">
                    {paymentWhen(row)} · {PAYMENT_TYPE_LABELS[row.paymentType]}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                    {paymentPayer(row)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                    {formatFeeAmount(row.amountCents)}
                  </span>
                  <GChip tone={status.tone}>{status.label}</GChip>
                </span>
              </button>
              <div className="flex items-center justify-between gap-2 px-4 pb-3 text-[12px] font-semibold text-[var(--sf-soft)]">
                <span className="tabular-nums">{paymentChargedLine(row)}</span>
                {row.applicationId ? (
                  <Link href={applicationHref(orgSlug, row.applicationId)} className={`${gLinkSm} !text-[12.5px]`}>
                    {row.applicantLabel ?? "View application"}
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Tablet and up: table scrolling inside the card */}
      <div className="-mx-2 hidden overflow-x-auto md:block">
        <table className={`${G_TABLE} min-w-[980px]`}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {HEADINGS.map((heading) => (
                <th key={heading} scope="col" className={`${G_TH} ${heading === "Amount" ? "text-right" : ""}`}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = paymentStatusChip(row);
              const selected = row.id === selectedId;
              return (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className={gRowClass({ selected, interactive: true })}
                  data-testid="finances-payment-row"
                >
                  <td className={`${G_TD} whitespace-nowrap text-[13px] font-semibold text-[var(--sf-ink)]/80`}>
                    {paymentWhen(row)}
                  </td>
                  <td className={`${G_TD} max-w-[16rem]`}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(row);
                      }}
                      aria-label={`${paymentTitle(row)}. Open payment details`}
                      className={`block max-w-full truncate rounded-md text-left text-[14px] font-extrabold text-[var(--sf-ink)] hover:underline hover:decoration-2 hover:underline-offset-4 ${G_FOCUS}`}
                    >
                      {paymentTitle(row)}
                    </button>
                  </td>
                  <td
                    className={`${G_TD} max-w-[14rem] truncate text-[13px] font-semibold text-[var(--sf-soft)]`}
                    title={paymentPayer(row)}
                  >
                    {paymentPayer(row)}
                  </td>
                  <td className={G_TD}>
                    <GChip tone="info">{PAYMENT_TYPE_LABELS[row.paymentType]}</GChip>
                  </td>
                  <td className={`${G_TD} whitespace-nowrap text-[13px] font-semibold text-[var(--sf-soft)]`}>
                    {paymentMethod(row)}
                  </td>
                  <td className={G_TD}>
                    <GChip tone={status.tone}>{status.label}</GChip>
                  </td>
                  <td className={`${G_TD} whitespace-nowrap text-right`}>
                    <span className="block text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                      {formatFeeAmount(row.amountCents)}
                    </span>
                    <span className="block text-[11.5px] font-semibold tabular-nums text-[var(--sf-soft)]">
                      {paymentChargedLine(row)}
                    </span>
                  </td>
                  <td className={G_TD}>
                    {row.applicationId ? (
                      <Link
                        href={applicationHref(orgSlug, row.applicationId)}
                        onClick={stop}
                        className={`${gLinkSm} !text-[13px]`}
                      >
                        {row.applicantLabel ?? "View application"}
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </Link>
                    ) : (
                      <span className="text-[13px] font-semibold text-[var(--sf-soft)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GardenRefetchVeil>
  );
}
