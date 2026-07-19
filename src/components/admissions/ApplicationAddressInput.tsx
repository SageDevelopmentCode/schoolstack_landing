"use client";

import type { CSSProperties, ReactNode } from "react";
import ApplicationSelectInput from "@/components/admissions/ApplicationSelectInput";
import {
  parseApplicationAddressFieldValue,
  serializeApplicationAddressFieldValue,
  US_STATES,
  type ApplicationAddressValue,
} from "@/lib/admissions/application-address";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationAddressInputProps = {
  idPrefix: string;
  value: string;
  onChange: (value: string) => void;
  C: AdminThemeTokens;
  disabled?: boolean;
  error?: string | null;
};

function fieldClassName() {
  return "w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2";
}

function SubFieldLabel({
  children,
  C,
}: {
  children: ReactNode;
  C: AdminThemeTokens;
}) {
  return (
    <span className="mb-1.5 block text-xs font-medium" style={{ color: C.textSecondary }}>
      {children}
    </span>
  );
}

export default function ApplicationAddressInput({
  idPrefix,
  value,
  onChange,
  C,
  disabled = false,
  error = null,
}: ApplicationAddressInputProps) {
  const address = parseApplicationAddressFieldValue(value);

  const style = {
    borderColor: error ? C.errorBorder : C.border,
    color: disabled ? C.textTertiary : C.textPrimary,
    backgroundColor: "#FFFFFF",
  } as const;

  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;

  const updateAddress = (patch: Partial<ApplicationAddressValue>) => {
    onChange(
      serializeApplicationAddressFieldValue({
        ...address,
        ...patch,
      }),
    );
  };

  return (
    <div
      className={
        error
          ? "space-y-4 rounded-md border p-4"
          : "space-y-4"
      }
      style={error ? { borderColor: C.errorBorder } : undefined}
    >
      <div>
        <SubFieldLabel C={C}>Address line 1</SubFieldLabel>
        <input
          id={`${idPrefix}-line1`}
          type="text"
          autoComplete="address-line1"
          placeholder="Street address"
          value={address.line1}
          onChange={(e) => updateAddress({ line1: e.target.value })}
          disabled={disabled}
          className={fieldClassName()}
          style={{ ...style, ...focusRing }}
        />
      </div>

      <div>
        <SubFieldLabel C={C}>Address line 2</SubFieldLabel>
        <input
          id={`${idPrefix}-line2`}
          type="text"
          autoComplete="address-line2"
          placeholder="Apt, suite, unit, etc."
          value={address.line2 ?? ""}
          onChange={(e) => updateAddress({ line2: e.target.value })}
          disabled={disabled}
          className={fieldClassName()}
          style={{ ...style, ...focusRing }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <SubFieldLabel C={C}>City</SubFieldLabel>
          <input
            id={`${idPrefix}-city`}
            type="text"
            autoComplete="address-level2"
            placeholder="City"
            value={address.city}
            onChange={(e) => updateAddress({ city: e.target.value })}
            disabled={disabled}
            className={fieldClassName()}
            style={{ ...style, ...focusRing }}
          />
        </div>

        <div>
          <SubFieldLabel C={C}>State</SubFieldLabel>
          <ApplicationSelectInput
            id={`${idPrefix}-state`}
            value={address.state}
            onChange={(state) => updateAddress({ state })}
            options={US_STATES}
            placeholder="Select state..."
            disabled={disabled}
            ariaLabel="State"
            autoComplete="address-level1"
            C={C}
          />
        </div>
      </div>

      <div className="sm:w-1/2">
        <SubFieldLabel C={C}>ZIP code</SubFieldLabel>
        <input
          id={`${idPrefix}-zip`}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="ZIP code"
          value={address.zip}
          onChange={(e) => updateAddress({ zip: e.target.value })}
          disabled={disabled}
          className={fieldClassName()}
          style={{ ...style, ...focusRing }}
        />
      </div>
      {error ? (
        <p className="text-xs" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
