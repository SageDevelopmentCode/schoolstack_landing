import type { ReactNode } from "react";
import { CircleAlert, ClipboardList, FileText } from "lucide-react";
import ParentOnboardingItemIcon from "@/components/school-parent/ParentOnboardingItemIcon";
import type { ParentPortalAttentionItem } from "@/lib/parent-portal/parent-home-attention";

export function parentPortalAttentionIcon(item: ParentPortalAttentionItem): {
  icon: ReactNode;
  iconBg?: string;
  iconIncludesWrapper?: boolean;
} {
  switch (item.iconKind) {
    case "form":
      return {
        icon: <FileText className="h-4 w-4" style={{ color: "#B5594A" }} />,
      };
    case "signup":
      return {
        icon: <ClipboardList className="h-4 w-4" style={{ color: "#3D6B4F" }} />,
        iconBg: item.iconBg ?? "#E9F2EA",
      };
    case "enrollment-incomplete":
    case "enrollment-amendment":
      return {
        icon: <CircleAlert className="h-4 w-4" style={{ color: "#B5594A" }} />,
      };
    case "onboarding":
      if (!item.onboardingItem) {
        return { icon: null };
      }
      return {
        icon: (
          <ParentOnboardingItemIcon
            item={item.onboardingItem}
            variant="attention"
          />
        ),
        iconIncludesWrapper: true,
      };
    default:
      return { icon: null };
  }
}
