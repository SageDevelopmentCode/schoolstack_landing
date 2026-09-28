"use client";

import { useEffect, useState } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

const DEFAULT_GROUP_CAPACITY = 10;

function parseCapacity(raw: string): number | null {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

function StorySwitch({
  checked,
  disabled,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        aria-hidden
        className="relative inline-flex h-6 w-10 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? "#2D6B47" : "#DCE4DC" }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
        />
      </span>
    </button>
  );
}

function AdminSwitch({
  C,
  checked,
  disabled,
  onChange,
  ariaLabel,
}: {
  C: AdminThemeTokens;
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        aria-hidden
        className="relative inline-flex h-6 w-10 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? C.accent : C.border }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
        />
      </span>
    </button>
  );
}

type AdmissionsGroupTourDayControlsProps = {
  C: AdminThemeTokens;
  organizationId: string;
  date: string | null;
  isWholeDayActive: boolean;
  wholeDayCapacity: number | null;
  readOnly?: boolean;
  storySurface?: boolean;
  onUpdated: () => void;
};

export default function AdmissionsGroupTourDayControls({
  C,
  organizationId,
  date,
  isWholeDayActive,
  wholeDayCapacity,
  readOnly = false,
  storySurface = false,
  onUpdated,
}: AdmissionsGroupTourDayControlsProps) {
  const [capacity, setCapacity] = useState(String(DEFAULT_GROUP_CAPACITY));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      if (wholeDayCapacity != null && wholeDayCapacity > 0) {
        setCapacity(String(wholeDayCapacity));
      } else if (!isWholeDayActive) {
        setCapacity(String(DEFAULT_GROUP_CAPACITY));
      }
    });
  }, [date, isWholeDayActive, wholeDayCapacity]);

  if (!date) return null;

  async function postGroupDay(body: {
    action: "apply" | "clear";
    groupCapacity?: number;
  }) {
    const response = await fetch("/api/school-admin/admissions/availability/group-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId,
        date,
        ...body,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to update group tour day.");
    }
  }

  async function applyWholeDay(groupCapacity: number) {
    setBusy(true);
    try {
      await postGroupDay({ action: "apply", groupCapacity });
      adminToast.success("Whole-day group tour applied");
      onUpdated();
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "admissions.group_day.apply",
          error: "",
        },
        err,
      );
      adminToast.error(formatActionError(err, "Failed to apply group tour day."));
    } finally {
      setBusy(false);
    }
  }

  async function clearWholeDay() {
    setBusy(true);
    try {
      await postGroupDay({ action: "clear" });
      adminToast.success("Group tour day cleared");
      onUpdated();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to clear group tour day."));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(next: boolean) {
    if (readOnly || busy) return;
    if (next) {
      const groupCapacity = parseCapacity(capacity) ?? DEFAULT_GROUP_CAPACITY;
      if (parseCapacity(capacity) == null) {
        setCapacity(String(groupCapacity));
      }
      await applyWholeDay(groupCapacity);
      return;
    }
    await clearWholeDay();
  }

  async function handleCapacityBlur() {
    if (readOnly || busy || !isWholeDayActive) return;
    const nextCapacity = parseCapacity(capacity);
    if (nextCapacity == null) {
      adminToast.error("Enter a capacity of at least 1.");
      if (wholeDayCapacity != null) {
        setCapacity(String(wholeDayCapacity));
      }
      return;
    }
    if (wholeDayCapacity === nextCapacity) return;
    await applyWholeDay(nextCapacity);
  }

  const Switch = storySurface ? (
    <StorySwitch
      checked={isWholeDayActive}
      disabled={readOnly || busy}
      ariaLabel="Whole-day group tour"
      onChange={(next) => void handleToggle(next)}
    />
  ) : (
    <AdminSwitch
      C={C}
      checked={isWholeDayActive}
      disabled={readOnly || busy}
      ariaLabel="Whole-day group tour"
      onChange={(next) => void handleToggle(next)}
    />
  );

  return (
    <div
      className={`space-y-2 border p-3 ${storySurface ? "rounded-[12px]" : "rounded-md"}`}
      style={
        storySurface
          ? {
              borderColor: "#B8DFC4",
              backgroundColor: "#EAF7EE",
            }
          : {
              borderColor: C.border,
              backgroundColor: C.accentLight,
            }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[11px] font-medium"
          style={{ color: storySurface ? "#2D6B47" : C.textSecondary }}
        >
          Whole-day group tour
        </p>
        {Switch}
      </div>
      <p className="text-[10px]" style={{ color: C.textTertiary }}>
        Shares one capacity pool across all open slots this day. Open slots stay open; families
        see a group tour badge on the public page.
      </p>
      {isWholeDayActive ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[10px]" style={{ color: C.textTertiary }}>
            Day capacity
          </label>
          <input
            type="number"
            min={1}
            disabled={readOnly || busy}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            onBlur={() => void handleCapacityBlur()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            className="w-20 rounded-md border px-2 py-1 text-xs"
            style={{ borderColor: C.border, color: C.textPrimary }}
            aria-label="Whole-day group capacity"
          />
        </div>
      ) : null}
    </div>
  );
}
