"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { defaultWebsiteDemoConfig } from "@/data/school-demos/default";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import SignatureSection from "@/components/sections/website-demo/SignatureSection";
import DemoWebsiteButton from "@/components/sections/website-demo/DemoWebsiteButton";
import { buildBrightDemoWebsiteThemeVars, DEMO_CONTAINER } from "@/components/sections/website-demo/bright-demo-theme";
import SiteNavBar from "@/components/sections/website-demo/sections/SiteNavBar";
import SiteHero from "@/components/sections/website-demo/sections/SiteHero";
import SiteStats from "@/components/sections/website-demo/sections/SiteStats";
import SiteWelcomeBento from "@/components/sections/website-demo/sections/SiteWelcomeBento";
import SiteMarquee from "@/components/sections/website-demo/sections/SiteMarquee";
import SitePrograms from "@/components/sections/website-demo/sections/SitePrograms";
import SiteGallery from "@/components/sections/website-demo/sections/SiteGallery";
import SiteDayTimeline from "@/components/sections/website-demo/sections/SiteDayTimeline";
import SiteQuote from "@/components/sections/website-demo/sections/SiteQuote";
import SiteStory from "@/components/sections/website-demo/sections/SiteStory";
import SiteFounder from "@/components/sections/website-demo/sections/SiteFounder";
import SitePillars from "@/components/sections/website-demo/sections/SitePillars";
import SitePhotoBand from "@/components/sections/website-demo/sections/SitePhotoBand";
import SitePhotoStrip from "@/components/sections/website-demo/sections/SitePhotoStrip";
import SiteEnroll from "@/components/sections/website-demo/sections/SiteEnroll";
import SiteFaq from "@/components/sections/website-demo/sections/SiteFaq";
import SiteClosing from "@/components/sections/website-demo/sections/SiteClosing";
import SiteFooter from "@/components/sections/website-demo/sections/SiteFooter";

const STICKY_NAV_HEIGHT = 88;
/** Nav link `i` scrolls to `NAV_SECTION_TARGETS[i]`. */
const NAV_SECTION_TARGETS = ["programs", "welcome", "form", "faq"] as const;
const WIDE_FRAME_PX = 1024;

interface Props {
  disableTour?: boolean;
  standalone?: boolean;
  externalScroll?: boolean;
  config?: SchoolWebsiteDemoConfig;
  scrollRequest?: { target: "top" | "form"; nonce: number } | null;
  onDiscoveryCallClick?: () => void;
}

export default function WebsiteDashboardDemo({
  standalone,
  externalScroll = false,
  config = defaultWebsiteDemoConfig,
  scrollRequest,
  onDiscoveryCallClick,
}: Props) {
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [activeNav, setActiveNav] = useState(-1);
  const [isWide, setIsWide] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);

  const { hero } = config;
  const sections = {
    showMosaic: config.sections?.showMosaic ?? true,
    showStrip: config.sections?.showStrip ?? true,
    showParallax: config.sections?.showParallax ?? true,
    showFounder: config.sections?.showFounder ?? true,
    showClosingCta: config.sections?.showClosingCta ?? true,
  };

  const scrollToSection = useCallback((sectionId: string, offset = STICKY_NAV_HEIGHT) => {
    const container = scrollContainerRef.current;
    const el = container?.querySelector<HTMLElement>(`#${sectionId}`);
    if (!container || !el) return false;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const visualScale = container.clientHeight > 0 ? containerRect.height / container.clientHeight : 1;
    const visualDelta = elRect.top - containerRect.top;
    const scrollTop = container.scrollTop + visualDelta / visualScale - offset;
    container.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
    return true;
  }, []);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, []);

  const scrollToForm = useCallback(() => scrollToSection("form"), [scrollToSection]);

  const runScrollRequest = useCallback(
    (target: "top" | "form") => (target === "top" ? scrollToTop() : scrollToForm()),
    [scrollToForm, scrollToTop],
  );

  const handleDiscoveryCallClick = () => {
    if (onDiscoveryCallClick) onDiscoveryCallClick();
    else scrollToForm();
  };

  const handleSecondaryCtaClick = () => {
    scrollToSection(hero.secondaryCtaTarget ?? (config.signatureSection ? "signature" : "programs"));
  };

  const handleNavLinkClick = (index: number) => {
    scrollToSection(NAV_SECTION_TARGETS[index] ?? "programs");
  };

  useEffect(() => {
    if (!scrollRequest) return;
    let cancelled = false;
    let frameId = 0;
    const scroll = () => {
      if (!cancelled) runScrollRequest(scrollRequest.target);
    };
    scroll();
    frameId = requestAnimationFrame(() => {
      scroll();
      if (!cancelled) frameId = requestAnimationFrame(scroll);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [scrollRequest, runScrollRequest]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => setIsWide(el.clientWidth >= WIDE_FRAME_PX);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const heroBottom = heroSectionRef.current?.offsetHeight ?? 600;
      const formTop = formSectionRef.current?.offsetTop ?? Number.MAX_SAFE_INTEGER;
      const scrollTop = container.scrollTop;

      setShowStickyNav(scrollTop > heroBottom - STICKY_NAV_HEIGHT);
      setShowFloatingCta(scrollTop > heroBottom && scrollTop < formTop - container.clientHeight * 0.5);

      let current = -1;
      let currentTop = -1;
      NAV_SECTION_TARGETS.forEach((id, i) => {
        const section = container.querySelector<HTMLElement>(`#${id}`);
        if (!section) return;
        const top = section.offsetTop;
        if (top <= scrollTop + STICKY_NAV_HEIGHT * 2 && top > currentTop) {
          current = i;
          currentTop = top;
        }
      });
      setActiveNav(current);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const themeStyle: CSSProperties = {
    ...buildBrightDemoWebsiteThemeVars(config.theme),
    backgroundColor: "var(--demo-paper)",
    color: "var(--demo-ink)",
  };

  return (
    <div
      ref={scrollContainerRef}
      className={standalone ? "min-h-screen w-full" : externalScroll ? "w-full" : "h-full overflow-y-auto overflow-x-hidden"}
      style={themeStyle}
    >
      <div className="@container/site relative">
        <div className="sticky top-0 z-40 h-0">
          <AnimatePresence>
            {showStickyNav ? (
              <motion.header
                className={`${DEMO_CONTAINER} pt-3`}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <SiteNavBar
                  config={config}
                  activeNav={activeNav}
                  onNavLinkClick={handleNavLinkClick}
                  onCtaClick={handleDiscoveryCallClick}
                  onScrollToTop={scrollToTop}
                  elevated
                />
              </motion.header>
            ) : null}
          </AnimatePresence>
        </div>

        <SiteHero
          config={config}
          heroRef={heroSectionRef}
          scrollContainerRef={scrollContainerRef}
          isWide={isWide}
          activeNav={activeNav}
          onNavLinkClick={handleNavLinkClick}
          onCtaClick={handleDiscoveryCallClick}
          onSecondaryCtaClick={handleSecondaryCtaClick}
          onScrollToTop={scrollToTop}
        />
        <SiteStats stats={config.stats} />
        <SiteWelcomeBento welcome={config.welcome} />
        <SiteMarquee items={config.marquee} />
        {config.signatureSection ? (
          <SignatureSection section={config.signatureSection} onCtaClick={handleDiscoveryCallClick} />
        ) : null}
        <SitePrograms programs={config.programs} onCtaClick={handleDiscoveryCallClick} />
        {sections.showMosaic ? <SiteGallery images={config.mosaicImages} /> : null}
        <SiteDayTimeline timeline={config.timeline} />
        <SiteQuote quote={config.quote} />
        <SiteStory socialProof={config.socialProof} />
        {sections.showFounder ? <SiteFounder founder={config.founder} /> : null}
        <SitePillars pillars={config.pillars} />
        {sections.showParallax ? (
          <SitePhotoBand
            parallax={config.parallax}
            onCtaClick={handleDiscoveryCallClick}
            onSecondaryCtaClick={handleSecondaryCtaClick}
          />
        ) : null}
        {sections.showStrip ? <SitePhotoStrip images={config.stripImages} /> : null}
        <SiteEnroll form={config.form} formRef={formSectionRef} onExplorePrograms={() => scrollToSection("programs")} />
        <SiteFaq faq={config.faq} ctaLabel={hero.navCta} onCtaClick={handleDiscoveryCallClick} />
        {sections.showClosingCta ? (
          <SiteClosing
            closingCta={config.closingCta}
            onCtaClick={handleDiscoveryCallClick}
            onSecondaryCtaClick={handleSecondaryCtaClick}
          />
        ) : null}
        <SiteFooter
          config={config}
          onNavLinkClick={handleNavLinkClick}
          onCtaClick={handleDiscoveryCallClick}
          onSecondaryCtaClick={handleSecondaryCtaClick}
          onScrollToTop={scrollToTop}
        />

        <AnimatePresence>
          {showFloatingCta ? (
            <motion.div
              className="sticky bottom-0 z-40 px-3 pb-3 @3xl/site:hidden"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <DemoWebsiteButton variant="primary" className="w-full shadow-[var(--demo-shadow-float)]" onClick={handleDiscoveryCallClick}>
                {hero.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </DemoWebsiteButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
