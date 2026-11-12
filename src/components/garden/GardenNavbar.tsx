"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import { TRY_FREE_NAV_LABEL, TRY_FREE_PATH } from "@/lib/marketing/free-tools";
import { MARKETING_NAV_LINKS } from "@/lib/marketing/nav-links";

/**
 * Garden navbar: transparent over the cream hero, then tucks into a floating
 * paper pill once you scroll. Same links and CTAs as the live navbar.
 */
export default function GardenNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-[200] px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 rounded-full px-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-6 ${
          solid
            ? "border-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]/90 shadow-[0_18px_40px_-28px_rgba(43,36,29,0.55)] backdrop-blur-md"
            : "border-2 border-transparent bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
        >
          <Image
            src="/images/Logo.webp"
            alt=""
            width={140}
            height={56}
            priority
            sizes="140px"
            className="h-9 w-auto object-contain transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110"
          />
          <span className="sf-display text-xl tracking-tight text-[var(--sf-ink)] md:text-[22px]">MudKitchen</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {MARKETING_NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 text-[15px] font-bold text-[var(--sf-ink)]/70 transition-colors hover:bg-[var(--sf-butter)]/60 hover:text-[var(--sf-ink)] focus-visible:bg-[var(--sf-butter)]/60 focus-visible:outline-none"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={GET_STARTED_PAGE_PATH}
            className="hidden h-10 items-center rounded-full border-2 border-[var(--sf-ink)]/15 bg-white px-4 text-sm font-extrabold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-ink)]/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-ink)]/15 lg:inline-flex"
          >
            Book a Demo
          </Link>
          <Link
            href={TRY_FREE_PATH}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--sf-clay)] px-5 text-sm font-extrabold text-white shadow-[0_4px_0_0_var(--sf-clay-deep)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--sf-clay-deep)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-clay-deep)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35"
          >
            {TRY_FREE_NAV_LABEL}
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--sf-ink)] shadow-[0_3px_0_0_rgba(43,36,29,0.15)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="garden-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav
          id="garden-mobile-menu"
          aria-label="Mobile navigation"
          data-lenis-prevent
          className="mx-auto mt-2 max-w-[1280px] rounded-[28px] border-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-5 pb-5 pt-2 shadow-[0_24px_50px_-30px_rgba(43,36,29,0.6)] md:hidden"
        >
          {MARKETING_NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-dashed border-[var(--sf-ink)]/10 py-3.5 text-lg font-extrabold text-[var(--sf-ink)]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={TRY_FREE_PATH}
            onClick={() => setOpen(false)}
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--sf-clay)] text-base font-extrabold text-white shadow-[0_4px_0_0_var(--sf-clay-deep)]"
          >
            {TRY_FREE_NAV_LABEL}
            <ArrowRight size={14} aria-hidden />
          </Link>
          <Link
            href={GET_STARTED_PAGE_PATH}
            onClick={() => setOpen(false)}
            className="mt-3 flex h-12 items-center justify-center rounded-full border-2 border-[var(--sf-ink)]/15 bg-white text-base font-extrabold text-[var(--sf-ink)]"
          >
            Book a Demo
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
