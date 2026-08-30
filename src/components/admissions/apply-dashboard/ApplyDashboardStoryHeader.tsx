"use client";

import { Plus } from "lucide-react";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ApplyDashboardStoryHeaderProps = {
  theme: ParentThemeTokens;
  kicker: string;
  title: string;
  subtitle: string;
  schoolSlug: string;
  previewMode?: boolean;
};

export default function ApplyDashboardStoryHeader({
  theme,
  kicker,
  title,
  subtitle,
  schoolSlug,
  previewMode = false,
}: ApplyDashboardStoryHeaderProps) {
  const newAppHref = `/school/${schoolSlug}/forms/apply?new=1`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <ParentSectionKicker theme={theme}>{kicker}</ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h1" size="section">
          {title}
        </ParentDisplayHeading>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      </div>
      {previewMode ? (
        <span
          aria-disabled="true"
          className="inline-flex w-full shrink-0 cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border px-[15px] py-[11px] text-[13px] font-bold opacity-50 sm:w-auto"
          style={{
            color: theme.primary,
            borderColor: "#B3C7B8",
            backgroundColor: theme.white,
          }}
        >
          <Plus className="h-4 w-4 shrink-0" />
          New application
        </span>
      ) : (
        <ParentButtonLink
          theme={theme}
          href={newAppHref}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4 shrink-0" />
            New application
          </span>
        </ParentButtonLink>
      )}
    </div>
  );
}
