"use client";

import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GSkeleton } from "@/components/school-parent/garden/ui";
import { GardenLoadError } from "@/components/school-admin/garden/kit";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/**
 * Placeholder drawer while a visit's application loads (same size as the
 * Garden review drawer that replaces it), or the inline error with Try again
 * when it couldn't load.
 */
export default function ScheduleVisitLoadingPanel({
  theme,
  error = null,
  onRetry,
  onClose,
}: {
  theme: ParentThemeTokens;
  error?: string | null;
  onRetry?: () => void;
  onClose: () => void;
}) {
  return (
    <GSidePanel
      theme={theme}
      open
      size="xl"
      onClose={onClose}
      kicker="Application review"
      title={error ? "Couldn't open this application" : "Loading application"}
      testId="schedule-visit-loading-panel"
      panelId="schedule-visit-loading"
    >
      {error ? (
        <GardenLoadError
          title="Couldn't load the application for this visit."
          description={`${error} The visit itself is unchanged.`}
          onRetry={() => onRetry?.()}
        />
      ) : (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading application">
          <GSkeleton className="h-10 w-2/3 rounded-full" />
          <GSkeleton className="h-28 rounded-[18px]" />
          <GSkeleton className="h-44 rounded-[18px]" />
          <GSkeleton className="h-24 rounded-[18px]" />
        </div>
      )}
    </GSidePanel>
  );
}
