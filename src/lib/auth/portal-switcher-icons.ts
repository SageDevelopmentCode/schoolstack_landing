import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  ClipboardList,
  Users,
} from "lucide-react";
import type { PortalId } from "@/lib/auth/portal-switcher-types";

export function getPortalSwitcherIcon(portalId: PortalId): LucideIcon {
  switch (portalId) {
    case "admin":
      return Building2;
    case "teacher":
      return Briefcase;
    case "family_apply":
      return ClipboardList;
    case "family_parent":
      return Users;
    default:
      return ClipboardList;
  }
}
