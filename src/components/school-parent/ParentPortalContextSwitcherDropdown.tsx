"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Check, ChevronDown } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";

type ParentPortalContextSwitcherDropdownProps = {
  variant?: "compact" | "card";
  onNavigate?: () => void;
};

export default function ParentPortalContextSwitcherDropdown({
  variant = "compact",
  onNavigate,
}: ParentPortalContextSwitcherDropdownProps) {
  const { theme } = useParentTheme();
  const { contexts, activeContext, switchToContext, showSwitcher } =
    useParentPortalContext();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!showSwitcher || !activeContext) {
    return null;
  }

  const handleSelect = (context: ParentPortalContextOption) => {
    setOpen(false);
    onNavigate?.();
    switchToContext(context);
  };

  const trigger =
    variant === "card" ? (
      <ParentButton
        theme={theme}
        variant="soft"
        type="button"
        className="inline-flex items-center gap-2"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        Switch portal
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </ParentButton>
    ) : (
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-90"
        style={{
          borderColor: theme.line,
          backgroundColor: theme.white,
          color: theme.primary,
        }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Switch portal
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
    );

  return (
    <div className="relative" ref={containerRef}>
      {trigger}
      {open ? (
        <div
          className="absolute right-0 z-[120] mt-1.5 min-w-[12rem] rounded-xl py-1.5 shadow-lg"
          style={{
            border: `1px solid ${theme.line}`,
            backgroundColor: theme.white,
          }}
          role="menu"
        >
          {contexts.map((context) => {
            const isCurrent = context.id === activeContext.id;
            return (
              <button
                key={context.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(context)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:opacity-90"
                style={{
                  color: isCurrent ? theme.primary : theme.ink,
                  backgroundColor: isCurrent ? theme.primaryLight : "transparent",
                }}
                aria-current={isCurrent ? "page" : undefined}
              >
                {isCurrent ? (
                  <Check className="h-4 w-4 shrink-0" style={{ color: theme.primary }} />
                ) : (
                  <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
                )}
                <span className="truncate font-medium">{context.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
