"use client";

import type { ReactNode } from "react";
import { Draw, Pill, Squiggle, type Tint } from "@/components/garden/ui";
import PortalReveal from "./PortalReveal";

/**
 * Page header for the MudKitchen account area: Pill → h1 (optional clay
 * accent with a drawn squiggle) → subtitle → optional decorative hand note
 * → optional actions. Sits on the dot-grid band.
 */
export default function PortalGardenHeader({
  pill,
  tint = "clay",
  title,
  accent,
  subtitle,
  hand,
  actions,
  width = "wide",
}: {
  /** Match the page body's column so the left edges line up. */
  width?: "wide" | "narrow";
  pill: string;
  tint?: Tint;
  title: string;
  accent?: string;
  subtitle?: ReactNode;
  hand?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="sf-grid border-b-2 border-[var(--sf-ink)]/5">
      <PortalReveal
        className={`mx-auto px-6 pb-12 pt-12 sm:px-10 lg:pb-16 lg:pt-16 ${width === "narrow" ? "max-w-[880px]" : "max-w-[1100px]"}`}
      >
        <Pill tint={tint}>{pill}</Pill>
        <h1 className="sf-display mt-5 max-w-3xl text-[2.6rem] leading-[0.95] text-[var(--sf-ink)] sm:text-5xl md:text-6xl">
          {title}
          {accent ? (
            <>
              {" "}
              <span className="relative isolate inline-block text-[var(--sf-clay)]">
                <Draw className="pointer-events-none absolute -bottom-1.5 left-0 -z-10 w-full" delay={0.25}>
                  <Squiggle className="h-3.5 w-full md:h-4" color="var(--sf-butter)" />
                </Draw>
                {accent}
              </span>
            </>
          ) : null}
        </h1>
        {subtitle ? (
          <div className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--sf-soft)]">{subtitle}</div>
        ) : null}
        {hand || actions ? (
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            {actions}
            {hand ? (
              <span className="sf-hand text-2xl text-[var(--sf-forest)]" aria-hidden="true">
                {hand}
              </span>
            ) : null}
          </div>
        ) : null}
      </PortalReveal>
    </section>
  );
}
