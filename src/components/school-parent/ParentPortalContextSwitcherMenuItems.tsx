"use client";

import { ArrowLeftRight, Check } from "lucide-react";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentPortalContextSwitcherMenuItemsProps = {
  C: AdminThemeTokens;
  themeInk: string;
  themeMuted: string;
  onNavigate?: () => void;
};

export default function ParentPortalContextSwitcherMenuItems({
  C,
  themeInk,
  themeMuted,
  onNavigate,
}: ParentPortalContextSwitcherMenuItemsProps) {
  const { contexts, activeContext, showSwitcher, switchToContext } =
    useParentPortalContext();

  if (!showSwitcher || !activeContext) {
    return null;
  }

  return (
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
            Portal
          </div>
        </div>
        <div className="pb-1">
          {contexts.map((context) => {
            const isCurrent = context.id === activeContext.id;

            if (isCurrent) {
              return (
                <div
                  key={context.id}
                  className="mx-1.5 flex items-center gap-2 rounded-sm py-2 pl-3 pr-2 text-sm"
                  style={{
                    color: themeMuted,
                    backgroundColor: C.surface,
                  }}
                  aria-current="page"
                >
                  <Check className="h-4 w-4 shrink-0" style={{ color: C.accent }} />
                  <span className="font-medium">{context.label}</span>
                </div>
              );
            }

            return (
              <button
                key={context.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onNavigate?.();
                  switchToContext(context);
                }}
                className="mx-1.5 flex w-[calc(100%-12px)] items-center rounded-sm py-2 pl-3 pr-2 text-left text-sm transition-colors hover:opacity-80"
                style={{ color: themeInk }}
              >
                {context.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
