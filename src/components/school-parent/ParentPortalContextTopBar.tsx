"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { G_FOCUS, GKicker } from "@/components/school-parent/garden/ui";
import GardenHeaderPopover from "@/components/school-parent/header/GardenHeaderPopover";
import { GardenProgramOptions } from "@/components/school-parent/header/ParentGardenPortalSwitcher";
import { MUDKITCHEN_LOGO_BRAND } from "@/lib/mudkitchen-portal/theme";

/**
 * "You're viewing: {program}" strip above the parent header, shown when the
 * family can switch between the school portal and a program portal.
 * Renders inside the header's Garden scope (SchoolParentHeader).
 */
export default function ParentPortalContextTopBar() {
  const { showSwitcher, activeContext } = useParentPortalContext();
  const { theme } = useParentTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  if (!showSwitcher || !activeContext) {
    return null;
  }

  return (
    <div className="border-b-[1.5px] border-[var(--sf-ink)]/[0.08] bg-[var(--sf-cream)] px-4 py-2 sm:px-7">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <p className="m-0 flex min-w-0 items-center gap-2 text-[12.5px] font-semibold text-[var(--sf-soft)] sm:text-[13px]">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: MUDKITCHEN_LOGO_BRAND.terracotta }}
          />
          <span className="min-w-0 truncate">
            You&apos;re viewing:{" "}
            <span
              className="font-extrabold"
              style={{ color: MUDKITCHEN_LOGO_BRAND.terracotta }}
            >
              {activeContext.label}
            </span>
          </span>
        </p>
        <div className="relative shrink-0" ref={wrapRef}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls="parent-context-switch"
            className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] bg-white px-3 py-1 text-[12.5px] font-extrabold text-[var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/35 ${
              open ? "border-[var(--sf-clay)]" : "border-[var(--sf-ink)]/15"
            } ${G_FOCUS}`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Switch portal
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              strokeWidth={2.6}
              aria-hidden
            />
          </button>
          <GardenHeaderPopover
            open={open}
            onClose={close}
            theme={theme}
            id="parent-context-switch"
            triggerRef={triggerRef}
            anchorRef={wrapRef}
            label="Switch portal"
            align="right"
            widthClass="w-[17.5rem]"
          >
            <div className="hidden px-4 pb-0.5 pt-3.5 sm:block">
              <GKicker>Switch to</GKicker>
            </div>
            <GardenProgramOptions withSection={false} onNavigate={close} />
          </GardenHeaderPopover>
        </div>
      </div>
    </div>
  );
}
