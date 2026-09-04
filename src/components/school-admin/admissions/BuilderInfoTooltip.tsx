"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleHelp } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type BuilderInfoTooltipProps = {
  C: AdminThemeTokens;
  content: string;
  ariaLabel?: string;
};

export default function BuilderInfoTooltip({
  C,
  content,
  ariaLabel = "More information",
}: BuilderInfoTooltipProps) {
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <span
      ref={rootRef}
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
        className="rounded p-0.5 transition-opacity hover:opacity-80"
        style={{ color: C.textTertiary }}
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-1.5 w-max max-w-[280px] -translate-x-1/2 rounded-md border px-2.5 py-2 text-[11px] leading-relaxed shadow-md"
          style={{
            borderColor: C.border,
            backgroundColor: C.surface,
            color: C.textSecondary,
          }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
