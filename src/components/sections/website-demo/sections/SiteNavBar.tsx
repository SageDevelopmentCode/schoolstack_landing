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

/** Floating pill navigation shared by the hero and the sticky header. */
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
      className={`flex items-center justify-between gap-4 rounded-pill bg-white/90 py-2 pl-4 pr-2 ring-1 ring-black/[0.07] backdrop-blur-md @3xl/site:pl-6 ${
        elevated ? "shadow-[0_16px_40px_-18px_rgba(20,20,40,0.3)]" : "shadow-[0_8px_30px_-16px_rgba(20,20,40,0.18)]"
      }`}
    >
      <button type="button" onClick={onScrollToTop} className="shrink-0 cursor-pointer" aria-label={`${config.schoolName} home`}>
        <SchoolDemoWordmark logo={config.logo} className="h-9 w-auto object-contain" />
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
              className={`font-secondary relative cursor-pointer rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors duration-200 ${
                isActive ? "text-[var(--demo-ink)]" : "text-[var(--demo-muted)] hover:text-[var(--demo-ink)]"
              }`}
            >
              {item}
              <span
                className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--demo-primary)] transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </nav>
      <DemoWebsiteButton variant="primary" className="h-10! px-5! text-[14px]!" onClick={onCtaClick}>
        {config.hero.navCta}
        <ArrowRight className="hidden h-4 w-4 @2xl/site:block" aria-hidden />
      </DemoWebsiteButton>
    </div>
  );
}
