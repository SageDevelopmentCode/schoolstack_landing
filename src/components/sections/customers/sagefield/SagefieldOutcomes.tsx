'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, BookOpen, LayoutDashboard, ChevronDown, ArrowRight } from 'lucide-react'
import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'

const PROOF_DRAWERS = [
  {
    id: 'tuition',
    label: 'Tuition',
    detail: 'Monthly and annual tuition plans published online with enrollment options visible to prospective families.',
  },
  {
    id: 'programs',
    label: 'Programs',
    detail: 'Detailed program pages covering age groups, schedules, and learning philosophies available on the public site.',
  },
  {
    id: 'team',
    label: 'Team',
    detail: 'Staff profiles and credentials published to build family trust before the first tour.',
  },
  {
    id: 'contact',
    label: 'Contact & enrollment',
    detail: 'Inquiry forms and enrollment pathways live on the website so families could take next steps immediately.',
  },
]

const TABS = [
  {
    id: 'parent',
    label: 'Parent',
    icon: Users,
    outcome: 'Keep families informed',
    tagline: 'Parents have a single place for everything related to their child\'s school experience.',
    items: [
      'Tuition access and payment history',
      'School news and announcements',
      'Direct communication with staff',
      'Class schedule and calendar',
      'Documents and forms',
      'Visibility into their child\'s daily experience',
    ],
    placeholder: 'Parent portal dashboard',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    icon: BookOpen,
    outcome: 'Give teachers one place to work',
    tagline: 'Teachers see their students, their schedule, and their responsibilities in one workspace.',
    items: [
      'Daily attendance tracking',
      'Student roster and profiles',
      'Shared school calendar',
      'Activity feed and updates',
      'Documents and SOPs',
      'Payroll and hours visibility',
    ],
    placeholder: 'Teacher workspace dashboard',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: LayoutDashboard,
    outcome: 'Run operations without spreadsheets',
    tagline: 'Administrators run the whole school from one coordinated system.',
    items: [
      'Lead and tour management',
      'Parent and student records',
      'School finances and invoicing',
      'Calendar and event coordination',
      'Marketing and outreach tools',
      'Staff management and scheduling',
    ],
    placeholder: 'Admin operations dashboard',
  },
] as const

type TabId = 'parent' | 'teacher' | 'admin'

export default function SagefieldOutcomes() {
  const [activeTab, setActiveTab] = useState<TabId>('parent')
  const [openDrawer, setOpenDrawer] = useState<string | null>(null)

  const current = TABS.find((t) => t.id === activeTab)!
  const ActiveIcon = current.icon

  return (
    <section id="outcomes" className="bg-bg py-28">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        {/* Heading */}
        <div className="max-w-[640px]">
          <FadeInView>
            <Badge>What we helped Sage Field run</Badge>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.07] text-text mt-5">
              Four outcomes.{' '}
              <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
                One platform.
              </em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="text-[16px] font-secondary text-text-muted leading-relaxed mt-4">
              The platform didn&apos;t just provide features — it gave every person
              in the school a clear operating surface so everyone could do their
              job without chasing information.
            </p>
          </FadeInView>
        </div>

        {/* Role tabs */}
        <FadeInView delay={0.18}>
          <div className="mt-12 relative inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className="relative z-10 flex items-center gap-2 px-5 h-9 rounded-lg text-[13px] font-medium font-secondary transition-colors duration-200 cursor-pointer"
                  style={{ color: isActive ? '#2E4A3C' : '#6D6257' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-lg bg-accent-highlight z-[-1]"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </FadeInView>

        {/* Tab content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-start"
            >
              {/* Left: outcome + items */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-sage-100 flex items-center justify-center">
                    <ActiveIcon size={16} className="text-accent" />
                  </div>
                  <span className="text-[11px] font-secondary font-semibold uppercase tracking-widest text-accent">
                    {current.outcome}
                  </span>
                </div>

                <p className="text-[16px] font-secondary text-text-muted leading-relaxed mb-6">
                  {current.tagline}
                </p>

                <div className="space-y-2.5">
                  {current.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'rgba(46,74,60,0.1)', border: '1px solid rgba(46,74,60,0.2)' }}
                      >
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2E4A3C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[14px] font-secondary text-text-muted leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: placeholder screenshot */}
              <div
                className="rounded-2xl border border-border overflow-hidden"
                style={{ backgroundColor: '#EDE0CE' }}
              >
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-surface">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                </div>
                <div className="flex items-center justify-center h-[280px]">
                  <div className="text-center px-6">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                      <ActiveIcon size={18} className="text-accent" />
                    </div>
                    <p className="text-sm font-secondary text-text-muted">
                      [{current.placeholder}]
                    </p>
                    <p className="text-[12px] font-secondary text-text-faint mt-1">
                      Replace with actual screenshot
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Expandable proof drawers */}
        <FadeInView delay={0.1}>
          <div className="mt-16 border-t border-border pt-10">
            <p className="text-[13px] font-secondary font-semibold uppercase tracking-widest text-text-faint mb-5">
              See what Sage Field had live
            </p>
            <div className="space-y-2">
              {PROOF_DRAWERS.map((drawer) => (
                <div
                  key={drawer.id}
                  className="rounded-xl border border-border bg-surface overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenDrawer(openDrawer === drawer.id ? null : drawer.id)
                    }
                    className="flex items-center justify-between w-full px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="text-[14px] font-medium font-secondary text-text">
                      {drawer.label}
                    </span>
                    <motion.div
                      animate={{ rotate: openDrawer === drawer.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-text-faint" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openDrawer === drawer.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-5 pb-5">
                          <div className="border-t border-border mb-4" />
                          <p className="text-[14px] font-secondary text-text-muted leading-relaxed">
                            {drawer.detail}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </FadeInView>

        {/* Inline CTA */}
        <FadeInView delay={0.12}>
          <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-2xl bg-bg-alt border border-border px-7 py-6">
            <div>
              <p className="font-secondary font-semibold text-text text-[15px]">
                Ready to see the platform for your school?
              </p>
              <p className="text-[13px] font-secondary text-text-muted mt-1">
                Walk through it live with someone who runs a microschool.
              </p>
            </div>
            <a
              href="#demo"
              className="shrink-0 inline-flex items-center gap-2 rounded-pill px-6 h-11 text-sm font-medium font-secondary hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: '#A05C45', color: '#ffffff' }}
            >
              Book a demo
              <ArrowRight size={14} />
            </a>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
