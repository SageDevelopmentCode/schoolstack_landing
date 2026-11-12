"use client";

import type { ReactNode } from "react";
import { Draw, Pill, Squiggle, type Tint } from "@/components/garden/ui";
import { WordsReveal } from "@/components/garden/motion";

/**
 * Garden section heading: Pill → h2 (lead + accent phrase with a drawn
 * squiggle) → optional handwritten note → optional body.
 */
export default function SectionIntro({
  pill,
  tint = "clay",
  lead,
  accent,
  accentColor = "text-[var(--sf-clay)]",
  squiggle = "var(--sf-butter)",
  note,
  body,
  align = "center",
  className = "",
  headingClassName = "text-5xl md:text-7xl",
  bodyClassName = "text-[var(--sf-soft)]",
  dark = false,
}: {
  pill?: ReactNode;
  tint?: Tint;
  lead: string;
  accent?: string;
  accentColor?: string;
  squiggle?: string | null;
  note?: string;
  body?: ReactNode;
  align?: "center" | "left";
  className?: string;
  headingClassName?: string;
  bodyClassName?: string;
  dark?: boolean;
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}>
      {pill ? <Pill tint={tint}>{pill}</Pill> : null}
      <h2 className={`sf-display mt-5 leading-[0.95] ${dark ? "text-[var(--sf-cream)]" : "text-[var(--sf-ink)]"} ${headingClassName}`}>
        <WordsReveal as="span" text={lead} className="block" />
        {accent ? (
          <span className={`relative isolate inline-block ${accentColor}`}>
            {squiggle ? (
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.3}>
                <Squiggle className="h-4 w-full md:h-5" color={squiggle} />
              </Draw>
            ) : null}
            <WordsReveal as="span" text={accent} delay={0.15} />
          </span>
        ) : null}
      </h2>
      {note ? <p className={`sf-hand mt-3 text-2xl ${dark ? "text-[var(--sf-butter)]" : "text-[var(--sf-forest)]"}`}>{note}</p> : null}
      {body ? <div className={`mt-6 text-lg leading-relaxed ${bodyClassName}`}>{body}</div> : null}
    </div>
  );
}
