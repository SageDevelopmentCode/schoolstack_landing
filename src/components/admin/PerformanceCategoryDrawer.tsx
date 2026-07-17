"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { AuditEnvironment, PageCategory } from "@/lib/performance/types";

function formatCategoryLabel(category: PageCategory) {
  return category.replace(/_/g, " ");
}

type PerformanceCategoryDrawerProps = {
  open: boolean;
  onClose: () => void;
  categories: PageCategory[];
  categoryCounts: Record<PageCategory, number>;
  selected: Set<PageCategory>;
  onChange: (selected: Set<PageCategory>) => void;
  environment: AuditEnvironment;
};

export function PerformanceCategoryDrawer({
  open,
  onClose,
  categories,
  categoryCounts,
  selected,
  onChange,
  environment,
}: PerformanceCategoryDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const selectedPageCount = categories.reduce(
    (sum, category) => sum + (selected.has(category) ? categoryCounts[category] : 0),
    0,
  );

  const hasAuthCategorySelected =
    environment === "production" &&
    (selected.has("school_admin") || selected.has("school_parent"));

  const toggleCategory = (category: PageCategory) => {
    const next = new Set(selected);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    onChange(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close categories"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <aside
        className="relative flex h-full w-full max-w-sm flex-col border-l border-border bg-surface shadow-xl"
        style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-base font-semibold text-text">Categories</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-bg hover:text-text"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-border px-4 py-2 text-xs">
          <button
            type="button"
            onClick={() => onChange(new Set(categories))}
            className="text-clay hover:underline"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className="text-text-muted hover:text-text hover:underline"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <ul className="space-y-1">
            {categories.map((category) => {
              const count = categoryCounts[category] ?? 0;
              const checked = selected.has(category);

              return (
                <li key={category}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-border text-clay focus:ring-clay"
                    />
                    <span className="flex-1 text-sm capitalize text-text">
                      {formatCategoryLabel(category)}
                    </span>
                    <span className="text-xs text-text-faint">({count})</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-2 border-t border-border px-4 py-3">
          {selected.size === 0 ? (
            <p className="text-sm text-text-muted">Showing all categories</p>
          ) : (
            <p className="text-sm text-text">
              {selectedPageCount} page{selectedPageCount === 1 ? "" : "s"} selected across{" "}
              {selected.size} categor{selected.size === 1 ? "y" : "ies"}
            </p>
          )}
          {hasAuthCategorySelected ? (
            <p className="text-xs text-text-faint">
              School admin and parent pages are skipped on production (auth required).
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
