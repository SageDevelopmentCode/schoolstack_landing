"use client";

import type { ReactNode } from "react";
import {
  ADMIN_DEMO_STORY_COMPAT,
  ADMIN_DEMO_STORY_THEME,
} from "@/components/demo/shared/admin-demo-runtime";
import { SchoolAdminStoryThemeProvider } from "@/components/school-admin/SchoolAdminStoryShell";

type DemoSchoolAdminStoryProviderProps = {
  children: ReactNode;
  className?: string;
};

export default function DemoSchoolAdminStoryProvider({
  children,
  className,
}: DemoSchoolAdminStoryProviderProps) {
  return (
    <SchoolAdminStoryThemeProvider
      theme={ADMIN_DEMO_STORY_THEME}
      C={ADMIN_DEMO_STORY_COMPAT}
      className={className}
    >
      {children}
    </SchoolAdminStoryThemeProvider>
  );
}
