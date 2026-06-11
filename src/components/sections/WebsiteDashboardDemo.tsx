"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  Star,
  ChevronDown,
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
} from "lucide-react";
import { defaultWebsiteDemoConfig } from "@/data/school-demos/default";
import type {
  DemoIconName,
  DemoTheme,
  DemoTimelineStep,
  SchoolWebsiteDemoConfig,
} from "@/data/school-demos/types";

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
    "--demo-primary": theme.primary,
    "--demo-primary-hover": theme.primaryHover,
    "--demo-dark": theme.dark,
    "--demo-dark-hover": theme.darkHover,
    "--demo-light-bg": theme.lightBg,
    "--demo-light-border": theme.lightBorder,
    "--demo-muted": theme.muted,
    "--demo-badge-bg": theme.badgeBg,
    "--demo-accent-text": theme.accentText,
    "--demo-page-bg": theme.pageBg ?? "#ffffff",
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
        <div className="absolute left-5 top-10 w-px h-full bg-white/15 z-0" />
      )}
      <div
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold font-secondary text-sm flex-shrink-0 shadow-sm transition-all duration-300 ${
          isActive
            ? "bg-white/20 border-2 border-white/50 text-white scale-110"
            : "bg-white/10 border-2 border-white/25 text-white/40 group-hover:border-white/50 group-hover:text-white/70"
        }`}
      >
        {index + 1}
      </div>
      <div className="pb-10">
        <p
          className={`text-xs font-secondary font-semibold uppercase tracking-widest mb-1 transition-colors duration-300 ${isActive ? "text-[var(--demo-primary)]" : "text-white/35"}`}
        >
          {step.time}
        </p>
        <h4
          className={`text-lg font-bold font-heading mb-1.5 transition-colors duration-300 ${isActive ? "text-white" : "text-white/40"}`}
        >
          {step.activity}
        </h4>
        <p
          className={`text-sm font-secondary leading-relaxed transition-all duration-300 ${isActive ? "text-white/70 max-h-24 opacity-100" : "text-transparent max-h-0 opacity-0 overflow-hidden"}`}
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
        className="absolute -bottom-8 -left-6 w-44 h-52 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-10"
        style={{ rotate: -4 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" as const }}
      >
        <Image src={secondaryImage} fill className="object-cover" alt="School community" />
      </motion.div>

      {statBadge && (
        <div className="absolute top-7 right-7 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg z-10">
          <p className="text-2xl font-bold text-[var(--demo-dark)] font-heading leading-none">
            {statBadge.value}
          </p>
          <p className="text-xs text-[var(--demo-muted)] font-secondary font-semibold uppercase tracking-wider mt-1">
            {statBadge.label}
          </p>
        </div>
      )}

      {floatBadge && (
        <div className="absolute bottom-5 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3.5 shadow-lg z-10 flex items-center gap-3">
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  const { theme, hero, welcome, timeline } = config;
  const activeProgramData = config.programs.items[activeProgram];
  const activeTimelineStep = timeline.steps[activeStep];

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDiscoveryCallClick = () => {
    if (onDiscoveryCallClick) {
      onDiscoveryCallClick();
    } else {
      scrollToForm();
    }
  };

  useEffect(() => {
    if (!scrollRequest) return;
    if (scrollRequest.target === "top") scrollToTop();
    else scrollToForm();
  }, [scrollRequest]);

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
      style={{ ...getThemeVars(theme), backgroundColor: "var(--demo-page-bg)" }}
    >
      {showAnnouncementBar && (
        <div
          className="relative z-30 w-full py-2.5 px-4 text-center text-[11px] sm:text-xs font-secondary font-semibold uppercase tracking-[0.12em] text-[var(--demo-dark)]"
          style={{ backgroundColor: "var(--demo-light-bg)" }}
        >
          {hero.eyebrow}
        </div>
      )}

      {/* ─── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 scale-[1.05]">
          <Image
            src={hero.backgroundImage}
            fill
            className="object-cover"
            alt={hero.imageAlt}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/75" />
        </div>

        {hero.floatingImages[0] && (
          <motion.div
            className="absolute top-24 right-6 md:right-16 w-40 md:w-52 h-52 md:h-72 rounded-2xl overflow-hidden shadow-2xl hidden sm:block"
            style={{ rotate: 3 }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" as const }}
          >
            <Image src={hero.floatingImages[0]} fill className="object-cover" alt="" />
            <div className="absolute inset-0 ring-1 ring-white/20 rounded-2xl" />
          </motion.div>
        )}

        {hero.floatingImages[1] && (
          <motion.div
            className="absolute top-52 right-40 md:right-64 w-28 md:w-36 h-36 md:h-44 rounded-xl overflow-hidden shadow-xl hidden md:block"
            style={{ rotate: -2 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.7, ease: "easeOut" as const }}
          >
            <Image src={hero.floatingImages[1]} fill className="object-cover" alt="" />
          </motion.div>
        )}

        <div className="relative z-20 flex items-center justify-between px-8 sm:px-12 pt-7">
          <div className="flex items-center gap-2">
            <Image
              src={config.logo.src}
              alt={config.logo.alt}
              width={config.logo.width ?? 120}
              height={config.logo.height ?? 32}
              className="h-8 w-auto object-contain"
            />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {hero.navLinks.map((item) => (
              <button
                key={item}
                className="text-white/65 hover:text-white font-secondary text-sm font-semibold transition-colors duration-200 cursor-pointer"
              >
                {item}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleDiscoveryCallClick}
            className="px-5 py-2.5 bg-[var(--demo-primary)] hover:bg-[var(--demo-primary-hover)] text-white text-sm font-semibold rounded-lg font-secondary transition-all duration-200 shadow-lg cursor-pointer"
          >
            {hero.navCta}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 z-10 px-8 sm:px-14 pb-14 max-w-2xl">
          {!showAnnouncementBar && (
            <motion.span
              className="inline-block px-5 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold rounded-full font-secondary mb-6 border border-white/25"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" as const }}
            >
              {hero.eyebrow}
            </motion.span>
          )}

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white font-heading leading-[1.05] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.85, ease: "easeOut" as const }}
          >
            {hero.headline.map((line, i) => (
              <span
                key={line}
                className={
                  hero.headlineAccentLine === i
                    ? "text-[var(--demo-primary)]"
                    : "text-white"
                }
              >
                {line}
                {i < hero.headline.length - 1 && <br />}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-white/70 font-secondary leading-relaxed mb-9 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7, ease: "easeOut" as const }}
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            className="flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" as const }}
          >
            <button
              type="button"
              onClick={handleDiscoveryCallClick}
              className="px-7 py-3.5 bg-[var(--demo-primary)] hover:bg-[var(--demo-primary-hover)] text-white font-semibold rounded-lg font-secondary transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-2 cursor-pointer"
            >
              {hero.primaryCta}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg font-secondary transition-all duration-200 border border-white/25 backdrop-blur-sm cursor-pointer">
              {hero.secondaryCta}
            </button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.7 }}
        >
          <span className="text-white/40 font-secondary text-xs uppercase tracking-widest">
            scroll
          </span>
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </section>

      {/* ─── 2. STAT BAND ─────────────────────────────────────────────────── */}
      <section
        ref={statsRef}
        className="bg-[var(--demo-light-bg)] border-b border-[var(--demo-light-border)] py-12 px-8"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {config.stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              className="text-center px-4 md:px-8 border-r border-[var(--demo-light-border)] last:border-0 py-4"
              initial={{ opacity: 0, y: 18 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" as const }}
            >
              <p className="text-2xl md:text-3xl font-bold text-[var(--demo-dark)] font-heading mb-1.5">
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-[var(--demo-muted)] font-secondary uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 3. WELCOME / PARENT FIT ──────────────────────────────────────── */}
      <section
        className="py-24 px-8 sm:px-12 lg:px-16"
        style={{ backgroundColor: "var(--demo-dark)" }}
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
                <span className="inline-block px-5 py-2 bg-white/15 text-white text-xs font-semibold rounded-full font-secondary mb-7 uppercase tracking-wider">
                  {welcome.eyebrow}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white font-heading mb-5 leading-tight">
                  {welcome.heading}
                  <br />
                  <em className="text-[var(--demo-primary)] not-italic">{welcome.headingAccent}</em>
                </h2>
                {welcome.paragraphs.map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="text-base text-white/70 leading-relaxed font-secondary mb-5 last:mb-8"
                  >
                    {p}
                  </p>
                ))}
                <div className="p-6 bg-[var(--demo-light-bg)] rounded-2xl border-l-4 border-[var(--demo-primary)]">
                  <p className="text-sm font-medium text-[var(--demo-dark)] font-secondary leading-relaxed">
                    &ldquo;{welcome.quote}&rdquo;
                  </p>
                  <p className="text-xs text-[var(--demo-muted)] font-secondary mt-3 uppercase tracking-wider">
                    {welcome.quoteAttribution}
                  </p>
                </div>
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
                <span className="inline-block px-5 py-2 bg-white/15 text-white text-xs font-semibold rounded-full font-secondary mb-7 uppercase tracking-wider">
                  {welcome.eyebrow}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white font-heading mb-8 leading-tight">
                  {welcome.heading}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {welcome.cards.map((card) => (
                    <div
                      key={card.title}
                      className="p-5 bg-white/8 rounded-2xl border border-white/15"
                    >
                      <h3 className="text-base font-bold text-white font-heading mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-white/65 font-secondary leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
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

      {/* ─── 5. PROGRAMS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-page-bg)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-5 uppercase tracking-wider">
              {config.programs.eyebrow}
            </span>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading leading-tight">
                {config.programs.heading}
              </h2>
              <p className="text-gray-500 font-secondary text-base max-w-sm md:text-right">
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
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-250 cursor-pointer ${
                    activeProgram === i
                      ? "border-[var(--demo-primary)] bg-[color-mix(in_srgb,var(--demo-primary)_8%,transparent)] shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider font-secondary block mb-2 ${activeProgram === i ? "text-[var(--demo-primary)]" : "text-gray-400"}`}
                  >
                    {p.badge}
                  </span>
                  <p className="text-base font-bold text-gray-900 font-heading leading-tight mb-1">
                    {p.title}
                  </p>
                  <p className="text-xs text-gray-500 font-secondary">{p.teaser}</p>
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
                  <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-7 shadow-lg">
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

                  <h3 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                    {activeProgramData.title}
                  </h3>
                  <p className="text-base text-gray-600 font-secondary leading-relaxed mb-6">
                    {activeProgramData.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-7">
                    {activeProgramData.details.map((d) => (
                      <span
                        key={d}
                        className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-xs font-semibold font-secondary"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <button className="px-8 py-3.5 bg-[var(--demo-dark)] hover:bg-[var(--demo-dark-hover)] text-white rounded-xl font-semibold font-secondary transition-colors duration-200 flex items-center gap-2 cursor-pointer">
                    {config.programs.ctaLabel}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. PHOTO MOSAIC ──────────────────────────────────────────────── */}
      <section className="px-4 pb-4" style={{ backgroundColor: "var(--demo-page-bg)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-3 h-[280px] sm:h-[340px] md:h-[480px]">
          <motion.div
            className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden"
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
            className="col-span-1 md:col-span-2 row-span-1 relative rounded-2xl overflow-hidden"
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
            className="col-span-1 md:col-span-2 row-span-1 relative rounded-2xl overflow-hidden"
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
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 leading-tight italic mb-10">
              {config.quote.text.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < config.quote.text.length - 1 && <br />}
                </span>
              ))}
            </blockquote>
            <p className="text-sm text-gray-400 font-secondary uppercase tracking-widest mb-8">
              {config.quote.attribution}
            </p>
            <div className="mx-auto w-20 h-1 bg-[var(--demo-primary)] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ─── 8. PHOTO STRIP ───────────────────────────────────────────────── */}
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
              className="relative w-48 sm:w-64 h-36 sm:h-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
            >
              <Image src={src} fill className="object-cover" alt="" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 9. DAY IN LIFE ───────────────────────────────────────────────── */}
      <section
        className="py-24 px-8 sm:px-12 lg:px-16"
        style={{ backgroundColor: "var(--demo-dark)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
          <div className="w-full lg:w-7/12">
            <motion.span
              className="inline-block px-5 py-2 bg-white/15 text-white text-xs font-semibold rounded-full font-secondary mb-7 uppercase tracking-wider"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" as const }}
            >
              {timeline.eyebrow}
            </motion.span>

            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white font-heading mb-10 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" as const }}
            >
              {timeline.heading}
              <br />
              <span className="text-white/60">{timeline.headingSub}</span>
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
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. TESTIMONIALS / TRUST ──────────────────────────────────────── */}
      <section className="bg-[var(--demo-light-bg)] py-24 px-8 sm:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-5 uppercase tracking-wider">
              {config.socialProof.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading mb-4">
              {config.socialProof.heading}
            </h2>
            <p className="text-gray-500 font-secondary text-lg max-w-lg mx-auto">
              {config.socialProof.subtitle}
            </p>
          </motion.div>

          {config.socialProof.type === "testimonials" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.socialProof.items.map((t, i) => (
                <motion.div
                  key={t.name}
                  className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" as const }}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
                >
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[var(--demo-primary)] text-[var(--demo-primary)]" />
                    ))}
                  </div>
                  <blockquote className="text-base text-gray-700 font-secondary leading-relaxed italic mb-7 flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[var(--demo-light-bg)]">
                      <Image src={t.avatar} fill className="object-cover" alt="" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 font-heading">{t.name}</p>
                      <p className="text-xs text-gray-400 font-secondary">{t.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.socialProof.items.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" as const }}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
                >
                  {item.icon && (
                    <div className="w-12 h-12 rounded-xl bg-[var(--demo-light-bg)] flex items-center justify-center mb-5">
                      <DemoIcon name={item.icon} className="w-6 h-6 text-[var(--demo-accent-text)]" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 font-heading mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-secondary leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── 11. FOUNDER ──────────────────────────────────────────────────── */}
      <section className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-page-bg)" }}>
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
              <div className="absolute top-7 right-7 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-xs text-gray-400 font-secondary font-semibold uppercase tracking-wider">
                  {config.founder.imageBadge.label}
                </p>
                <p className="text-sm font-bold text-gray-900 font-heading mt-0.5">
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
            <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary uppercase tracking-wider">
              {config.founder.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading leading-tight">
              {config.founder.heading}
              <br />
              <em className="text-[var(--demo-primary)] not-italic">{config.founder.headingAccent}</em>
            </h2>
            {config.founder.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="text-base text-gray-600 leading-relaxed font-secondary">
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
            <div className="bg-[color-mix(in_srgb,var(--demo-primary)_8%,transparent)] rounded-2xl border-l-4 border-[var(--demo-primary)] p-6">
              <p className="text-sm text-gray-700 font-secondary leading-relaxed">
                &ldquo;{config.founder.quote}&rdquo;
              </p>
              <p className="text-xs text-gray-400 font-secondary mt-2 uppercase tracking-wider">
                {config.founder.quoteAttribution}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 12. FULL-BLEED BAND ──────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 scale-[1.05]">
          <Image src={config.parallax.backgroundImage} fill className="object-cover" alt="" />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--demo-dark) 75%, transparent)" }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto px-8"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" as const }}
        >
          <p className="text-[color-mix(in_srgb,var(--demo-primary)_80%,transparent)] font-semibold text-xs uppercase tracking-widest font-secondary mb-7">
            {config.parallax.eyebrow}
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight mb-8">
            {config.parallax.heading.map((line, i) => (
              <span key={line}>
                {line}
                {i < config.parallax.heading.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="text-lg text-white/55 font-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            {config.parallax.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleDiscoveryCallClick}
              className="px-8 py-4 bg-[var(--demo-primary)] hover:bg-[var(--demo-primary-hover)] text-white font-semibold rounded-xl font-secondary transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-2 cursor-pointer"
            >
              {config.parallax.primaryCta}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/18 text-white font-semibold rounded-xl font-secondary transition-all duration-200 border border-white/25 cursor-pointer">
              {config.parallax.secondaryCta}
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── 13. PILLARS ──────────────────────────────────────────────────── */}
      <section className="bg-[var(--demo-light-bg)] py-24 px-8 sm:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-5 uppercase tracking-wider">
              {config.pillars.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading mb-4">
              {config.pillars.heading}
            </h2>
            <p className="text-gray-500 font-secondary text-lg max-w-xl mx-auto">
              {config.pillars.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {config.pillars.items.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" as const }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.07)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--demo-light-bg)] group-hover:bg-[var(--demo-light-border)] transition-colors flex items-center justify-center mb-6">
                  <DemoIcon name={pillar.icon} className="w-6 h-6 text-[var(--demo-accent-text)]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-heading mb-3">{pillar.title}</h3>
                <p className="text-sm text-gray-500 font-secondary leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. ENROLLMENT FORM ──────────────────────────────────────────── */}
      <section
        ref={formSectionRef}
        className="py-0 overflow-hidden"
        style={{ backgroundColor: "var(--demo-dark)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row">
          <motion.div
            className="hidden lg:block lg:w-1/2 relative min-h-[640px]"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
          >
            <Image src={config.form.sidebarImage} fill className="object-cover" alt="" />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "color-mix(in srgb, var(--demo-dark) 60%, transparent)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-14">
              <div className="text-center">
                <span className="block text-5xl text-[color-mix(in_srgb,var(--demo-primary)_40%,transparent)] font-heading mb-4 select-none">
                  &ldquo;
                </span>
                <p className="text-white text-2xl md:text-3xl font-heading font-bold leading-snug italic">
                  {config.form.sidebarQuote}
                </p>
                <div className="w-12 h-0.5 bg-[color-mix(in_srgb,var(--demo-primary)_50%,transparent)] mx-auto mt-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="w-full lg:w-1/2 px-8 sm:px-12 py-20 flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" as const }}
          >
            <span className="inline-block px-5 py-2 bg-[color-mix(in_srgb,var(--demo-primary)_20%,transparent)] text-[var(--demo-primary)] text-xs font-semibold rounded-full font-secondary mb-7 uppercase tracking-wider self-start">
              {config.form.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4 leading-tight">
              {config.form.heading}
            </h2>
            <p className="text-white/55 font-secondary text-base mb-10 leading-relaxed">
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
                  className="text-center py-10"
                >
                  <div className="text-5xl mb-5">{config.form.successEmoji}</div>
                  <p className="text-white text-2xl font-heading font-bold mb-3">
                    {config.form.successTitle}
                  </p>
                  <p className="text-white/50 font-secondary">{config.form.successMessage}</p>
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
                    className="w-full px-5 py-4 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/30 font-secondary focus:outline-none focus:border-[var(--demo-primary)] transition-colors duration-200 text-base"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full px-5 py-4 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/30 font-secondary focus:outline-none focus:border-[var(--demo-primary)] transition-colors duration-200 text-base"
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
                        className="w-full px-5 py-4 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/30 font-secondary focus:outline-none focus:border-[var(--demo-primary)] transition-colors duration-200 text-base"
                      />
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData((p) => ({ ...p, grade: e.target.value }))}
                        required
                        className="w-full px-5 py-4 rounded-xl border border-white/15 text-white font-secondary focus:outline-none focus:border-[var(--demo-primary)] transition-colors duration-200 appearance-none cursor-pointer text-base"
                        style={{ backgroundColor: "var(--demo-dark-hover)" }}
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
                    className="w-full px-5 py-4 rounded-xl border border-white/15 text-white font-secondary focus:outline-none focus:border-[var(--demo-primary)] transition-colors duration-200 appearance-none cursor-pointer text-base"
                    style={{ backgroundColor: "var(--demo-dark-hover)" }}
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
                  <button
                    type="submit"
                    className="w-full py-4 bg-[var(--demo-primary)] hover:bg-[var(--demo-primary-hover)] text-white font-bold rounded-xl font-secondary transition-all duration-200 shadow-xl hover:shadow-2xl text-base cursor-pointer mt-2"
                  >
                    {config.form.submitLabel}
                  </button>
                  <p className="text-center text-white/25 font-secondary text-xs pt-1">
                    {config.form.disclaimer}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ─── 15. FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-page-bg)" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
          >
            <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-5 uppercase tracking-wider">
              {config.faq.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading mb-4">
              {config.faq.heading}
            </h2>
            <p className="text-gray-500 font-secondary text-lg max-w-lg">{config.faq.subtitle}</p>
          </motion.div>

          <div>
            {config.faq.items.map((faq, i) => (
              <motion.div
                key={faq.q}
                className="border-b border-gray-100 last:border-0"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" as const }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={`w-full flex items-center justify-between py-6 text-left group cursor-pointer transition-colors duration-200 ${
                    openFaq === i
                      ? "text-[var(--demo-dark)]"
                      : "text-gray-700 hover:text-[var(--demo-accent-text)]"
                  }`}
                >
                  <span className="text-base md:text-lg font-semibold font-heading pr-6">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`text-2xl font-light flex-shrink-0 w-7 text-center leading-none transition-colors ${
                      openFaq === i ? "text-[var(--demo-primary)]" : "text-gray-300"
                    }`}
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
                      <p className="pb-7 text-gray-500 font-secondary text-base leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 15.5. CLOSING CTA ────────────────────────────────────────────── */}
      <section className="bg-[var(--demo-light-bg)] py-20 px-8 sm:px-12 lg:px-16 border-t border-[var(--demo-light-border)]">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        >
          <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-6 uppercase tracking-wider">
            {config.closingCta.eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading mb-5 leading-tight">
            {config.closingCta.heading}
            <br />
            <em className="text-[var(--demo-primary)] not-italic">{config.closingCta.headingAccent}</em>
          </h2>
          <p className="text-base text-gray-500 font-secondary leading-relaxed mb-10 max-w-lg mx-auto">
            {config.closingCta.description}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleDiscoveryCallClick}
              className="px-8 py-3.5 text-white font-semibold rounded-lg font-secondary transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: "var(--demo-dark)" }}
            >
              {config.closingCta.primaryCta}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3.5 border border-[var(--demo-light-border)] text-[var(--demo-accent-text)] hover:bg-[var(--demo-light-bg)] font-semibold rounded-lg font-secondary transition-all duration-200 cursor-pointer">
              {config.closingCta.secondaryCta}
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── 16. FOOTER ───────────────────────────────────────────────────── */}
      <footer className="py-16 px-8 text-white" style={{ backgroundColor: "var(--demo-dark)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Image
                src={config.logo.src}
                alt={config.logo.alt}
                width={config.logo.width ?? 140}
                height={config.logo.height ?? 36}
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-white/35 font-secondary text-sm">{config.footer.tagline}</p>
          </div>

          <div className="w-14 h-px bg-white/10 mx-auto mb-8" />

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-8">
            {config.footer.links.map((link) => (
              <button
                key={link}
                className="text-white/40 hover:text-white font-secondary text-sm transition-colors duration-200 cursor-pointer"
              >
                {link}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-5 mb-10">
            <button className="text-white/30 hover:text-white transition-colors duration-200 cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="text-white/30 hover:text-white transition-colors duration-200 cursor-pointer">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-white/20 font-secondary text-xs">
            {config.footer.copyright} &nbsp;·&nbsp; {config.footer.poweredBy}
          </p>
        </div>
      </footer>
    </div>
  );
}
