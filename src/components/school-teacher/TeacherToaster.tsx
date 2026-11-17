"use client";

import { usePathname } from "next/navigation";
import StoryToaster from "@/components/mudkitchen-portal/ui/StoryToaster";
import GardenToaster from "@/components/school-parent/garden/GardenToaster";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/**
 * Staff portal routes already on the Garden look (the last path segment of
 * `/school/{slug}/teacher/{feature}` or the admin staff preview
 * `/admin/preview/{slug}/teacher/{staffId}/{feature}`). Add each teacher tab
 * here when it migrates so its toasts match the page.
 * See `.agents/skills/teacher-portal-garden-design/SKILL.md`.
 */
export const GARDEN_TEACHER_ROUTES = [
  "dashboard",
  "my_students",
  "messages",
  "calendar",
  "forms_documents",
  "classroom_signups",
  "attendance",
] as const;

export function usesGardenTeacherToasts(pathname: string | null): boolean {
  if (!pathname) return false;
  const match = /\/teacher\/(?:.+\/)?([^/]+)\/?$/.exec(pathname);
  return match != null && (GARDEN_TEACHER_ROUTES as readonly string[]).includes(match[1]);
}

export default function TeacherToaster({ C, theme }: { C: AdminThemeTokens; theme: ParentThemeTokens }) {
  const pathname = usePathname();
  if (usesGardenTeacherToasts(pathname)) return <GardenToaster theme={theme} />;
  return <StoryToaster C={C} />;
}
