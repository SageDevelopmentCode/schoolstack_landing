"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import AboutFeatureChipGrid from "@/components/about/AboutFeatureChipGrid";
import { BUILT_CAPABILITY_CHIPS } from "@/components/about/about-feature-chips";
import { FOUNDER_PORTRAITS } from "@/components/about/about-copy";
import { scrollToBookDemoSection } from "@/lib/marketing/book-demo-hash-context";

const SAGE_FIELD_URL = "https://sagefield.co/";

export const GET_STARTED_DEMO_SECTION_ID = "get-started-demo";

export type AboutOurStoryCtaVariant = "about" | "get-started" | "same-page";

type AboutOurStorySectionProps = {
  ctaVariant: AboutOurStoryCtaVariant;
  showSrHeading?: boolean;
};

function scrollToGetStartedDemo() {
  const el = document.getElementById(GET_STARTED_DEMO_SECTION_ID);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function AboutOurStorySection({
  ctaVariant,
  showSrHeading = true,
}: AboutOurStorySectionProps) {
  return (
    <>
      {showSrHeading ? <h2 className="sr-only">Our story</h2> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {[FOUNDER_PORTRAITS.julius, FOUNDER_PORTRAITS.sabrina].map(
          (founder, i) => (
            <FadeInView key={founder.name} delay={i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-bg shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={founder.src}
                    alt={founder.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                    aria-hidden
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-display text-xl text-white">{founder.name}</p>
                    <p className="text-sm text-white/75 font-secondary mt-0.5">
                      {founder.role} · {founder.focus}
                    </p>
                  </div>
                </div>
              </div>
            </FadeInView>
          ),
        )}
      </div>

      <div className="max-w-[720px] space-y-6 text-[17px] font-secondary text-text-muted leading-relaxed">
        <FadeInView>
          <p className="text-text text-[19px] font-display leading-snug">
            In May 2026, we founded{" "}
            <a
              href={SAGE_FIELD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-clay inline-flex items-center gap-1 hover:underline underline-offset-2"
            >
              Sage Field Private Microschool
              <ExternalLink size={14} className="shrink-0" aria-hidden />
            </a>
            , an outdoor-focused private microschool for children ages 4–11 in Round Rock,
            Texas.
          </p>
        </FadeInView>
        <FadeInView delay={0.05}>
          <p>
            Getting the school off the ground meant building more than a learning
            environment. We needed a website, an application and enrollment process, a way
            to manage tuition, tools for communicating with families, and systems to keep
            the school running. We needed all of it to work together, without stretching
            our startup budget.
          </p>
        </FadeInView>
        <FadeInView delay={0.08}>
          <p>
            As a software engineer, Julius began looking for tools that could meet those
            needs. But the options we found were often difficult to use or hard to adapt
            to the way we wanted to run our school. Managing tuition and application
            flows felt more complicated than it needed to be, and our specific needs
            didn&apos;t always fit the systems available.
          </p>
        </FadeInView>
        <FadeInView delay={0.1}>
          <p className="font-display text-text text-[1.35rem] leading-snug">
            So we built our own.
          </p>
        </FadeInView>
      </div>

      <FadeInView delay={0.12} className="mt-10">
        <AboutFeatureChipGrid items={BUILT_CAPABILITY_CHIPS} />
      </FadeInView>

      <FadeInView
        delay={0.14}
        className="mt-10 max-w-[720px] space-y-6 text-[17px] font-secondary text-text-muted leading-relaxed"
      >
        <p>
          Julius developed our website, parent portal, and mobile app, along with tools
          for applications, enrollment, tuition, and family communication. We built
          systems for marketing, tours, and shadow days, plus teacher dashboards, school
          administration, finances, and automations.
        </p>
        <p>
          This wasn&apos;t software built around a hypothetical school. It was software we
          used to open and operate our own—supporting the same families, teachers, and
          daily responsibilities we were managing ourselves.
        </p>
      </FadeInView>

      <FadeInView delay={0.16} className="mt-12">
        <div
          className="rounded-2xl border border-white/10 px-8 py-10 text-center"
          style={{ backgroundColor: "#1a3327" }}
        >
          <p className="font-display text-[clamp(2.5rem,6vw,3.5rem)] leading-none text-white">
            0 → 40
          </p>
          <p className="text-white/70 font-secondary mt-2 text-[17px]">
            enrolled students in our first three months
          </p>
          <p className="text-white/55 font-secondary mt-4 text-[15px] max-w-[480px] mx-auto leading-relaxed">
            The software helped support that growth by bringing the work of running our
            school into one connected system.
          </p>
        </div>
      </FadeInView>

      <FadeInView
        delay={0.18}
        className="mt-10 max-w-[720px] space-y-6 text-[17px] font-secondary text-text-muted leading-relaxed"
      >
        <p>
          From the beginning, though, we were building with other microschools in mind.
          We wanted a product that could grow beyond Sage Field and help founders facing
          the same challenges: keeping costs manageable, welcoming new families,
          collecting tuition, supporting teachers, and making their systems fit their
          school—not the other way around.
        </p>
        <p className="text-text">
          That&apos;s why we&apos;re building this company. We know what it takes to start a
          microschool because we&apos;re doing it ourselves. And we believe the software
          behind a school should make that work easier, leaving founders more time for the
          children, families, and communities they set out to serve.
        </p>
      </FadeInView>

      <FadeInView delay={0.2} className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
        {ctaVariant === "about" ? (
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-clay text-white text-sm font-medium font-secondary px-6 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            Book a demo
            <ArrowRight size={16} aria-hidden />
          </Link>
        ) : ctaVariant === "get-started" ? (
          <button
            type="button"
            onClick={scrollToGetStartedDemo}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-clay text-white text-sm font-medium font-secondary px-6 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            Schedule your demo
            <ArrowRight size={16} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={scrollToBookDemoSection}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-clay text-white text-sm font-medium font-secondary px-6 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            Schedule your demo
            <ArrowRight size={16} aria-hidden />
          </button>
        )}
        <Link
          href="/customers/sagefield"
          className="inline-flex items-center justify-center gap-2 rounded-pill border border-border bg-bg text-sm font-medium font-secondary text-text px-6 h-11 hover:bg-surface transition-colors duration-200"
        >
          Read the Sage Field story
        </Link>
        <a
          href={SAGE_FIELD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-pill border border-border bg-bg text-sm font-medium font-secondary text-text-muted px-6 h-11 hover:text-text hover:bg-surface transition-colors duration-200"
        >
          Visit sagefield.co
          <ExternalLink size={14} aria-hidden />
        </a>
      </FadeInView>
    </>
  );
}
