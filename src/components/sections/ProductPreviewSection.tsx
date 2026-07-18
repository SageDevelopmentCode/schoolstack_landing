'use client'

import { useState, useRef, Fragment, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LucideIcon, Globe, ClipboardList, CreditCard, CalendarCheck, Clock, Megaphone, LayoutDashboard } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { FadeInView } from '@/components/ui/FadeInView'
import { InViewDemoGate } from '@/components/ui/InViewDemoGate'
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
import { LandingScaledDemoFrame } from '@/components/demo/LandingScaledDemoFrame'

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

  const activeGroup = TABS.find((t) => t.id === activeTab)!.group
  const activeGroupTabs = TABS.filter((t) => t.group === activeGroup)

  const handleTabChange = useCallback((id: TabId) => {
    setActiveTab(id)
    setLoadedTabs((prev) => new Set(prev).add(id))
    const bar = tabBarRef.current
    const el = tabRefs.current.get(id)
    if (bar && el && window.matchMedia('(min-width: 1024px)').matches) {
      const elRect = el.getBoundingClientRect()
      const barRect = bar.getBoundingClientRect()
      const targetLeft =
        bar.scrollLeft + (elRect.left - barRect.left) - (barRect.width - elRect.width) / 2
      bar.scrollTo({ left: targetLeft, behavior: 'smooth' })
    }
  }, [])

  const handleGroupChange = useCallback(
    (groupId: TabGroup) => {
      const groupTabs = TABS.filter((t) => t.group === groupId)
      const currentInGroup = groupTabs.find((t) => t.id === activeTab)
      handleTabChange(currentInGroup?.id ?? groupTabs[0].id)
    },
    [activeTab, handleTabChange],
  )

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
    <section id="product" className="relative w-full overflow-x-hidden overflow-y-hidden lg:overflow-hidden bg-surface py-24">

      {/* ── Left cluster ── */}
      {/* Notebook — top-left */}
      <motion.div
        {...illMotionProps(0.2, -1)}
        className="absolute top-6 left-[-150px] z-0 pointer-events-none select-none hidden lg:block"
      >
        <Image src="/images/illustrations/Notebook.webp" alt="" aria-hidden width={340} height={340} style={{ opacity: 0.88 }} />
      </motion.div>

      {/* Backpack — mid-left, lower and pulled in a bit more */}
      <motion.div
        {...illMotionProps(0.38, -1)}
        className="absolute top-[310px] left-[-100px] z-0 pointer-events-none select-none hidden lg:block"
      >
        <Image src="/images/illustrations/Backpack.webp" alt="" aria-hidden width={240} height={240} style={{ opacity: 0.82 }} />
      </motion.div>

      {/* ── Frame-level cluster ── */}
      {/* Letters — bottom-left corner */}
      <motion.div
        {...illMotionProps(0.55, -1)}
        className="absolute bottom-[80px] left-[-70px] z-0 pointer-events-none select-none hidden lg:block"
        style={{ rotate: '-8deg' }}
      >
        <Image src="/images/illustrations/Letters.webp" alt="" aria-hidden width={260} height={260} style={{ opacity: 0.82 }} />
      </motion.div>

      {/* Pastel — bottom-right corner */}
      <motion.div
        {...illMotionProps(0.65, 1)}
        className="absolute bottom-0 right-[-80px] z-0 pointer-events-none select-none hidden lg:block"
        style={{ rotate: '7deg' }}
      >
        <Image src="/images/illustrations/Pastel.webp" alt="" aria-hidden width={260} height={260} style={{ opacity: 0.82 }} />
      </motion.div>

      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-16 overflow-x-hidden">

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
          {/* Mobile tab bar */}
          <div className="lg:hidden w-full flex flex-col gap-2 bg-surface border border-border rounded-xl shadow-xs p-2">
            <div
              role="radiogroup"
              aria-label="Product category"
              className="grid grid-cols-4 gap-1 rounded-lg bg-surface-muted p-1"
            >
              {GROUP_META.map((group) => {
                const isActiveGroup = activeGroup === group.id
                return (
                  <button
                    key={group.id}
                    type="button"
                    role="radio"
                    aria-checked={isActiveGroup}
                    onClick={() => handleGroupChange(group.id)}
                    className={`min-h-10 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 touch-manipulation focus-visible:outline-2 focus-visible:outline-accent ${
                      isActiveGroup
                        ? 'bg-surface shadow-xs'
                        : 'text-text-muted'
                    }`}
                    style={isActiveGroup ? { color: GROUP_COLORS[group.id] } : undefined}
                  >
                    {group.label}
                  </button>
                )
              })}
            </div>
            <div
              role="tablist"
              aria-label="Product modules"
              className="flex gap-1.5"
            >
              {activeGroupTabs.map((tab) => {
                const flatIndex = TABS.findIndex((t) => t.id === tab.id)
                return (
                  <button
                    key={tab.id}
                    ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    onMouseEnter={() => prefetchTab(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, flatIndex)}
                    className={`flex flex-1 items-center justify-center gap-2 min-h-11 px-3 rounded-pill text-sm whitespace-nowrap transition-all duration-200 touch-manipulation focus-visible:outline-2 focus-visible:outline-accent ${
                      activeTab === tab.id
                        ? 'text-white shadow-xs font-medium'
                        : 'text-text-muted'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: GROUP_COLORS[tab.group] } : undefined}
                  >
                    <tab.icon
                      size={16}
                      style={{ color: activeTab === tab.id ? '#fff' : GROUP_COLORS[tab.group] }}
                    />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Desktop tab bar */}
          <div
            ref={tabBarRef}
            className="hidden lg:flex items-start gap-2 bg-surface border border-border rounded-xl shadow-xs p-2 overflow-x-auto w-fit mx-auto max-w-full"
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

          <div className="max-lg:-mx-6 max-lg:overflow-x-hidden max-lg:overscroll-x-none">
            <ProductScaledDemoFrame
              activeTab={activeTab}
              loadedTabs={loadedTabs}
            />
          </div>
        </FadeInView>

      </div>
    </section>
  )
}

function TabPanel({
  visible,
  id,
  caption,
  children,
}: {
  visible: boolean
  id: TabId
  caption: string
  children: React.ReactNode
}) {
  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-label={caption}
      aria-hidden={!visible}
      className={visible ? 'block' : 'hidden'}
    >
      {children}
    </div>
  )
}

function DemoInteractionGuard({ children }: { children: React.ReactNode }) {
  return <div inert>{children}</div>
}

/* ─── Tab mockups ────────────────────────────────────────────────────── */

function ProductScaledDemoFrame({
  activeTab,
  loadedTabs,
}: {
  activeTab: TabId
  loadedTabs: Set<TabId>
}) {
  return (
    <LandingScaledDemoFrame className="mt-6" preventHorizontalScroll>
      <div className="relative">
        <TabPanel visible={activeTab === 'admin'} id="admin" caption={TABS.find((t) => t.id === 'admin')!.caption}>
          <InViewDemoGate>
            {loadedTabs.has('admin') && (
              <DemoInteractionGuard>
                <LazyAdminDashboardDemo disableTour />
              </DemoInteractionGuard>
            )}
          </InViewDemoGate>
        </TabPanel>
        <TabPanel visible={activeTab === 'website'} id="website" caption={TABS.find((t) => t.id === 'website')!.caption}>
          <InViewDemoGate>
            {loadedTabs.has('website') && (
              <DemoInteractionGuard>
                <LazyWebsiteDashboardDemo disableTour />
              </DemoInteractionGuard>
            )}
          </InViewDemoGate>
        </TabPanel>
        <TabPanel visible={activeTab === 'enrollment'} id="enrollment" caption={TABS.find((t) => t.id === 'enrollment')!.caption}>
          <InViewDemoGate>
            {loadedTabs.has('enrollment') && (
              <DemoInteractionGuard>
                <LazyParentDashboardDemo initialTab="enrollment" disableTour hideNav />
              </DemoInteractionGuard>
            )}
          </InViewDemoGate>
        </TabPanel>
        <TabPanel visible={activeTab === 'parents'} id="parents" caption={TABS.find((t) => t.id === 'parents')!.caption}>
          <InViewDemoGate>
            {loadedTabs.has('parents') && (
              <DemoInteractionGuard>
                <LazyParentDashboardDemo initialTab="billing" disableTour hideNav />
              </DemoInteractionGuard>
            )}
          </InViewDemoGate>
        </TabPanel>
        <TabPanel visible={activeTab === 'teachers'} id="teachers" caption={TABS.find((t) => t.id === 'teachers')!.caption}>
          <InViewDemoGate>
            {loadedTabs.has('teachers') && (
              <DemoInteractionGuard>
                <LazyTeacherDashboardDemo initialTab="attendance" disableTour hideNav />
              </DemoInteractionGuard>
            )}
          </InViewDemoGate>
        </TabPanel>
        <TabPanel visible={activeTab === 'marketing'} id="marketing" caption={TABS.find((t) => t.id === 'marketing')!.caption}>
          <InViewDemoGate>
            {loadedTabs.has('marketing') && (
              <DemoInteractionGuard>
                <LazyAdminDashboardDemo initialPage="marketing" disableTour hideNav />
              </DemoInteractionGuard>
            )}
          </InViewDemoGate>
        </TabPanel>
        <TabPanel visible={activeTab === 'timeclock'} id="timeclock" caption={TABS.find((t) => t.id === 'timeclock')!.caption}>
          <InViewDemoGate>
            {loadedTabs.has('timeclock') && (
              <DemoInteractionGuard>
                <LazyTeacherDashboardDemo initialTab="hours" disableTour hideNav />
              </DemoInteractionGuard>
            )}
          </InViewDemoGate>
        </TabPanel>
      </div>
    </LandingScaledDemoFrame>
  )
}
