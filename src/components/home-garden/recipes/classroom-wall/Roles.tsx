"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { prefetchDemoStage } from "@/components/home/DemoStage";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal } from "@/components/garden/motion";
import { Tape, Tick, btnPop } from "@/components/garden/ui";
import GardenDemoFrame from "../../GardenDemoFrame";
import SectionIntro from "../../SectionIntro";
import { ROLES, ROLES_HEADING, type Role } from "../../roles";

const TILTS = [-2, 1.5, -1.2];

function FlipCard({ role, i }: { role: Role; i: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="sf-flip h-[500px]" data-flipped={flipped} style={{ rotate: `${TILTS[i]}deg` }}>
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={`${role.copy.eyebrow}: ${role.copy.headlineLead} ${role.copy.headlineAccent} ${flipped ? "Show front" : "Read more"}`}
        className="sf-flip-inner relative block h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 rounded-[30px]"
      >
        {/* Front */}
        <div className={`sf-face absolute inset-0 flex flex-col overflow-hidden rounded-[30px] border-2 border-[var(--sf-ink)] bg-white p-3 shadow-[0_8px_0_0_var(--sf-ink)]`}>
          <Tape color="var(--sf-butter)" className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
          <div className="relative h-56 shrink-0 overflow-hidden rounded-[22px]">
            <Image src={role.photo.src} alt={role.photo.alt} fill className="object-cover" sizes="(max-width: 768px) 90vw, 380px" />
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-extrabold ${role.tint} ${role.ink}`}>
              {role.emoji} {role.copy.eyebrow}
            </span>
          </div>
          <div className={`mt-3 flex flex-1 flex-col rounded-[22px] ${role.tintSoft} p-5`}>
            <h3 className="sf-display text-[1.85rem] leading-[1.02] text-[var(--sf-ink)]">
              {role.copy.headlineLead} <span className={role.ink}>{role.copy.headlineAccent}</span>
            </h3>
            <span className="sf-hand mt-auto pt-3 text-xl text-[var(--sf-soft)]" aria-hidden="true">
              flip me ↻
            </span>
          </div>
        </div>
        {/* Back */}
        <div className={`sf-face sf-back absolute inset-0 flex flex-col overflow-hidden rounded-[30px] border-2 border-[var(--sf-ink)] ${role.tint} p-7 shadow-[0_8px_0_0_var(--sf-ink)]`}>
          <Image src={role.illustration} alt="" width={120} height={120} className="absolute -right-4 -top-4 h-28 w-28 rotate-12 object-contain opacity-90" />
          <span className={`text-sm font-extrabold ${role.ink}`}>
            {role.emoji} {role.copy.eyebrow}
          </span>
          <div className="mt-4 overflow-y-auto pr-1" data-lenis-prevent>
            <p className="text-[15.5px] leading-relaxed text-[var(--sf-ink)]/85">{role.copy.body}</p>
            {role.copy.bullets ? (
              <ul className="mt-4 space-y-2.5">
                {role.copy.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[15px] font-bold text-[var(--sf-ink)]">
                    <Tick className="mt-0.5 h-5 w-5" />
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <span className="sf-hand mt-auto pt-3 text-xl text-[var(--sf-ink)]/60" aria-hidden="true">
            ↻ flip back
          </span>
        </div>
      </button>
    </div>
  );
}

/** Built for every role: flip cards for each audience, then one live demo you can switch between them. */
export default function Roles() {
  const [active, setActive] = useState<Role["id"]>("family");
  const role = ROLES.find((r) => r.id === active)!;

  return (
    <section className="relative bg-[var(--sf-sky)]/35 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro pill="👩‍👧 For families, founders & teachers" tint="sky" lead={ROLES_HEADING} squiggle={null} />

        <Reveal className="mt-16 grid gap-10 md:grid-cols-3 md:gap-7" stagger={0.12} y={60}>
          {ROLES.map((r, i) => (
            <FlipCard key={r.id} role={r} i={i} />
          ))}
        </Reveal>

        <div className="mt-24 flex flex-col items-center">
          <p className="sf-hand text-2xl text-[var(--sf-forest)]" aria-hidden="true">
            now see it from their side ↓
          </p>
          <div role="tablist" aria-label="Choose a view" className="mt-4 inline-flex rounded-full border-2 border-[var(--sf-ink)] bg-white p-1.5 shadow-[0_4px_0_0_var(--sf-ink)]">
            {ROLES.map((r) => {
              const isActive = r.id === active;
              return (
                <button
                  key={r.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls="garden-roles-demo"
                  onClick={() => setActive(r.id)}
                  onPointerEnter={() => prefetchDemoStage(r.demo)}
                  className="relative cursor-pointer rounded-full px-4 py-2.5 text-sm font-extrabold text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 sm:px-6 sm:text-base"
                >
                  {isActive ? (
                    <motion.span layoutId="garden-role-pill" className={`absolute inset-0 rounded-full ${r.tint}`} transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                  ) : null}
                  <span className="relative">
                    <span aria-hidden="true">{r.emoji}</span> {r.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div id="garden-roles-demo" role="tabpanel" aria-label={role.label} className="mt-10 w-full max-w-5xl">
            <GardenDemoFrame active={role.demo} tilt={0.8} tape="var(--sf-lav)" />
          </div>
          <a href={BOOK_DEMO_HASH_HREF} className={`${btnPop} mt-12`}>
            {role.copy.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
