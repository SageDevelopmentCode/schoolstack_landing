"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Layers, Users } from "lucide-react";

const NAV_LINKS = [
  { label: "About",   href: "#about",   icon: Info },
  { label: "Product", href: "#product", icon: Layers },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);


  return (
    <>
      <header className="fixed left-0 right-0 z-[200] flex justify-center pt-[10px] font-secondary">
        <motion.div
          className="flex items-center justify-between w-full gap-8 max-w-[860px] h-14 px-7 rounded-[18px] bg-white shadow-[0_4px_28px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.07)]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/images/Logo.png"
                alt="MudKitchen"
                className="h-14 w-auto object-contain"
              />
              <span
                className="font-display font-semibold text-[22px] text-clay"
              >
                MudKitchen
              </span>
            </a>

            {/* Desktop nav */}
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

              {/* Customers link */}
              <a
                href="/customers"
                className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text transition-colors duration-150"
              >
                <Users size={14} className="shrink-0" />
                Customers
              </a>
            </nav>

            {/* Desktop CTA */}
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

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className="w-5 h-[1.5px] bg-text-muted block" />
              <span className="w-5 h-[1.5px] bg-text-muted block" />
              <span className="w-3.5 h-[1.5px] bg-text-muted block self-start" />
            </button>
        </motion.div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-text/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-surface flex flex-col pt-6 px-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.38 }}
            >
              <div className="flex items-center justify-between mb-10">
                <img
                src="/images/Logo.png"
                alt="MudKitchen"
                className="h-7 w-auto object-contain"
                />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-faint hover:text-text transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 2L14 14M14 2L2 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2 text-[17px] font-medium text-text-muted hover:text-text py-3 border-b border-border transition-colors duration-150"
                  >
                    <link.icon size={16} className="shrink-0" />
                    {link.label}
                  </a>
                ))}

                {/* Customers link */}
                <a
                  href="/customers"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 text-[17px] font-medium text-text-muted hover:text-text py-3 border-b border-border transition-colors duration-150"
                >
                  <Users size={16} className="shrink-0" />
                  Customers
                </a>
              </nav>
              <div className="mt-8">
                <a
                  href="/get-started"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 bg-clay text-white text-sm font-medium rounded-pill h-12 w-full hover:opacity-90 transition-all duration-200"
                >
                  Book a Demo →
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
