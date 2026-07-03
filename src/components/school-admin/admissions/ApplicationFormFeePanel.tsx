"use client";

import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { ApplicationFormFeeConfig } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationFormFeePanelProps = {
  C: AdminThemeTokens;
  feeConfig: ApplicationFormFeeConfig;
  readOnly: boolean;
  onChange: (feeConfig: ApplicationFormFeeConfig) => void;
  hideHeader?: boolean;
};

export default function ApplicationFormFeePanel({
  C,
  feeConfig,
  readOnly,
  onChange,
  hideHeader = false,
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
      className={hideHeader ? "space-y-4" : "rounded-lg border p-5 space-y-4"}
      style={
        hideHeader
          ? undefined
          : { borderColor: C.border, backgroundColor: C.surface }
      }
    >
      {!hideHeader && (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Application fee
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
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
      )}

      {hideHeader && (
        <label className="flex items-center gap-2 text-sm font-medium" style={{ color: C.textPrimary }}>
          <input
            type="checkbox"
            checked={feeConfig.enabled}
            disabled={readOnly}
            onChange={(e) => onChange({ ...feeConfig, enabled: e.target.checked })}
            className="h-4 w-4 rounded"
            style={{ accentColor: C.accent }}
          />
          Collect an application fee
        </label>
      )}

      {feeConfig.enabled && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: C.textPrimary }}>
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
            <label className="mb-1.5 block text-sm font-medium" style={{ color: C.textPrimary }}>
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
            <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
              Families will pay {formatFeeAmount(feeConfig.amount_cents ?? 0)}.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
