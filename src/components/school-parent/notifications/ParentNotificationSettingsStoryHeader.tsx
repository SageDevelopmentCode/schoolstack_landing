"use client";

import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const SUBTITLE =
  "Choose where family emails go for applications, billing, messages, and other parent portal updates. This can differ from the email you use to sign in. School admin alerts are not affected.";

type ParentNotificationSettingsStoryHeaderProps = {
  theme: ParentThemeTokens;
};

export default function ParentNotificationSettingsStoryHeader({
  theme,
}: ParentNotificationSettingsStoryHeaderProps) {
  return (
    <header data-testid="parent-notification-settings-story-header">
      <ParentSectionKicker theme={theme}>Account & preferences</ParentSectionKicker>
      <ParentDisplayHeading
        theme={theme}
        as="h1"
        size="section"
        className="!text-[clamp(1.75rem,4vw,2rem)]"
      >
        Notification settings
      </ParentDisplayHeading>
      <p className="mt-1 max-w-2xl text-[13px]" style={{ color: theme.muted }}>
        {SUBTITLE}
      </p>
    </header>
  );
}
