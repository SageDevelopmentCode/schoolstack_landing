"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AFTER_BELL_FEATURES } from "@/lib/marketing/features";
import { AFTER_BELL_COPY as COPY } from "@/lib/marketing/features/features-copy";
import { FEATURES_PATH, featurePath } from "@/lib/marketing/features/paths";
import { Reveal } from "@/components/garden/motion";
import { IconStamp, TINT_BG, featureCoverShots } from "./feature-ui";

const TILTS = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.9, -1.9, 1.4];

/**
 * The end of the home page's school day: the features that live around the
 * day (calendar, bulletin, photos, newsletters, committees, staff, classrooms,
 * forms) as small tilted cards, each linking to its feature page. A grid on
 * tablets and up, a snap rail on phones.
 */
export default function AfterBellStrip() {
  if (!AFTER_BELL_FEATURES.length) return null;
  return (
    <div className="mx-auto mt-24 w-full max-w-7xl px-6 sm:px-10 lg:mt-28 lg:px-16">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-xl">
          <p className="sf-hand text-2xl text-[var(--sf-forest)]" aria-hidden="true">
            {COPY.note}
          </p>
          <h3 className="sf-display mt-2 text-4xl leading-[0.98] text-[var(--sf-ink)] md:text-5xl">{COPY.heading}</h3>
          <p className="mt-4 text-lg leading-relaxed text-[var(--sf-soft)]">{COPY.body}</p>
        </div>
        <Link
          href={FEATURES_PATH}
          className="group inline-flex items-center gap-2 rounded-full px-1 text-base font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-[6px] hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
        >
          {COPY.link}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      <Reveal
        as="ul"
        className="sf-no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 pt-4 [scroll-padding-inline:1.5rem] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
        stagger={0.06}
        y={30}
      >
        {AFTER_BELL_FEATURES.map((f, i) => {
          const { web, mobile } = featureCoverShots(f);
          const thumb = web ?? mobile;
          return (
            <li key={f.slug} className="w-[72vw] max-w-[290px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <Link
                href={featurePath(f.slug)}
                className="group flex h-full flex-col rounded-[24px] border-2 border-[var(--sf-ink)] bg-white p-4 shadow-[0_5px_0_0_var(--sf-ink)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1 hover:shadow-[0_8px_0_0_var(--sf-ink)] focus-visible:!rotate-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35 motion-reduce:transition-none"
                style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}
              >
                {thumb ? (
                  <span className={`relative block overflow-hidden rounded-[14px] border-2 border-[var(--sf-ink)]/80 ${TINT_BG[f.tint]} px-3 pt-3`} aria-hidden="true">
                    <span className="relative block overflow-hidden rounded-t-[8px] bg-white" style={{ aspectRatio: "16 / 10" }}>
                      <Image src={thumb.src} alt="" fill sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 72vw" className="object-cover object-left-top" loading="lazy" />
                    </span>
                  </span>
                ) : null}
                <span className="mt-4 flex items-start justify-between gap-3">
                  <span className="sf-display text-2xl leading-[1] text-[var(--sf-ink)]">{f.name}</span>
                  <IconStamp feature={f} size="sm" className="-mt-1 scale-90" />
                </span>
                <span className="mt-2 flex-1 text-[15px] leading-relaxed text-[var(--sf-ink)]/75">{f.oneLiner}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--sf-clay-deep)]">
                  {mobile && web ? "Web & app" : web ? "Web" : "App"}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </Reveal>
    </div>
  );
}
