"use client";

import Image from "next/image";
import { PRODUCT_INTRO_COPY } from "@/components/home/home-copy";
import { STICKERS_BY_DEMO, type Sticker } from "@/components/home/FloatingStickers";
import { PRODUCT_PREVIEW_TABS, type ProductPreviewTabId } from "@/lib/marketing/product-preview-tabs";
import { DOWNLOAD_APP_SLIDES } from "@/lib/marketing/download-app-slides";
import { HorizontalTrack } from "@/components/garden/motion";
import { MARK, Tape } from "@/components/garden/ui";
import { SAGEFIELD_PHOTOS, TAPES } from "../assets";
import SectionIntro from "../SectionIntro";
import StickerNote from "../StickerNote";

const tab = (id: ProductPreviewTabId) => PRODUCT_PREVIEW_TABS.find((t) => t.id === id)!;

type Moment = {
  /** Decorative handwritten time-of-day label. */
  when: string;
  sticker: Sticker;
  title: string;
  description: string;
  visual: { kind: "phone"; slide: (typeof DOWNLOAD_APP_SLIDES)[number] } | { kind: "photo"; src: string; alt: string };
  tint: string;
};

/** One school day, told through the notifications MudKitchen sends along the way. */
const DAY: Moment[] = [
  { when: "first thing", sticker: STICKERS_BY_DEMO.timeclock[0], title: tab("timeclock").caption, description: tab("timeclock").description, visual: { kind: "phone", slide: DOWNLOAD_APP_SLIDES[5] }, tint: "bg-[var(--sf-butter)]" },
  { when: "morning", sticker: STICKERS_BY_DEMO.attendance[0], title: tab("teachers").caption, description: tab("teachers").description, visual: { kind: "phone", slide: DOWNLOAD_APP_SLIDES[6] }, tint: "bg-[var(--sf-mint)]" },
  { when: "mid-morning", sticker: STICKERS_BY_DEMO.parent[1], title: "Messages", description: DOWNLOAD_APP_SLIDES[2].caption, visual: { kind: "phone", slide: DOWNLOAD_APP_SLIDES[2] }, tint: "bg-[var(--sf-sky)]" },
  { when: "lunchtime", sticker: STICKERS_BY_DEMO.admin[0], title: tab("admin").caption, description: tab("admin").description, visual: { kind: "phone", slide: DOWNLOAD_APP_SLIDES[9] }, tint: "bg-[var(--sf-peach)]" },
  { when: "afternoon", sticker: STICKERS_BY_DEMO.parent[0], title: tab("parents").caption, description: tab("parents").description, visual: { kind: "phone", slide: DOWNLOAD_APP_SLIDES[3] }, tint: "bg-[var(--sf-lav)]" },
  { when: "after pickup", sticker: STICKERS_BY_DEMO.website[0], title: tab("website").caption, description: tab("website").description, visual: { kind: "photo", src: SAGEFIELD_PHOTOS.entrance.src, alt: SAGEFIELD_PHOTOS.entrance.alt }, tint: "bg-[var(--sf-mint)]" },
  { when: "tonight", sticker: STICKERS_BY_DEMO.marketing[0], title: tab("marketing").caption, description: tab("marketing").description, visual: { kind: "phone", slide: DOWNLOAD_APP_SLIDES[0] }, tint: "bg-[var(--sf-butter)]" },
];

const TILTS = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9, -1.4];

function Postcard({ m, i }: { m: Moment; i: number }) {
  return (
    <article
      className={`relative flex w-[84vw] max-w-[560px] shrink-0 snap-center flex-col overflow-visible rounded-[30px] border-2 border-[var(--sf-ink)] ${m.tint} shadow-[0_8px_0_0_var(--sf-ink)] sm:w-[520px] lg:w-[540px]`}
      style={{ rotate: `${TILTS[i]}deg` }}
    >
      <Tape color={TAPES[(i + 2) % TAPES.length]} className="-top-3 left-12 -rotate-6" />
      <div className="grid flex-1 grid-cols-[1fr_32%] gap-5 p-6 sm:p-7">
        <div className="flex flex-col">
          <span className="sf-hand text-2xl text-[var(--sf-ink)]/70">{m.when}</span>
          <StickerNote sticker={m.sticker} tint="bg-white" size="sm" className="mt-3 w-fit" tilt={i % 2 ? 2 : -2} />
          <h3 className="sf-display mt-6 text-3xl leading-[1] text-[var(--sf-ink)]">{m.title}</h3>
          <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--sf-ink)]/80">{m.description}</p>
          <span className="mt-auto pt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--sf-ink)]/45" aria-hidden="true">
            {String(i + 1).padStart(2, "0")} / {String(DAY.length).padStart(2, "0")}
          </span>
        </div>
        <div className="relative self-center">
          {m.visual.kind === "phone" ? (
            <div className="relative aspect-[960/2078] overflow-hidden rounded-[18px] border-2 border-[var(--sf-ink)] bg-white">
              <Image src={m.visual.slide.src} alt={m.visual.slide.alt} fill className="object-cover" sizes="200px" />
            </div>
          ) : (
            <div className="sf-polaroid rotate-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px]">
                <Image src={m.visual.src} alt={m.visual.alt} fill className="object-cover" sizes="200px" />
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** "What is Mud Kitchen?" told as a school day: a pinned sideways scroll of postcards. */
export default function DayTrack() {
  return (
    <HorizontalTrack
      className="relative scroll-mt-0 bg-[var(--sf-paper)] py-24 lg:py-0"
      trackClassName="sf-no-scrollbar gap-8 px-6 pb-6 pt-14 sm:px-10 lg:gap-12 lg:px-16 lg:pt-12 [scroll-padding-inline:1.5rem]"
      progressClassName="bg-[var(--sf-clay)]"
      progressTrackClassName="bg-[var(--sf-ink)]/10"
      header={
        <div id="product" className="mx-auto w-full max-w-7xl scroll-mt-24 px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionIntro
              pill={`🧺 ${PRODUCT_INTRO_COPY.badge}`}
              tint="forest"
              lead={PRODUCT_INTRO_COPY.heading}
              squiggle={null}
              align="left"
              headingClassName="text-5xl md:text-6xl lg:text-[3.4rem] xl:text-6xl"
            />
            <ul className="flex max-w-sm flex-col gap-2 lg:pb-2">
              {PRODUCT_INTRO_COPY.bullets.map((b, i) => (
                <li key={b.title} className="text-[15px] text-[var(--sf-soft)]">
                  <span className={i === 0 ? MARK.butter : i === 1 ? MARK.sky : MARK.mint}>{b.title}</span> {b.body}
                </li>
              ))}
            </ul>
          </div>
          <p className="sf-hand mt-4 text-xl text-[var(--sf-forest)]" aria-hidden="true">
            a day at school, with MudKitchen → keep scrolling
          </p>
        </div>
      }
    >
      {DAY.map((m, i) => (
        <Postcard key={m.when} m={m} i={i} />
      ))}
      <div className="flex w-[70vw] max-w-[360px] shrink-0 snap-center flex-col items-start justify-center gap-4 pr-10 sm:w-[360px]">
        <span className="sf-hand text-3xl text-[var(--sf-forest)]">…and that&rsquo;s a day. 🌙</span>
        <a href="#book-demo" className="sf-display text-4xl leading-none text-[var(--sf-clay)] underline decoration-[var(--sf-butter)] decoration-[6px] underline-offset-8">
          Book a Demo →
        </a>
      </div>
    </HorizontalTrack>
  );
}
