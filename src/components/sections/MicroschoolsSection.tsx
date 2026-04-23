'use client'

import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'

const CARDS = [
  {
    tag: 'Admin burden',
    statement: 'The admin work follows you home.',
    body: 'Enrollment paperwork, billing reminders, parent questions — microschool founders handle all of it. School Stack keeps everything organized in one place so the evenings are yours.',
    stat: '22 students',
    statLabel: 'median enrollment',
    featured: false,
    wide: true,
  },
  {
    tag: 'Scheduling',
    statement: 'Your program is flexible.\nYour software isn\'t.',
    body: 'Full-time, part-time, hybrid — most school software assumes one model. School Stack is built around yours.',
    stat: '50%',
    statLabel: 'hybrid or part-time',
    featured: false,
    wide: false,
  },
  {
    tag: 'Billing',
    statement: 'A billing mix-up can cost you a family.',
    body: 'When tuition is already a stretch for families, unclear invoices erode trust fast. Clean billing, flexible payments, no confusion.',
    stat: '74%',
    statLabel: 'charge $10k or less',
    featured: false,
    wide: false,
  },
  {
    tag: 'Communication',
    statement: 'Families chose you because you\'re not a big institution.',
    body: 'Don\'t let that break down at the admin layer. School Stack gives parents a clear, simple portal — so the personal experience you built stays personal.',
    stat: null,
    statLabel: null,
    featured: true,
    wide: true,
  },
] as const

export default function MicroschoolsSection() {
  return (
    <section className="bg-bg-alt py-24">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">

        {/* Header */}
        <FadeInView>
          <Badge>For microschool founders</Badge>
        </FadeInView>

        <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <FadeInView delay={0.06}>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text max-w-lg">
              Built for how you
              <br />
              actually operate.
            </h2>
          </FadeInView>
          <FadeInView delay={0.12}>
            <p className="text-[15px] text-text-muted leading-relaxed max-w-sm lg:text-right">
              The software most microschools inherit wasn't made for them. School Stack was.
            </p>
          </FadeInView>
        </div>

        {/* Pain cards */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Card 1 — wide */}
          <FadeInView delay={0.08} className="lg:col-span-3">
            <div className="h-full rounded-2xl bg-surface border border-border p-7 flex flex-col gap-5 hover:-translate-y-0.5 transition-transform duration-200 shadow-xs">
              <span className="text-[11px] font-mono text-text-faint uppercase tracking-widest">
                Admin burden
              </span>
              <div className="flex-1">
                <p className="font-display text-[1.3rem] leading-snug text-text">
                  The admin work follows you home.
                </p>
                <p className="text-[14px] text-text-muted leading-relaxed mt-3">
                  Enrollment paperwork, billing reminders, parent questions — microschool founders handle all of it on top of running the classroom. School Stack keeps everything in one place so the evenings are yours.
                </p>
              </div>
              <div className="flex items-baseline gap-1.5 pt-2 border-t border-border">
                <span className="font-mono text-[13px] font-semibold text-accent">22 students</span>
                <span className="text-[12px] text-text-faint">— median enrollment per microschool</span>
              </div>
            </div>
          </FadeInView>

          {/* Card 2 — narrow */}
          <FadeInView delay={0.14} className="lg:col-span-2">
            <div className="h-full rounded-2xl bg-surface border border-border p-7 flex flex-col gap-5 hover:-translate-y-0.5 transition-transform duration-200 shadow-xs">
              <span className="text-[11px] font-mono text-text-faint uppercase tracking-widest">
                Scheduling
              </span>
              <div className="flex-1">
                <p className="font-display text-[1.3rem] leading-snug text-text">
                  Your program is flexible.<br />Your software isn't.
                </p>
                <p className="text-[14px] text-text-muted leading-relaxed mt-3">
                  Full-time, part-time, hybrid — most school software assumes one model. School Stack is built around yours.
                </p>
              </div>
              <div className="flex items-baseline gap-1.5 pt-2 border-t border-border">
                <span className="font-mono text-[13px] font-semibold text-accent">50%</span>
                <span className="text-[12px] text-text-faint">— hybrid or part-time programs</span>
              </div>
            </div>
          </FadeInView>

          {/* Card 3 — narrow */}
          <FadeInView delay={0.18} className="lg:col-span-2">
            <div className="h-full rounded-2xl bg-surface border border-border p-7 flex flex-col gap-5 hover:-translate-y-0.5 transition-transform duration-200 shadow-xs">
              <span className="text-[11px] font-mono text-text-faint uppercase tracking-widest">
                Billing
              </span>
              <div className="flex-1">
                <p className="font-display text-[1.3rem] leading-snug text-text">
                  A billing mix-up can cost you a family.
                </p>
                <p className="text-[14px] text-text-muted leading-relaxed mt-3">
                  When tuition is already a stretch, unclear invoices erode trust fast. Clean billing, flexible payments, no confusion.
                </p>
              </div>
              <div className="flex items-baseline gap-1.5 pt-2 border-t border-border">
                <span className="font-mono text-[13px] font-semibold text-accent">74%</span>
                <span className="text-[12px] text-text-faint">— charge $10k or less per year</span>
              </div>
            </div>
          </FadeInView>

          {/* Card 4 — wide, featured */}
          <FadeInView delay={0.22} className="lg:col-span-3">
            <div className="h-full rounded-2xl bg-accent p-7 flex flex-col gap-5 hover:-translate-y-0.5 transition-transform duration-200">
              <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                Communication
              </span>
              <div className="flex-1">
                <p className="font-display text-[1.3rem] leading-snug text-white">
                  Families chose you because you're not a big institution.
                </p>
                <p className="text-[14px] text-white/65 leading-relaxed mt-3">
                  Don't let that break down at the admin layer. School Stack gives parents a clear, simple portal — so the personal experience you built stays personal.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-pill bg-white text-accent text-sm font-medium hover:-translate-y-0.5 transition-transform duration-200"
                >
                  Get early access
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </FadeInView>

        </div>
      </div>
    </section>
  )
}
