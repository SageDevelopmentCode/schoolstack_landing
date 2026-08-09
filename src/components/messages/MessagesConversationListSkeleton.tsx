"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";

export default function MessagesConversationListSkeleton({
  C,
  embedded = false,
  rows = 5,
}: {
  C: AdminThemeTokens;
  embedded?: boolean;
  rows?: number;
}) {
  const rowPadding = embedded ? "px-4 py-3.5" : "p-3";

  return (
    <div
      className="overflow-y-auto flex-1"
      aria-busy="true"
      aria-label="Loading conversations"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`flex items-start gap-3 ${rowPadding}`}>
          <SkeletonBlock C={C} className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <SkeletonBlock C={C} className="h-3.5 w-28" />
              <SkeletonBlock C={C} className="h-2.5 w-10 shrink-0" />
            </div>
            <SkeletonBlock C={C} className="h-3 w-full max-w-[85%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
