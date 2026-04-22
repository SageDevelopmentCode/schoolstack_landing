'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ParentDashboardDemo from './ParentDashboardDemo'
import TeacherDashboardDemo from './TeacherDashboardDemo'
import AdminDashboardDemo from './AdminDashboardDemo'

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
  const [demoTab, setDemoTab] = useState<'parent' | 'teacher' | 'admin'>('parent')
  const t = demoTab === 'teacher'

  return (
    <section
      className="pt-[140px] pb-0 overflow-hidden"
      style={{
        backgroundColor: t ? '#f2f8f3' : demoTab === 'admin' ? '#1E2420' : '#052415',
        transition: 'background-color 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-16">

        {/* Centered text block */}
        <div className="max-w-[860px] mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={makeVariant(0)}>
            <span className={`inline-flex items-center gap-1.5 rounded-pill border text-[11px] font-medium uppercase tracking-widest px-3 py-1.5 transition-colors duration-500 ${t ? 'border-[#052415]/20 text-[#052415]/70' : 'border-white/20 text-white/70'}`}>
              For Microschools
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={makeVariant(0.08)}
            className={`font-display text-[clamp(2.6rem,5.2vw,4.75rem)] leading-[1.04] tracking-tight mt-6 transition-colors duration-500 ${t ? 'text-[#052415]' : 'text-white'}`}
          >
            We built the software
            <br />we couldn&apos;t find.
            <span className={`inline-block w-[3px] h-[0.85em] ml-1 align-middle animate-pulse transition-colors duration-500 ${t ? 'bg-[#052415]' : 'bg-white'}`} />
          </motion.h1>

          <motion.p
            key={demoTab}
            initial="hidden"
            animate="visible"
            variants={makeVariant(0.18)}
            className={`text-[17px] md:text-[18px] leading-relaxed mt-6 transition-colors duration-500 ${t ? 'text-[#052415]/65' : 'text-white/65'}`}
          >
            {demoTab === 'parent'
              ? "Keep every family on track — enrollment contracts, health forms, tuition billing, and parent messaging in one place. Parents get a clear portal; you get fewer follow-up emails and nothing that slips through."
              : demoTab === 'teacher'
                ? "Give your teachers one place to clock in, track hours, manage their roster, and stay connected. Less admin overhead, accurate payroll, and a staff that always knows what's next."
                : "Full operational control — leads, applications, billing, staff, and marketing all in one admin workspace. One dashboard to run every part of your microschool."
            }
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={makeVariant(0.28)}
            className="flex justify-center items-center gap-4 mt-8"
          >
            <a
              href="#demo"
              className={`inline-flex items-center gap-2 border text-sm font-medium rounded-pill px-7 h-11 transition-all duration-500 ${t ? 'border-[#052415]/40 text-[#052415] hover:bg-[#052415]/8' : 'border-white/40 text-white hover:bg-white/10'}`}
            >
              Book a Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#product"
              className={`inline-flex items-center gap-1.5 text-sm transition-colors duration-500 ${t ? 'text-[#052415]/50 hover:text-[#052415]/80' : 'text-white/50 hover:text-white/80'}`}
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
          className="grid grid-cols-3 items-center mt-14 px-1"
        >
          <div />
          <div className="flex justify-center">
          <div className={`flex items-center gap-1 rounded-full p-1 border transition-colors duration-500 ${t ? 'bg-[#052415]/8 border-[#052415]/10' : 'bg-white/8 border-white/10'}`}>
            {([
              { id: 'parent', label: 'Parent View' },
              { id: 'teacher', label: 'Teacher View' },
              { id: 'admin', label: 'Admin View' },
            ] as const).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setDemoTab(id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  demoTab === id
                    ? t ? 'bg-[#052415] text-white shadow-sm' : 'bg-white text-[#052415] shadow-sm'
                    : t ? 'text-[#052415]/50 hover:text-[#052415]/80' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          </div>

          <div />
        </motion.div>

        {/* Interactive parent dashboard demo */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroFrameVariant}
          className="relative max-w-[1100px] mx-auto mt-4"
        >
          <motion.div
            className={`w-full h-[680px] rounded-t-xl border border-b-0 overflow-hidden transition-colors duration-500 ${t ? 'border-[#052415]/10' : 'border-white/10'}`}
            animate={{
              boxShadow: t
                ? '0 0 0 1px rgba(74,124,89,0.15), 0 32px 80px rgba(74,124,89,0.12)'
                : '0 0 0 1px rgba(74,124,89,0.25), 0 32px 80px rgba(5,36,21,0.45)',
            }}
            transition={{ duration: 0.6, ease }}
          >
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
              ) : demoTab === 'teacher' ? (
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
              ) : (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <AdminDashboardDemo />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
