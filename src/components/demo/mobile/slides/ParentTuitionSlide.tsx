"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import {
  MOBILE_DEMO_CHILDREN,
  MOBILE_DEMO_INVOICES,
} from "../mobileDemoData";

type Props = {
  accentColor: string;
};

function darkenHex(hex: string, amount = 0.25): string {
  const raw = hex.replace("#", "");
  const r = Math.max(0, Math.round(parseInt(raw.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(raw.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(raw.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default function ParentTuitionSlide({ accentColor }: Props) {
  const [childFilter, setChildFilter] = useState<string | "all">("all");
  const [paidInvoices, setPaidInvoices] = useState<Set<string>>(new Set());

  const pending = useMemo(() => {
    return MOBILE_DEMO_INVOICES.filter(
      (inv) =>
        !paidInvoices.has(inv.id) &&
        (childFilter === "all" || inv.childId === childFilter),
    );
  }, [childFilter, paidInvoices]);

  const totalDue = pending.reduce((sum, inv) => sum + inv.amount, 0);
  const nextDue = pending.length > 0 ? pending[0].dueDate : null;

  const payInvoice = (id: string) => {
    setPaidInvoices((prev) => new Set([...prev, id]));
  };

  const payAll = () => {
    setPaidInvoices((prev) => {
      const next = new Set(prev);
      pending.forEach((inv) => next.add(inv.id));
      return next;
    });
  };

  const childPendingCount = (childId: string) =>
    MOBILE_DEMO_INVOICES.filter(
      (inv) => inv.childId === childId && !paidInvoices.has(inv.id),
    ).length;

  const gradientEnd = darkenHex(accentColor);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 px-4 py-3 shrink-0">
        <p className="text-base font-semibold text-gray-800">Tuition &amp; Billing</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div
          className="rounded-2xl p-4 text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${gradientEnd} 100%)`,
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70 mb-1">
            Total balance due
          </p>
          <p className="text-3xl font-bold leading-none tabular-nums">
            ${totalDue.toFixed(2)}
          </p>
          {nextDue && totalDue > 0 && (
            <span className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-medium text-amber-100 bg-white/15 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              Next due {nextDue}
            </span>
          )}
          {totalDue === 0 && (
            <span className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-medium text-emerald-100 bg-white/15 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" />
              All paid
            </span>
          )}
          <p className="text-[11px] text-white/70 mt-3">
            Monthly autopay · charged on the 1st
          </p>
          {childFilter === "all" && pending.length > 1 && (
            <button
              type="button"
              onClick={payAll}
              className="mt-3 w-full py-2.5 rounded-xl bg-white text-sm font-semibold cursor-pointer hover:bg-white/90 transition-colors"
              style={{ color: gradientEnd }}
            >
              Pay All · ${totalDue.toFixed(2)}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <ChildPill
            label="All"
            active={childFilter === "all"}
            accentColor={accentColor}
            onClick={() => setChildFilter("all")}
          />
          {MOBILE_DEMO_CHILDREN.map((child) => (
            <ChildPill
              key={child.id}
              label={child.name}
              initials={child.initials}
              color={child.color}
              active={childFilter === child.id}
              accentColor={accentColor}
              pendingCount={childPendingCount(child.id)}
              onClick={() => setChildFilter(child.id)}
            />
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Pending
            </h3>
            {pending.length > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                {pending.length} invoice{pending.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">You&apos;re all caught up</p>
              <p className="text-xs text-gray-400 mt-1">No pending invoices</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((inv) => (
                <div
                  key={inv.id}
                  className="rounded-xl border border-gray-100 p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{inv.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Due {inv.dueDate}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
                      ${inv.amount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => payInvoice(inv.id)}
                    className="mt-2.5 w-full rounded-lg py-2 text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    Pay ${inv.amount.toFixed(2)}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {paidInvoices.size > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Paid
            </h3>
            <div className="space-y-2">
              {MOBILE_DEMO_INVOICES.filter((inv) => paidInvoices.has(inv.id)).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-sm text-gray-600 truncate">{inv.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 shrink-0">Paid</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ChildPill({
  label,
  initials,
  color,
  active,
  accentColor,
  pendingCount,
  onClick,
}: {
  label: string;
  initials?: string;
  color?: string;
  active: boolean;
  accentColor: string;
  pendingCount?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
        active ? "text-white" : "bg-gray-100 text-gray-600"
      }`}
      style={active ? { backgroundColor: accentColor } : undefined}
    >
      {initials && color && (
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
          style={{
            backgroundColor: active ? "rgba(255,255,255,0.25)" : color,
          }}
        >
          {initials}
        </span>
      )}
      {label}
      {pendingCount !== undefined && pendingCount > 0 && !active && (
        <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] flex items-center justify-center">
          {pendingCount}
        </span>
      )}
    </button>
  );
}
