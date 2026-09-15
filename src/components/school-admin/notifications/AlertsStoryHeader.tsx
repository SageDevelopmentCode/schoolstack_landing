"use client";

import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AlertsStoryHeaderProps = {
  theme: ParentThemeTokens;
  schoolName: string;
  channelsNeedingActionCount: number;
};

export default function AlertsStoryHeader({
  theme,
  schoolName,
  channelsNeedingActionCount,
}: AlertsStoryHeaderProps) {
  const subtitleParts = [`Manage email alerts for ${schoolName}.`];

  if (channelsNeedingActionCount > 0) {
    subtitleParts.push(
      `${channelsNeedingActionCount} channel${channelsNeedingActionCount === 1 ? "" : "s"} need recipients.`,
    );
  }

  return (
    <header data-testid="alerts-story-header">
      <AdminSectionKicker theme={theme}>Workspace</AdminSectionKicker>
      <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1.5">
        Alerts
      </AdminDisplayHeading>
      <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
        {subtitleParts.join(" ")}
      </p>
    </header>
  );
}
