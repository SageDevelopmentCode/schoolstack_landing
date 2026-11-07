"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type VerificationCodeInputBaseProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  length?: number;
};

type VerificationCodeInputPortalProps = VerificationCodeInputBaseProps & {
  variant?: "portal";
  C: AdminThemeTokens;
};

type VerificationCodeInputBrightProps = VerificationCodeInputBaseProps & {
  variant: "bright";
  C?: never;
};

type VerificationCodeInputProps =
  | VerificationCodeInputPortalProps
  | VerificationCodeInputBrightProps;

function normalizeCode(value: string, length: number): string {
  return value.replace(/\D/g, "").slice(0, length);
}

export default function VerificationCodeInput(props: VerificationCodeInputProps) {
  const {
    id,
    label = "Verification code",
    value,
    onChange,
    disabled = false,
    autoFocus = false,
    length = 6,
    variant = "portal",
  } = props;

  const normalized = normalizeCode(value, length);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autofillRef = useRef<HTMLInputElement>(null);

  const isBright = variant === "bright";
  const C = variant === "portal" ? props.C : null;

  const focusRing = !isBright && C
    ? ({ "--tw-ring-color": `${C.accent}40` } as CSSProperties)
    : undefined;

  const cellStyle: CSSProperties | undefined = !isBright && C
    ? {
        borderColor: C.inputBorder,
        backgroundColor: C.input,
        color: C.textPrimary,
      }
    : undefined;

  const cellClassName = isBright
    ? "h-12 w-full min-w-0 rounded-[12px] border border-black/10 bg-white text-center font-secondary text-xl font-semibold tabular-nums text-[#1d1a16] outline-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1a16] disabled:cursor-not-allowed disabled:opacity-60"
    : "h-12 w-full min-w-0 rounded-md border text-center text-xl font-semibold tabular-nums outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

  const updateValue = useCallback(
    (next: string) => {
      onChange(normalizeCode(next, length));
    },
    [length, onChange],
  );

  const focusInput = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(length - 1, index));
      const input = inputRefs.current[clamped];
      input?.focus();
      input?.select();
    },
    [length],
  );

  const applyPaste = useCallback(
    (pasted: string, startIndex = 0) => {
      const digits = normalizeCode(pasted, length);
      if (!digits) return;

      const before = normalized.slice(0, startIndex);
      const next = normalizeCode(before + digits, length);
      updateValue(next);

      const focusIndex = Math.min(next.length, length - 1);
      requestAnimationFrame(() => focusInput(focusIndex));
    },
    [focusInput, length, normalized, updateValue],
  );

  const setDigitAt = useCallback(
    (index: number, digit: string) => {
      const next = normalizeCode(
        normalized.slice(0, index) + digit + normalized.slice(index + 1),
        length,
      );
      updateValue(next);

      if (index < length - 1) {
        requestAnimationFrame(() => focusInput(index + 1));
      }
    },
    [focusInput, length, normalized, updateValue],
  );

  const handleBackspace = useCallback(
    (index: number) => {
      if (normalized[index]) {
        const next = normalized.slice(0, index) + normalized.slice(index + 1);
        updateValue(next);
        requestAnimationFrame(() => focusInput(index));
        return;
      }

      if (index > 0) {
        const prevIndex = index - 1;
        const next = normalized.slice(0, prevIndex) + normalized.slice(prevIndex + 1);
        updateValue(next);
        requestAnimationFrame(() => focusInput(prevIndex));
      }
    },
    [focusInput, normalized, updateValue],
  );

  useEffect(() => {
    if (!autoFocus || disabled) return;
    const firstEmpty = normalized.length < length ? normalized.length : 0;
    requestAnimationFrame(() => focusInput(firstEmpty));
  }, [autoFocus, disabled, focusInput, length, normalized.length]);

  const labelId = id ? `${id}-label` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <span
          id={labelId}
          className={
            isBright
              ? "font-secondary text-[13px] font-semibold text-[#1d1a16]/70"
              : "text-sm font-medium"
          }
          style={!isBright && C ? { color: C.textPrimary } : undefined}
        >
          {label}
        </span>
      ) : null}

      <div
        role="group"
        aria-labelledby={labelId}
        aria-label={label ? undefined : "Verification code"}
        className="relative"
      >
        <input
          ref={autofillRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={normalized}
          onChange={(event) => updateValue(event.target.value)}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        />

        <div className="flex gap-2 sm:gap-3">
          {Array.from({ length }, (_, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              id={index === 0 ? id : undefined}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              disabled={disabled}
              value={normalized[index] ?? ""}
              maxLength={1}
              aria-label={`Digit ${index + 1} of ${length}`}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                const nextValue = event.target.value;
                if (nextValue.length > 1) {
                  applyPaste(nextValue, index);
                  return;
                }
                if (/^\d$/.test(nextValue)) {
                  setDigitAt(index, nextValue);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace") {
                  event.preventDefault();
                  handleBackspace(index);
                  return;
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusInput(index - 1);
                  return;
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusInput(index + 1);
                  return;
                }
                if (event.key === "Delete") {
                  event.preventDefault();
                  if (normalized[index]) {
                    const next = normalized.slice(0, index) + normalized.slice(index + 1);
                    updateValue(next);
                  }
                }
              }}
              onPaste={(event) => {
                event.preventDefault();
                applyPaste(event.clipboardData.getData("text"), index);
              }}
              className={cellClassName}
              style={cellStyle ? { ...cellStyle, ...focusRing } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
