"use client";

import { Draw, Star, Tape, Tick, btnOutline } from "@/components/garden/ui";
import { Reveal } from "@/components/garden/motion";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { BOOK_DEMO_HASH_HREF, GET_STARTED_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";
import { scrollToGetStartedDemoSection } from "@/lib/marketing/book-demo-hash-context";
import CustomDemoRequestForm from "./CustomDemoRequestForm";
import { CUSTOM_DEMO_COPY, GET_STARTED_CUSTOM_DEMO_COPY } from "./lead-magnet-copy";

/** id of the home section; the lead popup watches it (and pricing) as its engagement trigger. */
export const CUSTOM_DEMO_SECTION_ID = "custom-preview";

/**
 * "See MudKitchen built for your school": the custom preview lead magnet. The copy is on
 * the left and the request form sits on notebook paper on the right.
 * - variant "home": sits between Setup and Pricing on the home page.
 * - variant "get-started": the "not ready to book?" alternative below the booking flow,
 *   with a Book a Demo button that scrolls back up to it.
 */
export default function CustomDemoOffer({
  variant = "home",
  className = "bg-[var(--sf-lav)]/40",
}: {
  variant?: "home" | "get-started";
  className?: string;
}) {
  const isHome = variant === "home";
  const heading = isHome ? CUSTOM_DEMO_COPY : GET_STARTED_CUSTOM_DEMO_COPY;
  const bookDemoHref = isHome ? BOOK_DEMO_HASH_HREF : `#${GET_STARTED_DEMO_SECTION_ID}`;

  return (
    <section
      id={isHome ? CUSTOM_DEMO_SECTION_ID : `${CUSTOM_DEMO_SECTION_ID}-get-started`}
      className={`relative scroll-mt-24 overflow-hidden py-24 lg:py-32 ${className}`}
    >
      <Draw className="absolute right-[6%] top-16 hidden w-12 lg:block" delay={0.4}>
        <Star color="var(--sf-clay)" />
      </Draw>
      <div className="mx-auto grid max-w-[1320px] items-start gap-14 px-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-16">
        <div className="lg:sticky lg:top-28">
          <SectionIntro
            pill={heading.pill}
            tint="clay"
            lead={heading.headlineLead}
            accent={heading.headlineAccent}
            accentColor="text-[var(--sf-clay)]"
            squiggle="var(--sf-butter)"
            note={CUSTOM_DEMO_COPY.note}
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{CUSTOM_DEMO_COPY.body}</p>}
          />
          <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
            {CUSTOM_DEMO_COPY.includesTitle}
          </p>
          <Reveal as="ul" className="mt-4 space-y-3" stagger={0.1} y={20}>
            {CUSTOM_DEMO_COPY.includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] leading-relaxed text-[var(--sf-ink)]/85">
                <Tick className="mt-0.5 h-6 w-6 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </Reveal>
          <p className="mt-6 inline-block -rotate-1 rounded-md bg-[var(--sf-butter)] px-3 py-1.5 text-sm font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] ring-2 ring-[var(--sf-ink)]">
            {CUSTOM_DEMO_COPY.promise}
          </p>
          {isHome ? null : (
            <div className="mt-8">
              <button type="button" onClick={scrollToGetStartedDemoSection} className={`${btnOutline} !px-6 !py-3 !text-sm`}>
                Book a Demo <span aria-hidden="true">↑</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative" style={{ rotate: "0.6deg" }}>
          <div className="sf-paper relative rounded-[32px] border-2 border-[var(--sf-ink)] p-5 shadow-[0_10px_0_0_var(--sf-ink)] sm:p-8">
            <Tape color="var(--sf-lav)" className="-top-3 left-12 w-24 -rotate-6" />
            <Tape color="var(--sf-butter)" className="-top-3 right-12 w-20 rotate-3" />
            <h3 className="sf-display mb-6 text-3xl leading-[1.05] text-[var(--sf-ink)]">{CUSTOM_DEMO_COPY.form.title}</h3>
            <CustomDemoRequestForm placement={isHome ? "home-section" : "get-started-section"} bookDemoHref={bookDemoHref} />
          </div>
        </div>
      </div>
    </section>
  );
}
