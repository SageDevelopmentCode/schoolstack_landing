'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, UserCheck, Users, Settings } from 'lucide-react'
import { FadeInView } from '@/components/ui/FadeInView'
import type { LucideIcon } from 'lucide-react'

/** Warm accents tuned for legibility on the dark sage panel */
const ACCENT_SOLID = '#C4786A'
const ACCENT_TEXT = '#F0D4CA'

type Step = {
  number: string
  icon: LucideIcon
  title: string
  shortTitle: string
  outcome: string
  body: string
  details: string[]
}

const STEPS: Step[] = [
  {
    number: '01',
    icon: Globe,
    title: 'Launch',
    shortTitle: 'Launch',
    outcome: 'Turn interest into a real school',
    body: 'Before any student enrolled, Sage Field needed a credible public presence. That meant a polished website, visible tuition, clear program pages, and an enrollment pathway families could trust.',
    details: [
      'School website with program and tuition pages live',
      'Enrollment inquiry forms capturing family interest',
      'Public-facing team and contact infrastructure',
      'Admissions pathways guiding families toward a tour',
    ],
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Enroll',
    shortTitle: 'Enroll',
    outcome: 'Turn interest into tours',
    body: 'With families discovering the school, the next step was capturing leads, scheduling tours, and moving prospects through an enrollment funnel without losing anyone in a spreadsheet.',
    details: [
      'Lead tracking and tour scheduling in one place',
      'Enrollment agreements and e-signature workflows',
      'Family records created on acceptance',
      'Tuition setup and payment collection activated',
    ],
  },
  {
    number: '03',
    icon: Users,
    title: 'Onboard',
    shortTitle: 'Onboard',
    outcome: 'Keep families informed',
    body: 'Once students were accepted, parents needed visibility into their child\'s school experience. Teachers needed to know who was in class, what was expected, and where to find everything.',
    details: [
      'Parent portal with school info and communication',
      'Student and family records accessible to staff',
      'Teacher onboarding with calendar and document access',
      'Attendance and daily workflow tools ready before day one',
    ],
  },
  {
    number: '04',
    icon: Settings,
    title: 'Operate',
    shortTitle: 'Operate',
    outcome: 'Run operations without spreadsheets',
    body: 'Day-to-day school life required coordinated operations: attendance, payroll, finances, marketing, and family communication all running from a shared system instead of fragmented tools.',
    details: [
      'Admin dashboard for leads, finances, and school calendar',
      'Teacher workspace: attendance, students, SOPs, and feed',
      'Parent communication and school updates in one channel',
      'Marketing and operations coordinated without extra tools',
    ],
  },
]

const STEP_PREVIEWS = [
  /* 01 — Launch */
  <div key="launch" className="flex items-center justify-center w-full p-8">
    <div
      className="w-full max-w-[380px] rounded-lg overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className="px-5 py-3 border-b flex items-center gap-2"
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <span className="ml-2 text-[11px] font-mono" style={{ color: 'rgba(247,241,231,0.55)' }}>
          sagefield.co
        </span>
      </div>
      <div className="p-5 space-y-3" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div className="h-5 w-2/3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div className="h-3 w-full rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 w-4/5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div className="flex gap-2 mt-4">
          <div className="h-8 w-28 rounded-full" style={{ backgroundColor: '#f29a8f', border: '1px solid rgba(242,154,143,0.6)' }} />
          <div className="h-8 w-24 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Programs', 'Tuition', 'Team'].map(t => (
            <div key={t} className="rounded-md py-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div className="text-[10px] font-secondary" style={{ color: 'rgba(247,241,231,0.4)' }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>,

  /* 02 — Enroll */
  <div key="enroll" className="flex items-center justify-center w-full p-8">
    <div className="w-full max-w-[360px] space-y-3">
      {[
        { name: 'Rivera family', status: 'Tour scheduled', dot: '#f29a8f' },
        { name: 'Chen family', status: 'Application sent', dot: '#4a7c59' },
        { name: 'Torres family', status: 'Enrolled', dot: '#4a7c59' },
      ].map((f) => (
        <div
          key={f.name}
          className="flex items-center gap-3 rounded-lg px-4 py-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-secondary font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#F7F1E7' }}>
            {f.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-secondary font-medium" style={{ color: '#F7F1E7' }}>{f.name}</div>
            <div className="text-[11px] font-secondary" style={{ color: 'rgba(247,241,231,0.45)' }}>{f.status}</div>
          </div>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.dot }} />
        </div>
      ))}
      <div
        className="rounded-lg px-4 py-3 text-center"
        style={{ backgroundColor: 'rgba(242,154,143,0.12)', border: '1px dashed rgba(242,154,143,0.35)' }}
      >
        <span className="text-[12px] font-secondary" style={{ color: 'rgba(247,241,231,0.4)' }}>+ Add new lead</span>
      </div>
    </div>
  </div>,

  /* 03 — Onboard */
  <div key="onboard" className="flex items-center justify-center w-full p-8">
    <div className="w-full max-w-[380px]">
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <span className="text-[11px] font-secondary font-medium" style={{ color: 'rgba(247,241,231,0.6)' }}>Parent Portal</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74,124,89,0.3)', color: '#a6b89a' }}>Live</span>
        </div>
        <div className="p-4 space-y-2.5">
          {['Class schedule', 'School updates', 'Tuition & billing', 'Documents'].map(item => (
            <div key={item} className="flex items-center gap-3 rounded-md px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <div className="w-6 h-6 rounded-md shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[12px] font-secondary" style={{ color: 'rgba(247,241,231,0.55)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>,

  /* 04 — Operate */
  <div key="operate" className="flex items-center justify-center w-full p-8">
    <div className="w-full max-w-[380px] space-y-2.5">
      {[
        { label: 'Attendance', value: '32 / 35', color: '#4a7c59' },
        { label: 'Open leads', value: '8 families', color: ACCENT_TEXT },
        { label: 'Invoices due', value: '$4,800', color: '#4a7c59' },
        { label: 'Pending tasks', value: '3 items', color: 'rgba(247,241,231,0.4)' },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-lg px-4 py-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-[12px] font-secondary" style={{ color: 'rgba(247,241,231,0.45)' }}>{label}</span>
          <span className="text-[13px] font-secondary font-semibold" style={{ color }}>{value}</span>
        </div>
      ))}
    </div>
  </div>,
]

export default function SagefieldTimeline() {
  const [active, setActive] = useState(0)
  const ActiveIcon = STEPS[active].icon

  return (
    <section className="bg-dark-panel py-28 overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        {/* Heading */}
        <div className="text-center max-w-[560px] mx-auto">
          <FadeInView>
            <span
              className="inline-flex items-center gap-1.5 rounded-pill text-[11px] font-medium uppercase tracking-widest px-3.5 py-1.5 bg-white/10 border border-white/15 font-secondary"
              style={{ color: 'rgba(247,241,231,0.75)' }}
            >
              How it happened
            </span>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2
              className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] mt-5"
              style={{ color: '#F7F1E7' }}
            >
              From idea to operating school.
              <br />
              <em style={{ color: '#E8D5C8', fontStyle: 'italic' }}>Four steps.</em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p
              className="text-[16px] leading-relaxed mt-4"
              style={{ color: 'rgba(247,241,231,0.60)' }}
            >
              Each phase of the Sage Field launch was supported by a matching
              operational surface — so nothing fell through the cracks.
            </p>
          </FadeInView>
        </div>

        {/* Stepper */}
        <div className="mt-16 flex flex-col lg:flex-row gap-3 lg:gap-8 lg:items-start">
          {/* Mobile: horizontal scrollable step pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="shrink-0 rounded-pill text-[11px] font-semibold font-secondary px-3.5 h-8 cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: active === i ? ACCENT_SOLID : 'rgba(255,255,255,0.08)',
                  color: active === i ? '#ffffff' : 'rgba(247,241,231,0.55)',
                }}
              >
                {step.number} · {step.shortTitle}
              </button>
            ))}
          </div>

          {/* Desktop: vertical step sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0 relative">
            <div
              className="absolute top-5 bottom-5 pointer-events-none"
              style={{
                left: '27px',
                borderLeft: '1px dashed rgba(247,241,231,0.12)',
              }}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              {STEPS.map((step, i) => {
                const isActive = active === i
                return (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="relative flex items-start gap-3 w-full text-left px-4 py-3.5 rounded-md cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                      borderLeft: isActive ? `2px solid ${ACCENT_SOLID}` : '2px solid transparent',
                    }}
                  >
                    <span
                      className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-semibold font-secondary mt-0.5 transition-all duration-200 relative z-10"
                      style={{
                        backgroundColor: isActive ? ACCENT_SOLID : 'rgba(255,255,255,0.1)',
                        color: isActive ? '#ffffff' : 'rgba(247,241,231,0.5)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <span
                        className="text-[13px] leading-snug font-medium font-secondary transition-all duration-200 block"
                        style={{ color: isActive ? '#F7F1E7' : 'rgba(247,241,231,0.4)' }}
                      >
                        {step.title}
                      </span>
                      {isActive && (
                        <span
                          className="text-[11px] font-secondary mt-0.5 block"
                          style={{ color: 'rgba(247,241,231,0.4)' }}
                        >
                          {step.outcome}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: content panel */}
          <div
            className="flex-1 min-w-0 rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 lg:p-10 flex flex-col"
              >
                {/* Step badge + icon */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="inline-flex items-center rounded-pill text-[10px] font-semibold uppercase tracking-widest px-3 py-1 font-secondary"
                    style={{ backgroundColor: ACCENT_SOLID, color: '#ffffff' }}
                  >
                    Step {STEPS[active].number}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <ActiveIcon size={16} style={{ color: '#E8D5C8' }} />
                  </div>
                </div>

                {/* Title + outcome + body */}
                <h3
                  className="font-display text-[1.5rem] font-medium leading-snug"
                  style={{ color: '#F7F1E7' }}
                >
                  {STEPS[active].title}
                </h3>
                <p
                  className="text-[13px] font-secondary font-medium uppercase tracking-widest mt-1"
                  style={{ color: ACCENT_TEXT }}
                >
                  {STEPS[active].outcome}
                </p>
                <p
                  className="text-sm leading-relaxed mt-3"
                  style={{ color: 'rgba(247,241,231,0.55)' }}
                >
                  {STEPS[active].body}
                </p>

                {/* Detail list */}
                <div className="mt-5 space-y-2">
                  {STEPS[active].details.map((detail) => (
                    <div key={detail} className="flex items-start gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'rgba(242,154,143,0.15)', border: '1px solid rgba(240,212,202,0.4)' }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke="#E8D5C8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-secondary" style={{ color: 'rgba(247,241,231,0.6)' }}>
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Preview area */}
                <div
                  className="mt-6 rounded-md min-h-[220px] flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {STEP_PREVIEWS[active]}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
