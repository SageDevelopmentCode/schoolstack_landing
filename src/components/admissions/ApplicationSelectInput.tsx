"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SelectOption = {
  value: string;
  label: string;
};

type ApplicationSelectInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel: string;
  autoComplete?: string;
  error?: string | null;
  C: AdminThemeTokens;
};

function OptionButton({
  option,
  isSelected,
  onSelect,
  C,
  className = "",
}: {
  option: SelectOption;
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
        {isSelected ? (
          <Check className="h-4 w-4" style={{ color: C.accent }} />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">{option.label}</span>
    </button>
  );
}

export default function ApplicationSelectInput({
  id,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  ariaLabel,
  autoComplete,
  error = null,
  C,
}: ApplicationSelectInputProps) {
  const [open, setOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;

  const inputStyle = {
    borderColor: error ? C.errorBorder : C.border,
    color: disabled ? C.textTertiary : C.textPrimary,
    backgroundColor: "#FFFFFF",
  } as const;

  const close = () => setOpen(false);

  const openPicker = () => {
    if (disabled) return;

    if (isDesktop && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 240;
      const spaceAbove = rect.top;
      setOpensUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow);
    }

    setOpen(true);
  };

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    close();
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
      {autoComplete ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only absolute h-px w-px overflow-hidden opacity-0 pointer-events-none"
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      <button
        id={autoComplete ? undefined : id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-invalid={Boolean(error)}
        onClick={() => (open ? close() : openPicker())}
        className="flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ ...inputStyle, ...focusRing }}
      >
        <span
          className="min-w-0 truncate"
          style={{ color: selectedOption ? C.textPrimary : C.textTertiary }}
        >
          {selectedOption?.label ?? placeholder}
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
          aria-label={ariaLabel}
          className={`absolute left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-md border py-1 shadow-lg ${
            opensUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
        >
          {options.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              isSelected={option.value === value}
              onSelect={() => handleSelect(option.value)}
              C={C}
              className="px-3 py-2"
            />
          ))}
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
              style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: C.border }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: C.accentDark }}
                >
                  {ariaLabel}
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
              <div
                className="max-h-[calc(70dvh-52px)] overflow-y-auto"
                role="listbox"
                aria-label={ariaLabel}
              >
                {options.map((option) => (
                  <OptionButton
                    key={option.value}
                    option={option}
                    isSelected={option.value === value}
                    onSelect={() => handleSelect(option.value)}
                    C={C}
                    className="min-h-[44px]"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {error ? (
        <p className="mt-1.5 text-xs" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
