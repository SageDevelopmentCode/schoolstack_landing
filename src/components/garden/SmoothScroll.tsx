"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger scrubs stay
 * perfectly in sync. Disabled entirely for prefers-reduced-motion.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const prevPathnameRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const garden = document.querySelector(".sf-garden");
    if (reduce || !garden) return;

    garden.classList.add("sf-motion-ready");
    return () => garden.classList.remove("sf-motion-ready");
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let refreshRaf = 0;
    const refresh = () => {
      cancelAnimationFrame(refreshRaf);
      refreshRaf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        ScrollTrigger.update();
      });
    };

    window.addEventListener("load", refresh);
    // Fonts shift line lengths, which shifts trigger positions.
    document.fonts?.ready.then(refresh).catch(() => {});

    const garden = document.querySelector(".sf-garden");
    let lastH = garden?.scrollHeight ?? document.documentElement.scrollHeight;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      const h = garden?.scrollHeight ?? document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(timer);
      timer = setTimeout(() => {
        refresh();
        lastH = garden?.scrollHeight ?? document.documentElement.scrollHeight;
      }, 250);
    });
    if (garden) {
      ro.observe(garden);
    } else {
      ro.observe(document.body);
    }

    const stopObserving = () => {
      ro.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(refreshRaf);
      window.removeEventListener("load", refresh);
    };

    if (reduce) {
      return stopObserving;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      allowNestedScroll: true,
      anchors: true,
      // Never hijack scrolling inside modals, sheets, or the mobile menu.
      prevent: (node) => !!node.closest(".fixed, [role='dialog'], [data-lenis-prevent]"),
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisRef.current = null;
      stopObserving();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    });
  }, [pathname]);

  return <>{children}</>;
}
