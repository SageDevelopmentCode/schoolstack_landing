"use client";

import MobileAppDownloadBadges from "@/components/download/MobileAppDownloadBadges";
import { DOWNLOAD_APP_SLIDES } from "@/lib/marketing/download-app-slides";
import { Marquee, Reveal } from "@/components/garden/motion";
import { Pill } from "@/components/garden/ui";
import { TAPES } from "../assets";
import PhoneCard from "../PhoneCard";
import SectionIntro from "../SectionIntro";

const HERO_SLIDE = DOWNLOAD_APP_SLIDES[0];

/** The MudKitchen app: a marquee of taped-up app screens with their captions. */
export default function AppStrip() {
  return (
    <section className="relative overflow-hidden bg-[var(--sf-lav)]/40 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill="📱 MudKitchen app"
          tint="lav"
          lead={HERO_SLIDE.alt}
          squiggle={null}
          note={HERO_SLIDE.caption}
        />
        <Reveal className="mt-8 flex justify-center">
          <div>
            <MobileAppDownloadBadges className="flex flex-wrap items-center justify-center gap-3" />
          </div>
        </Reveal>
      </div>
      <div className="mt-16">
        <Marquee duration={60} trackClassName="py-6">
          {DOWNLOAD_APP_SLIDES.slice(1).map((s, i) => (
            <PhoneCard key={s.src} slide={s} tilt={i % 2 ? 2.5 : -2} tape={TAPES[i % TAPES.length]} className="mx-5 w-[220px] sm:w-[240px]" />
          ))}
        </Marquee>
      </div>
      <div className="mt-6 hidden text-center lg:block" aria-hidden="true">
        <Pill tint="lav">psst — hover to pause ✋</Pill>
      </div>
    </section>
  );
}
