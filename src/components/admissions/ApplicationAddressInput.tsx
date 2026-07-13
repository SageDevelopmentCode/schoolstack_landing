"use client";

import type { CSSProperties, ReactNode } from "react";
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
}: ApplicationAddressInputProps) {
  const address = parseApplicationAddressFieldValue(value);

  const style = {
    borderColor: C.border,
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
    <div className="space-y-4">
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
          <select
            id={`${idPrefix}-state`}
            autoComplete="address-level1"
            value={address.state}
            onChange={(e) => updateAddress({ state: e.target.value })}
            disabled={disabled}
            className={fieldClassName()}
            style={{ ...style, ...focusRing }}
          >
            <option value="">Select state...</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
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
    </div>
  );
}
