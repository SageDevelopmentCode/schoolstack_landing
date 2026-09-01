"use client";

import OrganizationEventsCalendarManager from "@/components/school-events/OrganizationEventsCalendarManager";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export default function SchoolEventsTab({
  theme,
  C,
  organizationId,
  onLoadingChange,
}: {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  organizationId: string;
  onLoadingChange?: (loading: boolean) => void;
}) {
  return (
    <OrganizationEventsCalendarManager
      theme={theme}
      C={C}
      organizationId={organizationId}
      onLoadingChange={onLoadingChange}
      toastVariant="admin"
    />
  );
}
