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
import {
  BOOK_DEMO_SECTION_ID,
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
