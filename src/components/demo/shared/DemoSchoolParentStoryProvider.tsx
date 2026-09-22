"use client";

import type { ReactNode } from "react";
import { ParentThemeProvider } from "@/components/school-parent/ParentThemeContext";
import { PARENT_DEMO_STORY_THEME } from "@/components/demo/shared/parent-demo-runtime";
import { buildDemoParentBranding } from "@/data/school-demos/demo-portal-shared";
import { fraunces, dmSans } from "@/lib/fonts";

type DemoSchoolParentStoryProviderProps = {
  children: ReactNode;
  className?: string;
};

export default function DemoSchoolParentStoryProvider({
  children,
  className,
}: DemoSchoolParentStoryProviderProps) {
  const branding = buildDemoParentBranding();

  return (
    <ParentThemeProvider branding={branding} themeOverride={PARENT_DEMO_STORY_THEME}>
      <div
        className={`${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] ${className ?? ""}`}
      >
        {children}
      </div>
    </ParentThemeProvider>
  );
}
