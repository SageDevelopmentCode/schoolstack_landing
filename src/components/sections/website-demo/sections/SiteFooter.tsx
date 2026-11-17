import { ArrowUpRight, MessageCircle, Share2 } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { SITE_BODY, SITE_CONTAINER } from "../site-garden-theme";

type Props = {
  config: SchoolWebsiteDemoConfig;
  onNavLinkClick: (index: number) => void;
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
  onScrollToTop: () => void;
};

const COLUMN_TITLE = "text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]";
const COLUMN_LINK =
  "inline-flex cursor-pointer items-center gap-1 rounded-md text-[15px] font-extrabold text-[var(--sf-ink)] underline decoration-[var(--sf-butter)] decoration-[3px] underline-offset-4 transition-colors hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

export default function SiteFooter({ config, onNavLinkClick, onCtaClick, onSecondaryCtaClick, onScrollToTop }: Props) {
  const { footer, hero } = config;

  return (
    <footer className="border-t-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] pb-10 pt-16">
      <div className={SITE_CONTAINER}>
        <div className="grid gap-10 @3xl/site:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <button
              type="button"
              onClick={onScrollToTop}
              className="cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              aria-label="Back to top"
            >
              <SchoolDemoWordmark logo={config.logo} className="h-11 w-auto object-contain" />
            </button>
            <p className={`${SITE_BODY} mt-5 max-w-[360px] text-[15px]`}>{footer.tagline}</p>
            <div className="mt-6 flex gap-2">
              {[Share2, MessageCircle].map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white text-[var(--sf-ink)] shadow-[0_2px_0_0_var(--sf-ink)]"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
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
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                </button>
              </li>
              <li>
                <button type="button" onClick={onSecondaryCtaClick} className={COLUMN_LINK}>
                  {hero.secondaryCta}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-6 text-[13px] font-semibold text-[var(--sf-soft)] @3xl/site:flex-row @3xl/site:justify-between">
          <p>{footer.copyright}</p>
          <p>{footer.poweredBy}</p>
        </div>
      </div>
    </footer>
  );
}
