import Link from "next/link";
import Image from "next/image";
import { Info, Layers, Users } from "lucide-react";
import NavbarFrame from "./NavbarFrame";

const NAV_LINKS = [
  { label: "About", href: "#about", icon: Info },
  { label: "Product", href: "#product", icon: Layers },
];

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 z-[200] flex justify-center px-3 sm:px-4 md:px-0 pt-[10px] font-secondary">
      <NavbarFrame>
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/images/Logo.webp"
            alt="MudKitchen"
            width={140}
            height={56}
            priority
            sizes="140px"
            className="h-9 w-auto object-contain md:h-14"
          />
          <span className="font-display text-lg font-semibold text-clay md:text-[22px]">
            MudKitchen
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text transition-colors duration-150"
            >
              <link.icon size={14} className="shrink-0" />
              {link.label}
            </a>
          ))}

          <a
            href="/customers"
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text transition-colors duration-150"
          >
            <Users size={14} className="shrink-0" />
            Customers
          </a>
        </nav>

        <div className="hidden md:flex">
          <a
            href="/get-started"
            className="inline-flex items-center gap-1.5 bg-clay text-white text-sm font-medium rounded-pill px-[18px] h-9 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            Book a Demo
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </NavbarFrame>
    </header>
  );
}
