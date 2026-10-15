"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { CALCULATOR_COPY } from "@/components/marketing/enrollment-calculator/enrollment-copy";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CalculatorDialogProps = {
  theme: ParentThemeTokens;
  kicker: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export default function CalculatorDialog({
  theme,
  kicker,
  title,
  onClose,
  children,
  actions,
}: CalculatorDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = () => {
      const dialog = dialogRef.current;
      if (!dialog) return [];
      return [
        ...dialog.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input, a[href], select, textarea",
        ),
      ];
    };

    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-5"
      style={{ backgroundColor: "rgba(40, 57, 67, 0.25)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-[610px] overflow-auto border p-6 sm:p-7"
        style={{
          backgroundColor: theme.white,
          borderColor: theme.line,
          borderRadius: theme.radiusCard,
          boxShadow: "0 20px 60px rgba(40, 57, 67, 0.13)",
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <ParentSectionKicker theme={theme} className="!mb-2">
              {kicker}
            </ParentSectionKicker>
            <h2
              id={titleId}
              className="font-heading text-[1.55rem] font-semibold leading-tight tracking-[-0.03em]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {title}
            </h2>
          </div>
          <ParentButton theme={theme} variant="soft" onClick={() => onCloseRef.current()} className="!px-3 !py-2 !text-[12px]">
            {CALCULATOR_COPY.close}
          </ParentButton>
        </div>
        {children}
        {actions ? <div className="mt-6 flex flex-wrap justify-end gap-2">{actions}</div> : null}
      </section>
    </div>,
    document.body,
  );
}
