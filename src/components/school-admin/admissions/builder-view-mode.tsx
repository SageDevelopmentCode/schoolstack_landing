"use client";

import { useState } from "react";
import { G_TOGGLE, G_TOGGLE_OFF, G_TOGGLE_ON } from "@/components/school-parent/garden/ui";

/*
 * "Family view | Compact list" for the admissions builders (application steps
 * and enrollment checklist items). One remembered choice per browser, shared
 * by both builders.
 */
export type BuilderViewMode = "family" | "list";
const STORAGE_KEY = "flows-step-view";

/**
 * Remembered per browser; falls back to Family view (and survives blocked storage).
 * Builders other than Enrollment Flows pass their own `storageKey`.
 */
export function useBuilderViewMode(
  storageKey: string = STORAGE_KEY,
): [BuilderViewMode, (mode: BuilderViewMode) => void] {
  const [mode, setMode] = useState<BuilderViewMode>(() => {
    try {
      return window.localStorage.getItem(storageKey) === "list" ? "list" : "family";
    } catch {
      return "family";
    }
  });
  const update = (next: BuilderViewMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // Private mode / blocked storage: the choice just isn't remembered.
    }
  };
  return [mode, update];
}

export function BuilderViewToggle({
  mode,
  onChange,
  label,
}: {
  mode: BuilderViewMode;
  onChange: (mode: BuilderViewMode) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-1.5">
      {(
        [
          { id: "family", label: "Family view" },
          { id: "list", label: "Compact list" },
        ] as const
      ).map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={mode === option.id}
          onClick={() => onChange(option.id)}
          className={`${G_TOGGLE} ${mode === option.id ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
          data-testid={`step-view-${option.id}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
