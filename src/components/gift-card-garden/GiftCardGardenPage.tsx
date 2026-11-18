"use client";

import Link from "next/link";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Magnetic, Reveal, WordsReveal } from "@/components/garden/motion";
import { Arrow, Draw, Leaf, Pill, Squiggle, Star, Sun, Tape, btnPop } from "@/components/garden/ui";
import GardenOurStory from "@/components/about-garden/GardenOurStory";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenFaq from "@/components/home-garden/GardenFaq";
import GardenModuleDemo from "@/components/home-garden/GardenModuleDemo";
import SectionIntro from "@/components/home-garden/SectionIntro";
import PricingPaper from "@/components/home-garden/sections/PricingPaper";
import { TAPES } from "@/components/home-garden/assets";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { scrollToBookDemoSection } from "@/lib/marketing/book-demo-hash-context";
import {
  GIFT_CARD_FAQ,
  GIFT_CARD_OFFER,
  GIFT_CARD_PAGE_COPY as COPY,
  GIFT_CARD_PROMO_ID,
  GIFT_CARD_STEPS,
  GIFT_CARD_TERMS_PATH,
} from "@/lib/marketing/gift-card-offer";
import { PRODUCT_SHOWCASE_SECTION_COPY } from "@/lib/marketing/showcase-section-copy";

const termsLinkClass =
  "font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--sf-clay)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

const STEP_NOTES = [
  { tint: "bg-[var(--sf-butter)]", tilt: -2 },
  { tint: "bg-[var(--sf-sky)]", tilt: 1.5 },
  { tint: "bg-[var(--sf-clay)] text-white", tilt: -1 },
] as const;

const FINE_PRINT_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-peach)]"] as const;

/** The offer as a big butter gift tag (web version of the ads' GiftTag). */
function GiftTag() {
  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <Draw className="absolute -right-4 -top-10 hidden w-14 sm:block" delay={0.9}>
        <Star />
      </Draw>
      <div
        className="relative rounded-[30px] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] py-9 pl-20 pr-8 shadow-[0_10px_0_0_var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 sm:pl-24"
        style={{ rotate: "-4deg" }}
      >
        <Tape color="var(--sf-peach)" className="-top-3 right-10 w-24 rotate-6" />
        {/* the tag's string hole */}
        <span
          aria-hidden="true"
          className="absolute left-7 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-cream)] sm:left-9"
        />
        <p aria-hidden="true" className="sf-hand text-2xl text-[var(--sf-clay-deep)]">
          for your microschool
        </p>
        <p className="sf-display mt-1 whitespace-nowrap text-[clamp(4.5rem,14vw,7.5rem)] leading-[0.9] text-[var(--sf-ink)]">
          {GIFT_CARD_OFFER.amount}
        </p>
        <p className="mt-3 text-xl font-extrabold leading-snug text-[var(--sf-ink)]">Amazon gift card</p>
        <p className="mt-1 text-[15px] font-extrabold leading-snug text-[var(--sf-clay-deep)]">
          when you start a paid plan within {GIFT_CARD_OFFER.signupWindowDays} days of your demo
        </p>
      </div>
    </div>
  );
}

function StepNotes() {
  return (
    <div className="relative mt-20 lg:mt-24">
      <h2 className="text-center text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--sf-soft)]">{COPY.stepsLabel}</h2>
      <div className="relative mt-12">
        <Draw className="pointer-events-none absolute left-[29%] top-[-2.5rem] hidden w-28 lg:block" delay={0.4}>
          <Arrow color="var(--sf-forest)" />
        </Draw>
        <Draw className="pointer-events-none absolute left-[63%] top-[-2.5rem] hidden w-28 lg:block" delay={0.9}>
          <Arrow color="var(--sf-forest)" />
        </Draw>
        <Reveal as="ol" className="grid gap-8 md:grid-cols-3 md:gap-7" stagger={0.15} y={50}>
          {GIFT_CARD_STEPS.map((s, i) => {
            const n = STEP_NOTES[i];
            const dark = i === 2;
            return (
              <li
                key={s.n}
                className={`sf-wiggle relative overflow-hidden rounded-md p-7 pt-9 shadow-[0_18px_34px_-18px_rgba(43,36,29,0.55)] ${n.tint}`}
                style={{ rotate: `${n.tilt}deg` }}
              >
                <span className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 rotate-2 rounded-b-sm bg-white/70" aria-hidden="true" />
                {dark ? (
                  <Draw className="absolute -bottom-6 -right-6 w-28 opacity-40">
                    <Leaf color="#fff" />
                  </Draw>
                ) : null}
                <span aria-hidden="true" className={`sf-hand text-xl ${dark ? "text-white/85" : "text-[var(--sf-ink)]/60"}`}>
                  step {s.n}
                </span>
                <h3 className={`sf-display mt-2 text-[1.9rem] leading-[1.02] ${dark ? "text-white" : "text-[var(--sf-ink)]"}`}>{s.title}</h3>
                <p className={`mt-4 leading-relaxed ${dark ? "text-white/90" : "text-[var(--sf-ink)]/75"}`}>{s.body}</p>
              </li>
            );
          })}
        </Reveal>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section aria-label="The gift card offer" className="sf-grid relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <Draw className="absolute left-[46%] top-28 hidden w-16 lg:block" delay={0.8}>
        <Sun />
      </Draw>
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="relative z-10">
            <Pill tint="butter">🎁 {COPY.heroPill}</Pill>
            <h1 className="sf-display mt-5 text-[11vw] leading-[0.92] text-[var(--sf-ink)] sm:text-6xl lg:text-[3.6rem] xl:text-[4.2rem]">
              <WordsReveal as="span" text={COPY.heroLead} immediate />{" "}
              <span className="relative isolate inline-block text-[var(--sf-clay)]">
                <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                  <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
                </Draw>
                <WordsReveal as="span" text={COPY.heroAccent} immediate delay={0.25} />
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{COPY.heroBody}</p>
            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Magnetic>
                <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                  {COPY.heroCta} <span aria-hidden="true">↓</span>
                </a>
              </Magnetic>
              <Link href={GIFT_CARD_TERMS_PATH} className={termsLinkClass}>
                {COPY.termsLink}
              </Link>
            </div>
          </div>
          <GiftTag />
        </div>
        <StepNotes />
      </div>
    </section>
  );
}

function ProductBand() {
  return (
    <section aria-label={COPY.productPill} className="relative bg-[var(--sf-paper)] py-24 lg:py-32">
      <Draw className="absolute right-[8%] top-24 hidden w-14 lg:block" delay={0.6}>
        <Leaf />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`🧺 ${COPY.productPill}`}
          tint="forest"
          lead={PRODUCT_SHOWCASE_SECTION_COPY.heading}
          accent={PRODUCT_SHOWCASE_SECTION_COPY.headingAccent}
          squiggle="var(--sf-butter)"
          align="left"
          headingClassName="text-5xl md:text-6xl"
          body={<p>{PRODUCT_SHOWCASE_SECTION_COPY.body}</p>}
        />
        <div className="mt-14">
          <GardenModuleDemo
            idPrefix="gift-card"
            aside={
              <button
                type="button"
                onClick={scrollToBookDemoSection}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-[var(--sf-ink)]/30 px-4 py-3 font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:border-[var(--sf-clay)] hover:bg-[var(--sf-peach)]/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                Book a Demo <span aria-hidden="true">↑</span>
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
}

function FinePrint() {
  return (
    <section id="fine-print" className="relative bg-[var(--sf-lav)]/40 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`📎 ${COPY.finePrintPill}`}
          tint="lav"
          lead={COPY.finePrintLead}
          accent={COPY.finePrintAccent}
          squiggle="var(--sf-butter)"
          body={<p>{COPY.finePrintBody}</p>}
        />
        <Reveal className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1} y={40}>
          {COPY.finePrintCards.map((card, i) => (
            <div
              key={card.title}
              className="relative rounded-[26px] border-2 border-[var(--sf-ink)] bg-white p-6 pt-8 shadow-[0_5px_0_0_var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0"
              style={{ rotate: `${i % 2 === 0 ? -1.2 : 1}deg` }}
            >
              <Tape color={TAPES[i % TAPES.length]} className={`-top-3 left-1/2 -translate-x-1/2 ${i % 2 === 0 ? "-rotate-3" : "rotate-3"}`} />
              <span aria-hidden="true" className={`inline-block h-2 w-10 rounded-full ${FINE_PRINT_TINTS[i]}`} />
              <h3 className="sf-display mt-3 text-2xl leading-[1.05] text-[var(--sf-ink)]">{card.title}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--sf-ink)]/80">{card.body}</p>
            </div>
          ))}
        </Reveal>
        <p className="mt-14 text-center text-lg">
          <Link href={GIFT_CARD_TERMS_PATH} className={termsLinkClass}>
            {COPY.termsLink} →
          </Link>
        </p>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="px-3 pb-24 pt-4 lg:px-6 lg:pb-32">
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[44px] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] px-6 py-20 text-center shadow-[0_10px_0_0_var(--sf-ink)] sm:px-10 lg:py-24">
        <Draw className="absolute left-[8%] top-12 hidden w-14 lg:block">
          <Star />
        </Draw>
        <Draw className="absolute bottom-10 right-[9%] hidden w-16 lg:block" delay={0.4}>
          <Leaf />
        </Draw>
        <SectionIntro
          pill={`🎁 ${GIFT_CARD_OFFER.amount} Amazon gift card`}
          tint="clay"
          lead={COPY.closingLead}
          accent={COPY.closingAccent}
          squiggle="var(--sf-peach)"
          body={<p className="text-[var(--sf-ink)]/75">{COPY.closingBody}</p>}
        />
        <div className="mt-10 flex flex-col items-center gap-5">
          <Magnetic>
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {COPY.closingCta} <span aria-hidden="true">↑</span>
            </a>
          </Magnetic>
          <Link href={GIFT_CARD_TERMS_PATH} className={termsLinkClass}>
            {COPY.termsLink}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * /gift-card: landing page for the $200 Amazon gift card ads. The offer and its
 * conditions up top, the real booking flow (tagged as a gift-card lead), then the
 * product, pricing, the founders' story, the fine print and a gift-card FAQ.
 */
export default function GiftCardGardenPage() {
  return (
    <HomeGardenShell bookDemoHref={BOOK_DEMO_HASH_HREF}>
      <Hero />
      <GardenBookDemo promo={GIFT_CARD_PROMO_ID} className="bg-[var(--sf-mint)]/45" />
      <ProductBand />
      <PricingPaper />
      <GardenOurStory ctaVariant="about" heading="get-started" className="bg-[var(--sf-sky)]/35" />
      <FinePrint />
      <GardenFaq
        items={GIFT_CARD_FAQ}
        idPrefix="gift-card-faq"
        copy={{ eyebrow: COPY.faqPill, heading: COPY.faqHeading, sub: COPY.faqSub }}
        footer={
          <p className="mt-6">
            <Link href={GIFT_CARD_TERMS_PATH} className={termsLinkClass}>
              {COPY.termsLink} →
            </Link>
          </p>
        }
      />
      <ClosingCta />
    </HomeGardenShell>
  );
}
