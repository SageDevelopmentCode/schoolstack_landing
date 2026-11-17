"use client";

import Image from "next/image";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { SITE_SECTION } from "../site-garden-theme";
import { SiteAccent, SiteReveal, SiteStickyNote } from "../garden/SiteKit";

/** The pull quote on a big taped note, with the photo as a small polaroid. */
export default function SiteQuote({ quote }: { quote: SchoolWebsiteDemoConfig["quote"] }) {
  const [first, ...rest] = quote.text;

  return (
    <section className={SITE_SECTION}>
      <SiteReveal className="relative mx-auto max-w-[1000px] px-5 @3xl/site:px-10">
        <SiteStickyNote tilt={-1} tape={0} className="!px-7 !pb-10 !pt-12 text-center @3xl/site:!px-16 @3xl/site:!pb-14 @3xl/site:!pt-16">
          <div
            className="sf-polaroid absolute -right-3 -top-8 hidden w-28 !p-1.5 !pb-3 @3xl/site:block"
            style={{ rotate: "6deg" }}
            aria-hidden="true"
          >
            <div className="relative aspect-square overflow-hidden rounded-[3px]">
              <Image src={quote.backgroundImage} fill sizes="112px" className="object-cover" alt="" />
            </div>
          </div>
          <figure>
            <blockquote className="sf-display mx-auto max-w-[820px] text-balance text-[clamp(1.8rem,3.4cqw,3rem)] leading-[1.06] text-[var(--sf-ink)]">
              &ldquo;{first}
              {rest.length > 0 ? (
                <>
                  {" "}
                  <SiteAccent>{rest.join(" ")}</SiteAccent>
                </>
              ) : null}
              &rdquo;
            </blockquote>
            <figcaption className="mt-8 inline-flex items-center gap-3 text-[13px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-ink)]/75">
              <span className="h-0.5 w-8 rounded-full bg-[var(--sf-ink)]/40" aria-hidden />
              {quote.attribution}
              <span className="h-0.5 w-8 rounded-full bg-[var(--sf-ink)]/40" aria-hidden />
            </figcaption>
          </figure>
        </SiteStickyNote>
      </SiteReveal>
    </section>
  );
}
