"use client";

import StoryToaster from "@/components/mudkitchen-portal/ui/StoryToaster";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdminToasterProps = {
  C: AdminThemeTokens;
};

export default function AdminToaster({ C }: AdminToasterProps) {
  return <StoryToaster C={C} />;
}
