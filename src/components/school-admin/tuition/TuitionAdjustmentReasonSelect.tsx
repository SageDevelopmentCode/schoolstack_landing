"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionAdjustmentReasonSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  reasons: string[];
  disabled?: boolean;
  onManageReasons: () => void;
  C: AdminThemeTokens;
};

function ReasonOptionButton({
  label,
  isSelected,
  onSelect,
  C,
  className = "",
}: {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  C: AdminThemeTokens;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${className}`}
      style={{
        color: C.textPrimary,
        backgroundColor: isSelected ? C.accentLight : "transparent",
      }}
    >
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {isSelected ? <Check className="h-4 w-4" style={{ color: C.accent }} /> : null}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

function ManageReasonsFooter({
  onManageReasons,
  C,
  className = "",
}: {
  onManageReasons: () => void;
  C: AdminThemeTokens;
  className?: string;
}) {
  return (
    <div className="px-3 pb-2 pt-1">
      <div
        className="mb-2"
        style={{ borderTop: `1px dashed ${C.inputBorder}` }}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onManageReasons}
        className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:opacity-90 ${className}`}
        style={{
          color: C.accentDark,
          backgroundColor: C.accentLight,
          border: `1px solid ${C.secondaryBtnBorder}`,
        }}
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Edit your own reasons</span>
      </button>
    </div>
  );
}

export default function TuitionAdjustmentReasonSelect({
  id,
  value,
  onChange,
  reasons,
  disabled = false,
  onManageReasons,
  C,
}: TuitionAdjustmentReasonSelectProps) {
  const [open, setOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const isDesktopQuery = useMediaQuery("(min-width: 640px)");
  const isDesktop = hydrated && isDesktopQuery;

  const selectedLabel = useMemo(
    () => reasons.find((reason) => reason === value) ?? null,
    [reasons, value],
  );

  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;

  const inputStyle = {
    borderColor: C.inputBorder,
    color: disabled ? C.textTertiary : C.textPrimary,
    backgroundColor: C.input,
  } as const;

  const close = () => setOpen(false);

  const openPicker = () => {
    if (disabled) return;

    if (isDesktop && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 280;
      const spaceAbove = rect.top;
      setOpensUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow);
    }

    setOpen(true);
  };

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    close();
  };

  const handleManageReasons = () => {
    close();
    onManageReasons();
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || !isDesktop) return;

    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, isDesktop]);

  useEffect(() => {
    if (!open || isDesktop) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isDesktop]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Adjustment reason"
        onClick={() => (open ? close() : openPicker())}
        className="flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ ...inputStyle, ...focusRing }}
      >
        <span
          className="min-w-0 truncate"
          style={{ color: selectedLabel ? C.textPrimary : C.textTertiary }}
        >
          {selectedLabel ?? "Select..."}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform"
          style={{
            color: open ? C.accent : C.textTertiary,
            transform: open ? "rotate(180deg)" : undefined,
          }}
        />
      </button>

      {open && isDesktop ? (
        <div
          role="listbox"
          aria-label="Adjustment reason"
          className={`absolute left-0 right-0 z-50 flex max-h-72 flex-col overflow-hidden rounded-md border shadow-lg ${
            opensUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto py-1">
            {reasons.map((reason) => (
              <ReasonOptionButton
                key={reason}
                label={reason}
                isSelected={reason === value}
                onSelect={() => handleSelect(reason)}
                C={C}
                className="px-3 py-2"
              />
            ))}
          </div>
          <div className="shrink-0" style={{ backgroundColor: C.surface }}>
            <ManageReasonsFooter onManageReasons={handleManageReasons} C={C} />
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {open && !isDesktop ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-4 pb-safe"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="max-h-[70dvh] w-full max-w-lg overflow-hidden rounded-xl border shadow-xl"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Adjustment reason"
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: C.border }}
              >
                <p className="text-sm font-semibold" style={{ color: C.accentDark }}>
                  Adjustment reason
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-sm p-1"
                  style={{ color: C.textTertiary }}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex max-h-[calc(70dvh-52px)] flex-col overflow-hidden">
                <div
                  className="min-h-0 flex-1 overflow-y-auto"
                  role="listbox"
                  aria-label="Adjustment reason"
                >
                  {reasons.map((reason) => (
                    <ReasonOptionButton
                      key={reason}
                      label={reason}
                      isSelected={reason === value}
                      onSelect={() => handleSelect(reason)}
                      C={C}
                      className="min-h-[44px]"
                    />
                  ))}
                </div>
                <div className="shrink-0" style={{ backgroundColor: C.surface }}>
                  <ManageReasonsFooter
                    onManageReasons={handleManageReasons}
                    C={C}
                    className="min-h-[44px]"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
