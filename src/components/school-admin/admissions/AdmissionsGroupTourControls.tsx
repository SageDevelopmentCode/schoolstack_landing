"use client";

import { useEffect, useState } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { useAdminConfirm } from "@/components/school-admin/garden/useAdminConfirm";
import { GardenSwitch, gInputClass } from "@/components/school-admin/garden/kit";

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
  const skin = useAdminGardenSkin();
  const { confirm, dialog: confirmDialog } = useAdminConfirm(C);

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
      if (skin) {
        adminToast.dismiss("group-day-error");
        adminToast.success("Whole-day group tour on.", {
          id: "group-day",
          description: `Up to ${groupCapacity} ${groupCapacity === 1 ? "person" : "people"} share the open slots this day.`,
        });
      } else {
        adminToast.success("Whole-day group tour applied");
      }
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
      if (skin) {
        adminToast.error("Couldn't turn on the group tour.", {
          id: "group-day-error",
          description: `${formatActionError(err, "Failed to apply group tour day.")} The day's slots are unchanged.`,
          action: { label: "Retry", onClick: () => void applyWholeDay(groupCapacity) },
        });
      } else {
        adminToast.error(formatActionError(err, "Failed to apply group tour day."));
      }
    } finally {
      setBusy(false);
    }
  }

  async function clearWholeDay() {
    setBusy(true);
    try {
      await postGroupDay({ action: "clear" });
      if (skin) {
        adminToast.dismiss("group-day-error");
        adminToast.success("Group tour turned off.", {
          id: "group-day",
          description: "Open slots stay open as 1:1 tours.",
        });
      } else {
        adminToast.success("Group tour day cleared");
      }
      onUpdated();
    } catch (err) {
      if (skin) {
        adminToast.error("Couldn't turn off the group tour.", {
          id: "group-day-error",
          description: `${formatActionError(err, "Failed to clear group tour day.")} It's still a group tour day.`,
          action: { label: "Retry", onClick: () => void clearWholeDay() },
        });
      } else {
        adminToast.error(formatActionError(err, "Failed to clear group tour day."));
      }
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
    if (skin) {
      const ok = await confirm({
        title: "Turn off the whole-day group tour?",
        description: "The shared capacity goes away and each open slot becomes a 1:1 tour again.",
        confirmLabel: "Turn off",
        destructive: false,
      });
      if (!ok) return;
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

  if (skin) {
    return (
      <div className="flex flex-col gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
        <GardenSwitch
          checked={isWholeDayActive}
          disabled={readOnly}
          busy={busy}
          onChange={(next) => void handleToggle(next)}
          label="Whole-day group tour"
          description="Shares one capacity pool across all open slots this day. Open slots stay open; families see a group tour badge on the public page."
        />
        {isWholeDayActive ? (
          <label className="flex items-center gap-2 text-[12.5px] font-bold text-[var(--sf-soft)]">
            Day capacity
            <input
              type="number"
              min={1}
              disabled={readOnly || busy}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              onBlur={() => void handleCapacityBlur()}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className={gInputClass(null, "!w-24 tabular-nums")}
              aria-label="Whole-day group capacity"
              data-garden-skip
            />
            <span>people</span>
          </label>
        ) : null}
        {confirmDialog}
      </div>
    );
  }

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
