import Link from "next/link";
import Image from "next/image";
import { Info, Layers, Users } from "lucide-react";

const NAV_LINKS = [
  { label: "About", href: "#about", icon: Info },
  { label: "Product", href: "#product", icon: Layers },
  { label: "Customers", href: "/customers", icon: Users },
];

export default function Footer() {
  return (
    <footer className="bg-sage-900 border-t border-white/8 py-16">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/images/Logo.webp"
                alt="MudKitchen"
                width={120}
                height={40}
                loading="lazy"
                sizes="120px"
                className="h-10 w-auto object-contain"
              />
              <span className="font-display font-semibold text-[20px] text-white/90">
                MudKitchen
              </span>
            </Link>
            <p className="text-sm text-white/50 mt-3 max-w-[240px] leading-relaxed">
              Software built to run a real microschool.
            </p>
          </div>

          {/* Nav links */}
          <nav
            className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-8"
            aria-label="Footer navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-white/55 hover:text-white/90 transition-colors duration-150"
              >
                <link.icon size={14} className="shrink-0" />
                {link.label}
              </a>
            ))}
            <a
              href="/get-started"
              className="inline-flex items-center gap-1.5 bg-white/10 text-white text-sm font-medium rounded-pill px-[18px] h-9 hover:bg-white/15 transition-all duration-200"
            >
              Book a Demo
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            © 2026 MudKitchen. All rights reserved.
          </p>
          <p className="text-xs text-white/35">
            🏫 Made for microschool founders, by people who get it.
          </p>
        </div>
      </div>
    </footer>
  );
}
