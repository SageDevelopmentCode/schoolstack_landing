'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'

const WITHOUT = [
  {
    label: 'Enrollment tracking',
    detail: 'Spreadsheet with family names, tour dates, and status columns maintained manually.',
  },
  {
    label: 'Family communication',
    detail: 'Email chains and group texts — no way to ensure everyone received the right info.',
  },
  {
    label: 'Tuition collection',
    detail: 'Manual invoices via Venmo, Zelle, or bank transfer. Chasing payments every month.',
  },
  {
    label: 'Staff coordination',
    detail: 'Separate group chats, shared Google Docs, and calendar invites across three platforms.',
  },
  {
    label: 'Operations overview',
    detail: 'No single view of the school. Context switching between apps to answer basic questions.',
  },
]

const WITH = [
  {
    label: 'Enrollment tracking',
    detail: 'Lead pipeline with status, tour scheduling, and enrollment agreements all in one place.',
  },
  {
    label: 'Family communication',
    detail: 'Parent portal with updates, documents, and messaging — one channel for all families.',
  },
  {
    label: 'Tuition collection',
    detail: 'Automated invoicing, online payment, and billing history visible to parents and admin.',
  },
  {
    label: 'Staff coordination',
    detail: 'Teacher workspace with shared calendar, student roster, SOPs, and activity feed.',
  },
  {
    label: 'Operations overview',
    detail: 'Admin dashboard showing leads, finances, attendance, and school calendar in one view.',
  },
]

export default function SagefieldBeforeAfter() {
  const [showWith, setShowWith] = useState(false)

  const items = showWith ? WITH : WITHOUT

  return (
    <section className="bg-surface-muted py-28">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        {/* Heading */}
        <div className="max-w-[600px] mb-12">
          <FadeInView>
            <Badge>Before &amp; after</Badge>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.07] text-text mt-5">
              What changed with{' '}
              <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
                MudKitchen.
              </em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="text-[16px] font-secondary text-text-muted leading-relaxed mt-4">
              Microschool founders don&apos;t lack tools — they have too many
              disconnected ones. The difference isn&apos;t a new feature. It&apos;s
              having one system that holds everything.
            </p>
          </FadeInView>
        </div>

        <FadeInView delay={0.18}>
          {/* Toggle */}
          <div className="max-w-full overflow-x-auto mb-8">
            <div className="flex w-full max-w-full sm:inline-flex sm:w-auto items-center rounded-xl border border-border bg-surface-soft p-1">
              <button
                onClick={() => setShowWith(false)}
                className="relative isolate flex flex-1 sm:flex-none items-center justify-center px-2.5 sm:px-5 h-8 sm:h-9 rounded-lg text-[11px] sm:text-[13px] leading-none font-medium font-secondary transition-all duration-200 cursor-pointer"
                style={{ color: !showWith ? '#2E4A3C' : '#6D6257' }}
              >
                {!showWith && (
                  <motion.div
                    layoutId="toggle-pill"
                    className="absolute inset-0 rounded-lg z-0"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DDD0BE',
                      boxShadow: '0 1px 3px rgba(46, 74, 60, 0.1), 0 1px 2px rgba(46, 74, 60, 0.06)',
                    }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center whitespace-nowrap">
                  <span className="sm:hidden">Without a system</span>
                  <span className="hidden sm:inline">Without an operating system</span>
                </span>
              </button>
              <button
                onClick={() => setShowWith(true)}
                className="relative isolate flex flex-1 sm:flex-none items-center justify-center px-2.5 sm:px-5 h-8 sm:h-9 rounded-lg text-[11px] sm:text-[13px] leading-none font-medium font-secondary transition-all duration-200 cursor-pointer"
                style={{ color: showWith ? '#2E4A3C' : '#6D6257' }}
              >
                {showWith && (
                  <motion.div
                    layoutId="toggle-pill"
                    className="absolute inset-0 rounded-lg z-0"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #A6B89A',
                      boxShadow: '0 1px 3px rgba(46, 74, 60, 0.1), 0 1px 2px rgba(46, 74, 60, 0.06)',
                    }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  <Image
                    src="/images/Logo.png"
                    alt=""
                    width={18}
                    height={18}
                    className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] object-contain shrink-0"
                    aria-hidden
                  />
                  With MudKitchen
                </span>
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={showWith ? 'with' : 'without'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* State label */}
              <div
                className="inline-flex items-center gap-2 rounded-pill px-4 py-1.5 mb-6 text-[11px] font-secondary font-semibold uppercase tracking-widest"
                style={
                  showWith
                    ? { backgroundColor: 'rgba(74,124,89,0.12)', color: '#2E4A3C', border: '1px solid rgba(74,124,89,0.25)' }
                    : { backgroundColor: 'rgba(160,92,69,0.1)', color: '#A05C45', border: '1px solid rgba(160,92,69,0.25)' }
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: showWith ? '#4a7c59' : '#A05C45' }}
                />
                {showWith ? 'With MudKitchen' : 'Without an operating system'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                      delay: i * 0.05,
                    }}
                    className="rounded-2xl border bg-surface p-5"
                    style={{
                      borderColor: showWith ? '#A6B89A' : '#DDD0BE',
                    }}
                  >
                    <div className="flex items-start gap-2.5 mb-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={
                          showWith
                            ? { backgroundColor: 'rgba(74,124,89,0.15)', border: '1px solid rgba(74,124,89,0.3)' }
                            : { backgroundColor: 'rgba(160,92,69,0.12)', border: '1px solid rgba(160,92,69,0.25)' }
                        }
                      >
                        {showWith ? (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2E4A3C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                            <path d="M2 2L7 7M7 2L2 7" stroke="#A05C45" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13.5px] font-secondary font-semibold text-text">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[13px] font-secondary text-text-muted leading-relaxed">
                      {item.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </FadeInView>
      </div>
    </section>
  )
}
