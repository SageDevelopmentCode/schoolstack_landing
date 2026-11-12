"use client";

import { useRef } from "react";
import Image from "next/image";
import { HERO_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_MOTION, MQ_DESKTOP_MOTION } from "@/components/garden/gsap";
import { Magnetic, WordsReveal } from "@/components/garden/motion";
import { Arrow, Draw, Ring, btnOutline, btnPop } from "@/components/garden/ui";
import { SAGEFIELD_PHOTOS } from "../../assets";
import GardenDemoFrame from "../../GardenDemoFrame";

/** Editorial hero: huge headline, a real classroom photo unveiled, the live product floating over it. */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.from("[data-in]", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.6 });
        gsap.fromTo("[data-photo]", { clipPath: "inset(18% 12% 0% 12% round 44px)" }, { clipPath: "inset(0% 0% 0% 0% round 44px)", duration: 1.6, ease: "expo.inOut", delay: 0.3 });
        gsap.fromTo("[data-photo-img]", { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "expo.out", delay: 0.3 });
        gsap.from("[data-frame]", { y: 140, opacity: 0, rotate: -4, duration: 1.4, ease: "back.out(1.1)", delay: 0.9 });
      });
      mm.add(MQ_DESKTOP_MOTION, () => {
        gsap.to("[data-photo-img]", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: "[data-photo]", start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-frame]", {
          y: -80,
          ease: "none",
          scrollTrigger: { trigger: "[data-photo]", start: "top 40%", end: "bottom top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label="Welcome" className="relative pt-32 lg:pt-40">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
        <div data-in className="flex items-center justify-between gap-6 border-b-2 border-[var(--sf-ink)] pb-4">
          <span className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--sf-ink)]">🌿 {HERO_COPY.badge}</span>
          <span className="sf-hand hidden text-xl text-[var(--sf-forest)] sm:inline">built inside a real microschool</span>
        </div>

        <h1 className="sf-display mt-8 text-[13.5vw] leading-[0.86] text-[var(--sf-ink)] sm:text-[11vw] lg:text-[6.6rem] xl:text-[7.4rem]">
          <WordsReveal as="span" text={HERO_COPY.headlineLead} immediate stagger={0.05} />{" "}
          <span className="relative isolate inline-block text-[var(--sf-forest)]">
            <WordsReveal as="span" text={HERO_COPY.headlineAccent} immediate delay={0.3} stagger={0.05} />
            <Draw className="pointer-events-none absolute -inset-x-5 -bottom-2 top-[18%] -z-10 hidden lg:block" delay={1.1} duration={1.6}>
              <Ring color="var(--sf-clay)" className="h-full w-full" />
            </Draw>
          </span>
        </h1>

        <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <p data-in className="max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)] xl:text-xl">
            {HERO_COPY.body}
          </p>
          <div data-in className="flex flex-col gap-4 sm:flex-row">
            <Magnetic>
              <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                {HERO_COPY.primaryCta}
              </a>
            </Magnetic>
            <a href="#product" className={btnOutline}>
              {HERO_COPY.secondaryCta}
            </a>
          </div>
        </div>
      </div>

      {/* Photo band + floating product */}
      <div className="relative mx-auto mt-14 max-w-[1400px] px-3 lg:mt-20 lg:px-6">
        <div data-photo className="relative h-[46vh] min-h-[320px] overflow-hidden rounded-[32px] lg:h-[78vh] lg:rounded-[44px]">
          <div data-photo-img className="absolute inset-0 will-change-transform">
            <Image src={SAGEFIELD_PHOTOS.running.src} alt={SAGEFIELD_PHOTOS.running.alt} fill className="object-cover" sizes="100vw" preload />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--sf-ink)]/55 via-transparent to-transparent" aria-hidden="true" />
          <p className="sf-hand absolute bottom-6 left-6 text-2xl text-white lg:bottom-10 lg:left-10" aria-hidden="true">
            sage field, round rock tx ☀︎
          </p>
        </div>
        <div className="relative z-10 mx-auto -mt-[14vh] max-w-5xl px-3 lg:-mt-[38vh] lg:px-0">
          <div data-frame>
            <GardenDemoFrame active="admin" tilt={-1} tape="var(--sf-butter)" />
          </div>
          <div className="mt-6 hidden items-center justify-end gap-2 lg:flex" aria-hidden="true">
            <span className="sf-hand text-xl text-[var(--sf-soft)]">an interactive demo — go ahead, click</span>
            <Draw className="block w-14 -scale-x-100 -rotate-90">
              <Arrow color="var(--sf-soft)" />
            </Draw>
          </div>
        </div>
      </div>
    </section>
  );
}
