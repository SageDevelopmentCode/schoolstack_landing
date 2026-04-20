'use client'

import { motion } from 'framer-motion'

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

        {/* Product frame with floating cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroFrameVariant}
          className="relative max-w-[900px] mx-auto mt-14"
        >
          {/* Floating card — top left */}
          <div className="hidden md:block absolute -left-10 top-12 z-10 w-[130px] rounded-xl border border-white/10 bg-white/8 backdrop-blur-sm shadow-xl overflow-hidden -rotate-2">
            <div className="bg-white/10 h-[78px] w-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="opacity-30">
                <rect x="3" y="3" width="22" height="22" rx="4" stroke="white" strokeWidth="1.5"/>
                <circle cx="10" cy="11" r="2.5" stroke="white" strokeWidth="1.2"/>
                <path d="M3 20L8.5 15L12 18L17 13L25 20" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="px-2.5 py-2">
              <div className="text-white/40 text-[9px] uppercase tracking-wide">Student</div>
              <div className="text-white/70 text-[10px] font-medium mt-0.5">Avery Chen</div>
              <div className="text-white/35 text-[9px] mt-0.5">Elementary · Active</div>
            </div>
          </div>

          {/* Floating card — top right */}
          <div className="hidden md:block absolute -right-8 top-6 z-10 w-[148px] rounded-xl border border-white/10 bg-white/8 backdrop-blur-sm shadow-xl p-3 rotate-1">
            <div className="text-white/40 text-[9px] uppercase tracking-wide mb-1.5">Newsletter Draft</div>
            <div className="space-y-1.5">
              {[100, 85, 90, 60].map((w, i) => (
                <div key={i} className="h-[5px] rounded-full bg-white/15" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[7px] text-white/50">SS</div>
              <span className="text-white/35 text-[9px]">5hr ago</span>
            </div>
          </div>

          {/* Floating card — bottom left */}
          <div className="hidden md:block absolute -left-6 bottom-16 z-10 w-[120px] rounded-xl border border-white/10 bg-white/8 backdrop-blur-sm shadow-xl p-3 rotate-1">
            <div className="text-white/40 text-[9px] uppercase tracking-wide mb-2">Payments</div>
            <div className="text-white text-[15px] font-semibold">$3,240</div>
            <div className="text-white/40 text-[9px] mt-0.5">April collected</div>
            <div className="mt-2 h-[4px] rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[72%] rounded-full bg-white/40" />
            </div>
          </div>

          {/* Floating card — bottom right */}
          <div className="hidden md:block absolute -right-6 bottom-20 z-10 w-[136px] rounded-xl border border-white/10 bg-white/8 backdrop-blur-sm shadow-xl overflow-hidden -rotate-1">
            <div className="bg-white/10 h-[70px] w-full flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="opacity-30">
                <rect x="2" y="2" width="22" height="22" rx="4" stroke="white" strokeWidth="1.5"/>
                <path d="M8 13h10M8 9h6M8 17h8" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="px-2.5 py-2">
              <div className="text-white/40 text-[9px] uppercase tracking-wide">Contract</div>
              <div className="text-white/70 text-[10px] font-medium mt-0.5">Enrollment 2025</div>
              <div className="mt-1.5 inline-block bg-green-500/20 text-green-400 text-[8px] rounded-pill px-1.5 py-0.5">Signed</div>
            </div>
          </div>

          {/* Central app window */}
          <div className="w-full h-[500px] md:h-[560px] rounded-t-xl border border-white/10 border-b-0 shadow-2xl overflow-hidden">
            <HeroProductMockup />
          </div>
        </motion.div>

      </div>
    </section>
  )
}

function HeroProductMockup() {
  return (
    <div className="flex h-full text-[11px]">
      {/* Sidebar */}
      <div className="w-[160px] shrink-0 bg-surface-soft border-r border-border flex flex-col p-4 gap-0.5">
        <div className="mb-4">
          <span className="font-display text-[13px] text-text">Sage Field</span>
          <span className="block text-text-faint text-[10px] mt-0.5">Admin Portal</span>
        </div>
        {[
          { label: 'Dashboard', icon: '⊞' },
          { label: 'Applications', icon: '◎', active: true },
          { label: 'Students', icon: '◉' },
          { label: 'Parents', icon: '○' },
          { label: 'Teachers', icon: '▦' },
          { label: 'Payments', icon: '◇' },
          { label: 'Leads CRM', icon: '◈' },
          { label: 'Calendar', icon: '▣' },
          { label: 'Contracts', icon: '▤' },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] transition-colors ${
              item.active
                ? 'bg-accent-soft text-accent font-medium'
                : 'text-text-muted hover:bg-surface-muted'
            }`}
          >
            <span className="text-[10px] opacity-60">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-surface p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[13px] font-semibold text-text font-body">Applications</h3>
            <p className="text-[10px] text-text-faint mt-0.5">12 total this enrollment period</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-[10px] text-text-faint flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="4.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M7 7L8.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Search
            </div>
            <div className="bg-accent text-white rounded-md px-2.5 py-1.5 text-[10px] font-medium">+ New</div>
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {['All (12)', 'New (4)', 'Reviewing (5)', 'Enrolled (3)'].map((tab, i) => (
            <div
              key={tab}
              className={`px-2.5 py-1 rounded-md text-[10px] ${
                i === 0 ? 'bg-surface-muted text-text font-medium' : 'text-text-faint'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 h-[calc(100%-84px)]">
          {[
            {
              title: 'New Inquiry',
              count: 4,
              color: 'bg-blue-50 text-blue-600',
              cards: [
                { name: 'Avery Chen', prog: 'Elementary', date: 'Apr 14' },
                { name: 'Mateo Silva', prog: 'Pre-K', date: 'Apr 13' },
                { name: 'Isla Thompson', prog: 'Elementary', date: 'Apr 11' },
                { name: 'Finn Nakamura', prog: 'Middle', date: 'Apr 10' },
              ],
            },
            {
              title: 'Reviewing',
              count: 5,
              color: 'bg-yellow-50 text-yellow-700',
              cards: [
                { name: 'Luna Martinez', prog: 'Pre-K', date: 'Apr 9' },
                { name: 'Jasper Kim', prog: 'Middle', date: 'Apr 8' },
                { name: 'Cleo Osei', prog: 'Elementary', date: 'Apr 7' },
              ],
            },
            {
              title: 'Enrolled',
              count: 3,
              color: 'bg-green-50 text-green-700',
              cards: [
                { name: 'Rowan Park', prog: 'Elementary', date: 'Apr 6' },
                { name: 'Sage Collins', prog: 'Pre-K', date: 'Apr 5' },
                { name: 'River Patel', prog: 'Middle', date: 'Apr 3' },
              ],
            },
          ].map((col) => (
            <div key={col.title} className="bg-surface-soft rounded-lg p-2.5 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-text-faint uppercase tracking-wide font-body">{col.title}</span>
                <span className={`text-[9px] font-medium rounded-pill px-1.5 py-0.5 ${col.color}`}>{col.count}</span>
              </div>
              <div className="flex flex-col gap-1.5 overflow-hidden">
                {col.cards.map((card) => (
                  <div key={card.name} className="bg-surface border border-border rounded-md p-2 shadow-xs">
                    <div className="font-medium text-text text-[10px] font-body">{card.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="bg-accent-soft text-accent text-[9px] rounded-pill px-1.5 py-0.5">{card.prog}</span>
                      <span className="text-text-faint text-[9px]">{card.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
