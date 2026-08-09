"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  DEFAULT_GRACE_DAYS,
  DEFAULT_LATE_FEE_DAY_OF_MONTH,
  DEFAULT_REMINDER_DAYS_BEFORE,
  resolveTuitionOrgSettings,
} from "@/lib/tuition/org-settings";
import type { TuitionLateFeeOverride, TuitionOrgSettings } from "@/lib/tuition/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type TuitionLateFeeSettingsPanelProps = {
  organizationId: string;
  branding: OrganizationBranding;
};

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function inputStyle(C: ReturnType<typeof buildAdminThemeTokens>): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

type AdminTheme = ReturnType<typeof buildAdminThemeTokens>;

function LateFeeRadioCard({
  C,
  name,
  checked,
  onChange,
  title,
  description,
  disabled = false,
}: {
  C: AdminTheme;
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-sm ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
      style={{
        borderColor: checked ? C.accent : C.border,
        backgroundColor: checked ? C.accentLight : C.surface,
        color: C.textSecondary,
      }}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-0.5 shrink-0"
        style={{ accentColor: C.accent }}
      />
      <span>
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {title}
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: C.textTertiary }}>
          {description}
        </span>
      </span>
    </label>
  );
}

export default function TuitionLateFeeSettingsPanel({
  organizationId,
  branding,
}: TuitionLateFeeSettingsPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TuitionOrgSettings>({});
  const [overrides, setOverrides] = useState<TuitionLateFeeOverride[]>([]);
  const [overrideYear, setOverrideYear] = useState(String(new Date().getFullYear()));
  const [overrideMonth, setOverrideMonth] = useState(String(new Date().getMonth() + 1));
  const [overrideDay, setOverrideDay] = useState("12");

  const resolved = useMemo(() => resolveTuitionOrgSettings(settings), [settings]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsResponse, overridesResponse] = await Promise.all([
        fetch(`/api/tuition/org-settings?organizationId=${organizationId}`),
        fetch(`/api/tuition/late-fee-overrides?organizationId=${organizationId}`),
      ]);

      const settingsPayload = (await settingsResponse.json()) as {
        settings?: TuitionOrgSettings;
        error?: string;
      };
      const overridesPayload = (await overridesResponse.json()) as {
        overrides?: TuitionLateFeeOverride[];
        error?: string;
      };

      if (!settingsResponse.ok) {
        throw new Error(settingsPayload.error ?? "Failed to load tuition settings.");
      }
      if (!overridesResponse.ok) {
        throw new Error(overridesPayload.error ?? "Failed to load late fee overrides.");
      }

      setSettings(settingsPayload.settings ?? {});
      setOverrides(overridesPayload.overrides ?? []);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load late fee settings."));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/tuition/org-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, settings }),
      });
      const payload = (await response.json()) as {
        settings?: TuitionOrgSettings;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save late fee settings.");
      }
      setSettings(payload.settings ?? settings);
      adminToast.success("Late fee settings saved");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save late fee settings."));
    } finally {
      setSaving(false);
    }
  };

  const handleAddOverride = async () => {
    const year = Number(overrideYear);
    const month = Number(overrideMonth);
    const lateFeeDayOfMonth = Number(overrideDay);

    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(lateFeeDayOfMonth)) {
      adminToast.error("Enter a valid year, month, and day.");
      return;
    }

    try {
      const response = await fetch("/api/tuition/late-fee-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          year,
          month,
          lateFeeDayOfMonth,
        }),
      });
      const payload = (await response.json()) as {
        override?: TuitionLateFeeOverride;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save override.");
      }
      await loadData();
      adminToast.success("Month override saved");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save override."));
    }
  };

  const handleDeleteOverride = async (overrideId: string) => {
    try {
      const response = await fetch(
        `/api/tuition/late-fee-overrides?organizationId=${organizationId}&overrideId=${overrideId}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete override.");
      }
      setOverrides((current) => current.filter((row) => row.id !== overrideId));
      adminToast.success("Override removed");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete override."));
    }
  };

  if (loading) {
    return (
      <p className="text-sm" style={{ color: C.textSecondary }}>
        Loading late fee settings…
      </p>
    );
  }

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-4"
      style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
      data-testid="tuition-late-fee-settings"
    >
      <div>
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          How should late fees work at your school?
        </p>
        <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
          We&apos;ll email families when a late fee is added.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Should your school charge automatic late fees?"
        className="flex flex-col gap-2"
      >
        <LateFeeRadioCard
          C={C}
          name="late-fee-enabled"
          checked={resolved.lateFeeEnabled}
          onChange={() =>
            setSettings((current) => ({ ...current, lateFeeEnabled: true }))
          }
          title="Yes, charge late fees automatically"
          description="Add a late fee when tuition is still unpaid after the due date."
        />
        <LateFeeRadioCard
          C={C}
          name="late-fee-enabled"
          checked={!resolved.lateFeeEnabled}
          onChange={() =>
            setSettings((current) => ({ ...current, lateFeeEnabled: false }))
          }
          title="No, don't charge late fees automatically"
          description="Families won't receive automatic late fees."
        />
      </div>

      <div
        className={`grid gap-3 sm:grid-cols-2 ${
          resolved.lateFeeEnabled ? "" : "opacity-50 pointer-events-none"
        }`}
      >
        <label className="flex flex-col gap-1 text-sm" style={{ color: C.textSecondary }}>
          How much is the late fee?
          <input
            type="number"
            min={0}
            step={1}
            value={resolved.lateFeeAmountCents / 100}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                lateFeeAmountCents: Math.max(
                  0,
                  Math.round(Number(event.target.value || 0) * 100),
                ),
              }))
            }
            style={inputStyle(C)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" style={{ color: C.textSecondary }}>
          Which day of the month should we check for unpaid tuition?
          <input
            type="number"
            min={1}
            max={28}
            value={resolved.lateFeeDayOfMonth}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                lateFeeDayOfMonth: Math.min(
                  28,
                  Math.max(1, Number(event.target.value || DEFAULT_LATE_FEE_DAY_OF_MONTH)),
                ),
              }))
            }
            style={inputStyle(C)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" style={{ color: C.textSecondary }}>
          How many grace days after the due date before tuition is overdue?
          <input
            type="number"
            min={0}
            value={resolved.graceDays}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                graceDays: Math.max(0, Number(event.target.value || DEFAULT_GRACE_DAYS)),
              }))
            }
            style={inputStyle(C)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" style={{ color: C.textSecondary }}>
          How many days before the due date should we remind families?
          <input
            type="number"
            min={1}
            value={resolved.reminderDaysBefore[0] ?? DEFAULT_REMINDER_DAYS_BEFORE}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                reminderDaysBefore: [
                  Math.max(1, Number(event.target.value || DEFAULT_REMINDER_DAYS_BEFORE)),
                ],
              }))
            }
            style={inputStyle(C)}
          />
        </label>
      </div>

      <div
        role="radiogroup"
        aria-label="Should late fees repeat while tuition is unpaid?"
        className={`flex flex-col gap-2 ${
          resolved.lateFeeEnabled ? "" : "opacity-50 pointer-events-none"
        }`}
      >
        <LateFeeRadioCard
          C={C}
          name="late-fee-recurring"
          checked={resolved.lateFeeRecurring}
          onChange={() =>
            setSettings((current) => ({ ...current, lateFeeRecurring: true }))
          }
          title="Yes, each month until paid"
          description="Add another late fee every month until the balance is paid."
        />
        <LateFeeRadioCard
          C={C}
          name="late-fee-recurring"
          checked={!resolved.lateFeeRecurring}
          onChange={() =>
            setSettings((current) => ({ ...current, lateFeeRecurring: false }))
          }
          title="No, one time per billing period"
          description="Only one late fee per unpaid billing period."
        />
      </div>

      <button
        type="button"
        onClick={() => void handleSaveSettings()}
        disabled={saving}
        className="self-start text-sm font-medium px-3 py-2 rounded-md disabled:opacity-60"
        style={{ backgroundColor: C.accent, color: "#fff" }}
      >
        {saving ? "Saving…" : "Save settings"}
      </button>

      <div
        className={`border-t pt-4 flex flex-col gap-3 ${
          resolved.lateFeeEnabled ? "" : "opacity-50 pointer-events-none"
        }`}
        style={{ borderColor: C.border }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            Need a different late fee day for a specific month?
          </p>
          <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
            For example, use the 12th in August during onboarding, then your usual day
            in other months.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm" style={{ color: C.textSecondary }}>
            Which year?
            <input
              type="number"
              value={overrideYear}
              onChange={(event) => setOverrideYear(event.target.value)}
              style={inputStyle(C)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm" style={{ color: C.textSecondary }}>
            Which month?
            <select
              value={overrideMonth}
              onChange={(event) => setOverrideMonth(event.target.value)}
              style={inputStyle(C)}
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm" style={{ color: C.textSecondary }}>
            On which day?
            <input
              type="number"
              min={1}
              max={28}
              value={overrideDay}
              onChange={(event) => setOverrideDay(event.target.value)}
              style={inputStyle(C)}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => void handleAddOverride()}
              className="text-sm font-medium px-3 py-2 rounded-md w-full"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              Add month override
            </button>
          </div>
        </div>

        {overrides.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {overrides.map((override) => {
              const monthLabel =
                MONTH_OPTIONS.find((option) => option.value === override.month)?.label ??
                String(override.month);
              return (
                <li
                  key={override.id}
                  className="flex items-center justify-between gap-3 text-sm px-3 py-2 rounded-md"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <span style={{ color: C.textPrimary }}>
                    {monthLabel} {override.year}: day {override.lateFeeDayOfMonth}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDeleteOverride(override.id)}
                    className="p-1 rounded"
                    style={{ color: C.textTertiary }}
                    aria-label={`Remove ${monthLabel} ${override.year} override`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs" style={{ color: C.textTertiary }}>
            No month overrides yet. Your default late fee day applies every month.
          </p>
        )}
      </div>
    </div>
  );
}
