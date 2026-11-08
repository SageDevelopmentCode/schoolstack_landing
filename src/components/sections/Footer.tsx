import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Info, Layers, Users, Wrench } from "lucide-react";
import { BOOK_DEMO_HREF } from "@/lib/marketing/book-demo";
import {
  FREE_TOOLS_HUB_PATH,
  FREE_TOOLS_NAV_LABEL,
} from "@/lib/marketing/free-tools";
import MobileAppDownloadBadges from "@/components/download/MobileAppDownloadBadges";

const NAV_LINKS = [
  { label: "About", href: "/about", icon: Info },
  { label: "Product", href: "/#product", icon: Layers },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: FREE_TOOLS_NAV_LABEL, href: FREE_TOOLS_HUB_PATH, icon: Wrench },
];

export default function Footer() {
  return (
    <footer className="bg-white px-3 pb-10 pt-6 lg:px-6">
      <div className="mx-auto max-w-[1400px] rounded-[40px] bg-[#1d1a16] px-6 py-12 md:px-10 lg:px-14 lg:py-14">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div>
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src="/images/Logo.webp"
                alt="MudKitchen"
                width={120}
                height={40}
                loading="lazy"
                sizes="120px"
                className="h-10 w-auto object-contain"
              />
              <span className="font-secondary text-[20px] font-bold tracking-tight text-white/95">
                MudKitchen
              </span>
            </Link>
            <p className="mt-3 max-w-[260px] font-secondary text-sm leading-relaxed text-white/60">
              Software built to run a real microschool.
            </p>
            <MobileAppDownloadBadges
              className="mt-5 flex flex-wrap items-center gap-3"
              badgeClassName="h-10 w-auto object-contain sm:h-11"
            />
          </div>

          <nav
            className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8"
            aria-label="Footer navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 font-secondary text-sm font-medium text-white/60 transition-colors duration-150 hover:text-white/90"
              >
                <link.icon size={14} className="shrink-0" />
                {link.label}
              </Link>
            ))}
            <a
              href={BOOK_DEMO_HREF}
              className="font-secondary inline-flex h-10 items-center gap-2 rounded-pill bg-white px-5 text-sm font-semibold text-[#1d1a16] transition-colors hover:bg-[#F8DDCF]"
            >
              Book a Demo
              <ArrowRight size={14} aria-hidden />
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p className="font-secondary text-xs text-white/60">
              © 2026 MudKitchen. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/support"
                className="font-secondary text-xs text-white/60 transition-colors hover:text-white/90"
              >
                Support
              </Link>
              <Link
                href="/account-deletion"
                className="font-secondary text-xs text-white/60 transition-colors hover:text-white/90"
              >
                Delete account
              </Link>
              <Link
                href="/privacy"
                className="font-secondary text-xs text-white/60 transition-colors hover:text-white/90"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="font-secondary text-xs text-white/60 transition-colors hover:text-white/90"
              >
                Terms of Use
              </Link>
              <Link
                href="/dpa"
                className="font-secondary text-xs text-white/60 transition-colors hover:text-white/90"
              >
                DPA
              </Link>
            </div>
          </div>
          <p className="font-secondary text-center text-xs text-white/60 md:text-right">
            🏫 Made for microschool founders, by people who get it.
          </p>
        </div>
      </div>
    </footer>
  );
}
