"use client";

import Image from "next/image";
import { FadeInView } from "@/components/ui/FadeInView";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { DEMO_CONTAINER, DEMO_HEADING, DEMO_INK } from "../bright-demo-theme";

/** Oversized centered pull quote with the photo as a small round portrait. */
export default function SiteQuote({ quote }: { quote: SchoolWebsiteDemoConfig["quote"] }) {
  const [first, ...rest] = quote.text;

  return (
    <section className="bg-white py-20 @3xl/site:py-28">
      <FadeInView className={`${DEMO_CONTAINER} text-center`}>
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full ring-[6px] ring-[var(--demo-tint-1)]">
          <Image src={quote.backgroundImage} fill sizes="80px" className="object-cover" alt="" />
        </div>
        <blockquote
          className={`${DEMO_HEADING} ${DEMO_INK} mx-auto mt-8 max-w-[980px] text-balance text-[clamp(1.75rem,3.4cqw,3rem)]`}
        >
          &ldquo;{first}
          {rest.length > 0 ? (
            <>
              {" "}
              <span className="text-[var(--demo-accent)]">{rest.join(" ")}</span>
            </>
          ) : null}
          &rdquo;
        </blockquote>
        <p className="font-secondary mt-8 inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--demo-muted)]">
          <span className="h-px w-8 bg-[var(--demo-primary)]" aria-hidden />
          {quote.attribution}
          <span className="h-px w-8 bg-[var(--demo-primary)]" aria-hidden />
        </p>
      </FadeInView>
    </section>
  );
}
