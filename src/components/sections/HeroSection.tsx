'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Users, BookOpen, LayoutDashboard } from 'lucide-react'
import {
  LazyAdminDashboardDemo,
  LazyTeacherDashboardDemo,
  LazyParentDashboardDemo,
  prefetchParentDemo,
} from './lazyDemos'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'
import { useMobileDemoScale } from '@/hooks/useMobileDemoScale'

type HeroDemoTab = 'parent' | 'teacher' | 'admin'

const DEMO_TABS = [
  { id: 'parent',  label: 'Parent View',  shortLabel: 'Parent',  icon: Users },
  { id: 'teacher', label: 'Teacher View', shortLabel: 'Teacher', icon: BookOpen },
  { id: 'admin',   label: 'Admin View',   shortLabel: 'Admin',   icon: LayoutDashboard },
] as const

const DEMO_WIDTH = 1100
const DEMO_HEIGHT = 680
const VISIBLE_FRACTION = 0.75

function HeroDemoPanels({
  demoTab,
  loadedTabs,
  readyTabs,
  onTabReady,
}: {
  demoTab: HeroDemoTab
  loadedTabs: Set<HeroDemoTab>
  readyTabs: Set<HeroDemoTab>
  onTabReady: (tab: HeroDemoTab) => void
}) {
  const showSkeleton = !loadedTabs.has(demoTab) || !readyTabs.has(demoTab)

  return (
    <>
      {showSkeleton && (
        <div className="absolute inset-0 z-10">
          <DemoSkeleton className="rounded-t-xl" />
        </div>
      )}
      {loadedTabs.has('parent') && (
        <div
          inert
          className={`absolute inset-0 transition-opacity duration-200 ${
            demoTab === 'parent' && readyTabs.has('parent')
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={demoTab !== 'parent'}
        >
          <LazyParentDashboardDemo onMount={() => onTabReady('parent')} />
        </div>
      )}
      {loadedTabs.has('teacher') && (
        <div
          inert
          className={`absolute inset-0 transition-opacity duration-200 ${
            demoTab === 'teacher' && readyTabs.has('teacher')
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={demoTab !== 'teacher'}
        >
          <LazyTeacherDashboardDemo onMount={() => onTabReady('teacher')} />
        </div>
      )}
      {loadedTabs.has('admin') && (
        <div
          inert
          className={`absolute inset-0 transition-opacity duration-200 ${
            demoTab === 'admin' && readyTabs.has('admin')
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={demoTab !== 'admin'}
        >
          <LazyAdminDashboardDemo onMount={() => onTabReady('admin')} />
        </div>
      )}
      <div
        className="absolute inset-0 z-20 cursor-default"
        aria-hidden="true"
      />
    </>
  )
}

function HeroDemoFrame({
  t,
  demoTab,
  loadedTabs,
  readyTabs,
  onTabReady,
  boxShadow,
  className,
}: {
  t: boolean
  demoTab: HeroDemoTab
  loadedTabs: Set<HeroDemoTab>
  readyTabs: Set<HeroDemoTab>
  onTabReady: (tab: HeroDemoTab) => void
  boxShadow: string
  className: string
}) {
  const frameClasses = `rounded-t-xl border border-b-0 overflow-hidden transition-[box-shadow,colors] duration-500 ${t ? 'border-[#2E4A3C]/10' : 'border-white/10'}`

  return (
    <div className={`${className} ${frameClasses}`} style={{ boxShadow }}>
      <div className="relative w-full h-full">
        <HeroDemoPanels
          demoTab={demoTab}
          loadedTabs={loadedTabs}
          readyTabs={readyTabs}
          onTabReady={onTabReady}
        />
      </div>
    </div>
  )
}

function HeroScaledDemoFrame({
  t,
  demoTab,
  loadedTabs,
  readyTabs,
  onTabReady,
}: {
  t: boolean
  demoTab: HeroDemoTab
  loadedTabs: Set<HeroDemoTab>
  readyTabs: Set<HeroDemoTab>
  onTabReady: (tab: HeroDemoTab) => void
}) {
  const clipRef = useRef<HTMLDivElement>(null)
  const { scale, isMobileLayout } = useMobileDemoScale(clipRef, DEMO_WIDTH, VISIBLE_FRACTION)

  const boxShadow = t
    ? '0 0 0 1px rgba(30,59,42,0.15), 0 32px 80px rgba(30,59,42,0.12)'
    : '0 0 0 1px rgba(30,59,42,0.25), 0 32px 80px rgba(30,59,42,0.45)'

  return (
    <div className="hero-frame-enter relative mt-4 lg:max-w-[1100px] lg:mx-auto">
      <div
        ref={clipRef}
        className={`relative -mx-6 overflow-hidden lg:mx-0 lg:overflow-visible${isMobileLayout ? ' flex justify-center' : ''}`}
        style={{
          height: isMobileLayout && scale > 0 ? DEMO_HEIGHT * scale : DEMO_HEIGHT,
        }}
      >
        <div
          className={isMobileLayout ? 'shrink-0' : 'relative w-full'}
          style={
            isMobileLayout
              ? {
                  width: DEMO_WIDTH,
                  height: DEMO_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                }
              : { height: DEMO_HEIGHT }
          }
        >
          <HeroDemoFrame
            t={t}
            demoTab={demoTab}
            loadedTabs={loadedTabs}
            readyTabs={readyTabs}
            onTabReady={onTabReady}
            boxShadow={boxShadow}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const [demoTab, setDemoTab] = useState<HeroDemoTab>('parent')
  const [loadedTabs, setLoadedTabs] = useState<Set<HeroDemoTab>>(() => new Set())
  const [readyTabs, setReadyTabs] = useState<Set<HeroDemoTab>>(() => new Set())
  const t = demoTab === 'parent'

  useEffect(() => {
    setLoadedTabs((prev) => new Set(prev).add('parent'))
    prefetchParentDemo()
  }, [])

  const handleTabReady = useCallback((tab: HeroDemoTab) => {
    setReadyTabs((prev) => new Set(prev).add(tab))
  }, [])

  const handleDemoTabChange = useCallback((id: HeroDemoTab) => {
    setDemoTab(id)
    setLoadedTabs((prev) => new Set(prev).add(id))
  }, [])

  return (
    <section
      className="pt-[140px] pb-0 overflow-x-visible overflow-y-hidden lg:overflow-hidden"
      style={{
        backgroundColor: t ? '#F7F1E7' : demoTab === 'admin' ? '#1a3327' : '#2E4A3C',
        transition: 'background-color 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-16">

        <div className="hero-enter-slide-right absolute top-[-20px] right-[-200px] z-0 pointer-events-none select-none hidden lg:block">
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

        <div className="hero-enter-slide-left absolute top-[-20px] left-[-200px] z-0 pointer-events-none select-none hidden lg:block">
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

        <div className="max-w-[680px] mx-auto text-center">
          <div className="hero-enter" style={{ '--hero-delay': '0ms' } as React.CSSProperties}>
            <span className={`inline-flex items-center gap-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 transition-colors duration-500 ${t ? 'bg-[#E2EDD9] text-[#4A6B52]' : 'bg-white/10 text-white/75'}`}>
              🌿 Built for Microschools
            </span>
          </div>

          <h1
            className={`hero-enter font-display font-medium text-[clamp(2.6rem,5.2vw,4.75rem)] leading-[1.04] tracking-tight mt-6 transition-colors duration-500 ${t ? 'text-[#2E4A3C]' : 'text-white'}`}
            style={{ '--hero-delay': '80ms' } as React.CSSProperties}
          >
            Everything your microschool needs,
            <br /><em style={{ color: t ? 'var(--color-clay)' : '#E8D5C8', fontStyle: 'italic' }}>all in one place.</em>
          </h1>

          <p
            className={`hero-enter text-[17px] md:text-[18px] leading-relaxed mt-6 transition-colors duration-500 ${t ? 'text-[#2E4A3C]/80' : 'text-white/80'}`}
            style={{ '--hero-delay': '180ms' } as React.CSSProperties}
          >
            MudKitchen keeps parents, teachers, and administrators aligned with enrollment, communication, billing, and more&mdash;so you can focus on what matters most: your students.
          </p>

          <div
            className="hero-enter flex justify-center items-center gap-4 mt-8"
            style={{ '--hero-delay': '280ms' } as React.CSSProperties}
          >
            <a
              href="/get-started"
              className="inline-flex items-center gap-2 bg-clay text-white text-sm font-medium font-secondary rounded-pill px-7 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              Book a Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#product"
              className={`hidden lg:inline-flex items-center gap-1.5 text-sm font-secondary transition-colors duration-500 ${t ? 'text-[#2E4A3C]/50 hover:text-[#2E4A3C]/80' : 'text-white/50 hover:text-white/80'}`}
            >
              Try the product
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div
          className="hero-enter grid grid-cols-3 items-center mt-14 px-1"
          style={{ '--hero-delay': '360ms' } as React.CSSProperties}
        >
          <div />
          <div className="flex justify-center">
          <div className={`flex items-center gap-1 rounded-full p-1 border transition-colors duration-500 ${t ? 'bg-[#2E4A3C]/8 border-[#2E4A3C]/10' : 'bg-white/8 border-white/10'}`}>
            {DEMO_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleDemoTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  demoTab === tab.id
                    ? t ? 'bg-[#2E4A3C] text-white shadow-sm' : 'bg-white text-[#2E4A3C] shadow-sm'
                    : t ? 'text-[#2E4A3C]/60 hover:text-[#2E4A3C]/80' : 'text-white/75 hover:text-white/90'
                }`}
              >
                <tab.icon size={13} />
                <span className="lg:hidden">{tab.shortLabel}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          </div>

          <div />
        </div>

        <HeroScaledDemoFrame
          t={t}
          demoTab={demoTab}
          loadedTabs={loadedTabs}
          readyTabs={readyTabs}
          onTabReady={handleTabReady}
        />

      </div>
    </section>
  )
}
