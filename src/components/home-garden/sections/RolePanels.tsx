"use client";

import { useState } from "react";
import Image from "next/image";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal } from "@/components/garden/motion";
import { Tape, Tick, btnPop } from "@/components/garden/ui";
import SectionIntro from "../SectionIntro";
import { ROLES, ROLES_HEADING, type Role } from "../roles";

/**
 * Built for every role: three tall pastel panels. The open one grows wide to
 * show its story; the others stay as tall spines with a photo peeking out.
 */
export default function RolePanels() {
  const [open, setOpen] = useState<Role["id"]>("family");

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro pill="👩‍👧 For families, founders & teachers" tint="sky" lead={ROLES_HEADING} squiggle={null} />
        <Reveal className="mt-14 flex flex-col gap-5 lg:h-[600px] lg:flex-row" stagger={0.1} y={50}>
          {ROLES.map((r) => {
            const isOpen = r.id === open;
            return (
              <div
                key={r.id}
                onPointerEnter={() => setOpen(r.id)}
                className={`relative overflow-hidden rounded-[34px] border-2 border-[var(--sf-ink)] ${r.tint} shadow-[0_8px_0_0_var(--sf-ink)] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:min-w-0 ${
                  isOpen ? "lg:flex-[3.2]" : "lg:flex-[1]"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`role-panel-${r.id}`}
                    onClick={() => setOpen(r.id)}
                    onFocus={() => setOpen(r.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-7 pt-7 text-left lg:pb-0 ${isOpen ? "" : "pb-7"} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--sf-clay)]/30`}
                  >
                    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-sm font-extrabold ${r.ink}`}>
                      <span aria-hidden="true">{r.emoji}</span> {r.copy.eyebrow}
                    </span>
                    <span className="sf-hand hidden whitespace-nowrap text-lg text-[var(--sf-ink)]/50 lg:inline" aria-hidden="true">
                      {isOpen ? "" : "open →"}
                    </span>
                  </button>
                </h3>

                {/* Spine (collapsed, desktop) */}
                <div
                  className={`absolute inset-x-0 bottom-0 top-24 hidden flex-col items-center justify-end p-6 transition-opacity duration-300 lg:flex ${
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
                </div>

                {/* Open content */}
                <div
                  id={`role-panel-${r.id}`}
                  className={`grid gap-8 px-7 pb-8 pt-6 transition-opacity duration-500 lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-20 lg:w-[min(820px,62vw)] lg:grid-cols-[1.25fr_0.75fr] lg:pb-9 ${
                    isOpen ? "opacity-100 delay-200" : "lg:pointer-events-none lg:opacity-0"
                  } ${isOpen ? "" : "max-lg:hidden"}`}
                >
                  <div className="flex flex-col">
                    <p className="sf-display text-4xl leading-[1] text-[var(--sf-ink)] xl:text-[2.75rem]">
                      {r.copy.headlineLead} <span className={r.ink}>{r.copy.headlineAccent}</span>
                    </p>
                    <p className="mt-5 leading-relaxed text-[var(--sf-ink)]/80">{r.copy.body}</p>
                    {r.copy.bullets ? (
                      <ul className="mt-5 space-y-2">
                        {r.copy.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-[15px] font-bold text-[var(--sf-ink)]">
                            <Tick className="mt-0.5 h-5 w-5" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-auto pt-7">
                      <a href={BOOK_DEMO_HASH_HREF} className={btnPop} tabIndex={isOpen ? 0 : -1}>
                        {r.copy.cta}
                      </a>
                    </div>
                  </div>
                  <div className="relative hidden lg:block">
                    <div className="sf-polaroid relative rotate-3">
                      <Tape color="var(--sf-butter)" className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[3px]">
                        <Image src={r.photo.src} alt={r.photo.alt} fill className="object-cover" sizes="300px" />
                      </div>
                    </div>
                    <Image src={r.illustration} alt="" width={140} height={140} className="absolute -bottom-6 -left-10 h-32 w-32 -rotate-12 object-contain drop-shadow-xl" />
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
