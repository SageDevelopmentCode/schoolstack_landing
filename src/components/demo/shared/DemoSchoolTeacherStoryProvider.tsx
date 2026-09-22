"use client";

import type { ReactNode } from "react";
import { ParentThemeProvider } from "@/components/school-parent/ParentThemeContext";
import { TEACHER_DEMO_STORY_THEME } from "@/components/demo/shared/teacher-demo-runtime";
import { buildDemoTeacherBranding } from "@/data/school-demos/demo-portal-shared";
import { fraunces, dmSans } from "@/lib/fonts";

type DemoSchoolTeacherStoryProviderProps = {
  children: ReactNode;
  className?: string;
};

export default function DemoSchoolTeacherStoryProvider({
  children,
  className,
}: DemoSchoolTeacherStoryProviderProps) {
  const branding = buildDemoTeacherBranding();

  return (
    <ParentThemeProvider branding={branding} themeOverride={TEACHER_DEMO_STORY_THEME}>
      <div
        className={`${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] ${className ?? ""}`}
      >
        {children}
      </div>
    </ParentThemeProvider>
  );
}
