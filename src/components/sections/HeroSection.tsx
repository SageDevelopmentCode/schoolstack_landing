'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users, BookOpen, LayoutDashboard } from 'lucide-react'
import {
  LazyAdminDashboardDemo,
  LazyTeacherDashboardDemo,
  LazyParentDashboardDemo,
  prefetchAdminDemo,
  prefetchTeacherDemo,
  prefetchParentDemo,
} from './lazyDemos'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'

type HeroDemoTab = 'parent' | 'teacher' | 'admin'

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

const DEMO_TABS = [
  { id: 'parent',  label: 'Parent View',  icon: Users },
  { id: 'teacher', label: 'Teacher View', icon: BookOpen },
  { id: 'admin',   label: 'Admin View',   icon: LayoutDashboard },
] as const

const DEMO_WIDTH = 1100
const DEMO_HEIGHT = 680
const VISIBLE_FRACTION = 0.75

const heroFrameVariant = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease, delay: 0.38 },
  },
}

function useMobileDemoScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0.47)
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const onChange = () => setIsMobileLayout(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !isMobileLayout) return

    const update = () => {
      const width = el.offsetWidth
      if (width <= 0) return
      setScale(width / (DEMO_WIDTH * VISIBLE_FRACTION))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, isMobileLayout])

  return { scale, isMobileLayout }
}

function HeroDemoPanels({
  demoTab,
  loadedTabs,
}: {
  demoTab: HeroDemoTab
  loadedTabs: Set<HeroDemoTab>
}) {
  return (
    <>
      {loadedTabs.has('parent') && (
        <div
          inert
          className={`absolute inset-0 transition-opacity duration-200 ${
            demoTab === 'parent' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={demoTab !== 'parent'}
        >
          <LazyParentDashboardDemo />
        </div>
      )}
      {loadedTabs.has('teacher') && (
        <div
          inert
          className={`absolute inset-0 transition-opacity duration-200 ${
            demoTab === 'teacher' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={demoTab !== 'teacher'}
        >
          <LazyTeacherDashboardDemo />
        </div>
      )}
      {loadedTabs.has('admin') && (
        <div
          inert
          className={`absolute inset-0 transition-opacity duration-200 ${
            demoTab === 'admin' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={demoTab !== 'admin'}
        >
          <LazyAdminDashboardDemo />
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
  boxShadow,
  className,
}: {
  t: boolean
  demoTab: HeroDemoTab
  loadedTabs: Set<HeroDemoTab>
  boxShadow: string
  className: string
}) {
  const frameClasses = `rounded-t-xl border border-b-0 overflow-hidden transition-colors duration-500 ${t ? 'border-[#2E4A3C]/10' : 'border-white/10'}`

  return (
    <motion.div
      className={`${className} ${frameClasses}`}
      animate={{ boxShadow }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="relative w-full h-full">
        <HeroDemoPanels demoTab={demoTab} loadedTabs={loadedTabs} />
      </div>
    </motion.div>
  )
}

function HeroScaledDemoFrame({
  t,
  demoTab,
  loadedTabs,
  motionInitial,
}: {
  t: boolean
  demoTab: HeroDemoTab
  loadedTabs: Set<HeroDemoTab>
  motionInitial: false | 'hidden'
}) {
  const clipRef = useRef<HTMLDivElement>(null)
  const { scale, isMobileLayout } = useMobileDemoScale(clipRef)

  const boxShadow = t
    ? '0 0 0 1px rgba(30,59,42,0.15), 0 32px 80px rgba(30,59,42,0.12)'
    : '0 0 0 1px rgba(30,59,42,0.25), 0 32px 80px rgba(30,59,42,0.45)'

  return (
    <motion.div
      initial={motionInitial}
      animate="visible"
      variants={heroFrameVariant}
      className="relative mt-4 lg:max-w-[1100px] lg:mx-auto"
    >
      <div
        ref={clipRef}
        className="relative -mx-6 overflow-hidden lg:mx-0 lg:overflow-visible"
        style={{
          height: isMobileLayout && scale > 0 ? DEMO_HEIGHT * scale : DEMO_HEIGHT,
        }}
      >
        <div
          className={isMobileLayout ? 'absolute top-0 left-0' : 'relative w-full'}
          style={
            isMobileLayout
              ? {
                  width: DEMO_WIDTH,
                  height: DEMO_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }
              : { height: DEMO_HEIGHT }
          }
        >
          <HeroDemoFrame
            t={t}
            demoTab={demoTab}
            loadedTabs={loadedTabs}
            boxShadow={boxShadow}
            className="w-full h-full"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const { skip } = useEntranceAnimation()
  const [demoTab, setDemoTab] = useState<HeroDemoTab>('parent')
  const [loadedTabs, setLoadedTabs] = useState<Set<HeroDemoTab>>(() => new Set(['parent']))
  const t = demoTab === 'parent'
  const motionInitial = skip ? false : 'hidden'

  const handleDemoTabChange = useCallback((id: HeroDemoTab) => {
    setDemoTab(id)
    setLoadedTabs((prev) => new Set(prev).add(id))
  }, [])

  useEffect(() => {
    prefetchParentDemo()
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

        {/* Decorative illustration — upper-right of hero */}
        <motion.div
          initial={motionInitial}
          animate="visible"
          variants={illustrationVariant(1)}
          className="absolute top-[-20px] right-[-200px] z-0 pointer-events-none select-none hidden lg:block"
        >
          <Image
            src="/images/illustrations/HeroRight.png"
            alt=""
            aria-hidden="true"
            width={480}
            height={580}
          />
        </motion.div>

        {/* Decorative illustration — upper-left of hero */}
        <motion.div
          initial={motionInitial}
          animate="visible"
          variants={illustrationVariant(-1)}
          className="absolute top-[-20px] left-[-200px] z-0 pointer-events-none select-none hidden lg:block"
        >
          <Image
            src="/images/illustrations/HeroLeft.png"
            alt=""
            aria-hidden="true"
            width={480}
            height={580}
          />
        </motion.div>

        {/* Centered text block */}
        <div className="max-w-[680px] mx-auto text-center">
          <motion.div initial={motionInitial} animate="visible" variants={makeVariant(0)}>
            <span className={`inline-flex items-center gap-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 transition-colors duration-500 ${t ? 'bg-[#E2EDD9] text-[#4A6B52]' : 'bg-white/10 text-white/75'}`}>
              🌿 Built for Microschools
            </span>
          </motion.div>

          <motion.h1
            initial={motionInitial}
            animate="visible"
            variants={makeVariant(0.08)}
            className={`font-display font-medium text-[clamp(2.6rem,5.2vw,4.75rem)] leading-[1.04] tracking-tight mt-6 transition-colors duration-500 ${t ? 'text-[#2E4A3C]' : 'text-white'}`}
          >
            Everything your microschool needs,
            <br /><em style={{ color: t ? 'var(--color-clay)' : '#E8D5C8', fontStyle: 'italic' }}>all in one place.</em>
          </motion.h1>

          <motion.p
            initial={motionInitial}
            animate="visible"
            variants={makeVariant(0.18)}
            className={`text-[17px] md:text-[18px] leading-relaxed mt-6 transition-colors duration-500 ${t ? 'text-[#2E4A3C]/65' : 'text-white/65'}`}
          >
            MudKitchen keeps parents, teachers, and administrators aligned with enrollment, communication, billing, and more&mdash;so you can focus on what matters most: your students.
          </motion.p>

          <motion.div
            initial={motionInitial}
            animate="visible"
            variants={makeVariant(0.28)}
            className="flex justify-center items-center gap-4 mt-8"
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
              className={`inline-flex items-center gap-1.5 text-sm font-secondary transition-colors duration-500 ${t ? 'text-[#2E4A3C]/50 hover:text-[#2E4A3C]/80' : 'text-white/50 hover:text-white/80'}`}
            >
              Try the product
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Tab switcher + live indicator */}
        <motion.div
          initial={motionInitial}
          animate="visible"
          variants={makeVariant(0.36)}
          className="grid grid-cols-3 items-center mt-14 px-1"
        >
          <div />
          <div className="flex justify-center">
          <div className={`flex items-center gap-1 rounded-full p-1 border transition-colors duration-500 ${t ? 'bg-[#2E4A3C]/8 border-[#2E4A3C]/10' : 'bg-white/8 border-white/10'}`}>
            {DEMO_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleDemoTabChange(tab.id)}
                onMouseEnter={() => {
                  if (tab.id === 'admin') prefetchAdminDemo()
                  else if (tab.id === 'teacher') prefetchTeacherDemo()
                  else prefetchParentDemo()
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  demoTab === tab.id
                    ? t ? 'bg-[#2E4A3C] text-white shadow-sm' : 'bg-white text-[#2E4A3C] shadow-sm'
                    : t ? 'text-[#2E4A3C]/50 hover:text-[#2E4A3C]/80' : 'text-white/50 hover:text-white/80'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
          </div>

          <div />
        </motion.div>

        {/* Autoplay tour demo (non-interactive) */}
        <HeroScaledDemoFrame
          t={t}
          demoTab={demoTab}
          loadedTabs={loadedTabs}
          motionInitial={motionInitial}
        />

      </div>
    </section>
  )
}
