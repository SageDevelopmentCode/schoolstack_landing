import type { CSSProperties } from "react";
import { dmSans, fraunces } from "@/lib/fonts";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

export const freeToolsStorySurfaceClassName = `${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`;

export function freeToolsStorySurfaceStyle(): CSSProperties {
  return {
    ...parentThemeCssVars(theme),
    backgroundColor: theme.paper,
    color: theme.ink,
    fontFamily: theme.fontBody,
  };
}
