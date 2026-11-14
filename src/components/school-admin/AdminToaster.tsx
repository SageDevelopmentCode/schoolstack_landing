"use client";

import { usePathname } from "next/navigation";
import StoryToaster from "@/components/mudkitchen-portal/ui/StoryToaster";
import GardenToaster from "@/components/school-parent/garden/GardenToaster";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminToasterProps = {
  C: AdminThemeTokens;
  /** Story theme tokens; enables Garden toasts on Garden admin pages. */
  theme?: ParentThemeTokens;
};

/**
 * Admin routes already on the Garden look (path after `/school/{slug}/admin/`).
 * Add each admin tab here when it migrates so its toasts match the page.
 * See `.agents/skills/admin-portal-garden-design/SKILL.md`.
 */
const GARDEN_ADMIN_ROUTES = ["dashboard"] as const;

function usesGardenToasts(pathname: string | null): boolean {
  if (!pathname) return false;
  const match = /\/admin\/(.+?)\/?$/.exec(pathname);
  return match != null && (GARDEN_ADMIN_ROUTES as readonly string[]).includes(match[1]);
}

export default function AdminToaster({ C, theme }: AdminToasterProps) {
  const pathname = usePathname();
  if (theme && usesGardenToasts(pathname)) {
    return <GardenToaster theme={theme} />;
  }
  return <StoryToaster C={C} />;
}
