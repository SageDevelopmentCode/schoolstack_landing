"use client";

import { CUSTOM_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { btnOutline } from "@/components/garden/ui";
import { Marquee, Reveal } from "@/components/garden/motion";
import SectionIntro from "./SectionIntro";

const TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-lav)]", "bg-[var(--sf-peach)]", "bg-white"];
const EMOJI = ["✏️", "🏫", "💬", "✅", "📊", "📅", "💸", "🎨", "🤝", "🙋", "📚", "✨"];

const half = Math.ceil(CUSTOM_COPY.tags.length / 2);
const ROW_A = CUSTOM_COPY.tags.slice(0, half);
const ROW_B = CUSTOM_COPY.tags.slice(half);

function TagPill({ tag, i }: { tag: string; i: number }) {
  return (
    <span
      className={`mx-2.5 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-2 border-[var(--sf-ink)] px-5 py-3 text-base font-extrabold text-[var(--sf-ink)] shadow-[0_4px_0_0_var(--sf-ink)] ${TINTS[i % TINTS.length]}`}
    >
      <span aria-hidden="true">{EMOJI[i % EMOJI.length]}</span>
      {tag}
    </span>
  );
}

/** "We build custom, too" — two opposing tilted marquees of custom-build tags. */
export default function CustomBuild({ className = "" }: { className?: string }) {
  return (
    <section id="custom" className={`overflow-hidden py-24 lg:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill="🛠️ Custom builds"
          tint="lav"
          lead={CUSTOM_COPY.headlineLead}
          accent={CUSTOM_COPY.headlineAccent}
          squiggle="var(--sf-lav)"
          body={<p>{CUSTOM_COPY.body}</p>}
        />
      </div>
      {/* Visible list for assistive tech; the marquees below are decorative. */}
      <ul className="sr-only">
        {CUSTOM_COPY.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="mt-16 -rotate-2 space-y-5" aria-hidden="true">
        <Marquee duration={45} trackClassName="py-2">
          {ROW_A.map((t, i) => (
            <TagPill key={t} tag={t} i={i} />
          ))}
        </Marquee>
        <Marquee duration={50} reverse trackClassName="py-2">
          {ROW_B.map((t, i) => (
            <TagPill key={t} tag={t} i={i + half} />
          ))}
        </Marquee>
      </div>
      <Reveal className="mt-16 text-center">
        <a href={BOOK_DEMO_HASH_HREF} className={btnOutline}>
          {CUSTOM_COPY.cta}
        </a>
      </Reveal>
    </section>
  );
}
