"use client";

import type { ReactNode } from "react";
import { fraunces, dmSans } from "@/lib/fonts";
import {
  parentThemeCssVars,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";

type MondayCheckStoryShellProps = {
  theme: ParentThemeTokens;
  wide?: boolean;
  children: ReactNode;
};

export default function MondayCheckStoryShell({
  theme,
  wide = false,
  children,
}: MondayCheckStoryShellProps) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} min-h-screen pt-[100px] pb-28 px-4 sm:px-6 [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      style={{
        ...parentThemeCssVars(theme),
        backgroundColor: theme.paper,
        fontFamily: theme.fontBody,
        color: theme.ink,
      }}
    >
      <div
        className={`${wide ? "max-w-[760px]" : "max-w-[720px]"} mx-auto transition-[max-width] duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
