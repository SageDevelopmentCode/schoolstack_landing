"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import { Clock } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import {
  formatTimeFromMinutes,
  parseTimeToMinutes,
  SIGNUP_TIME_PERIODS,
  signupTimeOptionsForPeriod,
  signupTimePeriodForValue,
  type SignupTimePeriodId,
} from "@/lib/school-events/calendar-time";
import {
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";

type PopupTimePickerProps = {
  theme: ParentThemeTokens;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  scrollToTime?: string;
};

export default function PopupTimePicker({
  theme,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  className = "rounded-[10px] py-2",
  scrollToTime,
}: PopupTimePickerProps) {
  const hydrated = useHydrated();
  const gridRef = useRef<HTMLDivElement>(null);
  const adminCompat = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<SignupTimePeriodId>(() =>
    signupTimePeriodForValue(value),
  );

  const displayMinutes = parseTimeToMinutes(value);
  const display =
    displayMinutes !== null ? formatTimeFromMinutes(displayMinutes) : "Select time…";

  const timeOptions = useMemo(
    () => signupTimeOptionsForPeriod(activePeriod),
    [activePeriod],
  );

  const focusRing = {
    "--tw-ring-color": `${adminCompat.accent}40`,
  } as CSSProperties;

  const openModal = () => {
    if (disabled || !hydrated) return;
    const periodSource = scrollToTime ?? value;
    setActivePeriod(signupTimePeriodForValue(periodSource));
    setOpen(true);
  };

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const target = scrollToTime ?? value;
    if (!target) return;

    const frame = requestAnimationFrame(() => {
      const button = gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-time="${target}"]`,
      );
      button?.scrollIntoView({ block: "center" });
    });

    return () => cancelAnimationFrame(frame);
  }, [open, activePeriod, scrollToTime, value]);

  const modal =
    open && hydrated ? (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close time picker"
          className="absolute inset-0 bg-black/30"
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-label={ariaLabel}
          className="relative w-full max-w-sm rounded-[14px] border p-4 shadow-xl"
          style={{
            borderColor: adminCompat.border,
            backgroundColor: adminCompat.surface,
          }}
        >
          <div className="mb-4">
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: adminCompat.textTertiary }}
            >
              Select time
            </p>
            <p className="mt-1 text-base font-semibold" style={{ color: adminCompat.textPrimary }}>
              {display}
            </p>
          </div>

          <div
            className="mb-3 flex rounded-[10px] border p-0.5"
            style={{ borderColor: adminCompat.border, backgroundColor: adminCompat.bg }}
            role="tablist"
            aria-label="Time of day"
          >
            {SIGNUP_TIME_PERIODS.map((period) => {
              const isActive = activePeriod === period.id;
              return (
                <button
                  key={period.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePeriod(period.id)}
                  className="flex-1 rounded-[8px] px-2 py-2 text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: isActive ? adminCompat.surface : "transparent",
                    color: isActive ? adminCompat.accent : adminCompat.textTertiary,
                    boxShadow: isActive ? `0 0 0 1px ${adminCompat.border}` : "none",
                  }}
                >
                  {period.label}
                </button>
              );
            })}
          </div>

          <div
            ref={gridRef}
            className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto"
          >
            {timeOptions.map((option) => {
              const optionMinutes = parseTimeToMinutes(option);
              const isSelected =
                optionMinutes !== null &&
                displayMinutes !== null &&
                optionMinutes === displayMinutes;

              return (
                <button
                  key={option}
                  type="button"
                  data-time={option}
                  onClick={() => handleSelect(option)}
                  className="rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    borderColor: isSelected ? adminCompat.accent : adminCompat.border,
                    backgroundColor: isSelected ? adminCompat.accentLight : adminCompat.bg,
                    color: isSelected ? adminCompat.accent : adminCompat.textSecondary,
                  }}
                >
                  {formatTimeFromMinutes(optionMinutes ?? 0)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        disabled={disabled || !hydrated}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openModal())}
        className={`flex w-full items-center justify-between gap-2 border px-3 py-2.5 text-left text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        style={{
          borderColor: adminCompat.inputBorder,
          color: displayMinutes !== null ? adminCompat.textPrimary : adminCompat.textTertiary,
          backgroundColor: adminCompat.input,
          ...focusRing,
        }}
      >
        <span className="min-w-0 truncate">{display}</span>
        <Clock className="h-4 w-4 shrink-0" style={{ color: adminCompat.textTertiary }} />
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
