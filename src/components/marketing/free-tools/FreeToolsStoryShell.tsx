import type { ReactNode } from "react";
import { dmSans, fraunces } from "@/lib/fonts";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

export default function FreeToolsStoryShell({ children }: { children: ReactNode }) {
  return (
    <main
      className={`${fraunces.variable} ${dmSans.variable} min-h-screen overflow-x-clip px-4 pb-16 pt-[108px] sm:px-7 lg:px-8 [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      style={{
        ...parentThemeCssVars(theme),
        backgroundColor: theme.paper,
        color: theme.ink,
        fontFamily: theme.fontBody,
      }}
    >
      <div className="mx-auto min-w-0 max-w-[1180px]">{children}</div>
    </main>
  );
}
