"use client";

import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { ApplicationFormFeeConfig } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFormFeePanelProps = {
  C: AdminThemeTokens;
  feeConfig: ApplicationFormFeeConfig;
  readOnly: boolean;
  onChange: (feeConfig: ApplicationFormFeeConfig) => void;
};

export default function ApplicationFormFeePanel({
  C,
  feeConfig,
  readOnly,
  onChange,
}: ApplicationFormFeePanelProps) {
  const inputStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };

  const dollars =
    feeConfig.amount_cents !== undefined
      ? (feeConfig.amount_cents / 100).toFixed(2)
      : "0.00";

  return (
    <div
      className="rounded-md border p-4 space-y-3"
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Application fee
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: C.textTertiary }}>
            Collected at the end of the application before submit.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: C.textSecondary }}>
          <input
            type="checkbox"
            checked={feeConfig.enabled}
            disabled={readOnly}
            onChange={(e) => onChange({ ...feeConfig, enabled: e.target.checked })}
            className="h-4 w-4 rounded"
            style={{ accentColor: C.accent }}
          />
          Enabled
        </label>
      </div>

      {feeConfig.enabled && (
        <>
          <div>
            <label
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Fee label
            </label>
            <input
              type="text"
              value={feeConfig.label ?? "Application fee"}
              disabled={readOnly}
              onChange={(e) => onChange({ ...feeConfig, label: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Amount (USD)
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={dollars}
              disabled={readOnly}
              onChange={(e) => {
                const parsed = Number.parseFloat(e.target.value);
                onChange({
                  ...feeConfig,
                  amount_cents: Number.isFinite(parsed)
                    ? Math.round(parsed * 100)
                    : 0,
                });
              }}
              style={inputStyle}
            />
            <p className="mt-1 text-[10px]" style={{ color: C.textTertiary }}>
              Families will pay {formatFeeAmount(feeConfig.amount_cents ?? 0)}.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
