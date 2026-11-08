"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, Wrench, X } from "lucide-react";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import { FREE_TOOLS_HUB_PATH, FREE_TOOLS_NAV_LABEL } from "@/lib/marketing/free-tools";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Product", href: "#product" },
  { label: "Customers", href: "/customers" },
  { label: "Blog", href: "/blog" },
];

const T = {
  top: "bg-transparent",
  solid: "bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md",
  link: "text-[#2B241D]/70 hover:text-[#2B241D]",
  wordmark: "font-secondary font-bold tracking-tight text-[#1d1a16]",
  cta: "bg-[#1d1a16] text-white hover:bg-clay",
  secondary: "border border-black/10 bg-white text-[#1d1a16] hover:border-black/25",
  menuPanel: "bg-white border-black/10",
} as const;

export default function BrightNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const t = T;

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[200] font-secondary transition-[background-color,box-shadow] duration-300 ${
        scrolled || open ? t.solid : t.top
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-5 md:h-[72px] lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/images/Logo.webp"
            alt="MudKitchen"
            width={140}
            height={56}
            priority
            sizes="140px"
            className="h-9 w-auto object-contain md:h-11"
          />
          <span className={`text-lg md:text-[21px] ${t.wordmark}`}>MudKitchen</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-150 ${t.link}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href={FREE_TOOLS_HUB_PATH}
            className={`hidden h-10 items-center gap-1.5 rounded-pill px-4 text-sm font-medium transition-all duration-200 lg:inline-flex ${t.secondary}`}
          >
            <Wrench size={14} aria-hidden />
            {FREE_TOOLS_NAV_LABEL}
          </Link>
          <Link
            href={GET_STARTED_PAGE_PATH}
            className={`inline-flex h-10 items-center gap-1.5 rounded-pill px-5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${t.cta}`}
          >
            Book a Demo
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <button
          type="button"
          className={`flex h-10 w-10 items-center justify-end md:hidden ${t.link}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="bright-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav
          id="bright-mobile-menu"
          aria-label="Mobile navigation"
          className={`border-t px-5 pb-5 pt-2 md:hidden ${t.menuPanel}`}
        >
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-[17px] font-medium ${t.link}`}
            >
              {link.label}
            </a>
          ))}
          <Link
            href={GET_STARTED_PAGE_PATH}
            onClick={() => setOpen(false)}
            className={`mt-2 flex h-12 items-center justify-center gap-2 rounded-pill text-sm font-semibold ${t.cta}`}
          >
            Book a Demo
            <ArrowRight size={14} aria-hidden />
          </Link>
          <Link
            href={FREE_TOOLS_HUB_PATH}
            onClick={() => setOpen(false)}
            className={`mt-2 flex h-12 items-center justify-center gap-2 rounded-pill text-sm font-medium ${t.secondary}`}
          >
            <Wrench size={16} aria-hidden />
            {FREE_TOOLS_NAV_LABEL}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
