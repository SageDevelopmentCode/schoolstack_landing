"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeSectionEmptyStateProps = {
  theme: ParentThemeTokens;
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export default function CommitteeSectionEmptyState({
  theme,
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: CommitteeSectionEmptyStateProps) {
  return (
    <ParentCard
      theme={theme}
      className={`flex flex-col items-center justify-center py-10 text-center sm:py-12 ${className}`}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
        style={{ backgroundColor: theme.primarySoft }}
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: theme.primary }} />
      </div>
      <ParentDisplayHeading theme={theme} as="h3" size="section" className="!text-[17px]">
        {title}
      </ParentDisplayHeading>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed" style={{ color: theme.muted }}>
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </ParentCard>
  );
}
