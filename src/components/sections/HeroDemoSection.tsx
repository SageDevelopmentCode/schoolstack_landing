'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Users, BookOpen, LayoutDashboard } from 'lucide-react'
import {
  LazyAdminDashboardDemo,
  LazyTeacherDashboardDemo,
  LazyParentDashboardDemo,
  prefetchAdminDemo,
  prefetchParentDemo,
  prefetchTeacherDemo,
} from './lazyDemos'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'
import { useMobileDemoScale } from '@/hooks/useMobileDemoScale'
import { scheduleOnIdle } from '@/lib/schedule-on-idle'

type HeroDemoTab = 'parent' | 'teacher' | 'admin'

const DEMO_TABS = [
  { id: 'parent',  label: 'Parent View',  shortLabel: 'Parent',  icon: Users },
  { id: 'teacher', label: 'Teacher View', shortLabel: 'Teacher', icon: BookOpen },
  { id: 'admin',   label: 'Admin View',   shortLabel: 'Admin',   icon: LayoutDashboard },
] as const

const DEMO_WIDTH = 1100
const DEMO_HEIGHT = 680
const VISIBLE_FRACTION = 0.75
const DEFAULT_MOBILE_SCALE = 0.47

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
  const mobileScale = scale > 0 ? scale : DEFAULT_MOBILE_SCALE

  const boxShadow = t
    ? '0 0 0 1px rgba(30,59,42,0.15), 0 32px 80px rgba(30,59,42,0.12)'
    : '0 0 0 1px rgba(30,59,42,0.25), 0 32px 80px rgba(30,59,42,0.45)'

  return (
    <div className="hero-frame-enter relative mt-4 lg:max-w-[1100px] lg:mx-auto">
      <div
        ref={clipRef}
        className={`relative -mx-6 overflow-hidden lg:mx-0 lg:overflow-visible${isMobileLayout ? ' flex justify-center' : ''}`}
        style={{
          height: isMobileLayout ? DEMO_HEIGHT * mobileScale : DEMO_HEIGHT,
        }}
      >
        <div
          className={isMobileLayout ? 'shrink-0' : 'relative w-full'}
          style={
            isMobileLayout
              ? {
                  width: DEMO_WIDTH,
                  height: DEMO_HEIGHT,
                  transform: `scale(${mobileScale})`,
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

export default function HeroDemoSection() {
  const [demoTab, setDemoTab] = useState<HeroDemoTab>('parent')
  const [loadedTabs, setLoadedTabs] = useState<Set<HeroDemoTab>>(() => new Set())
  const [readyTabs, setReadyTabs] = useState<Set<HeroDemoTab>>(() => new Set())
  const [demosEnabled, setDemosEnabled] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const idleScheduledRef = useRef(false)
  const t = demoTab === 'parent'

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return

        setDemosEnabled(true)

        if (idleScheduledRef.current) return
        idleScheduledRef.current = true

        scheduleOnIdle(() => {
          setLoadedTabs((prev) => new Set(prev).add('parent'))
          prefetchParentDemo()
        })

        observer.disconnect()
      },
      { rootMargin: '50px', threshold: 0.25 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleTabReady = useCallback((tab: HeroDemoTab) => {
    setReadyTabs((prev) => new Set(prev).add(tab))
  }, [])

  const handleDemoTabChange = useCallback((id: HeroDemoTab) => {
    setDemoTab(id)
    setLoadedTabs((prev) => new Set(prev).add(id))
    if (id === 'parent') prefetchParentDemo()
    if (id === 'teacher') prefetchTeacherDemo()
    if (id === 'admin') prefetchAdminDemo()
  }, [])

  const demoBackground =
    t ? '#F7F1E7' : demoTab === 'admin' ? '#1a3327' : '#2E4A3C'

  return (
    <div
      ref={sectionRef}
      className="mt-14 transition-colors duration-500"
      style={{ backgroundColor: demoBackground }}
    >
      <div
        className="hero-enter grid grid-cols-3 items-center px-1"
        style={{ '--hero-delay': '360ms' } as React.CSSProperties}
      >
        <div />
        <div className="flex justify-center">
          <div
            className={`flex items-center gap-1 rounded-full border p-1 transition-colors duration-500 ${t ? 'bg-[#2E4A3C]/8 border-[#2E4A3C]/10' : 'bg-white/8 border-white/10'}`}
          >
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

      {demosEnabled ? (
        <HeroScaledDemoFrame
          t={t}
          demoTab={demoTab}
          loadedTabs={loadedTabs}
          readyTabs={readyTabs}
          onTabReady={handleTabReady}
        />
      ) : (
        <div
          className="hero-frame-enter relative mt-4 lg:max-w-[1100px] lg:mx-auto"
          style={{ height: DEMO_HEIGHT * VISIBLE_FRACTION }}
        >
          <DemoSkeleton className="h-full rounded-t-xl" />
        </div>
      )}
    </div>
  )
}
