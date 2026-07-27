"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import PortalSectionHeader from "@/components/mudkitchen-portal/ui/PortalSectionHeader";
import ProgressLogEntryCard from "@/components/mudkitchen-portal/ProgressLogEntryCard";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";

type OrganizationProgressLogListProps = {
  entries: OrganizationProgressEntry[];
  schoolName: string;
  showHeader?: boolean;
};

export default function OrganizationProgressLogList({
  entries,
  schoolName,
  showHeader = true,
}: OrganizationProgressLogListProps) {
  const T = usePortalTheme();

  if (entries.length === 0) {
    return (
      <section className="px-6 py-10 pb-20 lg:px-16 lg:py-14 lg:pb-24">
        <div className="mx-auto max-w-[1100px]">
          {showHeader ? (
            <PortalSectionHeader
              eyebrow="Build progress"
              title="What we've done so far"
              subtitle={`A running log of the work we're doing for ${schoolName} — updated as we go.`}
            />
          ) : null}
          <FadeInView>
            <div
              className="rounded-2xl border px-6 py-10 text-center"
              style={{
                backgroundColor: T.surface,
                borderColor: T.border,
              }}
            >
              <p
                className="font-secondary text-[15px] leading-relaxed"
                style={{ color: T.textSecondary }}
              >
                No build updates yet. Check back soon — we&apos;ll post progress
                here as we work on your MudKitchen setup.
              </p>
            </div>
          </FadeInView>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-10 pb-20 lg:px-16 lg:py-14 lg:pb-24">
      <div className="mx-auto max-w-[1100px]">
        {showHeader ? (
          <PortalSectionHeader
            eyebrow="Build progress"
            title="What we've done so far"
            subtitle={`A running log of the work we're doing for ${schoolName} — updated as we go.`}
          />
        ) : null}

        <div className="relative space-y-5">
          <div
            className="pointer-events-none absolute top-3 bottom-3 hidden sm:block"
            style={{
              left: "11px",
              borderLeft: `1px dashed ${T.borderStrong}`,
            }}
            aria-hidden
          />

          {entries.map((entry, index) => (
            <ProgressLogEntryCard
              key={entry.id}
              entry={entry}
              delay={index * 0.06}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
