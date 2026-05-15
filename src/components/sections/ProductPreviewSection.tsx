'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, Globe, ClipboardList, CreditCard, CalendarCheck, Clock, Megaphone, LayoutDashboard } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { FadeInView } from '@/components/ui/FadeInView'
import AdminDashboardDemo from './AdminDashboardDemo'
import ParentDashboardDemo from './ParentDashboardDemo'
import TeacherDashboardDemo from './TeacherDashboardDemo'
import WebsiteDashboardDemo from './WebsiteDashboardDemo'

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
  const tabBarRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map())

  const currentTab = TABS.find((t) => t.id === activeTab)!

  function handleTabChange(id: TabId) {
    setActiveTab(id)
    const el = tabRefs.current.get(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleTabChange(TABS[(index + 1) % TABS.length].id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handleTabChange(TABS[(index - 1 + TABS.length) % TABS.length].id)
    }
  }

  return (
    <section id="product" className="bg-surface-soft py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">

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

          {/* Product frame */}
          <div className="mt-6 w-full h-[420px] md:h-[600px] lg:h-[700px] rounded-xl shadow-lg overflow-hidden relative bg-surface-soft">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                id={`tabpanel-${activeTab}`}
                role="tabpanel"
                aria-label={currentTab.caption}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <TabContent tabId={activeTab} />
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeInView>

      </div>
    </section>
  )
}

function TabContent({ tabId }: { tabId: TabId }) {
  switch (tabId) {
    case 'admin':    return <AdminTab />
    case 'website':  return <WebsiteTab />
    case 'enrollment': return <EnrollmentTab />
    case 'parents':  return <ParentsTab />
    case 'teachers': return <TeachersTab />
    case 'marketing': return <MarketingTab />
    case 'timeclock': return <TimeclockTab />
  }
}

/* ─── Tab mockups ────────────────────────────────────────────────────── */

function AdminTab() {
  return <AdminDashboardDemo disableTour />
}

function WebsiteTab() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.81)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const update = () => setScale(el.offsetWidth / 1440)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={outerRef} className="absolute inset-0 overflow-hidden">
      <div
        style={{
          width: 1440,
          height: scale > 0 ? `${100 / scale}%` : '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <WebsiteDashboardDemo disableTour />
      </div>
    </div>
  )
}

function EnrollmentTab() {
  return <ParentDashboardDemo initialTab="enrollment" disableTour hideNav />
}

function ParentsTab() {
  return <ParentDashboardDemo initialTab="billing" disableTour hideNav />
}

function TeachersTab() {
  return <TeacherDashboardDemo initialTab="attendance" disableTour hideNav />
}

function MarketingTab() {
  return <AdminDashboardDemo initialPage="marketing" disableTour hideNav />
}

function TimeclockTab() {
  return <TeacherDashboardDemo initialTab="hours" disableTour hideNav />
}
