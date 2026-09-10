"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ParentDocCategoryHeading from "@/components/school-parent/home/ParentDocCategoryHeading";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentDocGuide } from "@/lib/parent-portal/parent-documentation";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentHomeHowToGuidesSectionProps = {
  theme: ParentThemeTokens;
  documentationHref: string;
  groupedGuides: Array<{ category: string; guides: ParentDocGuide[] }>;
  onOpenGuide: (guide: ParentDocGuide) => void;
};

export default function ParentHomeHowToGuidesSection({
  theme,
  documentationHref,
  groupedGuides,
  onOpenGuide,
}: ParentHomeHowToGuidesSectionProps) {
  return (
    <ParentCard theme={theme} className="p-5 sm:p-6">
      <ParentSectionKicker theme={theme}>How-to guides</ParentSectionKicker>
      <ParentDisplayHeading
        theme={theme}
        as="h3"
        size="section"
        className="mt-1.5 text-[19px] leading-tight"
      >
        Step-by-step help
      </ParentDisplayHeading>

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {groupedGuides.map((group) => (
          <section key={group.category}>
            <ParentDocCategoryHeading
              category={group.category}
              theme={theme}
            />
            <ul className="flex flex-col">
              {group.guides.map((guide, index) => (
                <li
                  key={guide.id}
                  style={{
                    borderTop: index === 0 ? "none" : `1px solid ${theme.line}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onOpenGuide(guide)}
                    className="flex w-full items-center justify-between gap-2 py-[11px] text-left text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ color: theme.ink }}
                  >
                    <span className="min-w-0">{guide.title}</span>
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: theme.muted }}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-4 border-t pt-3" style={{ borderColor: theme.line }}>
        <Link
          href={documentationHref}
          className="text-xs font-extrabold no-underline"
          style={{ color: theme.primary }}
        >
          View full how-to guides →
        </Link>
      </div>
    </ParentCard>
  );
}
