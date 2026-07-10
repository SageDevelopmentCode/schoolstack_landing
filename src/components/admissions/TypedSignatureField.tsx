"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { greatVibes } from "@/lib/fonts";

type TypedSignatureFieldProps = {
  C: AdminThemeTokens;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

export function parseStoredSignerName(
  responses: Record<string, unknown> | null | undefined,
): string {
  const signerName = responses?.signerName;
  return typeof signerName === "string" ? signerName : "";
}

export default function TypedSignatureField({
  C,
  value,
  onChange,
  disabled = false,
  id,
}: TypedSignatureFieldProps) {
  const trimmedValue = value.trim();
  const previewText = trimmedValue || "Your signature will appear here";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium"
        style={{ color: C.textSecondary }}
      >
        Type your full legal name to sign
      </label>

      <div
        className="mb-3 flex min-h-[72px] flex-col justify-center rounded-md border px-4 py-4"
        style={{
          borderColor: C.border,
          backgroundColor: "#FFFFFF",
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <p
          className={`${greatVibes.className} break-words text-2xl leading-tight sm:text-3xl`}
          style={{
            color: trimmedValue ? C.accentDark : C.textTertiary,
            letterSpacing: "0.02em",
          }}
        >
          {previewText}
        </p>
      </div>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="Full legal name"
        className="w-full rounded-md border px-3 py-2.5 text-sm outline-none"
        style={{
          borderColor: C.inputBorder,
          backgroundColor: disabled ? C.input : "#FFFFFF",
          color: C.textPrimary,
        }}
      />
    </div>
  );
}
