"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const tipFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E4A3C]";

type CalculatorInfoTipProps = {
  theme: ParentThemeTokens;
  content: string;
  label: string;
  placement?: "below" | "above";
  align?: "start" | "end";
};

export default function CalculatorInfoTip({
  theme,
  content,
  label,
  placement = "below",
  align = "end",
}: CalculatorInfoTipProps) {
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = pinned || hovering || focused;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPinned(false);
      setHovering(false);
      buttonRef.current?.blur();
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPinned(false);
        setHovering(false);
        setFocused(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <span
      ref={rootRef}
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setPinned((current) => !current)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node)) {
            setFocused(false);
          }
        }}
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${tipFocusClass}`}
        style={{ color: theme.muted }}
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-40 w-max max-w-[240px] rounded-md border px-3 py-2 text-left text-[13px] font-normal normal-case leading-relaxed tracking-normal ${align === "start" ? "left-0" : "right-0"} ${placement === "above" ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}
          style={{
            borderColor: theme.line,
            backgroundColor: theme.white,
            color: theme.ink,
            fontFamily: theme.fontBody,
            boxShadow: theme.shadowCard,
          }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
