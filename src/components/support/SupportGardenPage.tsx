"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { WordsReveal } from "@/components/garden/motion";
import { Draw, Pill, Squiggle, Tape } from "@/components/garden/ui";
import { SAGEFIELD_PHOTOS } from "@/components/home-garden/assets";
import GardenFaq from "@/components/home-garden/GardenFaq";
import Polaroid from "@/components/home-garden/Polaroid";
import PublicSupportForm from "@/components/support/PublicSupportForm";
import { mudkitchenDemoContact } from "@/data/school-demos/mudkitchen-demo-contact";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";

const { contact } = mudkitchenDemoContact;

/** /support copy, word for word from the previous page. */
const SUPPORT_COPY = {
  eyebrow: "Support",
  headlineLead: "How can we",
  headlineAccent: "help?",
  bodyBefore:
    "Send us a message and the MudKitchen team will follow up — usually within one business day. For a live walkthrough, you can also ",
  bodyLink: "book a demo",
  bodyAfter: ".",
  phoneNote: "· text or call",
} as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-forest)]/40";

const contactLink = `group flex items-center gap-3 rounded-2xl font-extrabold text-[var(--sf-ink)] transition-colors hover:text-[var(--sf-forest)] ${focusRing}`;

const iconCircle =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--sf-forest)] ring-2 ring-[var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-focus-visible:-rotate-6";

/** /support in Garden: hero, the support form on notebook paper, a contact sticky note, then the FAQ. */
export default function SupportGardenPage() {
  return (
    <HomeGardenShell>
      <section aria-label={SUPPORT_COPY.eyebrow} className="sf-grid relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <Pill tint="forest">💬 {SUPPORT_COPY.eyebrow}</Pill>
          <h1 className="sf-display mt-6 max-w-4xl text-[12vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[5.6rem]">
            <WordsReveal as="span" text={SUPPORT_COPY.headlineLead} immediate />{" "}
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={SUPPORT_COPY.headlineAccent} immediate delay={0.2} />
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">
            {SUPPORT_COPY.bodyBefore}
            <Link
              href={GET_STARTED_PAGE_PATH}
              className="rounded font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
            >
              {SUPPORT_COPY.bodyLink}
            </Link>
            {SUPPORT_COPY.bodyAfter}
          </p>

          <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
            <div className="sf-paper relative rounded-[30px] border-2 border-[var(--sf-ink)] p-6 shadow-[0_8px_0_0_var(--sf-ink)] sm:p-10">
              <PublicSupportForm />
            </div>

            <div className="space-y-12">
              <aside
                aria-labelledby="support-contact-heading"
                className="relative rounded-md bg-[var(--sf-butter)] p-7 pt-9 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]"
                style={{ rotate: "-1.5deg" }}
              >
                <Tape color="rgba(255,255,255,0.7)" className="-top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2" />
                <h2 id="support-contact-heading" className="sf-display text-3xl leading-[1.05] text-[var(--sf-ink)]">
                  {contact.eyebrow}
                </h2>
                <div className="mt-6 space-y-4">
                  <a href={`mailto:${contact.email}`} className={contactLink}>
                    <span className={iconCircle}>
                      <Mail size={18} strokeWidth={2.4} aria-hidden />
                    </span>
                    <span className="min-w-0 [overflow-wrap:anywhere]">{contact.email}</span>
                  </a>
                  <a href={contact.phoneHref} className={contactLink}>
                    <span className={iconCircle}>
                      <Phone size={18} strokeWidth={2.4} aria-hidden />
                    </span>
                    <span>
                      {contact.phone}{" "}
                      <span className="font-semibold text-[var(--sf-ink)]/70">{SUPPORT_COPY.phoneNote}</span>
                    </span>
                  </a>
                </div>
                <p className="mt-6 border-t-2 border-dashed border-[var(--sf-ink)]/20 pt-5 leading-relaxed text-[var(--sf-ink)]/80">
                  {contact.blurb}
                </p>
              </aside>

              <Polaroid
                src={SAGEFIELD_PHOTOS.garden.src}
                alt=""
                tilt={3}
                tape="var(--sf-mint)"
                sizes="240px"
                className="mx-auto hidden w-[240px] lg:block"
              />
            </div>
          </div>
        </div>
      </section>

      <GardenFaq className="bg-[var(--sf-mint)]/40" />
    </HomeGardenShell>
  );
}
