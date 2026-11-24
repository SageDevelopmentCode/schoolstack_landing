"use client";

import { Draw, Squiggle } from "@/components/garden/ui";

type MarketingToolHeroProps = {
  /** Heading words before the coloured accent phrase. */
  lead: string;
  accent: string;
  description: string;
  headingAs?: "h1" | "h2";
  headingId?: string;
  className?: string;
};

/** Garden hero for a free tool: display heading with a clay accent → lead paragraph. */
export default function MarketingToolHero({
  lead,
  accent,
  description,
  headingAs = "h1",
  headingId,
  className = "mb-10 sm:mb-12",
}: MarketingToolHeroProps) {
  const Heading = headingAs;

  return (
    <header className={className}>
      <Heading
        id={headingId}
        className="sf-display max-w-[820px] text-[2.6rem] leading-[0.92] text-[var(--sf-ink)] sm:text-6xl lg:text-[4.2rem]"
      >
        {lead}{" "}
        <span className="relative isolate inline-block text-[var(--sf-clay)]">
          <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.3}>
            <Squiggle className="h-4 w-full md:h-5" color="var(--sf-butter)" />
          </Draw>
          {accent}
        </span>
      </Heading>
      <p className="mt-6 max-w-[640px] text-lg leading-relaxed text-[var(--sf-soft)]">{description}</p>
    </header>
  );
}
