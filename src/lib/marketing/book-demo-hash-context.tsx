"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { getActiveLenis } from "@/components/garden/lenis-instance";
import {
  BOOK_DEMO_SECTION_ID,
  GET_STARTED_DEMO_SECTION_ID,
} from "@/lib/marketing/book-demo";

function isBookDemoHash(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hash === `#${BOOK_DEMO_SECTION_ID}`;
}

const BookDemoHashContext = createContext(false);

export function BookDemoHashProvider({ children }: { children: ReactNode }) {
  const [targeted, setTargeted] = useState(false);

  useLayoutEffect(() => {
    const sync = () => setTargeted(isBookDemoHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <BookDemoHashContext.Provider value={targeted}>
      {children}
    </BookDemoHashContext.Provider>
  );
}

export function useBookDemoHashTargeted(): boolean {
  return useContext(BookDemoHashContext);
}

const SCROLL_RETRY_MS = [0, 100, 300, 600, 1200];

/** Space left above a scroll target so the fixed Garden navbar doesn't cover it. */
const NAVBAR_SCROLL_OFFSET = 100;

/** Smooth-scrolls to a section by id, leaving room for the fixed navbar. */
export function scrollToSectionById(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // Lenis is only running when motion is allowed; go through it so a wheel
  // scroll it is still easing can't override this one.
  const lenis = getActiveLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: -NAVBAR_SCROLL_OFFSET });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - NAVBAR_SCROLL_OFFSET,
    behavior: reduce ? "auto" : "smooth",
  });
}

/** Scrolls to the booking flow on /get-started. */
export function scrollToGetStartedDemoSection() {
  scrollToSectionById(GET_STARTED_DEMO_SECTION_ID);
}

export function scrollToBookDemoSection() {
  document
    .getElementById(BOOK_DEMO_SECTION_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BookDemoHashScroll() {
  const scheduleScroll = useCallback(() => {
    if (!isBookDemoHash()) return;
    const timeouts = SCROLL_RETRY_MS.map((delay) =>
      window.setTimeout(() => scrollToBookDemoSection(), delay),
    );
    return () => timeouts.forEach((id) => clearTimeout(id));
  }, []);

  useEffect(() => {
    let cancelRetries: (() => void) | undefined;

    const run = () => {
      cancelRetries?.();
      cancelRetries = scheduleScroll();
    };

    run();
    window.addEventListener("hashchange", run);
    window.addEventListener("pageshow", run);

    return () => {
      cancelRetries?.();
      window.removeEventListener("hashchange", run);
      window.removeEventListener("pageshow", run);
    };
  }, [scheduleScroll]);

  return null;
}
