"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { GIcon } from "@/components/school-parent/garden/ui";
import { useIsGardenCommittee } from "./committee-surface";

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
  const garden = useIsGardenCommittee();
  if (garden) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-[24px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] px-6 py-10 text-center sm:py-12 ${className}`}
      >
        <GIcon size="lg">
          <Icon />
        </GIcon>
        <h3 className="sf-display m-0 mt-4 text-[1.35rem] leading-[1.05] text-[var(--sf-ink)]">{title}</h3>
        <p className="m-0 mt-2 max-w-sm text-[14px] font-semibold leading-relaxed text-[var(--sf-soft)]">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    );
  }
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
