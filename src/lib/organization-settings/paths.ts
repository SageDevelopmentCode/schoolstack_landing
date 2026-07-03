import type { OrganizationBranding } from "./types";

export function getBrandingValue(
  branding: OrganizationBranding,
  path: string,
): string | number {
  const parts = path.split(".");
  let current: unknown = branding;
  for (const part of parts) {
    if (current === null || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === "number") return current;
  if (typeof current === "string") return current;
  return "";
}

export function setBrandingValue(
  branding: OrganizationBranding,
  path: string,
  value: string | number,
): OrganizationBranding {
  const parts = path.split(".");
  const clone = structuredClone(branding) as Record<string, unknown>;
  let current: Record<string, unknown> = clone;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (
      current[part] === null ||
      typeof current[part] !== "object" ||
      Array.isArray(current[part])
    ) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const last = parts[parts.length - 1];
  current[last] = value;
  return clone as unknown as OrganizationBranding;
}

/** Normalize rgba/hex for color input (only supports #rrggbb). */
export function toColorInputValue(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  const rgbMatch = value.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/,
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]).toString(16).padStart(2, "0");
    const g = Number(rgbMatch[2]).toString(16).padStart(2, "0");
    const b = Number(rgbMatch[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return "#827096";
}

export function serializeSettings(
  branding: OrganizationBranding,
  features: Record<string, unknown>,
) {
  return JSON.stringify({ branding, features });
}
