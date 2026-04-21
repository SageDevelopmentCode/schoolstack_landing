'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ParentDashboardDemo from './ParentDashboardDemo'
import TeacherDashboardDemo from './TeacherDashboardDemo'

const ease = [0.16, 1, 0.3, 1] as const

function makeVariant(delay: number) {
  return {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease, delay },
    },
  }
}

const heroFrameVariant = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease, delay: 0.38 },
  },
}

export default function HeroSection() {
  const [demoTab, setDemoTab] = useState<'parent' | 'teacher'>('parent')

  return (
    <section className="pt-[140px] pb-0 bg-[#052415] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-16">

        {/* Centered text block */}
        <div className="max-w-[860px] mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={makeVariant(0)}>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/20 text-white/70 text-[11px] font-medium uppercase tracking-widest px-3 py-1.5">
              For Microschools
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={makeVariant(0.08)}
            className="font-display text-[clamp(2.6rem,5.2vw,4.75rem)] leading-[1.04] tracking-tight text-white mt-6"
          >
            We built the software
            <br />we couldn&apos;t find.
            <span className="inline-block w-[3px] h-[0.85em] bg-white ml-1 align-middle animate-pulse" />
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={makeVariant(0.18)}
            className="text-[17px] md:text-[18px] text-white/65 leading-relaxed mt-6"
          >
            SchoolLayer started at Sage Field in Texas after trying to run enrollment, billing,
            parent communication, contracts, and daily operations across too many disconnected tools.
            Now it gives other microschools one calm system to run the whole school.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={makeVariant(0.28)}
            className="flex justify-center items-center gap-4 mt-8"
          >
            <a
              href="#demo"
              className="inline-flex items-center gap-2 border border-white/40 text-white text-sm font-medium rounded-pill px-7 h-11 hover:bg-white/10 transition-all duration-200"
            >
              Book a Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors duration-200"
            >
              See the product
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Tab switcher + live indicator */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={makeVariant(0.36)}
          className="flex justify-between items-center mt-14 px-1"
        >
          <div className="flex items-center gap-1 bg-white/8 rounded-full p-1 border border-white/10">
            {([
              { id: 'parent', label: 'Parent View' },
              { id: 'teacher', label: 'Teacher View' },
            ] as const).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setDemoTab(id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  demoTab === id
                    ? 'bg-white text-[#052415] shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-[11px] text-white/50 tracking-wide">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Click to explore · move cursor away to watch
          </div>
        </motion.div>

        {/* Interactive parent dashboard demo */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroFrameVariant}
          className="relative max-w-[1100px] mx-auto mt-4"
        >
          <div className="w-full h-[680px] rounded-t-xl border border-white/10 border-b-0 shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {demoTab === 'parent' ? (
                <motion.div
                  key="parent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <ParentDashboardDemo />
                </motion.div>
              ) : (
                <motion.div
                  key="teacher"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <TeacherDashboardDemo />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
