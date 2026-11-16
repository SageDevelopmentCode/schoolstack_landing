"use client";

import type { ReactNode } from "react";
import { ArrowLeftRight, Check, ExternalLink } from "lucide-react";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
import { useSchoolPortalSwitchNavigate } from "@/components/school/shared/SchoolPortalSwitcherMenuItems";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import { getPortalSwitcherIcon } from "@/lib/auth/portal-switcher-icons";
import {
  ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE,
  shouldShowPortalSwitcher,
  type PortalId,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { POPOVER_ITEM_ATTR } from "./GardenHeaderPopover";

/*
 * Garden rows for switching program context and account portal. Same data
 * and navigation as the portal-style switchers (ParentPortalContextProvider,
 * useSchoolPortalSwitchNavigate); only the presentation differs.
 */

export function GardenMenuSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/[0.08] bg-[var(--sf-paper)] p-1.5">
      <p className="m-0 flex items-center gap-1.5 px-2.5 pb-1 pt-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
        {icon}
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function RadioMark({ checked }: { checked: boolean }) {
  return checked ? (
    <span
      aria-hidden="true"
      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--sf-clay)] ring-[1.5px] ring-[var(--sf-ink)]"
    >
      <Check className="h-3 w-3 text-white" strokeWidth={3.2} />
    </span>
  ) : (
    <span
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-[var(--sf-ink)]/25 bg-white transition-colors group-hover:border-[var(--sf-clay)]"
    />
  );
}

function CurrentTag() {
  return (
    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-[var(--sf-clay-deep)] ring-[1.5px] ring-[var(--sf-clay)]/30">
      Current
    </span>
  );
}

export const gardenMenuRowClass = `group flex min-h-[44px] w-full items-center gap-3 rounded-[14px] px-2.5 py-2 text-left text-[14px] font-bold text-[var(--sf-ink)] transition-colors duration-150 ${G_FOCUS} focus-visible:ring-offset-0`;

/** Program (school vs. program portal) choices for this family. */
export function GardenProgramOptions({
  onNavigate,
  withSection = true,
}: {
  onNavigate?: () => void;
  withSection?: boolean;
}) {
  const { contexts, activeContext, showSwitcher, switchToContext } =
    useParentPortalContext();

  if (!showSwitcher || !activeContext) return null;

  const rows = contexts.map((context) => {
    const isCurrent = context.id === activeContext.id;
    return (
      <button
        key={context.id}
        type="button"
        {...POPOVER_ITEM_ATTR}
        aria-current={isCurrent ? "true" : undefined}
        aria-disabled={isCurrent || undefined}
        onClick={() => {
          if (isCurrent) return;
          onNavigate?.();
          switchToContext(context);
        }}
        className={`${gardenMenuRowClass} ${
          isCurrent
            ? "cursor-default bg-white shadow-[0_2px_0_0_rgba(43,36,29,0.06)]"
            : "hover:bg-white"
        }`}
      >
        <RadioMark checked={isCurrent} />
        <span className="min-w-0 flex-1 line-clamp-2 leading-snug">{context.label}</span>
        {isCurrent ? <CurrentTag /> : null}
      </button>
    );
  });

  if (!withSection) return <div className="flex flex-col gap-0.5 p-1.5">{rows}</div>;

  return (
    <GardenMenuSection
      label="Program"
      icon={<ArrowLeftRight className="h-3 w-3" aria-hidden strokeWidth={2.6} />}
    >
      {rows}
    </GardenMenuSection>
  );
}

/** Other account portals this person can open (staff, applications, parent). */
export function GardenAccountPortalOptions({
  options,
  currentPortal,
  openLinksInNewTab = false,
  onNavigate,
  newTabDescription = "This tab stays on the parent portal.",
}: {
  options: SchoolPortalOption[];
  currentPortal: PortalId;
  openLinksInNewTab?: boolean;
  onNavigate?: () => void;
  /** Toast description after a portal opens in a new tab. */
  newTabDescription?: string;
}) {
  const navigate = useSchoolPortalSwitchNavigate({
    onNavigate,
    openLinksInNewTab,
  });

  if (!shouldShowPortalSwitcher(options)) return null;

  return (
    <GardenMenuSection
      label={ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE}
      icon={<ArrowLeftRight className="h-3 w-3" aria-hidden strokeWidth={2.6} />}
    >
      {options.map((option) => {
        const isCurrent = option.id === currentPortal;
        const Icon = getPortalSwitcherIcon(option.id);
        return (
          <button
            key={option.id}
            type="button"
            {...POPOVER_ITEM_ATTR}
            aria-current={isCurrent ? "true" : undefined}
            aria-disabled={isCurrent || undefined}
            onClick={() => {
              if (isCurrent) return;
              const opened = navigate(option.href);
              if (opened === "new_tab") {
                parentToast.info(`Opened ${option.label} in a new tab`, {
                  description: newTabDescription,
                  id: `portal-switch-${option.id}`,
                });
              }
            }}
            className={`${gardenMenuRowClass} ${
              isCurrent
                ? "cursor-default bg-white shadow-[0_2px_0_0_rgba(43,36,29,0.06)]"
                : "hover:bg-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-[1.5px] ${
                isCurrent
                  ? "bg-[var(--sf-clay)] text-white ring-[var(--sf-ink)]"
                  : "bg-white text-[var(--sf-ink)]/75 ring-[var(--sf-ink)]/15 group-hover:text-[var(--sf-ink)]"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.3} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{option.label}</span>
              {!isCurrent && openLinksInNewTab ? (
                <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">
                  Opens in a new tab
                </span>
              ) : null}
            </span>
            {isCurrent ? (
              <CurrentTag />
            ) : openLinksInNewTab ? (
              <ExternalLink className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/45" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </GardenMenuSection>
  );
}
