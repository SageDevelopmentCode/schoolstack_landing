"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { btnPop } from "@/components/garden/ui";
import { useCaptureFirstTouch } from "@/hooks/useCaptureFirstTouch";
import SmoothScroll from "./SmoothScroll";

/**
 * Page chrome for ad landing pages (funnels). It is a stripped-down HomeGardenShell:
 * - the logo, one CTA and a slim footer
 * - no nav links, no lead popup and no floating Questions button
 * so the page has one goal.
 * It still records first-touch attribution so leads carry their UTMs.
 */
export default function FunnelGardenShell({
  children,
  ctaLabel,
  ctaShortLabel,
  ctaHref,
  footerLinks,
}: {
  children: ReactNode;
  ctaLabel: string;
  /** Shown instead of `ctaLabel` below `sm`, so the button stays on one line on phones. */
  ctaShortLabel?: string;
  /** In-page anchor of the page's form, e.g. "#free-preview-form". */
  ctaHref: string;
  footerLinks: { label: string; href: string }[];
}) {
  const [scrolled, setScrolled] = useState(false);
  useCaptureFirstTouch();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <SmoothScroll>
      <div className="overflow-x-clip">
        <header className="fixed inset-x-0 top-0 z-[200] px-3 pt-3 sm:px-5">
          <div
            className={`mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 rounded-full px-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-6 ${
              scrolled
                ? "border-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]/90 shadow-[0_18px_40px_-28px_rgba(43,36,29,0.55)] backdrop-blur-md"
                : "border-2 border-transparent bg-transparent"
            }`}
          >
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
            >
              <Image src="/images/Logo.webp" alt="" width={140} height={56} priority sizes="140px" className="h-9 w-auto object-contain" />
              <span className="sf-display hidden text-xl tracking-tight text-[var(--sf-ink)] min-[400px]:inline md:text-[22px]">
                MudKitchen
              </span>
            </Link>
            <a
              href={ctaHref}
              aria-label={ctaLabel}
              className={`${btnPop} shrink-0 whitespace-nowrap !px-4 !py-2 !text-sm !shadow-[0_4px_0_0_var(--sf-clay-deep)] sm:!px-6 sm:!py-3 sm:!text-[15px] sm:!shadow-[0_6px_0_0_var(--sf-clay-deep)]`}
            >
              {ctaShortLabel ? (
                <>
                  <span className="sm:hidden">{ctaShortLabel}</span>
                  <span className="hidden sm:inline">{ctaLabel}</span>
                </>
              ) : (
                ctaLabel
              )}
            </a>
          </div>
        </header>
        <main>{children}</main>
        <footer className="px-6 pb-10 pt-4 sm:px-10">
          <nav
            aria-label="Footer"
            className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-6 text-sm font-bold text-[var(--sf-soft)]"
          >
            <span>© {new Date().getFullYear()} MudKitchen</span>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </SmoothScroll>
  );
}
