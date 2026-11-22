"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Draw, Leaf, Tape } from "@/components/garden/ui";

/**
 * Calm Garden empty state: illustration on a taped card, a title, one
 * sentence of guidance, an optional action and one decorative hand line.
 */
export default function PortalEmptyState({
  illustration,
  eyebrow,
  title,
  body,
  action,
  hand,
  titleAs: Title = "h2",
}: {
  illustration: string;
  eyebrow?: string;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  hand?: string;
  titleAs?: "h2" | "h3";
}) {
  return (
    <div className="relative mx-auto max-w-xl rounded-[30px] border-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-6 pb-10 pt-12 text-center sm:px-10">
      <Tape color="var(--sf-mint)" className="-top-3 left-1/2 -translate-x-1/2 -rotate-2" />
      <Draw className="pointer-events-none absolute right-6 top-6 hidden w-10 sm:block">
        <Leaf className="h-10 w-10" color="var(--sf-moss)" />
      </Draw>
      <Image
        src={illustration}
        alt=""
        width={160}
        height={160}
        className="mx-auto h-28 w-auto object-contain sm:h-32"
      />
      {eyebrow ? (
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--sf-soft)]">{eyebrow}</p>
      ) : null}
      <Title className={`sf-display text-3xl leading-[1.05] text-[var(--sf-ink)] ${eyebrow ? "mt-2" : "mt-6"}`}>
        {title}
      </Title>
      <div className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-[var(--sf-soft)]">{body}</div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      {hand ? (
        <p className="sf-hand mt-5 text-xl text-[var(--sf-forest)]" aria-hidden="true">
          {hand}
        </p>
      ) : null}
    </div>
  );
}
