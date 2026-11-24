"use client";

import { useState } from "react";
import type { GetStartedDemoStep } from "@/components/get-started/GetStartedDemoFlow";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Draw, Leaf, btnPop } from "@/components/garden/ui";
import GardenOurStory from "@/components/about-garden/GardenOurStory";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import CustomDemoOffer from "@/components/lead-magnets/CustomDemoOffer";
import GardenBrowserFrame from "@/components/home-garden/GardenBrowserFrame";
import GardenModuleDemo from "@/components/home-garden/GardenModuleDemo";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { GET_STARTED_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";
import { scrollToGetStartedDemoSection } from "@/lib/marketing/book-demo-hash-context";
import { GET_STARTED_FILM_COPY, GET_STARTED_FILM_YOUTUBE_EMBED_SRC } from "@/lib/marketing/get-started-film";
import { PRODUCT_SHOWCASE_SECTION_COPY } from "@/lib/marketing/showcase-section-copy";
import GetStartedMobileBookBar from "./GetStartedMobileBookBar";

/** Film heading. Words unchanged from the previous /get-started page. */
const FILM_HEADING = { lead: "Before your demo,", accent: "watch how it works." } as const;

const GET_STARTED_DEMO_HASH_HREF = `#${GET_STARTED_DEMO_SECTION_ID}`;

const dashedBookDemoClassName =
  "flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-[var(--sf-ink)]/30 px-4 py-3 font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:border-[var(--sf-clay)] hover:bg-[var(--sf-peach)]/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

function DashedBookDemoButton() {
  return (
    <button type="button" onClick={scrollToGetStartedDemoSection} className={dashedBookDemoClassName}>
      Book a Demo <span aria-hidden="true">↑</span>
    </button>
  );
}

function ProductBand() {
  return (
    <section aria-label={PRODUCT_SHOWCASE_SECTION_COPY.eyebrow} className="sf-grid relative overflow-hidden py-24 lg:py-32">
      <Draw className="absolute right-[8%] top-20 hidden w-14 lg:block" delay={0.8}>
        <Leaf />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div>
          <SectionIntro
            lead={PRODUCT_SHOWCASE_SECTION_COPY.heading}
            accent={PRODUCT_SHOWCASE_SECTION_COPY.headingAccent}
            squiggle="var(--sf-butter)"
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{PRODUCT_SHOWCASE_SECTION_COPY.body}</p>}
          />
        </div>
        <div className="mt-14">
          <GardenModuleDemo idPrefix="get-started" aside={<DashedBookDemoButton />} />
        </div>
        {/* GardenModuleDemo only shows its aside from lg up. */}
        <div className="mt-8 lg:hidden">
          <DashedBookDemoButton />
        </div>
      </div>
    </section>
  );
}

function Film() {
  return (
    <section aria-label={GET_STARTED_FILM_COPY.kicker} className="bg-[var(--sf-peach)]/40 py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
        <div>
          <SectionIntro
            lead={FILM_HEADING.lead}
            accent={FILM_HEADING.accent}
            squiggle="var(--sf-butter)"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{GET_STARTED_FILM_COPY.subtitle}</p>}
          />
        </div>
        <GardenBrowserFrame label="MudKitchen · Product overview" tilt={-0.8} tape="var(--sf-mint)" tapeSide="left" className="mt-14">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={GET_STARTED_FILM_YOUTUBE_EMBED_SRC}
              title="MudKitchen product overview"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </GardenBrowserFrame>
        <div className="mt-14 text-center">
          <button type="button" onClick={scrollToGetStartedDemoSection} className={btnPop}>
            Book a Demo <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * /get-started in Garden: the real booking flow on notebook paper comes first
 * (its form title is the page h1), then the module cards driving the live
 * product, the custom demo offer, the product film and the founders' story.
 * Every section has a Book a Demo CTA that scrolls back up to the form, and on
 * phones a sticky footer bar does the same in place of the Questions button.
 */
export default function GetStartedGardenPage() {
  const [step, setStep] = useState<GetStartedDemoStep>(0);

  return (
    <HomeGardenShell
      bookDemoHref={GET_STARTED_DEMO_HASH_HREF}
      mobileBottomBar={<GetStartedMobileBookBar step={step} />}
    >
      {/* Desktop keeps a navbar spacer (the section's doodles need its top padding);
          below lg the form section clears the navbar with its own, tighter padding. */}
      <div className="hidden lg:block lg:h-28" aria-hidden="true" />
      <GardenBookDemo
        id={GET_STARTED_DEMO_SECTION_ID}
        scrollOnStepChange="window"
        onStepChange={setStep}
        introHeadingAs="h1"
        className="bg-[var(--sf-mint)]/45 !pt-24 sm:!pt-28 lg:!pt-28"
      />
      {step === 0 ? <ProductBand /> : null}
      {step === 0 ? <CustomDemoOffer variant="get-started" /> : null}
      <Film />
      <GardenOurStory ctaVariant="get-started" heading="get-started" className="bg-[var(--sf-cream)]" />
    </HomeGardenShell>
  );
}
