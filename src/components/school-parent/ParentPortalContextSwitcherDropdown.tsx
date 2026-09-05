"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, Check, ChevronDown } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
import { MUDKITCHEN_LOGO_BRAND } from "@/lib/mudkitchen-portal/theme";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";

type ParentPortalContextSwitcherDropdownProps = {
  variant?: "compact" | "card";
  triggerTone?: "default" | "warm";
  onNavigate?: () => void;
};

type MenuPosition = {
  top: number;
  left: number;
};

const MENU_GAP = 6;
const MENU_MIN_WIDTH = 192;
const VIEWPORT_PADDING = 8;

export default function ParentPortalContextSwitcherDropdown({
  variant = "compact",
  triggerTone = "default",
  onNavigate,
}: ParentPortalContextSwitcherDropdownProps) {
  const { theme } = useParentTheme();
  const { contexts, activeContext, switchToContext, showSwitcher } =
    useParentPortalContext();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    const menu = popoverRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight ?? contexts.length * 40 + 12;
    const menuWidth = Math.max(menu?.offsetWidth ?? 0, MENU_MIN_WIDTH);

    let top = rect.bottom + MENU_GAP;
    if (top + menuHeight > window.innerHeight - VIEWPORT_PADDING) {
      top = rect.top - menuHeight - MENU_GAP;
    }
    top = Math.max(
      VIEWPORT_PADDING,
      Math.min(top, window.innerHeight - menuHeight - VIEWPORT_PADDING),
    );

    let left = rect.right - menuWidth;
    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - menuWidth - VIEWPORT_PADDING),
    );

    setMenuPosition({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;

    updateMenuPosition();

    let frameId = 0;
    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateMenuPosition();
      });
    };

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [open, contexts.length]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!showSwitcher || !activeContext) {
    return null;
  }

  const handleSelect = (context: ParentPortalContextOption) => {
    setOpen(false);
    onNavigate?.();
    switchToContext(context);
  };

  const toggleOpen = () => setOpen((current) => !current);

  const menuStyle: CSSProperties = menuPosition
    ? {
        top: menuPosition.top,
        left: menuPosition.left,
        border: `1px solid ${theme.line}`,
        backgroundColor: theme.white,
      }
    : {
        visibility: "hidden",
        top: 0,
        left: 0,
        border: `1px solid ${theme.line}`,
        backgroundColor: theme.white,
      };

  const menu = open ? (
    <div
      ref={popoverRef}
      className="fixed z-[200] min-w-[12rem] rounded-xl py-1.5 shadow-lg"
      style={menuStyle}
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
  ) : null;

  if (variant === "card") {
    return (
      <>
        <ParentButton
          ref={triggerRef}
          theme={theme}
          variant="soft"
          type="button"
          className="inline-flex items-center gap-2"
          onClick={toggleOpen}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Switch portal
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </ParentButton>
        {typeof document !== "undefined" && menu
          ? createPortal(menu, document.body)
          : null}
      </>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-90"
        style={
          triggerTone === "warm"
            ? {
                borderColor: "rgba(194, 105, 79, 0.35)",
                backgroundColor: "#FFFFFF",
                color: MUDKITCHEN_LOGO_BRAND.terracotta,
              }
            : {
                borderColor: theme.line,
                backgroundColor: theme.white,
                color: theme.primary,
              }
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Switch portal
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </>
  );
}
