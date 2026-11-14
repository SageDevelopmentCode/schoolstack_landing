"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import CommitteeDescriptionExcerpt from "@/components/school-admin/committees/CommitteeDescriptionExcerpt";
import ParentGardenFrame, { PortalIsland } from "@/components/school-parent/garden/ParentGardenFrame";
import { GChip, GKicker, G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import type { Committee } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import GardenCommitteeMobileMenu, { GardenCommitteeMobileMenuButton } from "./GardenCommitteeMobileMenu";
import GardenCommitteeSectionNav, { type GardenCommitteeNavItem } from "./GardenCommitteeSectionNav";

const PANE_LINE = "border-[var(--sf-ink)]/10";

/**
 * Committee workspace in the Garden "full-height app tab" recipe: a white
 * rail (back link · committee · section nav) beside the section pane, split by
 * a thin ink divider. Below `lg` the rail collapses to a compact bar with a
 * section menu sheet. Sections are shared with the admin portal and render
 * their Garden look via CommitteeSurfaceProvider (see committee-surface.tsx).
 */
export default function GardenCommitteeWorkspaceLayout({
  theme,
  committee,
  navItems,
  activeSection,
  activeSectionLabel,
  onSectionChange,
  onBack,
  backLabel,
  navTestId,
  fillContent,
  children,
}: {
  theme: ParentThemeTokens;
  committee: Committee;
  navItems: GardenCommitteeNavItem[];
  activeSection: string;
  activeSectionLabel: string;
  onSectionChange: (key: string) => void;
  onBack?: () => void;
  backLabel: string;
  navTestId: string;
  fillContent: boolean;
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const leaders = committee.members.filter((member) => member.role === "lead");
  const leaderLine =
    leaders.length > 0 ? `Led by ${leaders.map((leader) => leader.name).join(", ")}` : null;
  const hasUnread = navItems.some((item) => (item.unreadCount ?? 0) > 0);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    queueMicrotask(() => mobileMenuButtonRef.current?.focus());
  };

  const chips = (
    <>
      <GChip tone="info">{committee.termLabel}</GChip>
      <GChip tone="success">Member</GChip>
      {committee.status === "archived" ? <GChip tone="neutral">Archived</GChip> : null}
    </>
  );

  const description = (
    <PortalIsland>
      <CommitteeDescriptionExcerpt
        theme={theme}
        committeeName={committee.name}
        description={committee.description}
        leaderLine={leaderLine}
      />
    </PortalIsland>
  );

  return (
    <ParentGardenFrame theme={theme} className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-full min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          aria-label="Committee"
          className={`shrink-0 border-b-[1.5px] ${PANE_LINE} bg-white lg:w-[272px] lg:overflow-y-auto lg:overflow-x-hidden lg:border-b-0 lg:border-r-[1.5px] xl:w-[300px]`}
        >
          {/* Phones / tablets: compact bar + section sheet */}
          <div className="flex min-w-0 items-center gap-2 px-3 py-2.5 sm:px-4 lg:hidden">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={backLabel}
                className={`-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/75 hover:bg-[var(--sf-ink)]/[0.06] ${G_FOCUS} focus-visible:ring-offset-0`}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="sf-display m-0 truncate text-[1.15rem] leading-tight text-[var(--sf-ink)]">
                {committee.name}
              </h1>
              <p className="m-0 truncate text-[12px] font-semibold text-[var(--sf-soft)]">{committee.termLabel}</p>
            </div>
            <GardenCommitteeMobileMenuButton
              currentSectionLabel={activeSectionLabel}
              expanded={mobileMenuOpen}
              hasUnread={hasUnread}
              onClick={() => setMobileMenuOpen(true)}
              buttonRef={mobileMenuButtonRef}
            />
          </div>

          {/* Desktop rail */}
          <div className="hidden flex-col gap-5 px-4 py-6 lg:flex">
            {onBack ? (
              <div className="px-1">
                <button type="button" onClick={onBack} className={gLinkSm}>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {backLabel}
                </button>
              </div>
            ) : null}

            <div className="min-w-0 px-1">
              <GKicker className="mb-1.5">Committee workspace</GKicker>
              <h1 className="sf-display m-0 text-[1.6rem] leading-[1.05] text-[var(--sf-ink)]">{committee.name}</h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">{chips}</div>
              <div className="mt-3">{description}</div>
            </div>

            <div aria-hidden="true" className="mx-1 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15" />

            <div>
              <GKicker className="mb-2 px-1">Workspace</GKicker>
              <GardenCommitteeSectionNav
                items={navItems}
                activeKey={activeSection}
                onChange={onSectionChange}
                ariaLabel="Committee sections"
                data-testid={navTestId}
              />
            </div>
          </div>
        </aside>

        {/* Messages (fillContent) is a full-bleed pane: no gutters, no max width. */}
        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            fillContent
              ? "min-h-[min(70dvh,100%)] overflow-hidden bg-white lg:min-h-0"
              : "overflow-y-auto bg-[var(--sf-cream)] px-4 py-6 sm:px-6 md:px-9"
          }`}
        >
          <div
            className={
              fillContent ? "flex h-full min-h-0 w-full flex-1 flex-col" : "mx-auto w-full max-w-[1250px]"
            }
          >
            {children}
          </div>
        </main>
      </div>

      <GardenCommitteeMobileMenu
        theme={theme}
        open={mobileMenuOpen}
        title={committee.name}
        kicker="Committee workspace"
        chips={chips}
        description={description}
        onClose={closeMobileMenu}
        nav={
          <GardenCommitteeSectionNav
            items={navItems}
            activeKey={activeSection}
            onChange={(key) => {
              onSectionChange(key);
              closeMobileMenu();
            }}
            ariaLabel="Committee sections"
            data-testid={navTestId}
          />
        }
      />
    </ParentGardenFrame>
  );
}
