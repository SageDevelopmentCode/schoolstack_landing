'use client'

import { useState } from 'react'
import Image from 'next/image'
import HeroDemoSection, { type HeroDemoTab } from '@/components/sections/HeroDemoSection'

const HERO_THEMES: Record<
  HeroDemoTab,
  {
    sectionBg: string
    headline: string
    subcopy: string
    badgeBg: string
    badgeText: string
    secondaryLink: string
    secondaryLinkHover: string
    illustrationOpacity: number
  }
> = {
  parent: {
    sectionBg: '#F7F1E7',
    headline: '#2E4A3C',
    subcopy: 'rgba(46, 74, 60, 0.8)',
    badgeBg: '#E2EDD9',
    badgeText: '#4A6B52',
    secondaryLink: 'rgba(46, 74, 60, 0.5)',
    secondaryLinkHover: 'rgba(46, 74, 60, 0.8)',
    illustrationOpacity: 1,
  },
  teacher: {
    sectionBg: '#2E4A3C',
    headline: '#F7F1E7',
    subcopy: 'rgba(247, 241, 231, 0.75)',
    badgeBg: 'rgba(247, 241, 231, 0.12)',
    badgeText: '#E2EDD9',
    secondaryLink: 'rgba(247, 241, 231, 0.6)',
    secondaryLinkHover: 'rgba(247, 241, 231, 0.9)',
    illustrationOpacity: 0.35,
  },
  admin: {
    sectionBg: '#1a3327',
    headline: '#F7F1E7',
    subcopy: 'rgba(247, 241, 231, 0.75)',
    badgeBg: 'rgba(247, 241, 231, 0.12)',
    badgeText: '#E2EDD9',
    secondaryLink: 'rgba(247, 241, 231, 0.6)',
    secondaryLinkHover: 'rgba(247, 241, 231, 0.9)',
    illustrationOpacity: 0.35,
  },
}

export default function HeroSectionContent() {
  const [demoTab, setDemoTab] = useState<HeroDemoTab>('parent')
  const theme = HERO_THEMES[demoTab]

  return (
    <section
      className="overflow-x-visible overflow-y-hidden pt-[140px] pb-0 transition-colors duration-500 lg:overflow-hidden"
      style={{ backgroundColor: theme.sectionBg }}
    >
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-16">
        <div
          className="hero-enter-slide-right pointer-events-none absolute top-[-20px] right-[-200px] z-0 hidden select-none transition-opacity duration-500 lg:block"
          style={{ opacity: theme.illustrationOpacity }}
        >
          <Image
            src="/images/illustrations/HeroRight.webp"
            alt=""
            aria-hidden="true"
            width={480}
            height={580}
            loading="lazy"
            sizes="480px"
          />
        </div>

        <div
          className="hero-enter-slide-left pointer-events-none absolute top-[-20px] left-[-200px] z-0 hidden select-none transition-opacity duration-500 lg:block"
          style={{ opacity: theme.illustrationOpacity }}
        >
          <Image
            src="/images/illustrations/HeroLeft.webp"
            alt=""
            aria-hidden="true"
            width={480}
            height={580}
            loading="lazy"
            sizes="480px"
          />
        </div>

        <div className="mx-auto max-w-[680px] text-center">
          <div className="hero-enter" style={{ '--hero-delay': '0ms' } as React.CSSProperties}>
            <span
              className="inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
            >
              🌿 Built for Microschools
            </span>
          </div>

          <h1
            className="font-display mt-6 text-[clamp(2.6rem,5.2vw,4.75rem)] font-medium leading-[1.04] tracking-tight transition-colors duration-500"
            style={{ color: theme.headline }}
          >
            Everything your microschool needs,
            <br />
            <em className="text-clay" style={{ fontStyle: 'italic' }}>
              all in one place.
            </em>
          </h1>

          <p
            className="mt-6 text-[17px] leading-relaxed transition-colors duration-500 md:text-[18px]"
            style={{ color: theme.subcopy }}
          >
            MudKitchen keeps parents, teachers, and administrators aligned with enrollment, communication, billing, and more&mdash;so you can focus on what matters most: your students.
          </p>

          <div className="hero-enter mt-8 flex items-center justify-center gap-4" style={{ '--hero-delay': '280ms' } as React.CSSProperties}>
            <a
              href="/get-started"
              className="font-secondary inline-flex h-11 items-center gap-2 rounded-pill bg-clay px-7 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Book a Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#product"
              className="font-secondary hidden items-center gap-1.5 text-sm transition-colors duration-500 lg:inline-flex"
              style={{ color: theme.secondaryLink }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.secondaryLinkHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.secondaryLink
              }}
            >
              Try the product
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <HeroDemoSection demoTab={demoTab} onDemoTabChange={setDemoTab} />
      </div>
    </section>
  )
}
