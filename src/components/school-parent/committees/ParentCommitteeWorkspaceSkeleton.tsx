"use client";

import { useMemo } from "react";
import CalendarSkeleton from "@/components/school-events-calendar/CalendarSkeleton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";

type ParentCommitteeWorkspaceSkeletonProps = {
  theme: ParentThemeTokens;
  variant: "workspace" | "section";
  section?: CommitteeWorkspaceSection;
};

function GenericSectionSkeleton({ theme }: { theme: ParentThemeTokens }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ParentSkeletonBlock theme={theme} className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <ParentCard key={index} theme={theme} className="!p-4">
            <ParentSkeletonBlock theme={theme} className="h-4 w-2/3" />
            <ParentSkeletonBlock theme={theme} className="mt-2 h-3 w-1/3" />
            <ParentSkeletonBlock theme={theme} className="mt-3 h-3 w-full" />
          </ParentCard>
        ))}
      </div>
    </div>
  );
}

function CalendarSectionSkeleton({ theme }: { theme: ParentThemeTokens }) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <ParentCard theme={theme} className="!p-3 sm:!p-4">
        <ParentSkeletonBlock theme={theme} className="mb-4 h-10 w-full max-w-md rounded-lg" />
        <CalendarSkeleton C={C} />
      </ParentCard>
      <ParentCard theme={theme} className="!p-3 sm:!p-4">
        <ParentSkeletonBlock theme={theme} className="h-3 w-20" />
        <ParentSkeletonBlock theme={theme} className="mt-2 h-5 w-40" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ParentSkeletonBlock key={index} theme={theme} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </ParentCard>
    </div>
  );
}

function MessagesSectionSkeleton({ theme }: { theme: ParentThemeTokens }) {
  const bubbles: Array<{ align: "left" | "right"; width: string }> = [
    { align: "left", width: "w-[58%]" },
    { align: "right", width: "w-[44%]" },
    { align: "left", width: "w-[48%]" },
    { align: "right", width: "w-[36%]" },
    { align: "left", width: "w-[52%]" },
  ];

  return (
    <ParentCard theme={theme} className="!overflow-hidden !p-0">
      <div className="space-y-2 p-3 sm:p-4" aria-busy="true" aria-label="Loading messages">
        {bubbles.map((bubble, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${
              bubble.align === "right" ? "flex-row-reverse" : ""
            }`}
          >
            <ParentSkeletonBlock theme={theme} className="h-8 w-8 shrink-0 rounded-full" />
            <ParentSkeletonBlock
              theme={theme}
              className={`h-12 ${bubble.width} rounded-2xl`}
            />
          </div>
        ))}
      </div>
      <div className="border-t p-3" style={{ borderColor: theme.line }}>
        <ParentSkeletonBlock theme={theme} className="h-10 w-full rounded-lg" />
      </div>
    </ParentCard>
  );
}

function HomeSectionSkeleton({ theme }: { theme: ParentThemeTokens }) {
  return (
    <div className="space-y-6">
      <ParentCard theme={theme} className="!p-5">
        <ParentSkeletonBlock theme={theme} className="h-3 w-28" />
        <ParentSkeletonBlock theme={theme} className="mt-2 h-6 w-64" />
        <ParentSkeletonBlock theme={theme} className="mt-3 h-4 w-full max-w-xl" />
      </ParentCard>
      <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <ParentSkeletonBlock key={index} theme={theme} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <ParentCard key={index} theme={theme} className="!p-4">
            <ParentSkeletonBlock theme={theme} className="h-5 w-36" />
            <ParentSkeletonBlock theme={theme} className="mt-3 h-16 w-full rounded-xl" />
            <ParentSkeletonBlock theme={theme} className="mt-2 h-16 w-full rounded-xl" />
          </ParentCard>
        ))}
      </div>
    </div>
  );
}

function SectionSkeleton({
  theme,
  section = "resources",
}: {
  theme: ParentThemeTokens;
  section?: CommitteeWorkspaceSection;
}) {
  if (section === "calendar") return <CalendarSectionSkeleton theme={theme} />;
  if (section === "messages") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <MessagesSectionSkeleton theme={theme} />
      </div>
    );
  }
  if (section === "home") return <HomeSectionSkeleton theme={theme} />;
  return <GenericSectionSkeleton theme={theme} />;
}

export default function ParentCommitteeWorkspaceSkeleton({
  theme,
  variant,
  section = "home",
}: ParentCommitteeWorkspaceSkeletonProps) {
  if (variant === "section") {
    return <SectionSkeleton theme={theme} section={section} />;
  }

  return (
    <div
      className="flex min-h-full flex-col lg:grid lg:grid-cols-[minmax(200px,17%)_minmax(0,1fr)]"
      style={{ backgroundColor: theme.paper }}
    >
      <aside
        className="shrink-0 border-b px-3 py-5 sm:px-4 lg:border-b-0 lg:border-r lg:py-6"
        style={{ borderColor: theme.line, backgroundColor: theme.white }}
      >
        <ParentSkeletonBlock theme={theme} className="mb-5 h-4 w-28" />
        <div className="flex flex-wrap items-center gap-2">
          <ParentSkeletonBlock theme={theme} className="h-7 w-full max-w-[180px]" />
          <ParentSkeletonBlock theme={theme} className="h-6 w-24 rounded-full" />
          <ParentSkeletonBlock theme={theme} className="h-6 w-20 rounded-full" />
        </div>
        <ParentSkeletonBlock theme={theme} className="mt-3 h-4 w-full" />
        <ParentSkeletonBlock theme={theme} className="mt-2 h-3 w-4/5" />
        <div className="mt-5 space-y-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <ParentSkeletonBlock key={index} theme={theme} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>
      <div className="flex-1 px-4 py-6 sm:px-6 md:px-9">
        <div className="mx-auto max-w-[1250px]">
          <SectionSkeleton theme={theme} section="home" />
        </div>
      </div>
    </div>
  );
}
