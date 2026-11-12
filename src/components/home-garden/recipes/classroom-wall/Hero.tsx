"use client";

import { useRef } from "react";
import { HERO_COPY } from "@/components/home/home-copy";
import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import { DOWNLOAD_APP_SLIDES } from "@/lib/marketing/download-app-slides";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_DESKTOP_MOTION, MQ_MOTION } from "@/components/garden/gsap";
import { Magnetic } from "@/components/garden/motion";
import { Draw, Leaf, Squiggle, Star, Sun, btnOutline, btnPop } from "@/components/garden/ui";
import { SAGEFIELD_PHOTOS, TAPES } from "../../assets";
import Polaroid from "../../Polaroid";
import PhoneCard from "../../PhoneCard";
import StickerNote from "../../StickerNote";

type Item =
  | { kind: "photo"; photo: (typeof SAGEFIELD_PHOTOS)[keyof typeof SAGEFIELD_PHOTOS]; caption: string }
  | { kind: "phone"; slide: (typeof DOWNLOAD_APP_SLIDES)[number] }
  | { kind: "sticker"; sticker: (typeof STICKERS_BY_DEMO)["parent"][number]; tint: string };

/** What's pinned to the wall: real school photos, the app, and the little wins it sends you. */
const ITEMS: Item[] = [
  { kind: "photo", photo: SAGEFIELD_PHOTOS.running, caption: "sage field ☀︎" },
  { kind: "sticker", sticker: STICKERS_BY_DEMO.parent[0], tint: "bg-[var(--sf-mint)]" },
  { kind: "phone", slide: DOWNLOAD_APP_SLIDES[3] },
  { kind: "photo", photo: SAGEFIELD_PHOTOS.mudKitchen, caption: "the mud kitchen" },
  { kind: "sticker", sticker: STICKERS_BY_DEMO.admin[0], tint: "bg-[var(--sf-butter)]" },
  { kind: "photo", photo: SAGEFIELD_PHOTOS.classroom, caption: "the classroom" },
  { kind: "phone", slide: DOWNLOAD_APP_SLIDES[1] },
  { kind: "sticker", sticker: STICKERS_BY_DEMO.teacher[0], tint: "bg-[var(--sf-sky)]" },
  { kind: "photo", photo: SAGEFIELD_PHOTOS.garden, caption: "garden beds" },
];

/** Hand-placed spots around the headline (desktop). x/y in %, r = rotation, d = parallax depth. */
const SPOTS = [
  { x: "2%", y: "21%", r: -8, d: 1.2, w: "lg:w-[14vw] lg:max-w-[220px]" },
  { x: "3%", y: "52%", r: 5, d: 0.8, w: "" },
  { x: "17%", y: "27%", r: -5, d: 1.5, w: "lg:w-[7.5vw] lg:max-w-[115px]" },
  { x: "87%", y: "19%", r: 7, d: 1.1, w: "lg:w-[10.5vw] lg:max-w-[165px]" },
  { x: "79%", y: "57%", r: -4, d: 0.7, w: "" },
  { x: "8%", y: "68%", r: 4, d: 1.3, w: "lg:w-[11vw] lg:max-w-[170px]" },
  { x: "77%", y: "25%", r: -6, d: 1.4, w: "lg:w-[7vw] lg:max-w-[110px]" },
  { x: "73%", y: "84%", r: 3, d: 1, w: "" },
  { x: "87%", y: "66%", r: -9, d: 1, w: "lg:w-[10vw] lg:max-w-[155px]" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.from("[data-hero-cta]", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.6, stagger: 0.08 });
      });
      mm.add(MQ_DESKTOP_MOTION, () => {
        const root = ref.current!;
        const pars = gsap.utils.toArray<HTMLElement>("[data-par]", root);
        const tos = pars.map((p) => ({
          x: gsap.quickTo(p, "x", { duration: 1, ease: "power3.out" }),
          y: gsap.quickTo(p, "y", { duration: 1, ease: "power3.out" }),
          d: Number(p.dataset.depth || 1),
        }));
        const move = (e: PointerEvent) => {
          const mx = e.clientX / window.innerWidth - 0.5;
          const my = e.clientY / window.innerHeight - 0.5;
          tos.forEach((t) => {
            t.x(mx * 46 * t.d);
            t.y(my * 34 * t.d);
          });
        };
        root.addEventListener("pointermove", move);

        // Pinned items drop onto the wall, then gather into a neat pile as you scroll on.
        gsap.from("[data-gather]", {
          y: -140,
          opacity: 0,
          rotate: () => gsap.utils.random(-30, 30),
          duration: 1.1,
          ease: "back.out(1.6)",
          stagger: 0.07,
          delay: 0.25,
        });
        const center = () => ({ x: root.clientWidth / 2, y: root.clientHeight * 0.95 });
        gsap.utils.toArray<HTMLElement>("[data-gather]").forEach((g, i) => {
          const spot = g.closest<HTMLElement>("[data-spot]")!;
          gsap.to(g, {
            x: () => (center().x - (spot.offsetLeft + spot.offsetWidth / 2)) * 0.82,
            y: () => center().y - (spot.offsetTop + spot.offsetHeight / 2),
            rotate: (i % 2 ? 1 : -1) * (4 + i),
            scale: 0.62,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom 30%", scrub: 0.8, invalidateOnRefresh: true },
          });
        });
        gsap.to("[data-headline]", {
          yPercent: 28,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
        return () => root.removeEventListener("pointermove", move);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="Welcome"
      className="sf-grid relative overflow-hidden pb-16 pt-32 lg:h-[100svh] lg:min-h-[780px] lg:pb-0 lg:pt-0"
    >
      <Draw className="absolute right-[33%] top-[13%] hidden w-20 lg:block" delay={0.6}>
        <Sun />
      </Draw>
      <Draw className="absolute bottom-[14%] left-[35%] hidden w-14 lg:block" delay={0.9}>
        <Leaf />
      </Draw>
      <Draw className="absolute bottom-[21%] right-[37%] hidden w-10 lg:block" delay={1.1}>
        <Star />
      </Draw>

      {/* Headline */}
      <div
        data-headline
        className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:absolute lg:inset-0 lg:flex lg:flex-col lg:items-center lg:justify-center lg:pt-16"
      >
        <span className="sf-hand text-2xl text-[var(--sf-forest)]">🌿 {HERO_COPY.badge.toLowerCase()}</span>
        <h1 className="sf-display mx-auto mt-3 max-w-[13ch] text-[13vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:max-w-[15ch] lg:text-[5.4rem] xl:text-[6rem]">
          {HERO_COPY.headlineLead}{" "}
          <span className="relative isolate inline-block text-[var(--sf-clay)]">
            <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.4}>
              <Squiggle className="h-5 w-full lg:h-7" color="var(--sf-butter)" />
            </Draw>
            {HERO_COPY.headlineAccent}
          </span>
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{HERO_COPY.body}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <span data-hero-cta>
            <Magnetic>
              <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                {HERO_COPY.primaryCta}
              </a>
            </Magnetic>
          </span>
          <span data-hero-cta>
            <a href="#product" className={btnOutline}>
              {HERO_COPY.secondaryCta}
            </a>
          </span>
        </div>
        <p className="sf-hand mt-6 hidden text-lg text-[var(--sf-soft)] lg:block" aria-hidden="true">
          scroll to tidy up ↓
        </p>
      </div>

      {/* Everything pinned to the wall */}
      <div
        className="sf-no-scrollbar mt-14 flex snap-x snap-mandatory items-center gap-8 overflow-x-auto px-6 pb-8 pt-6 [scroll-padding-inline:1.5rem] lg:absolute lg:inset-0 lg:m-0 lg:block lg:overflow-visible lg:p-0"
        aria-hidden="true"
      >
        {ITEMS.map((item, i) => {
          const spot = SPOTS[i];
          const tape = TAPES[i % TAPES.length];
          return (
            <div
              key={i}
              data-spot
              className={`relative shrink-0 snap-center lg:absolute lg:left-[var(--x)] lg:top-[var(--y)] lg:hover:z-30`}
              style={{ ["--x" as string]: spot.x, ["--y" as string]: spot.y, rotate: `${spot.r}deg` }}
            >
              <div data-gather className="will-change-transform">
                <div data-par data-depth={spot.d}>
                  {item.kind === "photo" ? (
                    <Polaroid
                      src={item.photo.src}
                      alt=""
                      caption={item.caption}
                      tape={tape}
                      className={`w-44 ${spot.w}`}
                      sizes="(max-width: 1024px) 176px, 190px"
                      aspect={item.photo.w > item.photo.h ? "aspect-[4/3]" : "aspect-[4/5]"}
                      preload={i < 2}
                    />
                  ) : item.kind === "phone" ? (
                    <PhoneCard slide={item.slide} tape={tape} showCaption={false} className={`w-32 ${spot.w}`} sizes="(max-width: 1024px) 128px, 120px" />
                  ) : (
                    <StickerNote sticker={item.sticker} tint={item.tint} className="w-56 lg:w-auto" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
