"use client";

import { ArrowRight } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";

type Props = {
  config: SchoolWebsiteDemoConfig;
  activeNav: number;
  onNavLinkClick: (index: number) => void;
  onCtaClick: () => void;
  onScrollToTop: () => void;
  elevated?: boolean;
};

/** Floating paper pill (like GardenNavbar), shared by the hero and the sticky header. */
export default function SiteNavBar({
  config,
  activeNav,
  onNavLinkClick,
  onCtaClick,
  onScrollToTop,
  elevated = false,
}: Props) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] py-2 pl-4 pr-2 @3xl/site:pl-6 ${
        elevated ? "shadow-[0_5px_0_0_var(--sf-ink)]" : "shadow-[0_3px_0_0_var(--sf-ink)]"
      }`}
    >
      <button
        type="button"
        onClick={onScrollToTop}
        className="min-w-0 shrink cursor-pointer overflow-hidden rounded-xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
        aria-label={`${config.schoolName} home`}
      >
        <SchoolDemoWordmark logo={config.logo} className="h-9 w-auto max-w-full object-contain" />
      </button>
      <nav className="hidden items-center gap-1 @3xl/site:flex" aria-label="Site">
        {config.hero.navLinks.map((item, i) => {
          const isActive = activeNav === i;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onNavLinkClick(i)}
              aria-current={isActive ? "true" : undefined}
              className={`relative cursor-pointer rounded-full px-4 py-2 text-[14px] font-extrabold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 ${
                isActive
                  ? "bg-[var(--sf-butter)] text-[var(--sf-ink)]"
                  : "text-[var(--sf-soft)] hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>
      <DemoWebsiteButton variant="primary" className="shrink-0 whitespace-nowrap !h-10 !px-4 !text-[13px] !shadow-[0_3px_0_0_var(--sf-ink)] @2xl/site:!px-5 @2xl/site:!text-[14px]" onClick={onCtaClick}>
        {config.hero.navCta}
        <ArrowRight className="hidden h-4 w-4 @2xl/site:block" strokeWidth={2.6} aria-hidden />
      </DemoWebsiteButton>
    </div>
  );
}
