import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentActivityNotificationsPanelSkeletonProps = {
  theme: ParentThemeTokens;
  count?: number;
  className?: string;
};

function SkeletonRow({ theme }: { theme: ParentThemeTokens }) {
  return (
    <div
      className="flex items-start gap-3 rounded-[14px] border px-3 py-3"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
    >
      <ParentSkeletonBlock theme={theme} className="h-[38px] w-[38px] shrink-0 rounded-[13px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <ParentSkeletonBlock theme={theme} className="h-3.5 w-[60%]" />
        <ParentSkeletonBlock theme={theme} className="h-3 w-[85%]" />
        <ParentSkeletonBlock theme={theme} className="h-2.5 w-[25%]" />
      </div>
      <ParentSkeletonBlock theme={theme} className="mt-1 h-4 w-4 shrink-0 rounded-md" />
    </div>
  );
}

export default function ParentActivityNotificationsPanelSkeleton({
  theme,
  count = 6,
  className = "",
}: ParentActivityNotificationsPanelSkeletonProps) {
  return (
    <div
      className={`flex flex-col gap-2 ${className}`}
      data-testid="parent-notifications-skeleton"
      aria-busy="true"
      aria-label="Loading notifications"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonRow key={index} theme={theme} />
      ))}
    </div>
  );
}
