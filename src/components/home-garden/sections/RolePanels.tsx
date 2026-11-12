"use client";

import { useState } from "react";
import Image from "next/image";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal, useMediaQuery } from "@/components/garden/motion";
import { Tick, btnPop } from "@/components/garden/ui";
import { prefetchDemoStage } from "@/components/home/DemoStage";
import GardenDemoFrame from "../GardenDemoFrame";
import SectionIntro from "../SectionIntro";
import { ROLES, ROLES_HEADING, type Role } from "../roles";

/** Tape colour on each role's demo frame, picked to contrast with the panel tint. */
const FRAME_TAPE: Record<Role["id"], string> = {
  family: "var(--sf-butter)",
  admin: "var(--sf-mint)",
  teacher: "var(--sf-lav)",
};

/**
 * Built for every role: three tall pastel panels. The open one grows wide to
 * show its story next to that role's live demo; the others stay as tall spines
 * with a photo peeking out. A demo mounts the first time its panel opens.
 */
export default function RolePanels() {
  const [open, setOpen] = useState<Role["id"]>("family");
  const [seen, setSeen] = useState<ReadonlySet<Role["id"]>>(() => new Set(["family"]));
  // Side-by-side panels get a tall, portrait demo; the stacked accordion gets a landscape one.
  const wide = useMediaQuery("(min-width: 1280px)");

  const openPanel = (id: Role["id"]) => {
    setOpen(id);
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  return (
    <section className="relative py-24 xl:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 xl:px-16">
        <SectionIntro pill="👩‍👧 For families, founders & teachers" tint="sky" lead={ROLES_HEADING} squiggle={null} />
        {/* The row is a size container so the open content can be exactly as wide as an open panel. */}
        <Reveal className="mt-14 flex flex-col gap-5 [container-type:inline-size] xl:h-[640px] xl:flex-row" stagger={0.1} y={50}>
          {ROLES.map((r) => {
            const isOpen = r.id === open;
            return (
              <div
                key={r.id}
                onPointerEnter={() => {
                  prefetchDemoStage(r.demo);
                  // Hover-to-open only suits the side-by-side panels; a stacked accordion would jump under the pointer.
                  if (wide) openPanel(r.id);
                }}
                className={`relative overflow-hidden rounded-[34px] border-2 border-[var(--sf-ink)] ${r.tint} shadow-[0_8px_0_0_var(--sf-ink)] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] xl:min-w-0 ${
                  isOpen ? "xl:flex-[4.5]" : "xl:flex-[1]"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`role-panel-${r.id}`}
                    onClick={() => openPanel(r.id)}
                    onFocus={() => {
                      prefetchDemoStage(r.demo);
                      openPanel(r.id);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-7 pt-7 text-left xl:pb-0 ${isOpen ? "" : "pb-7"} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--sf-clay)]/30`}
                  >
                    {/* Narrow spines let the label wrap instead of clipping it. */}
                    <span
                      className={`inline-flex items-center gap-2 bg-white px-4 py-1.5 text-sm font-extrabold ${r.ink} ${
                        isOpen ? "whitespace-nowrap rounded-full" : "whitespace-nowrap rounded-full xl:whitespace-normal xl:rounded-[18px] xl:leading-tight"
                      }`}
                    >
                      <span aria-hidden="true">{r.emoji}</span> {r.copy.eyebrow}
                    </span>
                  </button>
                </h3>

                {/* Spine (collapsed, desktop) */}
                <div
                  className={`absolute inset-x-0 bottom-0 top-24 hidden flex-col items-center justify-end p-6 transition-opacity duration-300 xl:flex ${
                    isOpen ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
                  }`}
                  aria-hidden="true"
                >
                  <p className="sf-display text-center text-2xl leading-[1.05] text-[var(--sf-ink)]">{r.copy.headlineAccent}</p>
                  <div className="sf-polaroid mt-6 w-full max-w-[180px] -rotate-3">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[3px]">
                      <Image src={r.photo.src} alt="" fill className="object-cover" sizes="180px" />
                    </div>
                  </div>
                  <span className="sf-hand mt-3 text-lg text-[var(--sf-ink)]/50">open →</span>
                </div>

                {/* Open content: fixed at the open panel's inner width (4.5 of 6.5 flex parts, less the gaps and border) so it never reflows mid-grow. */}
                <div
                  id={`role-panel-${r.id}`}
                  inert={!isOpen ? true : undefined}
                  aria-hidden={!isOpen ? true : undefined}
                  className={`grid grid-cols-1 gap-8 px-7 pb-8 pt-6 transition-opacity duration-500 xl:absolute xl:bottom-0 xl:left-0 xl:top-20 xl:w-[calc((100cqw_-_2.5rem)_*_4.5_/_6.5_-_4px)] xl:grid-cols-[0.95fr_1.05fr] xl:gap-7 xl:pb-10 ${
                    isOpen ? "opacity-100 delay-200" : "xl:pointer-events-none xl:opacity-0"
                  } ${isOpen ? "" : "max-xl:hidden"}`}
                >
                  <div className="flex flex-col">
                    <p className="sf-display text-4xl leading-[1] text-[var(--sf-ink)] xl:leading-[1.02] xl:text-[1.85rem]">
                      {r.copy.headlineLead} <span className={r.ink}>{r.copy.headlineAccent}</span>
                    </p>
                    <p className="mt-5 leading-relaxed text-[var(--sf-ink)]/80 xl:mt-4 xl:text-sm xl:leading-[1.55]">{r.copy.body}</p>
                    {r.copy.bullets ? (
                      <ul className="mt-5 space-y-2 xl:mt-4 xl:space-y-1.5">
                        {r.copy.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-[15px] font-bold text-[var(--sf-ink)] xl:text-[13px] xl:leading-snug">
                            <Tick className="mt-0.5 h-5 w-5 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-auto pt-7 xl:pt-4">
                      <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                        {r.copy.cta}
                      </a>
                    </div>
                  </div>

                  {/* Live demo, tilted and taped, with a stock polaroid tucked behind its corner. */}
                  <div className="relative min-w-0 pt-3 xl:self-center">
                    <div className="sf-polaroid absolute -bottom-9 -left-16 z-0 hidden w-[160px] -rotate-[8deg] xl:block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[3px]">
                        <Image src={r.photo.src} alt={r.photo.alt} fill className="object-cover" sizes="150px" />
                      </div>
                    </div>
                    {seen.has(r.id) ? (
                      <GardenDemoFrame
                        active={r.demo}
                        tilt={1.5}
                        tape={FRAME_TAPE[r.id]}
                        designHeight={wide ? 1250 : 720}
                        minScale={0.24}
                        className="relative z-10"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
