"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Squiggle, Tape } from "@/components/garden/ui";
import {
  SITE_BODY,
  SITE_EASE,
  SITE_H2,
  SITE_LEAD,
  SITE_SOFT_SHADOW,
  SITE_STRAIGHTEN,
  SITE_TAPES,
} from "../site-garden-theme";

/**
 * Fades and lifts its content in when it scrolls into view.
 *
 * Framer's `whileInView` (an IntersectionObserver) rather than Garden's GSAP
 * `Reveal`: the site scrolls inside its own container, and GSAP's
 * ScrollTriggers watch the window, so content could stay hidden.
 */
export function SiteReveal({
  children,
  className,
  style,
  delay = 0,
  y = 22,
  as = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "article" | "figure";
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      id={id}
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: SITE_EASE }}
    >
      {children}
    </Tag>
  );
}

/** Eyebrow pill, ink-bordered, in the school's soft tint. */
export function SitePill({
  children,
  onDark = false,
  className = "",
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1 text-[13px] font-extrabold ${
        onDark
          ? "border-[var(--sf-on-forest)]/35 bg-white/10 text-[var(--sf-on-forest)]"
          : "border-[var(--sf-ink)] bg-[var(--sf-peach)] text-[var(--sf-clay-deep)] shadow-[0_2px_0_0_var(--sf-ink)]"
      } ${className}`}
    >
      <span aria-hidden="true">✿</span>
      {children}
    </span>
  );
}

/**
 * Keeps hyphenated words ("K-5", "one-size-fits-all") on one line in big
 * display headings, where `text-balance` otherwise likes to break at the hyphen.
 */
export function keepHyphenated(text: ReactNode): ReactNode {
  if (typeof text !== "string" || !/\S-\S/.test(text)) return text;
  return text.split(/(\s+)/).map((part, i) =>
    /\S-\S/.test(part) ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Accent phrase: school colour with a butter marker swipe (wraps safely). */
export function SiteAccent({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span
      className={
        onDark
          ? "text-[var(--sf-butter)]"
          : "text-[var(--sf-accent-ink)] [box-decoration-break:clone] bg-[linear-gradient(transparent_64%,var(--sf-butter)_64%)]"
      }
    >
      {children}
    </span>
  );
}

/** Accent line with a drawn squiggle underneath (short phrases only, e.g. the hero). */
export function SiteSquiggleAccent({
  children,
  className = "text-[var(--sf-accent-ink)]",
  squiggleColor = "var(--sf-butter)",
}: {
  children: ReactNode;
  className?: string;
  squiggleColor?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <Squiggle
        className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.22em] w-full"
        color={squiggleColor}
      />
    </span>
  );
}

type IntroAlign = "left" | "center" | "split";

/**
 * Garden section heading stack: pill → h2 (lead + accent) → body.
 * `split` puts the body to the right on wide frames.
 */
export function SiteSectionIntro({
  eyebrow,
  heading,
  accent,
  subtitle,
  align = "left",
  onDark = false,
  headingAs = "h2",
  headingClassName = "",
  className = "",
}: {
  eyebrow?: string;
  heading: ReactNode;
  accent?: string;
  subtitle?: ReactNode;
  align?: IntroAlign;
  onDark?: boolean;
  headingAs?: ElementType;
  headingClassName?: string;
  className?: string;
}) {
  const Heading = headingAs;
  const headingColor = onDark ? "!text-[var(--sf-on-forest)]" : "";
  const bodyColor = onDark ? "!text-[var(--sf-on-forest)]/80" : "";

  const title = (
    <Heading className={`${SITE_H2} ${headingColor} ${eyebrow ? "mt-5" : ""} text-balance ${headingClassName}`}>
      {keepHyphenated(heading)}
      {accent ? (
        <>
          {" "}
          <SiteAccent onDark={onDark}>{keepHyphenated(accent)}</SiteAccent>
        </>
      ) : null}
    </Heading>
  );

  if (align === "split") {
    return (
      <SiteReveal
        className={`flex flex-col gap-5 @5xl/site:flex-row @5xl/site:items-end @5xl/site:justify-between @5xl/site:gap-12 ${className}`}
      >
        <div className="max-w-[720px]">
          {eyebrow ? <SitePill onDark={onDark}>{eyebrow}</SitePill> : null}
          {title}
        </div>
        {subtitle ? <p className={`${SITE_BODY} ${bodyColor} max-w-[420px] @5xl/site:pb-2`}>{subtitle}</p> : null}
      </SiteReveal>
    );
  }

  const centered = align === "center";
  return (
    <SiteReveal className={`${centered ? "mx-auto max-w-[780px] text-center" : "max-w-[760px]"} ${className}`}>
      {eyebrow ? <SitePill onDark={onDark}>{eyebrow}</SitePill> : null}
      {title}
      {subtitle ? (
        <p className={`${SITE_LEAD} ${bodyColor} mt-5 ${centered ? "mx-auto max-w-[600px]" : "max-w-[600px]"}`}>
          {subtitle}
        </p>
      ) : null}
    </SiteReveal>
  );
}

/** Taped polaroid photo; tilt straightens on hover. */
export function SitePolaroid({
  src,
  alt = "",
  sizes,
  tilt = 0,
  tape = 0,
  caption,
  className = "",
  imageClassName = "aspect-[4/3]",
  preload = false,
}: {
  src: string;
  alt?: string;
  sizes: string;
  tilt?: number;
  /** Index into the tape colours, or `false` for none. */
  tape?: number | false;
  caption?: string;
  className?: string;
  imageClassName?: string;
  preload?: boolean;
}) {
  return (
    <figure
      className={`sf-polaroid relative ${SITE_STRAIGHTEN} ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      {tape !== false ? (
        <Tape
          color={SITE_TAPES[tape % SITE_TAPES.length]}
          className="-top-3 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-3"
        />
      ) : null}
      <div className={`relative overflow-hidden rounded-[3px] bg-[var(--sf-cream)] ${imageClassName}`}>
        <Image src={src} fill sizes={sizes} className="object-cover" alt={alt} preload={preload} />
      </div>
      {caption ? (
        <figcaption className="sf-hand mt-2 text-center text-[1.1rem] leading-tight text-[var(--sf-soft)]" aria-hidden="true">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Pastel sticky note with a strip of tape. Decorative tilt only. */
export function SiteStickyNote({
  children,
  tilt = -1.5,
  tint = "bg-[var(--sf-butter)]",
  tape = 1,
  className = "",
}: {
  children: ReactNode;
  tilt?: number;
  tint?: string;
  tape?: number | false;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-md p-5 ${tint} ${SITE_SOFT_SHADOW} ${SITE_STRAIGHTEN} ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      {tape !== false ? (
        <Tape
          color={SITE_TAPES[tape % SITE_TAPES.length]}
          className="-top-3 left-1/2 h-5 w-14 -translate-x-1/2 rotate-2"
        />
      ) : null}
      {children}
    </div>
  );
}

/** Zero-padded index ("01") in Gochi, decorative. */
export function SiteIndex({ i, className = "" }: { i: number; className?: string }) {
  return (
    <span className={`sf-hand text-[1.4rem] leading-none text-[var(--sf-soft)] ${className}`} aria-hidden="true">
      {String(i + 1).padStart(2, "0")}
    </span>
  );
}
