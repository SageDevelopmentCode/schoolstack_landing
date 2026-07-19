"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

function usePointerParallax(enabled: boolean) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [enabled]);

  return enabled ? offset : { x: 0, y: 0 };
}

function FloatingIllustration({
  src,
  width,
  height,
  className,
  floatDelay = 0,
  parallax = { x: 0, y: 0 },
  parallaxStrength = 1,
  animate = true,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
  floatDelay?: number;
  parallax?: { x: number; y: number };
  parallaxStrength?: number;
  animate?: boolean;
}) {
  return (
    <motion.div
      className={className}
      style={{
        x: parallax.x * parallaxStrength,
        y: parallax.y * parallaxStrength,
      }}
    >
      <motion.div
        animate={
          animate
            ? {
                y: [0, -10, 0],
              }
            : undefined
        }
        transition={
          animate
            ? {
                duration: 5 + floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: floatDelay,
              }
            : undefined
        }
      >
        <Image
          src={src}
          alt=""
          aria-hidden
          width={width}
          height={height}
          loading="lazy"
          sizes={`${width}px`}
        />
      </motion.div>
    </motion.div>
  );
}

export default function NotFoundExperience() {
  const reduceMotion = useReducedMotion();
  const [parallaxReady, setParallaxReady] = useState(false);
  const parallax = usePointerParallax(parallaxReady);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setParallaxReady(!reduceMotion && media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [reduceMotion]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-6 py-24 lg:px-16">
      <div
        className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-accent-highlight/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-clay-soft/60 blur-3xl"
        aria-hidden
      />

      <div className="hero-enter-slide-right pointer-events-none absolute top-[60px] right-[-200px] z-0 hidden select-none lg:block">
        <FloatingIllustration
          src="/images/illustrations/HeroRight.webp"
          width={420}
          height={500}
          parallax={parallax}
          parallaxStrength={18}
          animate={!reduceMotion}
        />
      </div>

      <div className="hero-enter-slide-left pointer-events-none absolute top-[60px] left-[-200px] z-0 hidden select-none lg:block">
        <FloatingIllustration
          src="/images/illustrations/HeroLeft.webp"
          width={420}
          height={500}
          parallax={parallax}
          parallaxStrength={-18}
          floatDelay={0.4}
          animate={!reduceMotion}
        />
      </div>

      <div className="pointer-events-none absolute bottom-[120px] left-[8%] z-0 hidden select-none lg:block">
        <FloatingIllustration
          src="/images/illustrations/Acorns.webp"
          width={120}
          height={120}
          parallax={parallax}
          parallaxStrength={10}
          floatDelay={0.8}
          animate={!reduceMotion}
        />
      </div>

      <div className="pointer-events-none absolute top-[180px] right-[12%] z-0 hidden select-none lg:block">
        <FloatingIllustration
          src="/images/illustrations/Beads.webp"
          width={100}
          height={100}
          parallax={parallax}
          parallaxStrength={-12}
          floatDelay={1.2}
          animate={!reduceMotion}
        />
      </div>

      <div className="relative z-10 w-full max-w-[720px]">
        <div className="text-center">
          <div
            className="hero-enter"
            style={{ "--hero-delay": "0ms" } as CSSProperties}
          >
            <span className="inline-flex items-center rounded-pill bg-[#E2EDD9] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4A6B52]">
              404
            </span>
          </div>

          <h1
            className="hero-enter mt-5 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.06] tracking-tight text-accent"
            style={{ "--hero-delay": "80ms" } as CSSProperties}
          >
            This page wandered off{" "}
            <em className="text-clay not-italic">the trail.</em>
          </h1>

          <p
            className="hero-enter mt-4 text-[16px] leading-relaxed text-text-muted"
            style={{ "--hero-delay": "160ms" } as CSSProperties}
          >
            Let&apos;s get you back on track.
          </p>
        </div>

        <div
          className="hero-enter mt-10 flex flex-col items-center gap-4"
          style={{ "--hero-delay": "240ms" } as CSSProperties}
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-pill bg-accent px-7 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Back to homepage
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <Link
              href="/get-started"
              className="inline-flex h-11 items-center gap-2 rounded-pill bg-clay px-7 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Book a Demo
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <Link
            href="/#product"
            className="text-sm text-accent/60 transition-colors duration-200 hover:text-accent"
          >
            Explore the product
          </Link>
        </div>
      </div>
    </section>
  );
}
