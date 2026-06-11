'use client'

import { useState, useRef, useEffect, Fragment, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LucideIcon, Globe, ClipboardList, CreditCard, CalendarCheck, Clock, Megaphone, LayoutDashboard } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { FadeInView } from '@/components/ui/FadeInView'
import {
  LazyAdminDashboardDemo,
  LazyParentDashboardDemo,
  LazyTeacherDashboardDemo,
  LazyWebsiteDashboardDemo,
  prefetchAdminDemo,
  prefetchParentDemo,
  prefetchTeacherDemo,
  prefetchWebsiteDemo,
} from './lazyDemos'
import { useMobileDemoScale } from '@/hooks/useMobileDemoScale'

type TabId = 'admin' | 'website' | 'enrollment' | 'parents' | 'teachers' | 'marketing' | 'timeclock'

type TabGroup = 'website' | 'parent' | 'teacher' | 'admin'

interface Tab {
  id: TabId
  label: string
  caption: string
  description: string
  icon: LucideIcon
  group: TabGroup
}

const GROUP_COLORS: Record<TabGroup, string> = {
  website: 'var(--color-accent)',
  parent:  '#3b82f6',
  teacher: '#10b981',
  admin:   '#f97316',
}

const TABS: Tab[] = [
  {
    id: 'website',
    label: 'Website',
    caption: 'School Website',
    description: 'A full school website with programs, FAQs, team, and calls to action.',
    icon: Globe,
    group: 'website',
  },
  {
    id: 'enrollment',
    label: 'Enrollment',
    caption: 'Enrollment System',
    description: 'Enrollment with health info, emergency contacts, uploads, and signatures.',
    icon: ClipboardList,
    group: 'parent',
  },
  {
    id: 'parents',
    label: 'Tuition',
    caption: 'Tuition & Billing',
    description: 'Families view invoices, make payments, and track tuition history in one place.',
    icon: CreditCard,
    group: 'parent',
  },
  {
    id: 'teachers',
    label: 'Attendance',
    caption: 'Attendance',
    description: 'Log daily attendance for every student, track who showed up, and navigate week by week.',
    icon: CalendarCheck,
    group: 'teacher',
  },
  {
    id: 'timeclock',
    label: 'Timeclock',
    caption: 'Timeclock',
    description: 'Log hours, track sessions, and view weekly and monthly totals in one place.',
    icon: Clock,
    group: 'teacher',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    caption: 'Marketing',
    description: 'Automated email campaigns and lead nurture sequences, all tied to your pipeline.',
    icon: Megaphone,
    group: 'admin',
  },
  {
    id: 'admin',
    label: 'Admin',
    caption: 'Admin Portal',
    description: 'Track every applicant from first click to enrolled — with notes, approvals, and follow-up.',
    icon: LayoutDashboard,
    group: 'admin',
  },
]

const GROUP_META: { id: TabGroup; label: string }[] = [
  { id: 'website', label: 'Web' },
  { id: 'parent',  label: 'Parent' },
  { id: 'teacher', label: 'Teacher' },
  { id: 'admin',   label: 'Admin' },
]

const GROUPS = GROUP_META.map((g) => ({
  ...g,
  tabs: TABS.filter((t) => t.group === g.id),
}))

export default function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState<TabId>('website')
  const [loadedTabs, setLoadedTabs] = useState<Set<TabId>>(() => new Set(['website']))
  const tabBarRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map())

  function prefetchTab(id: TabId) {
    switch (id) {
      case 'website':
        prefetchWebsiteDemo()
        break
      case 'enrollment':
      case 'parents':
        prefetchParentDemo()
        break
      case 'teachers':
      case 'timeclock':
        prefetchTeacherDemo()
        break
      case 'admin':
      case 'marketing':
        prefetchAdminDemo()
        break
    }
  }

  const handleTabChange = useCallback((id: TabId) => {
    setActiveTab(id)
    setLoadedTabs((prev) => new Set(prev).add(id))
    const bar = tabBarRef.current
    const el = tabRefs.current.get(id)
    if (bar && el) {
      const elRect = el.getBoundingClientRect()
      const barRect = bar.getBoundingClientRect()
      const targetLeft =
        bar.scrollLeft + (elRect.left - barRect.left) - (barRect.width - elRect.width) / 2
      bar.scrollTo({ left: targetLeft, behavior: 'smooth' })
    }
  }, [])

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleTabChange(TABS[(index + 1) % TABS.length].id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handleTabChange(TABS[(index - 1 + TABS.length) % TABS.length].id)
    }
  }

  function illVariant(dir: 1 | -1, delay: number) {
    return {
      hidden: { opacity: 0, x: dir * 36 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const, delay },
      },
    }
  }

  function illMotionProps(delay: number, dir: 1 | -1) {
    return {
      initial: false as const,
      whileInView: 'visible' as const,
      viewport: { once: true },
      variants: illVariant(dir, delay),
    }
  }

  return (
    <section id="product" className="relative w-full overflow-x-visible overflow-y-hidden lg:overflow-hidden bg-surface py-24">

      {/* ── Left cluster ── */}
      {/* Notebook — top-left */}
      <motion.div
        {...illMotionProps(0.2, -1)}
        className="absolute top-6 left-[-150px] z-0 pointer-events-none select-none hidden lg:block"
      >
        <Image src="/images/illustrations/Notebook.png" alt="" aria-hidden width={340} height={340} style={{ opacity: 0.88 }} />
      </motion.div>

      {/* Backpack — mid-left, lower and pulled in a bit more */}
      <motion.div
        {...illMotionProps(0.38, -1)}
        className="absolute top-[310px] left-[-100px] z-0 pointer-events-none select-none hidden lg:block"
      >
        <Image src="/images/illustrations/Backpack.png" alt="" aria-hidden width={240} height={240} style={{ opacity: 0.82 }} />
      </motion.div>

      {/* ── Frame-level cluster ── */}
      {/* Letters — bottom-left corner */}
      <motion.div
        {...illMotionProps(0.55, -1)}
        className="absolute bottom-[80px] left-[-70px] z-0 pointer-events-none select-none hidden lg:block"
        style={{ rotate: '-8deg' }}
      >
        <Image src="/images/illustrations/Letters.png" alt="" aria-hidden width={260} height={260} style={{ opacity: 0.82 }} />
      </motion.div>

      {/* Pastel — bottom-right corner */}
      <motion.div
        {...illMotionProps(0.65, 1)}
        className="absolute bottom-0 right-[-80px] z-0 pointer-events-none select-none hidden lg:block"
        style={{ rotate: '7deg' }}
      >
        <Image src="/images/illustrations/Pastel.png" alt="" aria-hidden width={260} height={260} style={{ opacity: 0.82 }} />
      </motion.div>

      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-16 lg:overflow-x-hidden">

        {/* Top content */}
        <div className="max-w-[720px] mx-auto text-center mb-16">
          <FadeInView>
            <Badge>What is Mud Kitchen?</Badge>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text mt-5">
              One system for the work of running a microschool.
            </h2>
          </FadeInView>
          <FadeInView delay={0.16}>
            <p className="text-[16px] text-text-muted leading-relaxed mt-5 max-w-[640px] mx-auto">
              Mud Kitchen brings{' '}
              <strong className="text-text font-semibold">enrollment, family communication, student information, schedules,</strong>
              {' '}and everyday operations{' '}
              <em className="font-display text-[17px]" style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>into one place</em>
              , so school teams can stay organized without relying on a patchwork of{' '}
              <span className="line-through text-text-faint">spreadsheets, forms, inboxes, and apps.</span>
            </p>
            <p className="text-[16px] text-text-muted leading-relaxed mt-4 max-w-[640px] mx-auto">
              It is designed for the way{' '}
              <strong className="text-text font-semibold">small schools actually work</strong>
              {' '}—{' '}
              <span style={{ color: 'var(--color-clay)' }}>high-touch, fast-moving, relationship-centered</span>
              , and too often stuck stitching together tools that were never built for them.
            </p>
          </FadeInView>

          {/* Bullet cards */}
          <FadeInView delay={0.22}>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {[
                { title: 'One place', body: 'for the work your team touches every day.' },
                { title: 'Clearer experience', body: 'for families from day one.' },
                { title: 'Less friction', body: 'as your school grows.' },
              ].map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col gap-2 rounded-xl px-5 py-4 border border-border bg-surface shadow-xs"
                >
                  <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                    <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <p className="text-[15px] leading-snug">
                    <strong className="font-semibold text-text">{item.title}</strong>{' '}
                    <span className="text-text-muted">{item.body}</span>
                  </p>
                </li>
              ))}
            </ul>
          </FadeInView>
        </div>

        <FadeInView delay={0.1}>
          {/* Tab bar */}
          <div
            ref={tabBarRef}
            className="flex items-start gap-2 bg-surface border border-border rounded-xl shadow-xs p-2 overflow-x-auto w-fit mx-auto max-w-full"
            style={{ scrollbarWidth: 'none' }}
            role="tablist"
            aria-label="Product modules"
          >
            {GROUPS.map((group, gi) => (
              <Fragment key={group.id}>
                {gi > 0 && <div className="w-px self-stretch bg-border mx-1" aria-hidden />}
                <div className="flex flex-col gap-1.5">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider text-center px-1"
                    style={{ color: GROUP_COLORS[group.id] }}
                  >
                    {group.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {group.tabs.map((tab) => {
                      const flatIndex = TABS.findIndex((t) => t.id === tab.id)
                      return (
                        <button
                          key={tab.id}
                          ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
                          role="tab"
                          aria-selected={activeTab === tab.id}
                          aria-controls={`tabpanel-${tab.id}`}
                          onClick={() => handleTabChange(tab.id)}
                          onMouseEnter={() => prefetchTab(tab.id)}
                          onKeyDown={(e) => handleKeyDown(e, flatIndex)}
                          className={`flex items-center gap-1.5 px-4 h-9 rounded-pill text-sm whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent ${
                            activeTab === tab.id
                              ? 'text-white shadow-xs font-medium'
                              : 'text-text-muted hover:text-text hover:bg-surface-muted'
                          }`}
                          style={activeTab === tab.id ? { backgroundColor: GROUP_COLORS[tab.group] } : undefined}
                        >
                          <tab.icon
                            size={14}
                            style={{ color: activeTab === tab.id ? '#fff' : GROUP_COLORS[tab.group] }}
                          />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          <ProductScaledDemoFrame
            activeTab={activeTab}
            loadedTabs={loadedTabs}
          />
        </FadeInView>

      </div>
    </section>
  )
}

function TabPanel({
  visible,
  id,
  caption,
  isMobileLayout,
  children,
}: {
  visible: boolean
  id: TabId
  caption: string
  isMobileLayout: boolean
  children: React.ReactNode
}) {
  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-label={caption}
      aria-hidden={!visible}
      className={
        isMobileLayout
          ? visible
            ? 'relative block h-full'
            : 'hidden'
          : `absolute inset-0 transition-opacity duration-200 ${
              visible ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`
      }
    >
      {children}
    </div>
  )
}

function DemoInteractionGuard({
  scrollable = false,
  className = '',
  children,
}: {
  scrollable?: boolean
  className?: string
  children: React.ReactNode
}) {
  if (scrollable) {
    return (
      <div className={`relative h-full min-h-0 ${className}`}>
        <div className="h-full overflow-y-auto overscroll-contain">
          <div inert>{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div inert>{children}</div>
      <div className="absolute inset-0 z-20 cursor-default" aria-hidden="true" />
    </div>
  )
}

/* ─── Tab mockups ────────────────────────────────────────────────────── */

const DESIGN_WIDTH = 1440
const DESIGN_HEIGHT = 700
const MOBILE_PREVIEW_HEIGHT = DESIGN_HEIGHT
const VISIBLE_FRACTION = 0.65

function ProductScaledDemoFrame({
  activeTab,
  loadedTabs,
}: {
  activeTab: TabId
  loadedTabs: Set<TabId>
}) {
  const clipRef = useRef<HTMLDivElement>(null)
  const { scale, isMobileLayout } = useMobileDemoScale(clipRef, DESIGN_WIDTH, VISIBLE_FRACTION)

  const demoPanels = (
    <div
      className={isMobileLayout ? 'relative h-full' : 'absolute inset-0 overflow-hidden'}
      style={isMobileLayout ? { width: DESIGN_WIDTH, height: MOBILE_PREVIEW_HEIGHT } : undefined}
    >
      {loadedTabs.has('admin') && (
        <TabPanel visible={activeTab === 'admin'} id="admin" isMobileLayout={isMobileLayout} caption={TABS.find((t) => t.id === 'admin')!.caption}>
          <AdminTab isMobileLayout={isMobileLayout} />
        </TabPanel>
      )}
      {loadedTabs.has('website') && (
        <TabPanel visible={activeTab === 'website'} id="website" isMobileLayout={isMobileLayout} caption={TABS.find((t) => t.id === 'website')!.caption}>
          <WebsiteTab isMobileLayout={isMobileLayout} />
        </TabPanel>
      )}
      {loadedTabs.has('enrollment') && (
        <TabPanel visible={activeTab === 'enrollment'} id="enrollment" isMobileLayout={isMobileLayout} caption={TABS.find((t) => t.id === 'enrollment')!.caption}>
          <EnrollmentTab isMobileLayout={isMobileLayout} />
        </TabPanel>
      )}
      {loadedTabs.has('parents') && (
        <TabPanel visible={activeTab === 'parents'} id="parents" isMobileLayout={isMobileLayout} caption={TABS.find((t) => t.id === 'parents')!.caption}>
          <ParentsTab isMobileLayout={isMobileLayout} />
        </TabPanel>
      )}
      {loadedTabs.has('teachers') && (
        <TabPanel visible={activeTab === 'teachers'} id="teachers" isMobileLayout={isMobileLayout} caption={TABS.find((t) => t.id === 'teachers')!.caption}>
          <TeachersTab isMobileLayout={isMobileLayout} />
        </TabPanel>
      )}
      {loadedTabs.has('marketing') && (
        <TabPanel visible={activeTab === 'marketing'} id="marketing" isMobileLayout={isMobileLayout} caption={TABS.find((t) => t.id === 'marketing')!.caption}>
          <MarketingTab isMobileLayout={isMobileLayout} />
        </TabPanel>
      )}
      {loadedTabs.has('timeclock') && (
        <TabPanel visible={activeTab === 'timeclock'} id="timeclock" isMobileLayout={isMobileLayout} caption={TABS.find((t) => t.id === 'timeclock')!.caption}>
          <TimeclockTab isMobileLayout={isMobileLayout} />
        </TabPanel>
      )}
    </div>
  )

  if (isMobileLayout) {
    return (
      <div className="relative mt-6">
        <div
          ref={clipRef}
          className="relative -mx-6 overflow-x-hidden flex justify-start pl-4"
          style={{
            height: scale > 0 ? MOBILE_PREVIEW_HEIGHT * scale : MOBILE_PREVIEW_HEIGHT,
          }}
        >
          <div
            className="shrink-0 rounded-xl shadow-lg relative isolate bg-surface overflow-hidden"
            style={{
              width: DESIGN_WIDTH,
              height: MOBILE_PREVIEW_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {demoPanels}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 w-full h-[700px] rounded-xl shadow-lg overflow-hidden relative isolate bg-surface">
      {demoPanels}
    </div>
  )
}

function ScaledDemoContainer({
  children,
  isMobileLayout,
  scrollable = false,
}: {
  children: React.ReactNode
  isMobileLayout: boolean
  scrollable?: boolean
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.81)

  useEffect(() => {
    if (isMobileLayout) return
    const el = outerRef.current
    if (!el) return
    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isMobileLayout])

  if (isMobileLayout) {
    return (
      <div
        className={`relative w-full h-full ${scrollable ? 'min-h-0' : 'overflow-hidden'}`}
        style={{
          width: DESIGN_WIDTH,
          height: MOBILE_PREVIEW_HEIGHT,
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={outerRef}
      className="absolute inset-0 overflow-hidden flex justify-center"
      style={{ contain: 'paint' }}
    >
      <div
        className="shrink-0"
        style={{
          width: DESIGN_WIDTH,
          height: scale > 0 ? `${100 / scale}%` : '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function AdminTab({ isMobileLayout }: { isMobileLayout: boolean }) {
  return (
    <ScaledDemoContainer isMobileLayout={isMobileLayout}>
      <DemoInteractionGuard>
        <LazyAdminDashboardDemo disableTour />
      </DemoInteractionGuard>
    </ScaledDemoContainer>
  )
}

function WebsiteTab({ isMobileLayout }: { isMobileLayout: boolean }) {
  return (
    <ScaledDemoContainer isMobileLayout={isMobileLayout} scrollable>
      <DemoInteractionGuard scrollable className="h-full">
        <LazyWebsiteDashboardDemo disableTour externalScroll />
      </DemoInteractionGuard>
    </ScaledDemoContainer>
  )
}

function EnrollmentTab({ isMobileLayout }: { isMobileLayout: boolean }) {
  return (
    <ScaledDemoContainer isMobileLayout={isMobileLayout}>
      <DemoInteractionGuard>
        <LazyParentDashboardDemo initialTab="enrollment" disableTour hideNav />
      </DemoInteractionGuard>
    </ScaledDemoContainer>
  )
}

function ParentsTab({ isMobileLayout }: { isMobileLayout: boolean }) {
  return (
    <ScaledDemoContainer isMobileLayout={isMobileLayout}>
      <DemoInteractionGuard>
        <LazyParentDashboardDemo initialTab="billing" disableTour hideNav />
      </DemoInteractionGuard>
    </ScaledDemoContainer>
  )
}

function TeachersTab({ isMobileLayout }: { isMobileLayout: boolean }) {
  return (
    <ScaledDemoContainer isMobileLayout={isMobileLayout}>
      <DemoInteractionGuard>
        <LazyTeacherDashboardDemo initialTab="attendance" disableTour hideNav />
      </DemoInteractionGuard>
    </ScaledDemoContainer>
  )
}

function MarketingTab({ isMobileLayout }: { isMobileLayout: boolean }) {
  return (
    <ScaledDemoContainer isMobileLayout={isMobileLayout}>
      <DemoInteractionGuard>
        <LazyAdminDashboardDemo initialPage="marketing" disableTour hideNav />
      </DemoInteractionGuard>
    </ScaledDemoContainer>
  )
}

function TimeclockTab({ isMobileLayout }: { isMobileLayout: boolean }) {
  return (
    <ScaledDemoContainer isMobileLayout={isMobileLayout}>
      <DemoInteractionGuard>
        <LazyTeacherDashboardDemo initialTab="hours" disableTour hideNav />
      </DemoInteractionGuard>
    </ScaledDemoContainer>
  )
}
