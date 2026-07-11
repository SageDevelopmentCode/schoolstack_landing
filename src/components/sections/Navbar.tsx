"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Layers, Menu, Users, X } from "lucide-react";
import { useEntranceAnimation } from "@/hooks/useEntranceAnimation";

const NAV_LINKS = [
  { label: "About", href: "#about", icon: Info },
  { label: "Product", href: "#product", icon: Layers },
];

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { label: "Customers", href: "/customers", icon: Users },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const { skip } = useEntranceAnimation();
  const [menuOpen, setMenuOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
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
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[190] bg-text/20 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <header className="fixed left-0 right-0 z-[200] flex justify-center px-3 sm:px-4 md:px-0 pt-[10px] font-secondary">
        <motion.div
          layout
          className="w-full max-w-[860px] overflow-hidden rounded-[18px] bg-white shadow-[0_4px_28px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.07)]"
          initial={skip ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <div className="flex h-12 md:h-14 items-center justify-between gap-4 md:gap-8 px-4 md:px-7">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <img
                src="/images/Logo.png"
                alt="MudKitchen"
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
            </div>

            <button
              className="md:hidden ml-auto flex h-10 w-10 shrink-0 items-center justify-end text-text-muted"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.2, ease }}
                  >
                    <X size={22} strokeWidth={1.75} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    transition={{ duration: 0.2, ease }}
                  >
                    <Menu size={22} strokeWidth={1.75} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                id="mobile-menu"
                role="dialog"
                aria-label="Mobile navigation"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className="overflow-hidden border-t border-border/60 md:hidden"
              >
                <div className="flex flex-col px-4 pb-3 pt-1">
                  {MOBILE_LINKS.map((link, i) => (
                    <motion.a
                      key={link.href}
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease, delay: i * 0.04 }}
                      className="flex items-center gap-2 py-3.5 text-[17px] font-medium text-text-muted transition-colors duration-150 hover:text-text"
                    >
                      <link.icon size={16} className="shrink-0" />
                      {link.label}
                    </motion.a>
                  ))}

                  <motion.a
                    href="/get-started"
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease,
                      delay: MOBILE_LINKS.length * 0.04,
                    }}
                    className="mt-2 flex h-12 items-center justify-center gap-2 rounded-pill bg-clay text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
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
                  </motion.a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </header>
    </>
  );
}
