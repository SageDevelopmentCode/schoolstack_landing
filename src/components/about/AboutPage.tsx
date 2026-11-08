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
import {
  ACCENT_HIGHLIGHT,
  BOLD_HEADING,
  DARK_PILL,
  OUTLINE_PILL,
} from "@/components/home/bright-styles";
import { BOOK_DEMO_HREF } from "@/lib/marketing/book-demo";

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
                className={`font-secondary text-sm transition-colors duration-150 ${
                  layout === "sidebar"
                    ? `block w-full border-l-2 py-1.5 pl-3 text-left ${
                        active
                          ? "border-clay font-semibold text-[#1d1a16]"
                          : "border-transparent text-[#1d1a16]/55 hover:text-[#1d1a16]"
                      }`
                    : active
                      ? "font-semibold text-[#1d1a16]"
                      : "text-[#1d1a16]/55 hover:text-[#1d1a16]"
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
      <section className="border-b border-black/8 bg-white pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pb-20">
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-8">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              About MudKitchen
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h1
              className={`mt-4 max-w-[720px] text-[clamp(2rem,4.5vw,3.2rem)] ${BOLD_HEADING}`}
            >
              We didn&apos;t start with a software company.{" "}
              <span className={ACCENT_HIGHLIGHT}>We started with a school.</span>
            </h1>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="mt-5 max-w-[600px] font-secondary text-[17px] leading-relaxed text-[#1d1a16]/70">
              MudKitchen is built by Julius Cecilia and Sabrina Obnamia — microschool
              founders who needed one connected system to open and run Sage Field in
              Round Rock, Texas.
            </p>
          </FadeInView>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 pb-8 lg:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(140px,180px)_1fr] lg:items-start lg:gap-12 xl:gap-16 lg:pt-10">
          <SectionNav
            layout="sidebar"
            activeTab={activeTab}
            onSelect={scrollToSection}
            className="sticky top-[100px] hidden self-start lg:block"
          />

          <div className="min-w-0">
            <SectionNav
              layout="inline"
              activeTab={activeTab}
              onSelect={scrollToSection}
              className="sticky top-[72px] z-30 -mx-6 mb-6 border-b border-black/8 bg-white/90 px-6 py-3 backdrop-blur-md lg:hidden"
            />

            <section
              id="our-story"
              ref={storyRef}
              className="scroll-mt-24 pb-16 pt-0"
            >
              <AboutOurStorySection ctaVariant="about" />
            </section>

            <section
              id="platform"
              ref={platformRef}
              className="scroll-mt-24 border-t border-black/8 pt-8"
            >
              <GetStartedShowcaseCarousel variant="embedded" />
              <div className="pb-16 pt-12 lg:pb-20 lg:pt-14">
                <FadeInView>
                  <div className="mb-4 flex items-center gap-2 text-clay">
                    <Layers size={18} aria-hidden />
                    <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest">
                      The platform
                    </p>
                  </div>
                </FadeInView>
                <FadeInView delay={0.06}>
                  <h2
                    className={`max-w-[640px] text-[clamp(1.75rem,3.5vw,2.5rem)] ${BOLD_HEADING}`}
                  >
                    One system for the people who{" "}
                    <span className={ACCENT_HIGHLIGHT}>run a microschool.</span>
                  </h2>
                </FadeInView>
                <FadeInView delay={0.1}>
                  <p className="mt-5 max-w-[640px] font-secondary text-[17px] leading-relaxed text-[#1d1a16]/70">
                    MudKitchen brings enrollment, tuition and billing, parent communication,
                    student records, and daily school operations into one platform — built
                    inside a real microschool to replace the patchwork of spreadsheets, form
                    builders, and disconnected tools founders typically stitch together.
                  </p>
                </FadeInView>

                <FadeInView delay={0.14} className="mt-12">
                  <h3 className="mb-4 font-secondary text-xl font-bold text-[#1d1a16]">
                    Who it&apos;s for
                  </h3>
                  <p className="mb-8 max-w-[640px] font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
                    Microschool founders, school administrators, and private school operators who
                    need parents, teachers, and admins aligned in one system — whether you are
                    launching a new program or running an established school.
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                          className="rounded-[24px] border border-black/8 bg-white p-6 shadow-[0_12px_40px_rgba(30,60,30,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(30,60,30,0.08)]"
                        >
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F1EC]">
                            <Icon size={18} className="text-clay" aria-hidden />
                          </div>
                          <h4 className="font-secondary text-lg font-bold text-[#1d1a16]">
                            {card.title}
                          </h4>
                          <p className="mt-2 font-secondary text-[15px] leading-relaxed text-[#1d1a16]/70">
                            {card.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </FadeInView>

                <FadeInView delay={0.18} className="mt-16">
                  <h3 className="mb-6 font-secondary text-xl font-bold text-[#1d1a16]">
                    What&apos;s included
                  </h3>
                  <AboutFeatureChipGrid items={CORE_FEATURE_CHIPS} />
                </FadeInView>

                <FadeInView
                  delay={0.22}
                  className="mt-14 flex flex-col flex-wrap gap-3 sm:flex-row"
                >
                  <Link href="/#product" className={OUTLINE_PILL}>
                    See the product on the homepage
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                  <Link href={BOOK_DEMO_HREF} className={DARK_PILL}>
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
