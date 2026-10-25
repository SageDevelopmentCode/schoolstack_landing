"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  DASHBOARD_TAB_ROOT_CLASS,
  JOURNEY_TILE_GRID_CLASS,
} from "@/components/school-admin/dashboard/dashboard-panel-layout";
import { DASHBOARD_TAB_ICON_CLASS } from "@/components/school-admin/dashboard/dashboard-tabs";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import {
  buildJourneySections,
  journeyStageAccent,
  type JourneyLink,
  type JourneySection,
} from "@/lib/school-admin/dashboard-family-journey";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

type AdminDashboardJourneyPanelProps = {
  theme: ParentThemeTokens;
  slug: string;
  features: OrganizationFeatures;
};

function JourneyStageTabs({
  theme,
  sections,
  activeStageIndex,
  onSelectStage,
}: {
  theme: ParentThemeTokens;
  sections: JourneySection[];
  activeStageIndex: number;
  onSelectStage: (index: number) => void;
}) {
  if (sections.length <= 1) {
    return null;
  }

  return (
    <div
      className="mb-4 grid w-full gap-1 rounded-lg p-1"
      style={{
        backgroundColor: "#EAF2EB",
        gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))`,
      }}
      role="tablist"
      aria-label="Journey stages"
    >
      {sections.map((section, index) => {
        const active = index === activeStageIndex;
        const Icon = section.icon;
        const accent = journeyStageAccent(section.id);
        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${section.label}: ${section.description}`}
            onClick={() => onSelectStage(index)}
            data-testid={`journey-stage-${section.id}`}
            className="flex w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 transition-colors max-sm:px-0.5 sm:flex-row sm:gap-1.5"
            style={{
              backgroundColor: active ? theme.white : "transparent",
              color: active ? accent.tabActiveLabel : "#728079",
              boxShadow: active ? "0 1px 4px #dbe2dc" : undefined,
            }}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-auto sm:w-auto sm:rounded-none sm:bg-transparent"
              style={
                active
                  ? { backgroundColor: accent.chipBg, color: accent.chipFg }
                  : { color: accent.tabInactiveIcon }
              }
            >
              <Icon className={DASHBOARD_TAB_ICON_CLASS} aria-hidden />
            </span>
            <span className="max-w-full truncate text-[9px] font-bold sm:text-[11px]">
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function JourneyLinkTile({
  theme,
  link,
}: {
  theme: ParentThemeTokens;
  link: JourneyLink;
}) {
  const Icon = link.icon;
  const accent = journeyStageAccent(link.stageId);

  return (
    <Link
      href={link.href}
      aria-label={link.title}
      className={`group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#E9EFEA] border-t-[3px] bg-white shadow-sm transition-shadow hover:shadow-[0_4px_14px_#dbe2dc] ${accent.borderClass}`}
      data-testid={`journey-link-${link.id}`}
    >
      <div className="relative h-24 w-full shrink-0">
        <Image
          src={link.bannerSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          aria-hidden
        />
        <div
          className={`absolute inset-0 ${accent.bannerOverlayClass}`}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      <div className="flex min-h-[7.5rem] flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: accent.chipBg, color: accent.chipFg }}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
            style={{ color: theme.muted }}
            aria-hidden
          />
        </div>
        <b className="mt-3 block text-xs leading-snug" style={{ color: theme.ink }}>
          {link.title}
        </b>
        <span
          className="mt-1.5 line-clamp-3 text-[11px] leading-snug"
          style={{ color: theme.muted }}
        >
          {link.subtitle}
        </span>
      </div>
    </Link>
  );
}

export default function AdminDashboardJourneyPanel({
  theme,
  slug,
  features,
}: AdminDashboardJourneyPanelProps) {
  const sections = useMemo(
    () => buildJourneySections(slug, features),
    [slug, features],
  );
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const stageCount = sections.length;
  const clampedIndex =
    stageCount === 0 ? 0 : Math.min(activeStageIndex, stageCount - 1);
  const activeSection = sections[clampedIndex];

  if (sections.length === 0) {
    return (
      <p className="text-sm" style={{ color: theme.muted }}>
        Journey shortcuts appear when admissions, schedule, or school workspace features are
        enabled.
      </p>
    );
  }

  if (!activeSection) {
    return null;
  }

  return (
    <div className={DASHBOARD_TAB_ROOT_CLASS} data-testid="dashboard-journey-panel">
      <JourneyStageTabs
        theme={theme}
        sections={sections}
        activeStageIndex={clampedIndex}
        onSelectStage={setActiveStageIndex}
      />

      <AdminCard theme={theme} padding="canvas" className="w-full">
        <AdminSectionKicker theme={theme}>{activeSection.label}</AdminSectionKicker>
        <AdminDisplayHeading
          theme={theme}
          as="h3"
          size="section"
          className="mt-1.5 text-[19px] leading-tight"
        >
          Where to go next
        </AdminDisplayHeading>
        <div className={`mt-4 ${JOURNEY_TILE_GRID_CLASS}`}>
          {activeSection.links.map((link) => (
            <JourneyLinkTile key={link.id} theme={theme} link={link} />
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
