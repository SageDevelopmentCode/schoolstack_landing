"use client";

import Link from "next/link";
import { WORKFLOW_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal } from "@/components/garden/motion";
import { Arrow, Draw, Leaf, btnOutline, btnPop } from "@/components/garden/ui";
import SectionIntro from "../SectionIntro";

const NOTES = [
  { tint: "bg-[var(--sf-butter)]", tilt: -2 },
  { tint: "bg-[var(--sf-sky)]", tilt: 1.5 },
  { tint: "bg-[var(--sf-clay)] text-white", tilt: -1 },
];

/** Guided setup as three sticky notes, joined by hand-drawn arrows. */
export default function SetupNotes() {
  return (
    <section id="setup" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`🌱 ${WORKFLOW_COPY.badge}`}
          tint="forest"
          lead={WORKFLOW_COPY.headlineLead}
          accent={WORKFLOW_COPY.headlineAccent}
          accentColor="text-[var(--sf-forest)]"
          squiggle="var(--sf-mint)"
          body={<p>{WORKFLOW_COPY.body}</p>}
        />

        <div className="relative mt-20">
          <Draw className="pointer-events-none absolute left-[29%] top-[-2.5rem] hidden w-28 lg:block" delay={0.4}>
            <Arrow color="var(--sf-forest)" />
          </Draw>
          <Draw className="pointer-events-none absolute left-[63%] top-[-2.5rem] hidden w-28 lg:block" delay={0.9}>
            <Arrow color="var(--sf-forest)" />
          </Draw>
          <Reveal as="ol" className="grid gap-8 md:grid-cols-3 md:gap-7" stagger={0.15} y={60}>
            {WORKFLOW_COPY.steps.map((s, i) => {
              const n = NOTES[i];
              const dark = i === 2;
              return (
                <li
                  key={s.number}
                  className={`sf-wiggle relative overflow-hidden rounded-md p-7 pt-9 shadow-[0_18px_34px_-18px_rgba(43,36,29,0.55)] ${n.tint}`}
                  style={{ rotate: `${n.tilt}deg` }}
                >
                  <span className="absolute -top-0 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 rounded-b-sm bg-white/70" aria-hidden="true" />
                  {dark ? (
                    <Draw className="absolute -bottom-6 -right-6 w-28 opacity-40">
                      <Leaf color="#fff" />
                    </Draw>
                  ) : null}
                  <span className={`sf-hand text-xl ${dark ? "text-white/85" : "text-[var(--sf-ink)]/60"}`}>step {s.number}</span>
                  <h3 className={`sf-display mt-2 text-[1.9rem] leading-[1.02] ${dark ? "text-white" : "text-[var(--sf-ink)]"}`}>{s.title}</h3>
                  <p className={`mt-4 leading-relaxed ${dark ? "text-white/90" : "text-[var(--sf-ink)]/75"}`}>{s.body}</p>
                </li>
              );
            })}
          </Reveal>
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-lg font-bold text-[var(--sf-soft)]">{WORKFLOW_COPY.reassurance}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {WORKFLOW_COPY.primaryCta}
            </a>
            <Link href={WORKFLOW_COPY.secondaryHref} className={btnOutline}>
              {WORKFLOW_COPY.secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
