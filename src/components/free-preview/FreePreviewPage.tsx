"use client";

import FunnelGardenShell from "@/components/garden/FunnelGardenShell";
import { Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Squiggle, Star, Sun, Tape, Tick } from "@/components/garden/ui";
import GardenFaq from "@/components/home-garden/GardenFaq";
import SectionIntro from "@/components/home-garden/SectionIntro";
import StoryTicket from "@/components/home-garden/sections/StoryTicket";
import CustomDemoRequestForm from "@/components/lead-magnets/CustomDemoRequestForm";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import { FREE_PREVIEW_COPY as COPY, FREE_PREVIEW_FORM_ID } from "./free-preview-copy";
import FreePreviewShowcase from "./FreePreviewShowcase";

const FOOTER_LINKS = [
  { label: COPY.footer.privacy, href: "/privacy" },
  { label: COPY.footer.terms, href: "/terms" },
  { label: COPY.footer.home, href: "/" },
];

/** The request form on notebook paper; used in the hero and again at the bottom. */
function FormCard({ placement, id, headingAs: Heading = "h2" }: { placement: string; id?: string; headingAs?: "h2" | "h3" }) {
  return (
    <div id={id} className="relative scroll-mt-28" style={{ rotate: "0.6deg" }}>
      <div className="sf-paper relative rounded-[32px] border-2 border-[var(--sf-ink)] p-5 shadow-[0_10px_0_0_var(--sf-ink)] sm:p-8">
        <Tape color="var(--sf-lav)" className="-top-3 left-12 w-24 -rotate-6" />
        <Tape color="var(--sf-butter)" className="-top-3 right-12 w-20 rotate-3" />
        <Heading className="sf-display mb-6 text-3xl leading-[1.05] text-[var(--sf-ink)]">{COPY.hero.formTitle}</Heading>
        <CustomDemoRequestForm placement={placement} bookDemoHref={GET_STARTED_PAGE_PATH} />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section aria-label={COPY.hero.pill} className="sf-grid relative overflow-hidden pb-20 pt-28 lg:pb-28 lg:pt-36">
      <Draw className="absolute left-[44%] top-24 hidden w-16 lg:block" delay={0.8}>
        <Sun />
      </Draw>
      <div className="mx-auto grid max-w-[1320px] items-start gap-12 px-6 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-12">
        <div className="relative z-10 lg:pt-6">
          <h1 className="sf-display text-[12vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[4.2rem] xl:text-[4.75rem]">
            <WordsReveal as="span" text={COPY.hero.lead} immediate className="block" />
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={COPY.hero.accent} immediate delay={0.25} />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{COPY.hero.body}</p>
          <ul className="mt-7 space-y-3">
            {COPY.hero.ticks.map((tick) => (
              <li key={tick} className="flex items-center gap-3 text-[16px] font-bold text-[var(--sf-ink)]/85">
                <Tick className="h-6 w-6 shrink-0" />
                {tick}
              </li>
            ))}
          </ul>
          <p aria-hidden="true" className="sf-hand mt-6 hidden -rotate-2 text-2xl text-[var(--sf-forest)] lg:block">
            {COPY.hero.note} →
          </p>
        </div>
        <FormCard placement="free-preview-hero" id={FREE_PREVIEW_FORM_ID} />
      </div>
    </section>
  );
}

function WhatYouGet() {
  return (
    <section className="relative bg-[var(--sf-paper)] py-24 lg:py-32">
      <Draw className="absolute right-[7%] top-20 hidden w-12 lg:block" delay={0.4}>
        <Star color="var(--sf-clay)" />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          lead={COPY.whatYouGet.lead}
          accent={COPY.whatYouGet.accent}
          accentColor="text-[var(--sf-forest)]"
          squiggle="var(--sf-mint)"
          headingClassName="text-5xl md:text-6xl"
          body={<p>{COPY.whatYouGet.body}</p>}
        />
        <div className="mt-16">
          <FreePreviewShowcase />
        </div>
      </div>
    </section>
  );
}

const STEP_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-sky)]"] as const;

function HowItWorks() {
  return (
    <section className="relative bg-[var(--sf-lav)]/40 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          lead={COPY.steps.lead}
          accent={COPY.steps.accent}
          headingClassName="text-5xl md:text-6xl"
        />
        <Reveal as="ol" className="mt-16 grid gap-8 md:grid-cols-3" stagger={0.12} y={40}>
          {COPY.steps.items.map((step, i) => (
            <li
              key={step.n}
              className={`relative rounded-[26px] border-2 border-[var(--sf-ink)] ${STEP_TINTS[i]} p-7 shadow-[0_6px_0_0_var(--sf-ink)]`}
              style={{ rotate: i % 2 ? "0.8deg" : "-0.8deg" }}
            >
              <p aria-hidden="true" className="sf-hand text-xl text-[var(--sf-forest)]">
                step {step.n}
              </p>
              <h3 className="sf-display mt-2 text-3xl leading-[1.05] text-[var(--sf-ink)]">{step.title}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--sf-ink)]/80">{step.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="relative bg-[var(--sf-sky)]/45 py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-12">
        <div>
          <SectionIntro
            lead={COPY.closing.lead}
            accent={COPY.closing.accent}
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{COPY.closing.body}</p>}
          />
          <p className="mt-8 text-[15px] font-bold text-[var(--sf-soft)]">
            {COPY.closing.altLead}{" "}
            <a
              href={GET_STARTED_PAGE_PATH}
              className="text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] underline-offset-4 hover:decoration-[var(--sf-clay)]"
            >
              {COPY.closing.altCta}
            </a>
          </p>
        </div>
        <FormCard placement="free-preview-closing" headingAs="h3" />
      </div>
    </section>
  );
}

/** /free-preview: the ad landing page for the custom preview offer. One goal: the form. */
export default function FreePreviewPage() {
  return (
    <FunnelGardenShell ctaLabel={COPY.headerCta} ctaShortLabel={COPY.headerCtaShort} ctaHref={`#${FREE_PREVIEW_FORM_ID}`} footerLinks={FOOTER_LINKS}>
      <Hero />
      <WhatYouGet />
      <HowItWorks />
      <StoryTicket />
      <GardenFaq items={COPY.faq.items} copy={COPY.faq.copy} idPrefix="free-preview-faq" className="bg-[var(--sf-cream)]" />
      <Closing />
    </FunnelGardenShell>
  );
}
