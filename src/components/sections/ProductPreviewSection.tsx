'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { FadeInView } from '@/components/ui/FadeInView'
import AdminDashboardDemo from './AdminDashboardDemo'
import ParentDashboardDemo from './ParentDashboardDemo'
import TeacherDashboardDemo from './TeacherDashboardDemo'

type TabId = 'admin' | 'website' | 'enrollment' | 'parents' | 'teachers' | 'marketing' | 'leads'

interface Tab {
  id: TabId
  label: string
  caption: string
  description: string
}

const TABS: Tab[] = [
  {
    id: 'admin',
    label: 'Admin',
    caption: 'Admin Portal',
    description: 'Track every applicant from first click to enrolled — with notes, approvals, and follow-up.',
  },
  {
    id: 'website',
    label: 'Website',
    caption: 'School Website',
    description: 'A full school website with programs, FAQs, team, and calls to action.',
  },
  {
    id: 'enrollment',
    label: 'Enrollment',
    caption: 'Enrollment System',
    description: 'Enrollment with health info, emergency contacts, uploads, and signatures.',
  },
  {
    id: 'parents',
    label: 'Tuition',
    caption: 'Tuition & Billing',
    description: 'Families view invoices, make payments, and track tuition history in one place.',
  },
  {
    id: 'teachers',
    label: 'Attendance',
    caption: 'Attendance',
    description: 'Log daily attendance for every student, track who showed up, and navigate week by week.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    caption: 'Marketing',
    description: 'Automated email campaigns and lead nurture sequences, all tied to your pipeline.',
  },
  {
    id: 'leads',
    label: 'Leads',
    caption: 'Leads CRM',
    description: 'Waitlist inquiries, tour bookings, and follow-up all live in one pipeline.',
  },
]

export default function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState<TabId>('admin')
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
    <section id="product" className="bg-bg py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">

        {/* Top content */}
        <div className="max-w-[680px] mx-auto text-center mb-12">
          <FadeInView>
            <Badge>Product Tour</Badge>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text mt-5">
              Built inside a{' '}
              <em style={{ color: 'var(--color-clay)', fontStyle: 'italic' }}>real microschool.</em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.16}>
            <p className="text-[16px] text-text-muted leading-relaxed mt-4 max-w-[600px] mx-auto">
              Click through the modules to see how MudKitchen handles the work
              founders actually deal with every week: leads, enrollment, contracts,
              family communication, billing, and staff operations in one system.
            </p>
          </FadeInView>
        </div>

        <FadeInView delay={0.1}>
          {/* Tab bar */}
          <div
            ref={tabBarRef}
            className="flex items-center gap-1 bg-surface border border-border rounded-pill shadow-xs p-1.5 overflow-x-auto w-fit mx-auto max-w-full"
            style={{ scrollbarWidth: 'none' }}
            role="tablist"
            aria-label="Product modules"
          >
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`px-4 h-9 rounded-pill text-sm whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent ${
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-xs font-medium'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                }`}
              >
                {tab.label}
              </button>
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
    case 'leads':    return <LeadsTab />
  }
}

/* ─── Tab mockups ────────────────────────────────────────────────────── */

function AdminTab() {
  return <AdminDashboardDemo disableTour />
}

function WebsiteTab() {
  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* Nav */}
      <div className="flex items-center px-5 h-11 border-b border-border gap-6 shrink-0">
        <span className="font-display text-[13px] text-text">Sage Field</span>
        <div className="hidden md:flex gap-5">
          {['About', 'Programs', 'Admissions', 'Calendar', 'Contact'].map((l) => (
            <span key={l} className="text-[11px] text-text-muted">{l}</span>
          ))}
        </div>
        <div className="ml-auto">
          <span className="bg-accent text-white text-[10px] rounded-pill px-2.5 py-1">Apply Now</span>
        </div>
      </div>

      {/* Hero band */}
      <div className="bg-bg-alt px-6 py-8 border-b border-border shrink-0">
        <span className="text-[10px] text-accent uppercase tracking-widest font-medium">Microschool in Austin, Texas</span>
        <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] text-text mt-2 leading-tight">
          A different kind of school.<br />Built for curious minds.
        </h3>
        <p className="text-[12px] text-text-muted mt-2 max-w-xs">
          Small classrooms. Deep learning. A community that knows your child by name.
        </p>
        <div className="flex gap-2 mt-4">
          <span className="bg-accent text-white text-[10px] rounded-pill px-3 py-1.5">Enroll for Fall 2026</span>
          <span className="border border-border text-text-muted text-[10px] rounded-pill px-3 py-1.5">Book a Tour</span>
        </div>
      </div>

      {/* Programs */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="text-[11px] font-semibold text-text font-body mb-3">Our Programs</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Explorers', ages: 'Ages 4–6', desc: 'Play-based early learning' },
            { name: 'Builders', ages: 'Grades 1–4', desc: 'Project-based curriculum' },
            { name: 'Pioneers', ages: 'Grades 5–8', desc: 'Socratic-led discussions' },
          ].map((p) => (
            <div key={p.name} className="bg-surface border border-border rounded-lg p-3">
              <div className="text-[11px] font-medium text-text font-body">{p.name}</div>
              <div className="text-[10px] text-accent mt-0.5">{p.ages}</div>
              <div className="text-[10px] text-text-muted mt-1">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EnrollmentTab() {
  return <ParentDashboardDemo initialTab="enrollment" hideNav />
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

function LeadsTab() {
  const leads = [
    { name: 'The Garza Family', child: 'Elementary', status: 'New', tags: ['waitlist', 'summer'], date: '2d ago' },
    { name: 'Priya & Arjun Mehta', child: 'Pre-K', status: 'Contacted', tags: ['tour-booked'], date: '4d ago' },
    { name: 'The Kim-Torres Family', child: 'Middle', status: 'Touring', tags: ['referral'], date: '6d ago' },
    { name: 'Simone Okafor', child: 'Elementary', status: 'New', tags: ['waitlist'], date: '1w ago' },
    { name: 'Marcus & Joy Webb', child: 'Grades 1–3', status: 'Enrolled', tags: ['fall-2026'], date: '2w ago' },
  ]

  const statusStyles: Record<string, string> = {
    New: 'bg-blue-50 text-blue-600',
    Contacted: 'bg-yellow-50 text-yellow-700',
    Touring: 'bg-purple-50 text-purple-700',
    Enrolled: 'bg-green-50 text-green-700',
  }

  return (
    <div className="flex flex-col h-full p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[13px] font-semibold text-text font-body">Leads CRM</div>
          <div className="text-[10px] text-text-faint">14 active leads</div>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface-muted border border-border rounded-md px-2.5 h-7 flex items-center text-[10px] text-text-faint">Search</div>
          <div className="bg-accent text-white rounded-md px-2.5 h-7 flex items-center text-[10px] font-medium">+ New Lead</div>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {[['All', '14'], ['New', '6'], ['Contacted', '4'], ['Touring', '2'], ['Enrolled', '2']].map(([label, count], i) => (
          <div key={label} className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${i === 0 ? 'bg-surface-muted text-text font-medium' : 'text-text-faint'}`}>
            {label} <span className="opacity-60">{count}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden flex-1">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border bg-surface-soft">
              <th className="text-left px-3 py-2 text-text-faint font-medium uppercase tracking-wide text-[9px] font-mono">Family</th>
              <th className="text-left px-3 py-2 text-text-faint font-medium uppercase tracking-wide text-[9px] font-mono hidden md:table-cell">Interest</th>
              <th className="text-left px-3 py-2 text-text-faint font-medium uppercase tracking-wide text-[9px] font-mono">Status</th>
              <th className="text-left px-3 py-2 text-text-faint font-medium uppercase tracking-wide text-[9px] font-mono hidden lg:table-cell">Tags</th>
              <th className="text-left px-3 py-2 text-text-faint font-medium uppercase tracking-wide text-[9px] font-mono hidden md:table-cell">Added</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-soft transition-colors">
                <td className="px-3 py-2.5 font-medium text-text">{lead.name}</td>
                <td className="px-3 py-2.5 text-text-muted hidden md:table-cell">{lead.child}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] rounded-pill px-2 py-0.5 ${statusStyles[lead.status]}`}>{lead.status}</span>
                </td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {lead.tags.map((tag) => (
                      <span key={tag} className="bg-accent-soft text-accent text-[9px] rounded-pill px-1.5 py-0.5">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-text-faint hidden md:table-cell">{lead.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
