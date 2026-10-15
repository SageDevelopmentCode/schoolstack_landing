"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Layers,
  Sparkles,
} from "lucide-react";
import AboutOurStorySection from "@/components/about/AboutOurStorySection";
import GetStartedShowcaseCarousel from "@/components/get-started/GetStartedShowcaseCarousel";
import { FadeInView } from "@/components/ui/FadeInView";
import AboutFeatureChipGrid from "@/components/about/AboutFeatureChipGrid";
import { CORE_FEATURE_CHIPS } from "@/components/about/about-feature-chips";
import { AUDIENCE_CARDS } from "@/components/about/about-copy";

type AboutTab = "our-story" | "platform";

const SECTION_LINKS: { id: AboutTab; label: string }[] = [
  { id: "our-story", label: "Our story" },
  { id: "platform", label: "The platform" },
];

function SectionNav({
  activeTab,
  onSelect,
  className,
  layout,
}: {
  activeTab: AboutTab;
  onSelect: (tab: AboutTab) => void;
  className?: string;
  layout: "sidebar" | "inline";
}) {
  return (
    <nav aria-label="On this page" className={className}>
      <ul
        className={
          layout === "inline"
            ? "flex flex-wrap items-center gap-x-6 gap-y-2"
            : "flex flex-col gap-1"
        }
      >
        {SECTION_LINKS.map((link) => {
          const active = activeTab === link.id;
          return (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => onSelect(link.id)}
                aria-current={active ? "true" : undefined}
                className={`text-sm font-secondary transition-colors duration-150 ${
                  layout === "sidebar"
                    ? `block w-full text-left py-1.5 pl-3 border-l-2 ${
                        active
                          ? "border-clay text-text font-medium"
                          : "border-transparent text-text-muted hover:text-text"
                      }`
                    : active
                      ? "text-text font-medium"
                      : "text-text-muted hover:text-text"
                }`}
              >
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<AboutTab>("our-story");
  const storyRef = useRef<HTMLElement>(null);
  const platformRef = useRef<HTMLElement>(null);
  const tabClickLock = useRef(false);

  const scrollToSection = useCallback((tab: AboutTab) => {
    const el = tab === "our-story" ? storyRef.current : platformRef.current;
    if (!el) return;
    tabClickLock.current = true;
    setActiveTab(tab);
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: "smooth" });
    window.setTimeout(() => {
      tabClickLock.current = false;
    }, 800);
  }, []);

  useEffect(() => {
    const sections: { id: AboutTab; el: HTMLElement | null }[] = [
      { id: "our-story", el: storyRef.current },
      { id: "platform", el: platformRef.current },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        if (tabClickLock.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        const id = visible.target.id as AboutTab;
        if (id === "our-story" || id === "platform") setActiveTab(id);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );

    for (const { el } of sections) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sage-900 border-b border-white/8 pt-[140px] pb-16 lg:pb-20">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-bg/25"
          aria-hidden
        />
        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-16">
          <FadeInView>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/10 text-white/75 text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5">
              About MudKitchen
            </span>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.08] text-white mt-5 max-w-[720px]">
              We didn&apos;t start with a software company.{" "}
              <em style={{ color: "#A05C45", fontStyle: "italic" }}>
                We started with a school.
              </em>
            </h1>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p
              className="text-[17px] font-secondary leading-relaxed mt-5 max-w-[600px]"
              style={{ color: "rgba(247, 241, 231, 0.75)" }}
            >
              MudKitchen is built by Julius Cecilia and Sabrina Obnamia — microschool
              founders who needed one connected system to open and run Sage Field in
              Round Rock, Texas.
            </p>
          </FadeInView>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-6 lg:px-16 pb-8">
        <div className="pt-10 lg:pt-12 lg:grid lg:grid-cols-[minmax(140px,180px)_1fr] lg:gap-12 xl:gap-16 lg:items-start">
          <SectionNav
            layout="sidebar"
            activeTab={activeTab}
            onSelect={scrollToSection}
            className="hidden lg:block sticky top-[100px] self-start"
          />

          <div className="min-w-0">
            <SectionNav
              layout="inline"
              activeTab={activeTab}
              onSelect={scrollToSection}
              className="lg:hidden sticky top-[72px] z-30 -mx-6 px-6 py-3 mb-6 bg-bg/90 backdrop-blur-md"
            />

            {/* Our story */}
            <section
              id="our-story"
              ref={storyRef}
              className="scroll-mt-24 pt-0 pb-16"
            >
              <AboutOurStorySection ctaVariant="about" />
            </section>

            {/* Platform */}
            <section
              id="platform"
              ref={platformRef}
              className="scroll-mt-24 border-t border-border"
            >
              <GetStartedShowcaseCarousel variant="embedded" />
              <div className="pt-12 lg:pt-14 pb-16 lg:pb-20">
          <FadeInView>
            <div className="flex items-center gap-2 text-accent mb-4">
              <Layers size={18} aria-hidden />
              <p className="text-[13px] font-medium uppercase tracking-widest text-text-muted">
                The platform
              </p>
            </div>
          </FadeInView>
          <FadeInView delay={0.06}>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] text-text max-w-[640px]">
              One system for the people who{" "}
              <em style={{ color: "#A05C45", fontStyle: "italic" }}>run a microschool.</em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.1}>
            <p className="text-[17px] font-secondary text-text-muted leading-relaxed mt-5 max-w-[640px]">
              MudKitchen brings enrollment, tuition and billing, parent communication,
              student records, and daily school operations into one platform — built
              inside a real microschool to replace the patchwork of spreadsheets, form
              builders, and disconnected tools founders typically stitch together.
            </p>
          </FadeInView>

          <FadeInView delay={0.14} className="mt-12">
            <h3 className="font-display text-xl text-text mb-4">Who it&apos;s for</h3>
            <p className="text-[16px] font-secondary text-text-muted leading-relaxed max-w-[640px] mb-8">
              Microschool founders, school administrators, and private school operators who
              need parents, teachers, and admins aligned in one system — whether you are
              launching a new program or running an established school.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AUDIENCE_CARDS.map((card) => {
                const Icon =
                  card.title === "Parents"
                    ? HeartHandshake
                    : card.title === "Teachers"
                      ? GraduationCap
                      : Sparkles;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-border bg-surface p-6 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center mb-4">
                      <Icon size={18} className="text-accent" aria-hidden />
                    </div>
                    <h4 className="font-display text-lg text-text">{card.title}</h4>
                    <p className="text-[15px] font-secondary text-text-muted leading-relaxed mt-2">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </FadeInView>

          <FadeInView delay={0.18} className="mt-16">
            <h3 className="font-display text-xl text-text mb-6">What&apos;s included</h3>
            <AboutFeatureChipGrid items={CORE_FEATURE_CHIPS} />
          </FadeInView>

          <FadeInView delay={0.22} className="mt-14 flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/#product"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-border bg-surface text-sm font-medium font-secondary text-text px-6 h-11 hover:bg-bg transition-colors duration-200"
            >
              See the product on the homepage
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-clay text-white text-sm font-medium font-secondary px-6 h-11 hover:opacity-90 transition-all duration-200"
            >
              Book a demo
            </Link>
          </FadeInView>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
