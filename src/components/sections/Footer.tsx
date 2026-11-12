"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Info, Layers, Users, Wrench } from "lucide-react";
import { BOOK_DEMO_HREF } from "@/lib/marketing/book-demo";
import {
  FREE_TOOLS_HUB_PATH,
  FREE_TOOLS_NAV_LABEL,
} from "@/lib/marketing/free-tools";
import MobileAppDownloadBadges from "@/components/download/MobileAppDownloadBadges";
import { gardenFontVariables } from "@/components/garden/fonts";
import { Draw, Leaf, Tape, btnPop } from "@/components/garden/ui";
import { ILLUSTRATIONS, MUDKITCHEN_LOGO } from "@/components/home-garden/assets";
import "@/components/garden/garden.css";

/*
 * The footer is shared by Garden pages (inside GardenRoot) and older pages that
 * aren't. It opts into the Garden scope itself (fonts + `.sf-garden` tokens), so
 * it looks the same everywhere; nesting inside another `.sf-garden` is harmless.
 * Client component because `ui.tsx` is a client module (its string exports such
 * as `btnPop` can't cross into a server component).
 */

const NAV_LINKS = [
  { label: "About", href: "/about", icon: Info },
  { label: "Product", href: "/#product", icon: Layers },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: FREE_TOOLS_NAV_LABEL, href: FREE_TOOLS_HUB_PATH, icon: Wrench },
];

const LEGAL_LINKS = [
  { label: "Support", href: "/support" },
  { label: "Delete account", href: "/account-deletion" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "DPA", href: "/dpa" },
];

/** Icon dot tint per chip, cycled. Literal classes so Tailwind sees them. */
const CHIP_DOTS = [
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-mint)]",
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-lav)]",
  "bg-[var(--sf-peach)]",
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sf-paper)]";

const chip = `inline-flex items-center gap-2 rounded-full border-2 border-[var(--sf-ink)] bg-white py-1.5 pl-1.5 pr-4 text-[15px] font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-[rotate,translate,box-shadow] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_var(--sf-ink)] focus-visible:!rotate-0 focus-visible:-translate-y-0.5 focus-visible:shadow-[0_5px_0_0_var(--sf-ink)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)] motion-reduce:transition-none ${focusRing}`;

const legalLink = `rounded-md text-sm font-bold text-[var(--sf-soft)] transition-colors hover:text-[var(--sf-ink)] ${focusRing}`;

export default function Footer() {
  return (
    <footer
      className={`${gardenFontVariables} sf-garden bg-[var(--sf-cream)] px-3 pb-8 pt-6 lg:px-6`}
    >
      <div className="sf-grid relative mx-auto max-w-[1400px] rounded-[44px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] shadow-[0_10px_0_0_var(--sf-ink)]">
        <Tape color="var(--sf-butter)" className="-top-3 left-10 -rotate-6 sm:left-16" />
        <Tape color="var(--sf-mint)" className="-top-3 right-10 rotate-3 sm:right-24" />

        <div className="px-5 pt-12 sm:px-10 lg:px-14 lg:pt-14">
          {/* Top row: brand + CTA */}
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/"
                className={`inline-flex items-center gap-2.5 rounded-2xl ${focusRing}`}
              >
                <Image
                  src={MUDKITCHEN_LOGO}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  sizes="44px"
                  className="h-11 w-11 object-contain"
                />
                <span className="sf-display text-[28px] text-[var(--sf-ink)]">MudKitchen</span>
              </Link>
              <p className="mt-3 max-w-[280px] text-base leading-relaxed text-[var(--sf-soft)]">
                Software built to run a real microschool.
              </p>
              <MobileAppDownloadBadges
                className="mt-5 flex flex-wrap items-center gap-3"
                badgeClassName="h-10 w-auto object-contain sm:h-11"
              />
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <p
                aria-hidden="true"
                className="sf-hand -rotate-2 text-2xl text-[var(--sf-forest)]"
              >
                pull up a chair! ↓
              </p>
              <a href={BOOK_DEMO_HREF} className={btnPop}>
                Book a Demo
                <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Sticker-chip nav */}
          <nav aria-label="Footer navigation" className="mt-12">
            <ul className="flex flex-wrap gap-x-3 gap-y-4">
              {NAV_LINKS.map((link, i) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={chip}
                    style={{ rotate: i % 2 === 0 ? "-1.5deg" : "1.5deg" }}
                  >
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full ${CHIP_DOTS[i % CHIP_DOTS.length]}`}
                    >
                      <link.icon size={15} strokeWidth={2.4} aria-hidden="true" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Big clipped wordmark sinking into the perforation, with a plant peeking out */}
        <div aria-hidden="true" className="relative mt-10 lg:mt-12">
          <Draw className="absolute left-5 top-0 z-10 h-12 w-12 -translate-y-3/4 -rotate-12 sm:left-10 sm:h-16 sm:w-16 lg:left-14">
            <Leaf className="h-full w-full" />
          </Draw>
          <div className="relative h-[0.6em] overflow-hidden px-4 text-[min(14vw,13.5rem)] sm:px-8 lg:px-12">
            <p className="sf-display select-none whitespace-nowrap leading-[0.8] tracking-[-0.05em] text-[var(--sf-ink)]/[0.1]">
              MudKitchen
            </p>
          </div>
          <Image
            src={ILLUSTRATIONS.plant}
            alt=""
            width={1024}
            height={1024}
            loading="lazy"
            sizes="(min-width: 1024px) 160px, (min-width: 640px) 120px, 88px"
            className="pointer-events-none absolute bottom-0 right-6 h-auto w-[88px] translate-y-[14%] sm:right-12 sm:w-[120px] lg:right-20 lg:w-[160px]"
          />
        </div>

        {/* Perforation + legal */}
        <div className="border-t-2 border-dashed border-[var(--sf-ink)]/25 px-5 pb-8 pt-6 sm:px-10 lg:px-14">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
              <p className="text-sm font-bold text-[var(--sf-soft)]">
                © 2026 MudKitchen. All rights reserved.
              </p>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={legalLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm font-bold text-[var(--sf-soft)]">
              🏫 Made for microschool founders, by people who get it.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
