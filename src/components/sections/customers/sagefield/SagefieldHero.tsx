'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Users, Globe } from 'lucide-react'
import { FadeInView } from '@/components/ui/FadeInView'

const ease = [0.16, 1, 0.3, 1] as const

const PROOF_ITEMS = [
  {
    icon: MapPin,
    text: 'Real private microschool in Round Rock, Texas.',
  },
  {
    icon: Users,
    text: 'Ages 4–11, with live programs and tuition published online.',
  },
  {
    icon: Globe,
    text: 'Website, enrollment, and operations supporting an active launch.',
  },
]

export default function SagefieldHero() {
  return (
    <section className="bg-bg pt-[140px] pb-20 overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        {/* Eyebrow */}
        <FadeInView>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <Image
                src="/images/SageFieldLogo.png"
                alt="Sage Field logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-sage-100 text-accent text-[11px] font-medium uppercase tracking-widest px-3.5 py-1.5 font-secondary">
              Customer Story
            </span>
            <span className="text-[11px] font-secondary text-text-faint uppercase tracking-widest">
              Sage Field · Round Rock, TX
            </span>
          </div>
        </FadeInView>

        {/* Headline */}
        <div className="max-w-[780px]">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.04] text-text"
          >
            How Sage Field launched and grew from{' '}
            <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
              0 to 25 students
            </em>{' '}
            in under 3 months.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.12 }}
            className="text-[17px] leading-relaxed text-text-muted mt-6 max-w-[620px] font-secondary"
          >
            Sage Field is an outdoor-focused private microschool in Round Rock,
            Texas. We helped power the launch with the website, enrollment
            experience, tuition setup, staff workflows, family communication,
            and back-office operations needed to run a real school from day one.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.22 }}
            className="flex flex-wrap items-center gap-3 mt-9"
          >
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-pill px-7 h-12 text-sm font-medium font-secondary hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: '#A05C45', color: '#ffffff' }}
            >
              Book a demo
              <ArrowRight size={14} />
            </a>
            <a
              href="#outcomes"
              className="inline-flex items-center gap-1.5 text-sm font-medium font-secondary text-accent hover:text-accent-hover transition-colors duration-200 underline underline-offset-2"
            >
              See what&apos;s inside the platform
            </a>
          </motion.div>
        </div>

        {/* Proof strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.34 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {PROOF_ITEMS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-3 bg-surface rounded-xl border border-border px-5 py-4"
            >
              <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-accent" />
              </div>
              <p className="text-[13.5px] font-secondary text-text-muted leading-snug">
                {text}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Hero placeholder image */}
        <FadeInView delay={0.4}>
          <div
            className="mt-14 w-full rounded-2xl border border-border overflow-hidden"
            style={{ backgroundColor: '#EDE0CE' }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
              <div className="w-3 h-3 rounded-full bg-border-strong" />
              <div className="w-3 h-3 rounded-full bg-border-strong" />
              <div className="w-3 h-3 rounded-full bg-border-strong" />
              <span className="ml-2 text-[12px] font-mono text-text-faint">
                sagefieldacademy.com
              </span>
            </div>
            <div className="flex items-center justify-center h-[320px] lg:h-[420px]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Globe size={22} className="text-accent" />
                </div>
                <p className="text-sm font-secondary text-text-muted">
                  [Screenshot: Sage Field public website]
                </p>
                <p className="text-[12px] font-secondary text-text-faint mt-1">
                  Replace with actual school website screenshot
                </p>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
