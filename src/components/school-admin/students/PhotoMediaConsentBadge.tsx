import { Camera, CheckCircle2, CircleX, Eye } from "lucide-react";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import {
  photoMediaConsentAdminChipTone,
  photoMediaConsentLabel,
  type PhotoMediaConsent,
} from "@/lib/students/photo-media-consent";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type PhotoMediaConsentBadgeProps = {
  theme: ParentThemeTokens;
  consent: PhotoMediaConsent | null;
  label?: string;
};

function iconColor(theme: ParentThemeTokens, consent: PhotoMediaConsent | null): string {
  if (consent === "full") return "#348457";
  if (consent === "limited") return "#A26B22";
  if (consent === "none") return theme.alert;
  return "#39788D";
}

export default function PhotoMediaConsentBadge({
  theme,
  consent,
  label,
}: PhotoMediaConsentBadgeProps) {
  const displayLabel = label ?? photoMediaConsentLabel(consent);
  const tone = photoMediaConsentAdminChipTone(consent);
  const color = iconColor(theme, consent);
  const iconProps = { className: "h-4 w-4 shrink-0", style: { color }, "aria-hidden": true as const };

  return (
    <span className="inline-flex items-center gap-1.5">
      {consent === "full" ? (
        <CheckCircle2 {...iconProps} />
      ) : consent === "limited" ? (
        <Eye {...iconProps} />
      ) : consent === "none" ? (
        <CircleX {...iconProps} />
      ) : (
        <Camera {...iconProps} />
      )}
      <AdminChip theme={theme} tone={tone} className="normal-case font-semibold !text-[11px]">
        {displayLabel}
      </AdminChip>
    </span>
  );
}
