"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight, Check } from "lucide-react";
import { useNavigationLoading } from "@/components/school/shared/NavigationLoadingProvider";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getPortalSwitcherIcon } from "@/lib/auth/portal-switcher-icons";
import {
  ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE,
  shouldShowPortalSwitcher,
  type PortalId,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";

type SchoolPortalSwitcherMenuItemsProps = {
  C: AdminThemeTokens;
  options: SchoolPortalOption[];
  currentPortal: PortalId;
  onNavigate?: () => void;
  sectionTitle?: string;
  openLinksInNewTab?: boolean;
};

export default function SchoolPortalSwitcherMenuItems({
  C,
  options,
  currentPortal,
  onNavigate,
  sectionTitle = ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE,
  openLinksInNewTab = false,
}: SchoolPortalSwitcherMenuItemsProps) {
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  if (!shouldShowPortalSwitcher(options)) {
    return null;
  }

  const handleNavigate = (href: string) => {
    onNavigate?.();
    if (openLinksInNewTab) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    startNavigation("Switching portal");
    router.push(href);
  };

  return (
    <>
      <div className="px-2 py-2">
        <div
          className="overflow-hidden rounded-md"
          style={{ backgroundColor: C.accentLight }}
        >
          <div className="px-3 pb-1 pt-2">
            <div
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: C.textTertiary }}
            >
              <ArrowLeftRight className="h-3 w-3" />
              {sectionTitle}
            </div>
          </div>
          <div className="pb-1">
            {options.map((option) => {
              const isCurrent = option.id === currentPortal;
              const Icon = getPortalSwitcherIcon(option.id);

              if (isCurrent) {
                return (
                  <div
                    key={option.id}
                    className="mx-1.5 flex items-center gap-2 rounded-sm py-2 pl-3 pr-2 text-sm"
                    style={{
                      color: C.textSecondary,
                      backgroundColor: C.surface,
                    }}
                    aria-current="page"
                  >
                    <Check
                      className="h-4 w-4 shrink-0"
                      style={{ color: C.accent }}
                    />
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: C.textTertiary }}
                      aria-hidden
                    />
                    <span className="font-medium">{option.label}</span>
                  </div>
                );
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleNavigate(option.href)}
                  className="mx-1.5 flex w-[calc(100%-0.75rem)] items-center gap-2 rounded-sm py-2 pl-3 pr-2 text-left text-sm transition-colors hover:opacity-90"
                  style={{ color: C.textPrimary }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: C.textTertiary }}
                    aria-hidden
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: C.border }} />
    </>
  );
}
