'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      // Hysteresis: enter pill at 60px, leave only when near top (< 15px)
      if (current > 60) setScrolled(true)
      else if (current < 15) setScrolled(false)
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <>
      <header className={`fixed left-0 right-0 z-50 flex justify-center transition-[padding] duration-300 ${scrolled ? 'pt-[10px]' : 'pt-0'}`}>
        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scrolled ? 'pill' : 'full'}
          className={`flex items-center justify-between w-full gap-8 ${
            scrolled
              ? 'max-w-[860px] h-14 px-7 rounded-[18px] bg-white shadow-[0_4px_28px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.07)]'
              : 'max-w-[1280px] h-16 px-6 lg:px-16'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/images/SchoolLayerLogo.png" alt="SchoolLayer" className="h-8 w-auto object-contain" />
            <span className={`font-display text-[18px] ${scrolled ? 'text-accent' : 'text-white'}`}>SchoolStack</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted hover:text-text transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <a
              href="#demo"
              className="inline-flex items-center gap-1.5 bg-accent text-white text-sm font-medium rounded-pill px-[18px] h-9 hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              Book a Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        </AnimatePresence>
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.38 }}
            >
              <div className="flex items-center justify-between mb-10">
                <img src="/images/SchoolLayerLogo.png" alt="SchoolLayer" className="h-7 w-auto object-contain" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-faint hover:text-text transition-colors"
                  aria-label="Close menu"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="text-[17px] text-text-muted hover:text-text py-3 border-b border-border transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8">
                <a
                  href="#demo"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 bg-accent text-white text-sm font-medium rounded-pill h-12 w-full hover:bg-accent-hover transition-colors"
                >
                  Book a Demo →
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
