import { ArrowUpRight, MessageCircle, Share2 } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { DEMO_BODY, DEMO_CONTAINER } from "../bright-demo-theme";

type Props = {
  config: SchoolWebsiteDemoConfig;
  onNavLinkClick: (index: number) => void;
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
  onScrollToTop: () => void;
};

const COLUMN_TITLE = "font-secondary text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--demo-muted)]";
const COLUMN_LINK =
  "font-secondary inline-flex cursor-pointer items-center gap-1 text-[15px] font-medium text-[var(--demo-ink)] transition-colors hover:text-[var(--demo-accent)]";

export default function SiteFooter({ config, onNavLinkClick, onCtaClick, onSecondaryCtaClick, onScrollToTop }: Props) {
  const { footer, hero } = config;

  return (
    <footer className="bg-white pb-10 pt-20">
      <div className={DEMO_CONTAINER}>
        <div className="grid gap-10 @3xl/site:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <button type="button" onClick={onScrollToTop} className="cursor-pointer" aria-label="Back to top">
              <SchoolDemoWordmark logo={config.logo} className="h-11 w-auto object-contain" />
            </button>
            <p className={`${DEMO_BODY} mt-5 max-w-[360px] text-[15px]`}>{footer.tagline}</p>
            <div className="mt-6 flex gap-2">
              {[Share2, MessageCircle].map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--demo-tint-3)] text-[var(--demo-ink)]"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className={COLUMN_TITLE}>Explore</p>
            <ul className="mt-5 space-y-3">
              {footer.links.map((link, i) => (
                <li key={link}>
                  <button type="button" onClick={() => onNavLinkClick(i)} className={COLUMN_LINK}>
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={COLUMN_TITLE}>Get started</p>
            <ul className="mt-5 space-y-3">
              <li>
                <button type="button" onClick={onCtaClick} className={COLUMN_LINK}>
                  {hero.primaryCta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
              </li>
              <li>
                <button type="button" onClick={onSecondaryCtaClick} className={COLUMN_LINK}>
                  {hero.secondaryCta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="font-secondary mt-14 flex flex-col gap-2 border-t border-black/[0.07] pt-6 text-[13px] text-[var(--demo-muted)] @3xl/site:flex-row @3xl/site:justify-between">
          <p>{footer.copyright}</p>
          <p>{footer.poweredBy}</p>
        </div>
      </div>
    </footer>
  );
}
