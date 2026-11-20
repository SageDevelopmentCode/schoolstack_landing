"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";

/*
 * How the shared application inputs look (`ApplicationFieldInput` and its
 * sub-inputs). They are used by the family apply form, the enrollment
 * checklist, the admin builders and a few admin date pickers, so the shape is
 * opt-in: only Garden family pages (and the builders' family views) set
 * "garden". Colours still come from the `C` tokens passed to each input, which
 * Garden pages build with `parentThemeToGardenCompat`, so portalled popups
 * (select sheet, date dialog) match without the `--sf-*` scope.
 */
export type ApplicationFieldAppearance = "default" | "garden";

const AppearanceContext = createContext<ApplicationFieldAppearance>("default");

export function ApplicationFieldAppearanceProvider({
  value,
  children,
}: {
  value: ApplicationFieldAppearance;
  children: ReactNode;
}) {
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useApplicationFieldAppearance(): ApplicationFieldAppearance {
  return useContext(AppearanceContext);
}

/** Text input / textarea shape. */
export function applicationFieldClass(appearance: ApplicationFieldAppearance): string {
  return appearance === "garden"
    ? "w-full rounded-[14px] border-2 px-3.5 py-2.5 text-[16px] font-semibold outline-none transition placeholder:font-medium focus:ring-4 sm:text-sm"
    : "w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2";
}

/** Extra classes for buttons that act as inputs (select / date triggers), on top of their base `rounded-md border` classes. */
export function applicationTriggerClass(appearance: ApplicationFieldAppearance): string {
  return appearance === "garden"
    ? "!rounded-[14px] !border-2 !px-3.5 font-semibold focus:!ring-4"
    : "";
}

/** Focus ring colour (accent at 25% default, 15% Garden to pair with the wider ring). */
export function applicationFocusRing(accent: string, appearance: ApplicationFieldAppearance): CSSProperties {
  return { "--tw-ring-color": `${accent}${appearance === "garden" ? "26" : "40"}` } as CSSProperties;
}

/** Choice cards (checkbox, stacked radio) and pills. */
export function applicationChoiceRadius(appearance: ApplicationFieldAppearance): string {
  return appearance === "garden" ? "rounded-[14px] border-2" : "rounded-md border";
}

/** Help text / error text under a field. */
export function applicationMetaTextClass(appearance: ApplicationFieldAppearance): string {
  return appearance === "garden" ? "mt-1.5 text-[12.5px] font-semibold" : "mt-1.5 text-xs";
}
