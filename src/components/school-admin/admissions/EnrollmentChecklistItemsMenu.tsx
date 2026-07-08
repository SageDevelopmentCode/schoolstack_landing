"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ChecklistBuilderFocus } from "./checklist-builder-focus";

type EnrollmentChecklistItemsMenuProps = {
  C: AdminThemeTokens;
  items: EnrollmentChecklistItem[];
  focus: ChecklistBuilderFocus | null;
  onFocusChange: (focus: ChecklistBuilderFocus) => void;
};

export default function EnrollmentChecklistItemsMenu({
  C,
  items,
  focus,
  onFocusChange,
}: EnrollmentChecklistItemsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const isItemActive = (itemId: string) =>
    focus?.kind === "item"
      ? focus.itemId === itemId
      : focus?.kind === "field" && focus.itemId === itemId;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold"
        style={{
          border: `1px solid ${C.border}`,
          color: C.textSecondary,
          backgroundColor: C.surface,
        }}
      >
        Checklist Items
        {items.length > 0 ? (
          <span style={{ color: C.textTertiary }}>({items.length})</span>
        ) : null}
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>
      {menuOpen ? (
        <div
          className="absolute left-0 top-full z-20 mt-1 max-h-[min(360px,60vh)] w-[280px] overflow-y-auto rounded-md border py-1 shadow-lg"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          {items.length === 0 ? (
            <p className="px-3 py-2 text-[11px]" style={{ color: C.textTertiary }}>
              No items yet
            </p>
          ) : (
            items.map((item, idx) => {
              const active = isItemActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onFocusChange({ kind: "item", itemId: item.id });
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
                  style={{
                    backgroundColor: active ? C.accentLight : "transparent",
                    color: active ? C.accent : C.textPrimary,
                  }}
                >
                  <span
                    className="shrink-0 tabular-nums"
                    style={{ color: active ? C.accent : C.textTertiary }}
                  >
                    {idx + 1}.
                  </span>
                  <span className="min-w-0 truncate font-medium">{item.label}</span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
