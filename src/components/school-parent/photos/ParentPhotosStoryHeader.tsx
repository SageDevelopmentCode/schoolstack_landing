"use client";

import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentPhotosStoryHeaderProps = {
  theme: ParentThemeTokens;
};

export default function ParentPhotosStoryHeader({ theme }: ParentPhotosStoryHeaderProps) {
  return (
    <header className="flex flex-col gap-1" data-testid="parent-photos-story-header">
      <ParentSectionKicker theme={theme}>Your family</ParentSectionKicker>
      <ParentDisplayHeading
        theme={theme}
        as="h1"
        size="section"
        className="!text-[clamp(1.75rem,4vw,2.15rem)]"
      >
        Photos
      </ParentDisplayHeading>
      <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
        School gallery and your child&apos;s photo permissions in one place.
      </p>
    </header>
  );
}
