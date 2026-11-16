"use client";

import { SearchX } from "lucide-react";
import { GSkeleton, gLinkSm } from "@/components/school-parent/garden/ui";
import { GardenFilterChips, type GardenFilterOption } from "@/components/school-admin/garden/kit";

/** Status + Type chip rows above a Finances ledger. */
export function LedgerFilters({
  statusOptions,
  statusValue,
  onStatusChange,
  typeOptions,
  typeValue,
  onTypeChange,
  busy,
}: {
  statusOptions: GardenFilterOption[];
  statusValue: string;
  onStatusChange: (key: string) => void;
  typeOptions: GardenFilterOption[];
  typeValue: string;
  onTypeChange: (key: string) => void;
  busy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
          Status
        </span>
        <GardenFilterChips
          ariaLabel="Filter by status"
          options={statusOptions}
          value={statusValue}
          onChange={onStatusChange}
          busy={busy}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
          Type
        </span>
        <GardenFilterChips
          ariaLabel="Filter by type"
          options={typeOptions}
          value={typeValue}
          onChange={onTypeChange}
        />
      </div>
    </div>
  );
}

/** "No payments match these filters." with a reset link. */
export function LedgerNoMatch({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-[16px] bg-[var(--sf-paper)] p-4" role="status">
      <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-soft)]" aria-hidden />
      <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
        No payments match these filters.{" "}
        <button type="button" onClick={onReset} className={gLinkSm}>
          Show all payments
        </button>
      </p>
    </div>
  );
}

export function LedgerSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <GSkeleton key={i} className="h-14 !rounded-[14px]" />
      ))}
    </div>
  );
}

export function StatTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <GSkeleton key={i} className="h-[112px] !rounded-[22px]" />
      ))}
    </div>
  );
}

/** Bring the ledger into view after a filter is applied from above it. */
export function scrollToLedger(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  if (top > window.innerHeight * 0.55 || top < 0) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

/** Short local time ("3:42 PM") for "what's on screen is from…" copy. */
export function shortTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
