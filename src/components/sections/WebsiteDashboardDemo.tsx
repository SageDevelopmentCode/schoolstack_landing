// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  Star,
  Share2,
  MessageCircle,
  Sprout,
  Heart,
  Palette,
  TreePine,
  ArrowRight,
  Leaf,
  GraduationCap,
  Users,
  Compass,
  BookOpen,
  Shield,
  Award,
  Sparkles,
  Check,
} from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { buildDemoWebsiteThemeVars } from "@/components/demo/shared/demo-story-theme";
import { defaultWebsiteDemoConfig } from "@/data/school-demos/default";
import type {
  DemoIconName,
  DemoTheme,
  DemoTimelineStep,
  SchoolWebsiteDemoConfig,
} from "@/data/school-demos/types";
import SignatureSection from "@/components/sections/website-demo/SignatureSection";
import DemoWebsiteButton from "@/components/sections/website-demo/DemoWebsiteButton";
import DemoWebsiteCard from "@/components/sections/website-demo/DemoWebsiteCard";
import DemoWebsiteSectionKicker from "@/components/sections/website-demo/DemoWebsiteSectionKicker";
import DemoWebsiteStoryHero from "@/components/sections/website-demo/DemoWebsiteStoryHero";

const STICKY_NAV_HEIGHT = 72;
const NAV_SECTION_TARGETS = ["programs", "welcome", "form", "faq"] as const;
const FORM_FIELD_CLASS =
  "w-full px-5 py-4 rounded-[var(--demo-radius-button)] border border-[var(--demo-line)] bg-white text-[var(--demo-ink)] placeholder:text-[var(--demo-muted)] font-secondary focus:outline-none focus:border-[var(--demo-primary)] transition-colors duration-200 text-base";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  sprout: Sprout,
  heart: Heart,
  palette: Palette,
  treePine: TreePine,
  leaf: Leaf,
  graduationCap: GraduationCap,
  users: Users,
  compass: Compass,
  bookOpen: BookOpen,
  shield: Shield,
  award: Award,
  sparkles: Sparkles,
} as const;

function DemoIcon({ name, className }: { name: DemoIconName; className?: string }) {
  const Icon = ICON_MAP[name];
  return <Icon className={className} />;
}

function getThemeVars(theme: DemoTheme): React.CSSProperties {
  return {
    ...buildDemoWebsiteThemeVars(theme),
    "--demo-primary": theme.primary,
    "--demo-primary-light": `color-mix(in srgb, ${theme.primary} 45%, white)`,
    "--demo-primary-hover": theme.primaryHover,
    "--demo-dark": theme.dark,
    "--demo-dark-hover": theme.darkHover,
    "--demo-light-bg": theme.lightBg,
    "--demo-light-border": theme.lightBorder,
    "--demo-muted": theme.muted,
    "--demo-badge-bg": theme.badgeBg,
    "--demo-accent-text": theme.accentText,
  } as React.CSSProperties;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimelineStep({
  step,
  index,
  stepCount,
  isActive,
  onClick,
}: {
  step: DemoTimelineStep;
  index: number;
  stepCount: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-30% 0px -50% 0px" });

  useEffect(() => {
    if (inView) onClick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="flex gap-6 relative cursor-pointer group"
    >
      {index < stepCount - 1 && (
        <div
          className="absolute left-5 top-10 w-px h-full z-0"
          style={{ backgroundColor: "var(--demo-line)" }}
        />
      )}
      <div
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold font-secondary text-sm flex-shrink-0 transition-all duration-300 ${
          isActive
            ? "scale-110 border-2"
            : "border-2 opacity-70 group-hover:opacity-100"
        }`}
        style={
          isActive
            ? {
                backgroundColor: "var(--demo-primary-soft)",
                borderColor: "color-mix(in srgb, var(--demo-primary) 35%, transparent)",
                color: "var(--demo-primary)",
                boxShadow: "var(--demo-shadow-pill)",
              }
            : {
                backgroundColor: "var(--demo-cream)",
                borderColor: "var(--demo-line)",
                color: "var(--demo-muted)",
              }
        }
      >
        {index + 1}
      </div>
      <div className="pb-10">
        <p
          className="text-xs font-secondary font-semibold uppercase tracking-widest mb-1 transition-colors duration-300"
          style={{ color: isActive ? "var(--demo-primary)" : "var(--demo-muted)" }}
        >
          {step.time}
        </p>
        <h4
          className="text-lg font-bold font-heading mb-1.5 transition-colors duration-300"
          style={{ color: isActive ? "var(--demo-ink)" : "color-mix(in srgb, var(--demo-ink) 45%, transparent)" }}
        >
          {step.activity}
        </h4>
        <p
          className={`text-sm font-secondary leading-relaxed transition-all duration-300 ${isActive ? "max-h-24 opacity-100" : "text-transparent max-h-0 opacity-0 overflow-hidden"}`}
          style={{ color: "var(--demo-muted)" }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

function WelcomeImages({
  mainImage,
  secondaryImage,
  statBadge,
  floatBadge,
}: {
  mainImage: string;
  secondaryImage: string;
  statBadge?: { value: string; label: string };
  floatBadge?: { title: string; subtitle: string; icon: DemoIconName };
}) {
  return (
    <motion.div
      className="w-full lg:w-7/12 relative overflow-hidden lg:overflow-visible"
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" as const }}
    >
      <div className="relative h-[460px] rounded-3xl overflow-hidden shadow-2xl">
        <Image src={mainImage} fill className="object-cover" alt="Students learning" />
      </div>

      <motion.div
        className="absolute -bottom-8 -left-6 w-44 h-52 rounded-[var(--demo-radius-card)] overflow-hidden shadow-xl border-4 border-white z-10"
        style={{ rotate: -4 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" as const }}
      >
        <Image src={secondaryImage} fill className="object-cover" alt="School community" />
      </motion.div>

      {statBadge && (
        <div className="absolute top-7 right-7 bg-white/95 backdrop-blur-sm rounded-[var(--demo-radius-card)] px-5 py-4 shadow-lg z-10">
          <p className="text-2xl font-bold text-[var(--demo-dark)] font-heading leading-none">
            {statBadge.value}
          </p>
          <p className="text-xs text-[var(--demo-muted)] font-secondary font-semibold uppercase tracking-wider mt-1">
            {statBadge.label}
          </p>
        </div>
      )}

      {floatBadge && (
        <div className="absolute bottom-5 right-6 bg-white/95 backdrop-blur-sm rounded-[var(--demo-radius-button)] px-5 py-3.5 shadow-lg z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--demo-light-bg)] flex items-center justify-center flex-shrink-0">
            <DemoIcon name={floatBadge.icon} className="w-4 h-4 text-[var(--demo-accent-text)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--demo-dark)] font-heading leading-none">
              {floatBadge.title}
            </p>
            <p className="text-xs text-[var(--demo-muted)] font-secondary mt-0.5">
              {floatBadge.subtitle}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  disableTour?: boolean;
  standalone?: boolean;
  externalScroll?: boolean;
  config?: SchoolWebsiteDemoConfig;
  scrollRequest?: { target: "top" | "form"; nonce: number } | null;
  onDiscoveryCallClick?: () => void;
}

export default function WebsiteDashboardDemo({
  disableTour: _disableTour,
  standalone,
  externalScroll = false,
  config = defaultWebsiteDemoConfig,
  scrollRequest,
  onDiscoveryCallClick,
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentName: "",
    grade: "",
    program: "",
  });
  const [formSuccess, setFormSuccess] = useState(false);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const [activeProgram, setActiveProgram] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  const { theme, hero, welcome, timeline } = config;
  const activeProgramData = config.programs.items[activeProgram];
  const activeTimelineStep = timeline.steps[activeStep];

  const sectionVisibility = {
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
    const visualScale =
      container.clientHeight > 0
        ? containerRect.height / container.clientHeight
        : 1;
    const visualDelta = elRect.top - containerRect.top;
    const scrollTop =
      container.scrollTop + visualDelta / visualScale - offset;
    container.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
    return true;
  }, []);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, []);

  const scrollToForm = useCallback(() => {
    return scrollToSection("form", STICKY_NAV_HEIGHT);
  }, [scrollToSection]);

  const runScrollRequest = useCallback(
    (target: "top" | "form") => {
      if (target === "top") {
        scrollToTop();
        return true;
      }
      return scrollToForm();
    },
    [scrollToForm, scrollToTop],
  );

  const handleDiscoveryCallClick = () => {
    if (onDiscoveryCallClick) {
      onDiscoveryCallClick();
    } else {
      scrollToForm();
    }
  };

  const handleSecondaryCtaClick = () => {
    const target = hero.secondaryCtaTarget ?? (config.signatureSection ? "signature" : "programs");
    scrollToSection(target);
  };

  const handleNavLinkClick = (index: number) => {
    const target = NAV_SECTION_TARGETS[index] ?? "programs";
    scrollToSection(target);
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
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const heroBottom = heroSectionRef.current?.offsetHeight ?? 600;
      const formTop = formSectionRef.current?.offsetTop ?? Number.MAX_SAFE_INTEGER;
      const scrollTop = container.scrollTop;

      setShowStickyNav(scrollTop > heroBottom - STICKY_NAV_HEIGHT);
      setShowFloatingCta(
        scrollTop > heroBottom && scrollTop < formTop - container.clientHeight * 0.5,
      );
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(true);
  };

  const showAnnouncementBar = hero.eyebrowPlacement === "announcementBar" && hero.eyebrow;

  return (
    <div
      ref={scrollContainerRef}
      className={
        standalone
          ? "min-h-screen w-full"
          : externalScroll
            ? "w-full"
            : "h-full overflow-y-auto"
      }
      style={{ ...getThemeVars(theme), backgroundColor: "var(--demo-paper)" }}
    >
      <DemoWebsiteStoryHero
        config={config}
        heroSectionRef={heroSectionRef}
        showAnnouncementBar={Boolean(showAnnouncementBar)}
        onNavLinkClick={handleNavLinkClick}
        onDiscoveryCallClick={handleDiscoveryCallClick}
        onSecondaryCtaClick={handleSecondaryCtaClick}
        onScrollToTop={scrollToTop}
      />

      <AnimatePresence>
        {showStickyNav && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="sticky top-0 z-40 flex items-center justify-between px-6 sm:px-10 py-3 border-b backdrop-blur-md"
            style={{
              backgroundColor: "color-mix(in srgb, var(--demo-cream) 92%, transparent)",
              borderColor: "var(--demo-line)",
            }}
          >
            <button type="button" onClick={scrollToTop} className="cursor-pointer">
              <SchoolDemoWordmark
                logo={config.logo}
                className="h-9 w-auto object-contain"
              />
            </button>
            <nav className="hidden md:flex items-center gap-6">
              {hero.navLinks.map((item, i) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleNavLinkClick(i)}
                  className="font-secondary text-sm font-semibold transition-colors duration-200 cursor-pointer"
                  style={{ color: "var(--demo-muted)" }}
                >
                  {item}
                </button>
              ))}
            </nav>
            <DemoWebsiteButton
              variant="primary"
              className="px-4 py-2 text-sm"
              onClick={handleDiscoveryCallClick}
            >
              {hero.navCta}
            </DemoWebsiteButton>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ─── 2. STAT BAND ─────────────────────────────────────────────────── */}
      <section ref={statsRef} className="px-6 sm:px-10 lg:px-14 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
          {config.stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 18 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" as const }}
            >
              <DemoWebsiteCard className="text-center" padding="compact">
                <p
                  className="text-2xl md:text-3xl font-bold font-heading mb-1.5"
                  style={{ color: "var(--demo-ink)" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-[10px] font-semibold font-secondary uppercase tracking-wider"
                  style={{ color: "var(--demo-muted)" }}
                >
                  {stat.label}
                </p>
              </DemoWebsiteCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 3. WELCOME / PARENT FIT ──────────────────────────────────────── */}
      <section
        id="welcome"
        className="py-20 px-6 sm:px-10 lg:px-14"
        style={{ backgroundColor: "var(--demo-paper)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {welcome.type === "mission" ? (
            <>
              <motion.div
                className="w-full lg:w-5/12"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" as const }}
              >
                <div className="mb-7">
                  <DemoWebsiteSectionKicker>{welcome.eyebrow}</DemoWebsiteSectionKicker>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-heading mb-5 leading-tight" style={{ color: "var(--demo-ink)" }}>
                  {welcome.heading}
                  <br />
                  <em className="text-[var(--demo-primary)] not-italic">{welcome.headingAccent}</em>
                </h2>
                {welcome.paragraphs.map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="text-base leading-relaxed font-secondary mb-5 last:mb-8"
                    style={{ color: "var(--demo-muted)" }}
                  >
                    {p}
                  </p>
                ))}
                <DemoWebsiteCard className="border-l-4" style={{ borderLeftColor: "var(--demo-primary)" }} padding="compact">
                  <p className="text-sm font-medium font-secondary leading-relaxed" style={{ color: "var(--demo-ink)" }}>
                    &ldquo;{welcome.quote}&rdquo;
                  </p>
                  <p className="text-xs font-secondary mt-3 uppercase tracking-wider" style={{ color: "var(--demo-muted)" }}>
                    {welcome.quoteAttribution}
                  </p>
                </DemoWebsiteCard>
              </motion.div>
              <WelcomeImages
                mainImage={welcome.mainImage}
                secondaryImage={welcome.secondaryImage}
                statBadge={welcome.statBadge}
                floatBadge={welcome.floatBadge}
              />
            </>
          ) : (
            <>
              <motion.div
                className="w-full lg:w-5/12"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" as const }}
              >
                <div className="mb-7">
                  <DemoWebsiteSectionKicker>{welcome.eyebrow}</DemoWebsiteSectionKicker>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight" style={{ color: "var(--demo-ink)" }}>
                  {welcome.heading}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {welcome.cards.map((card) => (
                    <DemoWebsiteCard key={card.title} padding="compact">
                      <h3 className="text-base font-bold font-heading mb-2" style={{ color: "var(--demo-ink)" }}>
                        {card.title}
                      </h3>
                      <p className="text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                        {card.desc}
                      </p>
                    </DemoWebsiteCard>
                  ))}
                </div>
              </motion.div>
              <WelcomeImages
                mainImage={welcome.mainImage}
                secondaryImage={welcome.secondaryImage}
              />
            </>
          )}
        </div>
      </section>

      {/* ─── 4. MARQUEE ───────────────────────────────────────────────────── */}
      <section className="bg-[var(--demo-light-bg)] py-4 overflow-hidden border-y border-[var(--demo-light-border)]">
        <style>{`
          @keyframes marquee-website-demo {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: "marquee-website-demo 38s linear infinite",
            animationPlayState: marqueePaused ? "paused" : "running",
          }}
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
        >
          {[...config.marquee, ...config.marquee].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-5 mx-7 text-[var(--demo-accent-text)] font-semibold font-secondary text-sm uppercase tracking-wider"
            >
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--demo-primary)] flex-shrink-0 opacity-60" />
            </span>
          ))}
        </div>
      </section>

      {config.signatureSection && (
        <SignatureSection
          section={config.signatureSection}
          onCtaClick={handleDiscoveryCallClick}
        />
      )}

      {/* ─── 5. PROGRAMS ──────────────────────────────────────────────────── */}
      <section
        id="programs"
        className="py-20 px-6 sm:px-10 lg:px-14"
        style={{ backgroundColor: "var(--demo-paper)" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <div className="mb-5"><DemoWebsiteSectionKicker>
              {config.programs.eyebrow}
            </DemoWebsiteSectionKicker></div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight" style={{ color: "var(--demo-ink)" }}>
                {config.programs.heading}
              </h2>
              <p className="font-secondary text-base max-w-sm md:text-right" style={{ color: "var(--demo-muted)" }}>
                {config.programs.subtitle}
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="w-full lg:w-[340px] flex flex-col sm:grid sm:grid-cols-3 lg:flex lg:flex-col gap-3 flex-shrink-0">
              {config.programs.items.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => setActiveProgram(i)}
                  className={`w-full text-left p-5 rounded-[var(--demo-radius-card)] border-2 transition-all duration-250 cursor-pointer ${
                    activeProgram === i
                      ? "border-[var(--demo-primary)] bg-[color-mix(in_srgb,var(--demo-primary)_8%,transparent)] shadow-sm"
                      : "border-[var(--demo-line)] bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider font-secondary block mb-2 ${activeProgram === i ? "text-[var(--demo-primary)]" : "text-[var(--demo-muted)]"}`}
                  >
                    {p.badge}
                  </span>
                  <p className="text-base font-bold text-[var(--demo-ink)] font-heading leading-tight mb-1">
                    {p.title}
                  </p>
                  <p className="text-xs text-[var(--demo-muted)] font-secondary">{p.teaser}</p>
                </button>
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProgram}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: "easeOut" as const }}
                >
                  <div className="relative h-64 md:h-80 rounded-[var(--demo-radius-card)] overflow-hidden mb-7 shadow-lg">
                    <Image
                      src={activeProgramData.image}
                      fill
                      className="object-cover"
                      alt={activeProgramData.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span
                      className={`absolute top-5 left-5 px-4 py-1.5 text-xs font-bold rounded-full font-secondary ${activeProgramData.accentBg} ${activeProgramData.accent}`}
                    >
                      {activeProgramData.badge}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-[var(--demo-ink)] font-heading mb-4">
                    {activeProgramData.title}
                  </h3>
                  <p className="text-base text-[var(--demo-muted)] font-secondary leading-relaxed mb-6">
                    {activeProgramData.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-7">
                    {activeProgramData.details.map((d) => (
                      <span
                        key={d}
                        className="bg-[var(--demo-cream)] text-[var(--demo-ink)] px-4 py-1.5 rounded-full text-xs font-semibold font-secondary"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <DemoWebsiteButton
                    type="button"
                    onClick={handleDiscoveryCallClick}
                    variant="primary"
                    className="inline-flex items-center gap-2"
                  >
                    {config.programs.ctaLabel}
                    <ArrowRight className="w-4 h-4" />
                  </DemoWebsiteButton>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. PHOTO MOSAIC ──────────────────────────────────────────────── */}
      {sectionVisibility.showMosaic && (
      <section className="px-4 pb-4" style={{ backgroundColor: "var(--demo-paper)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-3 h-[280px] sm:h-[340px] md:h-[480px]">
          <motion.div
            className="col-span-1 row-span-2 relative rounded-[var(--demo-radius-card)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
          >
            <Image
              src={config.mosaicImages[0]}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              alt="School life"
            />
          </motion.div>
          <motion.div
            className="col-span-1 md:col-span-2 row-span-1 relative rounded-[var(--demo-radius-card)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" as const }}
          >
            <Image
              src={config.mosaicImages[1]}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              alt="Students learning"
            />
          </motion.div>
          <motion.div
            className="col-span-1 md:col-span-2 row-span-1 relative rounded-[var(--demo-radius-card)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" as const }}
          >
            <Image
              src={config.mosaicImages[2]}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              alt="Campus activities"
            />
          </motion.div>
        </div>
      </section>
      )}

      {/* ─── 7. PHILOSOPHY QUOTE ──────────────────────────────────────────── */}
      <section className="relative py-28 px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={config.quote.backgroundImage} fill className="object-cover" alt="" />
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" as const }}
          >
            <span className="block text-7xl md:text-8xl text-[color-mix(in_srgb,var(--demo-primary)_25%,transparent)] font-heading leading-none mb-2 select-none">
              &ldquo;
            </span>
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[var(--demo-ink)] leading-tight italic mb-10">
              {config.quote.text.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < config.quote.text.length - 1 && <br />}
                </span>
              ))}
            </blockquote>
            <p className="text-sm text-[var(--demo-muted)] font-secondary uppercase tracking-widest mb-8">
              {config.quote.attribution}
            </p>
            <div className="mx-auto w-20 h-1 bg-[var(--demo-primary)] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ─── 8. PHOTO STRIP ───────────────────────────────────────────────── */}
      {sectionVisibility.showStrip && (
      <section className="bg-[var(--demo-light-bg)] py-10 overflow-hidden border-t border-[var(--demo-light-border)]">
        <style>{`
          @keyframes strip-scroll-website-demo {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div
          className="flex gap-4 items-center"
          style={{
            animation: "strip-scroll-website-demo 22s linear infinite",
            width: "max-content",
          }}
        >
          {[...config.stripImages, ...config.stripImages].map((src, i) => (
            <motion.div
              key={`${src}-${i}`}
              className="relative w-48 sm:w-64 h-36 sm:h-44 flex-shrink-0 rounded-[var(--demo-radius-card)] overflow-hidden shadow-sm"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
            >
              <Image src={src} fill className="object-cover" alt="" />
            </motion.div>
          ))}
        </div>
      </section>
      )}

      {/* ─── 9. DAY IN LIFE ───────────────────────────────────────────────── */}
      <section
        id="timeline"
        className="py-20 px-6 sm:px-10 lg:px-14"
        style={{ backgroundColor: "var(--demo-cream)" }}
      >
        <div className="max-w-7xl mx-auto">
          <DemoWebsiteCard className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start" padding="default">
          <div className="w-full lg:w-7/12">
            <div className="mb-7">
              <DemoWebsiteSectionKicker>{timeline.eyebrow}</DemoWebsiteSectionKicker>
            </div>

            <motion.h2
              className="text-4xl md:text-5xl font-bold font-heading mb-10 leading-tight"
              style={{ color: "var(--demo-ink)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" as const }}
            >
              {timeline.heading}
              <br />
              <span style={{ color: "var(--demo-muted)" }}>{timeline.headingSub}</span>
            </motion.h2>

            <div className="relative">
              {timeline.steps.map((step, i) => (
                <TimelineStep
                  key={step.activity}
                  step={step}
                  index={i}
                  stepCount={timeline.steps.length}
                  isActive={activeStep === i}
                  onClick={() => setActiveStep(i)}
                />
              ))}
            </div>
          </div>

          <div className="w-full lg:w-5/12 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: "easeOut" as const }}
                className="relative h-[280px] sm:h-[420px] md:h-[520px] rounded-3xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={activeTimelineStep.image}
                  fill
                  className="object-cover"
                  alt={activeTimelineStep.activity}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="text-[var(--demo-primary)] font-secondary text-xs font-semibold uppercase tracking-widest mb-1.5">
                    {activeTimelineStep.time}
                  </p>
                  <p className="text-white font-heading font-bold text-xl">
                    {activeTimelineStep.activity}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-5">
              {timeline.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    activeStep === i
                      ? "w-6 h-2"
                      : "w-2 h-2 opacity-40 hover:opacity-70"
                  }`}
                  style={{ backgroundColor: "var(--demo-primary)" }}
                />
              ))}
            </div>
          </div>
          </DemoWebsiteCard>
        </div>
      </section>

      {/* ─── 10. TESTIMONIALS / TRUST ──────────────────────────────────────── */}
      <section className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <div className="mb-5">
              <DemoWebsiteSectionKicker>{config.socialProof.eyebrow}</DemoWebsiteSectionKicker>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4" style={{ color: "var(--demo-ink)" }}>
              {config.socialProof.heading}
            </h2>
            <p className="font-secondary text-lg max-w-lg mx-auto" style={{ color: "var(--demo-muted)" }}>
              {config.socialProof.subtitle}
            </p>
          </motion.div>

          {config.socialProof.type === "testimonials" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.socialProof.items.map((t, i) => (
                <motion.div
                  key={`${t.name}-${i}`}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" as const }}
                  whileHover={{ y: -4 }}
                >
                  <DemoWebsiteCard className="flex h-full flex-col">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-[var(--demo-primary)] text-[var(--demo-primary)]" />
                      ))}
                    </div>
                    <blockquote className="mb-7 flex-1 text-base font-secondary italic leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[var(--demo-light-bg)]">
                        <Image src={t.avatar} fill className="object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold font-heading" style={{ color: "var(--demo-ink)" }}>{t.name}</p>
                        <p className="text-xs font-secondary" style={{ color: "var(--demo-muted)" }}>{t.detail}</p>
                      </div>
                    </div>
                  </DemoWebsiteCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.socialProof.items.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" as const }}
                  whileHover={{ y: -4 }}
                >
                  <DemoWebsiteCard className="flex h-full flex-col">
                    {item.icon && (
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--demo-radius-button)] bg-[var(--demo-cream)]">
                        <DemoIcon name={item.icon} className="h-6 w-6 text-[var(--demo-accent-text)]" />
                      </div>
                    )}
                    <h3 className="mb-3 text-lg font-bold font-heading" style={{ color: "var(--demo-ink)" }}>
                      {item.title}
                    </h3>
                    <p className="flex-1 text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                      {item.desc}
                    </p>
                  </DemoWebsiteCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── 11. FOUNDER ──────────────────────────────────────────────────── */}
      {sectionVisibility.showFounder && (
      <section className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-paper)" }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <motion.div
            className="w-full lg:w-5/12"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
          >
            <div className="relative h-[380px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={config.founder.image}
                fill
                className="object-cover"
                alt={config.founder.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute top-7 right-7 bg-white/95 backdrop-blur-sm rounded-[var(--demo-radius-card)] px-4 py-3 shadow-lg">
                <p className="text-xs text-[var(--demo-muted)] font-secondary font-semibold uppercase tracking-wider">
                  {config.founder.imageBadge.label}
                </p>
                <p className="text-sm font-bold text-[var(--demo-ink)] font-heading mt-0.5">
                  {config.founder.imageBadge.value}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-16">
                <p className="text-white font-heading font-bold text-xl">{config.founder.name}</p>
                <p className="text-white/60 font-secondary text-sm mt-1">{config.founder.title}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="w-full lg:w-7/12 space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" as const }}
          >
            <div className="mb-5">
              <DemoWebsiteSectionKicker>{config.founder.eyebrow}</DemoWebsiteSectionKicker>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight" style={{ color: "var(--demo-ink)" }}>
              {config.founder.heading}
              <br />
              <em className="text-[var(--demo-primary)] not-italic">{config.founder.headingAccent}</em>
            </h2>
            {config.founder.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="text-base text-[var(--demo-muted)] leading-relaxed font-secondary">
                {p}
              </p>
            ))}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {config.founder.credentials.map((cred) => (
                <span
                  key={cred}
                  className="bg-[var(--demo-light-bg)] text-[var(--demo-accent-text)] px-4 py-2 rounded-full text-sm font-semibold font-secondary border border-[var(--demo-light-border)]"
                >
                  {cred}
                </span>
              ))}
            </div>
            <div className="bg-[color-mix(in_srgb,var(--demo-primary)_8%,transparent)] rounded-[var(--demo-radius-card)] border-l-4 border-[var(--demo-primary)] p-6">
              <p className="text-sm text-[var(--demo-ink)] font-secondary leading-relaxed">
                &ldquo;{config.founder.quote}&rdquo;
              </p>
              <p className="text-xs text-[var(--demo-muted)] font-secondary mt-2 uppercase tracking-wider">
                {config.founder.quoteAttribution}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* ─── 12. FULL-BLEED BAND ──────────────────────────────────────────── */}
      {sectionVisibility.showParallax && (
      <section
        className="relative overflow-hidden px-8 py-24 sm:px-12 lg:px-16"
        style={{ backgroundColor: "var(--demo-primary-soft)" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <Image src={config.parallax.backgroundImage} fill className="object-cover" alt="" />
        </div>

        <motion.div
          className="relative z-10 mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <DemoWebsiteCard className="mx-auto max-w-3xl bg-white/90 backdrop-blur-sm">
            <div className="mb-5">
              <DemoWebsiteSectionKicker>{config.parallax.eyebrow}</DemoWebsiteSectionKicker>
            </div>
            <h2
              className="mb-6 text-4xl font-bold font-heading leading-tight md:text-5xl lg:text-6xl"
              style={{ color: "var(--demo-ink)" }}
            >
              {config.parallax.heading.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < config.parallax.heading.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p
              className="mx-auto mb-10 max-w-2xl font-secondary text-lg leading-relaxed"
              style={{ color: "var(--demo-muted)" }}
            >
              {config.parallax.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <DemoWebsiteButton
                type="button"
                onClick={handleDiscoveryCallClick}
                variant="primary"
                className="inline-flex items-center gap-2"
              >
                {config.parallax.primaryCta}
                <ArrowRight className="w-4 h-4" />
              </DemoWebsiteButton>
              <DemoWebsiteButton type="button" onClick={handleSecondaryCtaClick} variant="outline">
                {config.parallax.secondaryCta}
              </DemoWebsiteButton>
            </div>
          </DemoWebsiteCard>
        </motion.div>
      </section>
      )}

      {/* ─── 13. PILLARS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-cream)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <div className="mb-5">
              <DemoWebsiteSectionKicker>{config.pillars.eyebrow}</DemoWebsiteSectionKicker>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4" style={{ color: "var(--demo-ink)" }}>
              {config.pillars.heading}
            </h2>
            <p className="font-secondary text-lg max-w-xl mx-auto" style={{ color: "var(--demo-muted)" }}>
              {config.pillars.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {config.pillars.items.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="bg-white rounded-[var(--demo-radius-card)] p-8 shadow-sm border border-[var(--demo-line)] group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" as const }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.07)" }}
              >
                <div className="w-12 h-12 rounded-[var(--demo-radius-button)] bg-[var(--demo-light-bg)] group-hover:bg-[var(--demo-light-border)] transition-colors flex items-center justify-center mb-6">
                  <DemoIcon name={pillar.icon} className="w-6 h-6 text-[var(--demo-accent-text)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--demo-ink)] font-heading mb-3">{pillar.title}</h3>
                <p className="text-sm text-[var(--demo-muted)] font-secondary leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. ENROLLMENT FORM ──────────────────────────────────────────── */}
      <section
        id="form"
        ref={formSectionRef}
        className="scroll-mt-[72px] px-6 py-16 sm:px-10 lg:px-14"
        style={{ backgroundColor: "var(--demo-cream)" }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-5">
          <motion.div
            className="hidden lg:block lg:col-span-2"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
          >
            <DemoWebsiteCard className="relative min-h-[520px] overflow-hidden p-0" padding="none">
              <div className="relative h-full min-h-[520px]">
                <Image src={config.form.sidebarImage} fill className="object-cover" alt="" />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--demo-ink) 55%, transparent), transparent 70%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <span
                    className="mb-3 block font-heading text-4xl select-none"
                    style={{ color: "color-mix(in srgb, var(--demo-primary) 55%, white)" }}
                  >
                    &ldquo;
                  </span>
                  <p className="font-heading text-xl font-bold italic leading-snug text-white">
                    {config.form.sidebarQuote}
                  </p>
                </div>
              </div>
            </DemoWebsiteCard>
          </motion.div>

          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" as const }}
          >
            <DemoWebsiteCard>
              <div className="mb-6">
                <DemoWebsiteSectionKicker>{config.form.eyebrow}</DemoWebsiteSectionKicker>
              </div>
              <h2
                className="mb-3 text-3xl md:text-4xl font-bold font-heading leading-tight"
                style={{ color: "var(--demo-ink)" }}
              >
                {config.form.heading}
              </h2>
              <p
                className="mb-8 font-secondary text-base leading-relaxed"
                style={{ color: "var(--demo-muted)" }}
              >
                {config.form.description}
              </p>

              <AnimatePresence mode="wait">
                {formSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                      style={{ backgroundColor: "var(--demo-primary-soft)" }}
                    >
                      <Check className="h-8 w-8 text-[var(--demo-primary)]" />
                    </motion.div>
                    <p
                      className="mb-3 text-2xl font-bold font-heading"
                      style={{ color: "var(--demo-ink)" }}
                    >
                      {config.form.successTitle}
                    </p>
                    <p className="mb-6 font-secondary" style={{ color: "var(--demo-muted)" }}>
                      {config.form.successMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToSection("programs")}
                      className="cursor-pointer text-sm font-semibold font-secondary hover:underline"
                      style={{ color: "var(--demo-primary)" }}
                    >
                      Explore our programs →
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                    onSubmit={handleSubmit}
                  >
                    <input
                      type="text"
                      placeholder="Parent / Guardian Name"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      required
                      className={FORM_FIELD_CLASS}
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      required
                      className={FORM_FIELD_CLASS}
                    />
                    {config.form.studentFields && (
                      <>
                        <input
                          type="text"
                          placeholder={config.form.studentFields.namePlaceholder}
                          value={formData.studentName}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, studentName: e.target.value }))
                          }
                          required
                          className={FORM_FIELD_CLASS}
                        />
                        <select
                          value={formData.grade}
                          onChange={(e) => setFormData((p) => ({ ...p, grade: e.target.value }))}
                          required
                          className={`${FORM_FIELD_CLASS} cursor-pointer appearance-none`}
                        >
                          <option value="" disabled>
                            {config.form.studentFields.gradePlaceholder}
                          </option>
                          {config.form.studentFields.gradeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData((p) => ({ ...p, program: e.target.value }))}
                      required
                      className={`${FORM_FIELD_CLASS} cursor-pointer appearance-none`}
                    >
                      <option value="" disabled>
                        Select a program...
                      </option>
                      {config.form.programOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <DemoWebsiteButton type="submit" variant="primary" className="mt-2 w-full py-4 text-base">
                      {config.form.submitLabel}
                    </DemoWebsiteButton>
                    {config.form.trustNote && (
                      <p
                        className="text-center text-xs font-secondary"
                        style={{ color: "var(--demo-muted)" }}
                      >
                        {config.form.trustNote}
                      </p>
                    )}
                    <p
                      className="pt-1 text-center text-xs font-secondary"
                      style={{ color: "var(--demo-muted)" }}
                    >
                      {config.form.disclaimer}
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </DemoWebsiteCard>
          </motion.div>
        </div>
      </section>

      {/* ─── 15. FAQ ──────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="py-24 px-8 sm:px-12 lg:px-16 scroll-mt-[72px]"
        style={{ backgroundColor: "var(--demo-paper)" }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <div className="mb-5">
              <DemoWebsiteSectionKicker>{config.faq.eyebrow}</DemoWebsiteSectionKicker>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4" style={{ color: "var(--demo-ink)" }}>
              {config.faq.heading}
            </h2>
            <p className="font-secondary text-lg max-w-lg" style={{ color: "var(--demo-muted)" }}>{config.faq.subtitle}</p>
          </motion.div>

          <div className="space-y-3">
            {config.faq.items.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" as const }}
              >
                <DemoWebsiteCard className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between text-left transition-colors duration-200"
                    style={{ color: openFaq === i ? "var(--demo-primary)" : "var(--demo-ink)" }}
                  >
                    <span className="pr-6 text-base font-semibold font-heading md:text-lg">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-2xl font-light leading-none"
                      style={{
                        color: openFaq === i ? "var(--demo-primary)" : "var(--demo-muted)",
                      }}
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" as const }}
                        className="overflow-hidden"
                      >
                        <p
                          className="pt-4 font-secondary text-base leading-relaxed"
                          style={{ color: "var(--demo-muted)" }}
                        >
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </DemoWebsiteCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 15.5. CLOSING CTA ────────────────────────────────────────────── */}
      {sectionVisibility.showClosingCta && (
      <section
        className="border-t px-8 py-20 sm:px-12 lg:px-16"
        style={{ backgroundColor: "var(--demo-cream)", borderColor: "var(--demo-line)" }}
      >
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        >
          <div className="mb-6">
            <DemoWebsiteSectionKicker>{config.closingCta.eyebrow}</DemoWebsiteSectionKicker>
          </div>
          <h2
            className="mb-5 text-4xl font-bold font-heading leading-tight md:text-5xl"
            style={{ color: "var(--demo-ink)" }}
          >
            {config.closingCta.heading}
            <br />
            <em className="text-[var(--demo-primary)] not-italic">{config.closingCta.headingAccent}</em>
          </h2>
          <p
            className="mx-auto mb-10 max-w-lg font-secondary text-base leading-relaxed"
            style={{ color: "var(--demo-muted)" }}
          >
            {config.closingCta.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <DemoWebsiteButton
              type="button"
              onClick={handleDiscoveryCallClick}
              variant="primary"
              className="inline-flex items-center gap-2"
            >
              {config.closingCta.primaryCta}
              <ArrowRight className="w-4 h-4" />
            </DemoWebsiteButton>
            <DemoWebsiteButton type="button" onClick={handleSecondaryCtaClick} variant="outline">
              {config.closingCta.secondaryCta}
            </DemoWebsiteButton>
          </div>
        </motion.div>
      </section>
      )}

      {/* ─── 16. FOOTER ───────────────────────────────────────────────────── */}
      <footer
        className="border-t px-8 py-14"
        style={{
          backgroundColor: "var(--demo-cream)",
          borderColor: "var(--demo-line)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <SchoolDemoWordmark logo={config.logo} className="h-11 w-auto object-contain" />
            </div>
            <p className="font-secondary text-sm" style={{ color: "var(--demo-muted)" }}>
              {config.footer.tagline}
            </p>
          </div>

          <div className="mx-auto mb-8 h-px w-14" style={{ backgroundColor: "var(--demo-line)" }} />

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-8">
            {config.footer.links.map((link, i) => (
              <button
                key={link}
                type="button"
                onClick={() => handleNavLinkClick(i)}
                className="font-secondary text-sm transition-colors duration-200 cursor-pointer"
                style={{ color: "var(--demo-muted)" }}
              >
                {link}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-5 mb-10">
            <button
              type="button"
              className="cursor-pointer"
              style={{ color: "var(--demo-muted)" }}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="cursor-pointer"
              style={{ color: "var(--demo-muted)" }}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-xs font-secondary" style={{ color: "var(--demo-muted)" }}>
            {config.footer.copyright} &nbsp;·&nbsp; {config.footer.poweredBy}
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {showFloatingCta && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden border-t border-[var(--demo-light-border)] backdrop-blur-md"
            style={{ backgroundColor: "color-mix(in srgb, var(--demo-cream) 95%, transparent)" }}
          >
            <button
              type="button"
              onClick={handleDiscoveryCallClick}
              className="w-full py-3.5 bg-[var(--demo-primary)] hover:bg-[var(--demo-primary-hover)] text-white font-semibold rounded-[var(--demo-radius-button)] font-secondary shadow-lg cursor-pointer"
            >
              {hero.primaryCta}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
