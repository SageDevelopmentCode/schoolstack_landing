import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentFridayBranchPausedStateProps = {
  theme: ParentThemeTokens;
};

export default function ParentFridayBranchPausedState({
  theme,
}: ParentFridayBranchPausedStateProps) {
  return (
    <ParentCard theme={theme} className="max-w-lg">
      <p className="text-sm font-semibold" style={{ color: theme.ink }}>
        Friday Branch signup is paused
      </p>
      <p className="mt-2 text-sm" style={{ color: theme.muted }}>
        Your school will open enrollment again soon. If you have questions, contact
        the office.
      </p>
    </ParentCard>
  );
}
