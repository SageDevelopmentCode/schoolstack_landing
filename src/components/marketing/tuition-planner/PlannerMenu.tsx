"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { plannerFocusClass } from "@/components/marketing/tuition-planner/planner-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type PlannerMenuItem = {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  onSelect: () => void;
};

export type PlannerMenuSection = {
  id: string;
  label?: string;
  items: PlannerMenuItem[];
};

type PlannerMenuProps = {
  theme: ParentThemeTokens;
  label: ReactNode;
  ariaLabel: string;
  sections: PlannerMenuSection[];
  disabled?: boolean;
  compact?: boolean;
  /** Soft matches the planner's secondary "Add plan" button. */
  variant?: "primary" | "soft";
  testId?: string;
};

export default function PlannerMenu({
  theme,
  label,
  ariaLabel,
  sections,
  disabled = false,
  compact = false,
  variant = "primary",
  testId,
}: PlannerMenuProps) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const button = buttonRef.current;
      const panel = panelRef.current;
      if (!button || !panel) return;
      const rect = button.getBoundingClientRect();
      const width = panel.offsetWidth || 280;
      const height = panel.offsetHeight || 240;
      const margin = 8;
      let left = rect.right - width;
      left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
      let top = rect.bottom + margin;
      if (top + height > window.innerHeight - margin) {
        top = Math.max(margin, rect.top - margin - height);
      }
      setPosition((current) =>
        current && current.top === top && current.left === left ? current : { top, left },
      );
    };
    place();
    const panel = panelRef.current;
    const observer = panel ? new ResizeObserver(place) : null;
    if (panel) observer?.observe(panel);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menuButtons = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);

  const moveFocus = (current: HTMLButtonElement, direction: 1 | -1 | "first" | "last") => {
    const buttons = menuButtons();
    if (buttons.length === 0) return;
    if (direction === "first") {
      buttons[0]?.focus();
      return;
    }
    if (direction === "last") {
      buttons[buttons.length - 1]?.focus();
      return;
    }
    const index = buttons.indexOf(current);
    const next = (index + direction + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        data-testid={testId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center justify-center gap-1.5 border-0 font-bold disabled:cursor-not-allowed disabled:opacity-50 ${plannerFocusClass} ${
          compact ? "h-9 w-9" : variant === "soft" ? "px-2.5 py-2 text-[11px]" : "px-[15px] py-[11px] text-[13px]"
        }`}
        style={{
          borderRadius: compact || variant === "soft" ? "9px" : theme.radiusButton,
          backgroundColor: compact ? theme.white : variant === "soft" ? "#EAF2EB" : theme.primary,
          color: compact ? theme.muted : variant === "soft" ? theme.primary : theme.white,
          border: compact ? `1px solid ${theme.line}` : undefined,
          fontFamily: theme.fontBody,
        }}
      >
        {label}
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          className="fixed z-[260] max-h-[min(24rem,70vh)] w-[17.5rem] overflow-y-auto border p-1.5"
          style={{
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
            borderColor: theme.line,
            borderRadius: theme.radiusCard,
            backgroundColor: theme.white,
            boxShadow: theme.shadowCard,
            fontFamily: theme.fontBody,
          }}
        >
          {sections.map((section) => (
            <div key={section.id} className="py-1" role="group" aria-label={section.label}>
              {section.label ? (
                <p
                  className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: "#759077" }}
                >
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) return;
                      setOpen(false);
                      item.onSelect();
                      buttonRef.current?.focus();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        moveFocus(event.currentTarget, 1);
                      } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        moveFocus(event.currentTarget, -1);
                      } else if (event.key === "Home") {
                        event.preventDefault();
                        moveFocus(event.currentTarget, "first");
                      } else if (event.key === "End") {
                        event.preventDefault();
                        moveFocus(event.currentTarget, "last");
                      }
                    }}
                    className={`flex w-full flex-col items-start rounded-[10px] px-2.5 py-2 text-left text-[14px] font-semibold hover:bg-[#EAF2EB] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${plannerFocusClass}`}
                    style={{ color: theme.ink, fontFamily: theme.fontBody }}
                  >
                    {item.label}
                    {item.description ? (
                      <span className="mt-0.5 text-[12px] font-normal leading-snug" style={{ color: theme.muted }}>
                        {item.description}
                      </span>
                    ) : null}
                  </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
