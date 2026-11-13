"use client";

import type { CSSProperties, ReactNode } from "react";
import { gardenFontVariables } from "@/components/garden/fonts";
import "@/components/garden/garden.css";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/**
 * Parent portal "Garden dashboard" scope.
 *
 * Wraps a parent tab's content (never the portal header/nav) in `.sf-garden`
 * with the Garden fonts, and maps the school's accent onto the Garden action
 * tokens so every `--sf-clay*` utility speaks in the school's colour:
 *
 * - `--sf-clay`        → `theme.primary`      (primary actions, accent words)
 * - `--sf-clay-deep`   → `theme.primaryDark`  (small accent text, dark card)
 * - `--sf-peach`       → accent tint on paper (soft accent backgrounds)
 * - `--sf-accent-wash` → faint accent wash    (hover rows, call-outs)
 *
 * `sf-parent-garden` keeps the Garden type reset working even when the page
 * is rendered inside a marketing `.sf-demo` (see garden.css).
 *
 * Skill: `.agents/skills/parent-portal-garden-design`.
 */
export default function ParentGardenFrame({
  theme,
  children,
  className = "",
}: {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
}) {
  const style = {
    "--sf-clay": theme.primary,
    "--sf-clay-deep": theme.primaryDark,
    "--sf-peach": `color-mix(in srgb, ${theme.primary} 16%, #fffaf4)`,
    "--sf-accent-wash": `color-mix(in srgb, ${theme.primary} 8%, #fffaf4)`,
  } as CSSProperties;
  return (
    <div
      className={`${gardenFontVariables} sf-garden sf-parent-garden min-h-full w-full overflow-x-clip ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * Keeps a reused, not-yet-migrated portal block (story primitives, shared
 * layouts) in the portal's own type inside the Garden frame.
 */
export function PortalIsland({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`sf-demo ${className}`}>{children}</div>;
}
