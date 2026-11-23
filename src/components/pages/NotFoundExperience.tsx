"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { gsap, useGSAP, MQ_MOTION } from "@/components/garden/gsap";
import { WordsReveal } from "@/components/garden/motion";
import { Draw, Squiggle, btnOutline, btnPop } from "@/components/garden/ui";
import { ILLUSTRATIONS } from "@/components/home-garden/assets";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";

/**
 * Props scattered round the edges of the hero (desktop only). Each wrapper is
 * positioned and tilted; GSAP only animates the inner [data-drop] element.
 */
const PROPS = [
  { src: ILLUSTRATIONS.acorns, size: 132, rotate: "-8deg", className: "left-[6%] top-[22%]" },
  { src: ILLUSTRATIONS.beads, size: 116, rotate: "9deg", className: "right-[7%] top-[20%]" },
  { src: ILLUSTRATIONS.basket, size: 168, rotate: "7deg", className: "bottom-[10%] left-[9%]" },
  { src: ILLUSTRATIONS.plant, size: 176, rotate: "-6deg", className: "bottom-[8%] right-[8%]" },
] as const;

export default function NotFoundExperience() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.from("[data-drop]", {
          y: -60,
          autoAlpha: 0,
          rotate: -8,
          duration: 1.1,
          delay: 0.2,
          stagger: 0.1,
          ease: "back.out(1.4)",
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <HomeGardenShell>
      <section
        ref={scope}
        className="sf-grid relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 sm:px-10 lg:px-16"
      >
        {PROPS.map((prop) => (
          <div
            key={prop.src}
            aria-hidden="true"
            className={`pointer-events-none absolute hidden select-none lg:block ${prop.className}`}
            style={{ rotate: prop.rotate, width: prop.size }}
          >
            <div data-drop>
              <Image src={prop.src} alt="" width={prop.size} height={prop.size} sizes={`${prop.size}px`} className="h-auto w-full object-contain" />
            </div>
          </div>
        ))}

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <h1 className="sf-display text-[12vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[6rem]">
            <WordsReveal as="span" immediate text="This page wandered off" className="block" />{" "}
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.5}>
                <Squiggle className="h-4 w-full md:h-5" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" immediate text="the trail." delay={0.25} />
            </span>
          </h1>

          <p className="sf-hand mt-5 text-balance text-xl text-[var(--sf-forest)]" aria-hidden="true">
            even the best explorers take a wrong turn ↺
          </p>

          <p className="mt-4 text-lg leading-relaxed text-[var(--sf-soft)]">Let&apos;s get you back on track.</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={GET_STARTED_PAGE_PATH} className={btnPop}>
              Book a Demo
            </Link>
            <Link href="/" className={btnOutline}>
              Back to homepage
            </Link>
          </div>

          <Link
            href="/features"
            className="mt-8 inline-block rounded-sm text-base font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-forest)]/30"
          >
            Explore the product
          </Link>
        </div>
      </section>
    </HomeGardenShell>
  );
}
