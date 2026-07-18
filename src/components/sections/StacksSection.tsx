'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { FadeInView } from '@/components/ui/FadeInView'

const ease = [0.16, 1, 0.3, 1] as const

function illustrationVariant(dir: 1 | -1) {
  return {
    hidden: { opacity: 0, x: dir * 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease, delay: 0.3 },
    },
  }
}

const CORE_FEATURES = [
  'Branded school website',
  'Enrollment and registration workflows',
  'Parent portal, forms, and billing',
  'Student records and family information',
  'Tuition, fees, and Stripe payments',
  'Admin tools for daily operations',
  'Guided setup and support',
]

export default function StacksSection() {
  return (
    <section id="pricing" className="relative bg-bg py-24 overflow-hidden">

        {/* Decorative illustrations — left cluster (anchored to bottom-left) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={illustrationVariant(-1)}
          className="absolute bottom-0 left-[-80px] z-0 pointer-events-none select-none hidden lg:block"
        >
          <div className="relative w-[380px] h-[480px]">
            {/* FolderWithLeaf rises from bottom — bottom edge intentionally clipped */}
            <div className="absolute bottom-[-60px] left-0">
              <Image
                src="/images/illustrations/FolderWithLeaf.webp"
                alt=""
                aria-hidden="true"
                width={360}
                height={360}
              />
            </div>
          </div>
        </motion.div>

        {/* Decorative illustrations — right cluster (anchored to bottom-right) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={illustrationVariant(1)}
          className="absolute bottom-0 right-[-140px] z-0 pointer-events-none select-none hidden lg:block"
        >
          <div className="relative w-[520px] h-[560px]">
            {/* Boquet — large, upper area, partially bleeds off right */}
            <div className="absolute top-0 right-[-20px]">
              <Image
                src="/images/illustrations/Boquet.webp"
                alt=""
                aria-hidden="true"
                width={420}
                height={420}
              />
            </div>
            {/* Counting — large, lower-left, partially bleeds off bottom */}
            <div className="absolute bottom-[-40px] left-0">
              <Image
                src="/images/illustrations/Counting.webp"
                alt=""
                aria-hidden="true"
                width={320}
                height={320}
              />
            </div>
          </div>
        </motion.div>

      <div className="relative max-w-[1100px] mx-auto px-6 lg:px-16">

        {/* Heading */}
        <div className="text-center max-w-[560px] mx-auto mb-12">
          <FadeInView>
            <div className="text-[11px] font-medium text-text-muted uppercase tracking-widest mb-4">
              Built for growing microschools
            </div>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text">
              Start with what you need.
              <br /><em style={{ color: 'var(--color-clay)', fontStyle: 'italic' }}>Grow when you&apos;re ready.</em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.08}>
            <p className="text-[16px] text-text-muted mt-4 leading-relaxed">
              Everything you need to launch and run your microschool in one calm, connected system — from enrollment and billing to parent communication and daily operations.
            </p>
          </FadeInView>
        </div>

        {/* Main card */}
        <FadeInView delay={0.1}>
          <div className="max-w-[560px] mx-auto rounded-xl bg-surface border border-border shadow-md p-8">

            <div>
              <div className="text-[11px] font-medium text-text-muted uppercase tracking-widest">
                Core plan
              </div>
              <p className="text-[14px] text-text-muted mt-2 leading-snug">
                For microschools that want a simpler way to run school.
              </p>
            </div>

            <div className="border-t border-border my-6" />

            <ul className="space-y-3">
              {CORE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-[6px] shrink-0 bg-accent"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-text-muted">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <a
                href="/get-started"
                className="flex items-center justify-center gap-2 rounded-pill h-11 text-sm font-medium font-secondary bg-clay text-white hover:opacity-90 shadow-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                Book a Demo
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M2 6.5H11M11 6.5L7 2.5M11 6.5L7 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <p className="text-center text-[13px] text-text-muted mt-3">
                See if it&apos;s the right fit for your school.
              </p>
            </div>

          </div>
        </FadeInView>

        {/* Custom note */}
        <FadeInView delay={0.18}>
          <div className="text-center max-w-[460px] mx-auto mt-10">
            <p className="text-[15px] font-medium text-text">
              Need advanced workflows or a larger-school setup?
            </p>
            <p className="text-[14px] text-text-muted mt-1.5">
              We also offer tailored configurations for growing teams.
            </p>
            <a
              href="/get-started"
              className="inline-flex items-center gap-1.5 mt-3 text-[14px] text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
            >
              Talk About Your School
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2 6.5H11M11 6.5L7 2.5M11 6.5L7 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </FadeInView>

      </div>
    </section>
  )
}
