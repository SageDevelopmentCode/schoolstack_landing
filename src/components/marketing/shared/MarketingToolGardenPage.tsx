"use client";

import type { ReactNode } from "react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Draw, Leaf } from "@/components/garden/ui";
import GardenOurStory from "@/components/about-garden/GardenOurStory";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenModuleDemo from "@/components/home-garden/GardenModuleDemo";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { scrollToBookDemoSection } from "@/lib/marketing/book-demo-hash-context";
import { PRODUCT_SHOWCASE_SECTION_COPY } from "@/lib/marketing/showcase-section-copy";

/** "See it in action": the module cards drive the live product. */
function ToolProductBand() {
  return (
    <section
      aria-label={PRODUCT_SHOWCASE_SECTION_COPY.eyebrow}
      className="relative overflow-hidden bg-[var(--sf-paper)] py-24 lg:py-32"
    >
      <Draw className="absolute right-[8%] top-20 hidden w-14 lg:block">
        <Leaf />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          lead={PRODUCT_SHOWCASE_SECTION_COPY.heading}
          accent={PRODUCT_SHOWCASE_SECTION_COPY.headingAccent}
          squiggle="var(--sf-butter)"
          align="left"
          headingClassName="text-5xl md:text-6xl"
          body={<p>{PRODUCT_SHOWCASE_SECTION_COPY.body}</p>}
        />
        <div className="mt-14">
          <GardenModuleDemo
            idPrefix="tool-tail"
            aside={
              <button
                type="button"
                onClick={scrollToBookDemoSection}
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

/**
 * A free tool page in Garden: the tool itself (it owns the page h1), then the
 * shared tail — the live product, the founders' story and the booking flow.
 */
export default function MarketingToolGardenPage({ children }: { children: ReactNode }) {
  return (
    <HomeGardenShell>
      {children}
      <ToolProductBand />
      <GardenOurStory ctaVariant="same-page" heading="get-started" className="bg-[var(--sf-mint)]/45" />
      <GardenBookDemo className="bg-[var(--sf-cream)]" />
    </HomeGardenShell>
  );
}
