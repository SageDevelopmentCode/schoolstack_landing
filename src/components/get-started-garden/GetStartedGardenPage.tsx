"use client";

import { useState } from "react";
import type { GetStartedDemoStep } from "@/components/get-started/GetStartedDemoFlow";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Draw, Leaf } from "@/components/garden/ui";
import GardenOurStory from "@/components/about-garden/GardenOurStory";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenBrowserFrame from "@/components/home-garden/GardenBrowserFrame";
import GardenModuleDemo from "@/components/home-garden/GardenModuleDemo";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { GET_STARTED_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";
import { GET_STARTED_FILM_COPY, GET_STARTED_FILM_YOUTUBE_EMBED_SRC } from "@/lib/marketing/get-started-film";
import { PRODUCT_SHOWCASE_SECTION_COPY } from "@/lib/marketing/showcase-section-copy";

/** Film heading. Words unchanged from the previous /get-started page. */
const FILM_HEADING = { lead: "Before your demo,", accent: "watch how it works." } as const;

function scrollToFlow() {
  const el = document.getElementById(GET_STARTED_DEMO_SECTION_ID);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
}

function ProductBand() {
  return (
    <section aria-label={PRODUCT_SHOWCASE_SECTION_COPY.eyebrow} className="sf-grid relative overflow-hidden pb-16 pt-32 lg:pb-24 lg:pt-40">
      <Draw className="absolute right-[8%] top-28 hidden w-14 lg:block" delay={0.8}>
        <Leaf />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div>
          <SectionIntro
            pill={`🧺 ${PRODUCT_SHOWCASE_SECTION_COPY.eyebrow}`}
            tint="forest"
            lead={PRODUCT_SHOWCASE_SECTION_COPY.heading}
            accent={PRODUCT_SHOWCASE_SECTION_COPY.headingAccent}
            squiggle="var(--sf-butter)"
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{PRODUCT_SHOWCASE_SECTION_COPY.body}</p>}
          />
        </div>
        <div className="mt-14">
          <GardenModuleDemo
            idPrefix="get-started"
            aside={
              <button
                type="button"
                onClick={scrollToFlow}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-[var(--sf-ink)]/30 px-4 py-3 font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:border-[var(--sf-clay)] hover:bg-[var(--sf-peach)]/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                Book a Demo <span aria-hidden="true">↓</span>
              </button>
            }
          />
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
            pill={`🎬 ${GET_STARTED_FILM_COPY.kicker}`}
            tint="clay"
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
      </div>
    </section>
  );
}

/**
 * /get-started in Garden: the module cards drive the live product, then the
 * real booking flow on notebook paper (its form title is the page h1), the
 * product film and the founders' story.
 */
export default function GetStartedGardenPage() {
  const [step, setStep] = useState<GetStartedDemoStep>(0);

  return (
    <HomeGardenShell>
      {step === 0 ? <ProductBand /> : <div className="h-24 lg:h-28" aria-hidden="true" />}
      <GardenBookDemo
        id={GET_STARTED_DEMO_SECTION_ID}
        scrollOnStepChange="window"
        onStepChange={setStep}
        introHeadingAs="h1"
        className="bg-[var(--sf-mint)]/45"
      />
      <Film />
      <GardenOurStory ctaVariant="get-started" heading="get-started" className="bg-[var(--sf-cream)]" />
    </HomeGardenShell>
  );
}
