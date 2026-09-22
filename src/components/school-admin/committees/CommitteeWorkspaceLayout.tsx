"use client";

import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeWorkspaceLayoutProps = {
  theme: ParentThemeTokens;
  sidePanel: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  contentInnerClassName?: string;
};

export default function CommitteeWorkspaceLayout({
  theme,
  sidePanel,
  children,
  contentClassName = "",
  contentInnerClassName = "",
}: CommitteeWorkspaceLayoutProps) {
  return (
    <div
      className="flex h-full min-h-0 flex-col lg:grid lg:grid-cols-[minmax(200px,17%)_minmax(0,1fr)]"
      style={{ backgroundColor: theme.paper }}
    >
      <aside
        className="shrink-0 border-b px-3 py-5 sm:px-4 lg:border-b-0 lg:border-r lg:py-6"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
      >
        {sidePanel}
      </aside>
      <main
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 md:px-9 ${contentClassName}`}
        style={{ backgroundColor: theme.paper }}
      >
        <div className={`mx-auto w-full max-w-[1250px] ${contentInnerClassName}`.trim()}>
          {children}
        </div>
      </main>
    </div>
  );
}
