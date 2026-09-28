import { Globe, Lock } from "lucide-react";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type PublicTourVisibilityBadgeProps = {
  theme: ParentThemeTokens;
  platformEnabled: boolean;
  className?: string;
};

export default function PublicTourVisibilityBadge({
  theme,
  platformEnabled,
  className = "",
}: PublicTourVisibilityBadgeProps) {
  const ariaLabel = platformEnabled
    ? "Public tour page is live for families"
    : "Public tour page is not enabled";

  return (
    <span role="img" aria-label={ariaLabel} className={className}>
      <AdminChip
        theme={theme}
        tone={platformEnabled ? "success" : "warning"}
        className="px-1.5 py-1"
      >
        {platformEnabled ? (
          <Globe className="h-3 w-3" aria-hidden />
        ) : (
          <Lock className="h-3 w-3" aria-hidden />
        )}
      </AdminChip>
    </span>
  );
}
