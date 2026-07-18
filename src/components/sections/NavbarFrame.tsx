"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Layers, Menu, Users, X } from "lucide-react";

const MOBILE_LINKS = [
  { label: "About", href: "#about", icon: Info },
  { label: "Product", href: "#product", icon: Layers },
  { label: "Customers", href: "/customers", icon: Users },
];

export default function NavbarFrame({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      firstLinkRef.current?.focus();
    }
  }, [menuOpen]);

  return (
    <>
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[190] bg-text/20 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <div className="navbar-enter w-full max-w-[860px] overflow-hidden rounded-[18px] bg-white shadow-[0_4px_28px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.07)]">
        <div className="flex h-12 md:h-14 items-center justify-between gap-4 md:gap-8 px-4 md:px-7">
          {children}

          <button
            className="md:hidden ml-auto flex h-10 w-10 shrink-0 items-center justify-end text-text-muted"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>

        <nav
          id="mobile-menu"
          role="dialog"
          aria-label="Mobile navigation"
          className={`overflow-hidden border-t border-border/60 md:hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "h-auto opacity-100" : "h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col px-4 pb-3 pt-1">
            {MOBILE_LINKS.map((link, index) => (
              <a
                key={link.href}
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-3.5 text-[17px] font-medium text-text-muted transition-colors duration-150 hover:text-text"
              >
                <link.icon size={16} className="shrink-0" />
                {link.label}
              </a>
            ))}

            <a
              href="/get-started"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-pill bg-clay text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
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
        </nav>
      </div>
    </>
  );
}
