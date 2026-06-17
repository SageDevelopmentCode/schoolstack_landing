'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, TrendingUp } from 'lucide-react'

export default function SagefieldStickyRail() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 600px (past the hero)
      setVisible(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="hidden 2xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 w-[176px]"
          aria-label="Key results"
        >
          <div
            className="rounded-2xl border border-border bg-surface shadow-md p-4 flex flex-col gap-3"
          >
            {/* Icon + label */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-sage-100 flex items-center justify-center shrink-0">
                <TrendingUp size={13} className="text-accent" />
              </div>
              <span className="text-[10px] font-secondary font-semibold uppercase tracking-widest text-text-faint">
                Sage Field
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-2.5">
              <div className="rounded-lg bg-bg-alt border border-border px-3 py-2.5 text-center">
                <div className="font-display text-[1.5rem] leading-none text-text">0→35</div>
                <div className="text-[11px] font-secondary text-text-faint mt-1 leading-snug">
                  students in &lt;3 months
                </div>
              </div>
              <div className="rounded-lg bg-bg-alt border border-border px-3 py-2.5">
                <div className="text-[10px] font-secondary font-semibold uppercase tracking-widest text-text-faint mb-1.5">
                  Platform covered
                </div>
                {['Website', 'Enrollment', 'Tuition', 'Ops'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 mb-1 last:mb-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="text-[12px] font-secondary text-text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a
              href="#demo"
              className="flex items-center justify-center gap-1.5 rounded-pill h-9 text-[12px] font-medium font-secondary hover:-translate-y-0.5 transition-all duration-200 w-full"
              style={{ backgroundColor: '#A05C45', color: '#ffffff' }}
            >
              Book a demo
              <ArrowRight size={12} />
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
