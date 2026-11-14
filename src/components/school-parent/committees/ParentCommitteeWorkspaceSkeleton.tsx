"use client";

import { GSkeleton } from "@/components/school-parent/garden/ui";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/*
 * Garden placeholders shaped like each committee section, shown while a
 * section's code loads for the first time. Renders inside the workspace's
 * ParentGardenFrame. (The full-workspace loading state lives in
 * ParentCommitteeWorkspace.)
 */

type ParentCommitteeWorkspaceSkeletonProps = {
  theme: ParentThemeTokens;
  variant: "workspace" | "section";
  section?: CommitteeWorkspaceSection;
};

function Status({ label }: { label: string }) {
  return <span className="sr-only" role="status">{label}</span>;
}

function HomeSkeleton() {
  return (
    <div className="space-y-5">
      <GSkeleton className="h-36" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <GSkeleton key={i} className="h-24 !rounded-[20px]" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GSkeleton className="h-56" />
        <GSkeleton className="h-56" />
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <GSkeleton className="h-[520px]" />
      <GSkeleton className="h-72" />
    </div>
  );
}

function MessagesSkeleton() {
  const bubbles = ["w-[58%]", "ml-auto w-[44%]", "w-[48%]", "ml-auto w-[36%]", "w-[52%]"];
  return (
    <div className="flex h-full min-h-[60dvh] flex-1 flex-col bg-white">
      <div className="flex items-center gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3 sm:px-8">
        <GSkeleton className="h-8 w-8 !rounded-full" />
        <GSkeleton className="h-5 w-48 !rounded-full" />
      </div>
      <div className="flex-1 space-y-3 bg-[var(--sf-paper)] px-4 py-5 sm:px-8">
        {bubbles.map((width, i) => (
          <GSkeleton key={i} className={`h-12 max-w-md !rounded-[18px] ${width}`} />
        ))}
      </div>
      <div className="border-t-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3">
        <GSkeleton className="mx-auto h-12 max-w-[760px] !rounded-full" />
      </div>
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <GSkeleton key={i} className="h-72 !rounded-[22px]" />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <GSkeleton className="h-10 w-32 !rounded-full" />
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <GSkeleton key={i} className="h-20 !rounded-[20px]" />
      ))}
    </div>
  );
}

export default function ParentCommitteeWorkspaceSkeleton({
  section = "home",
}: ParentCommitteeWorkspaceSkeletonProps) {
  const label = `Loading ${section}…`;
  return (
    <div aria-busy="true">
      <Status label={label} />
      {section === "home" ? (
        <HomeSkeleton />
      ) : section === "calendar" ? (
        <CalendarSkeleton />
      ) : section === "messages" ? (
        <MessagesSkeleton />
      ) : section === "tasks" ? (
        <TasksSkeleton />
      ) : (
        <ListSkeleton />
      )}
    </div>
  );
}
