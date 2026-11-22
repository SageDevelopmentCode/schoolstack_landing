'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'

function DemoChunkLoading() {
  return <DemoSkeleton className="rounded-2xl border border-gray-200" />
}

const importAdmin = () => import('./AdminDashboardDemo') as Promise<DemoModule>
const importTeacher = () => import('./TeacherDashboardDemo') as Promise<DemoModule>
const importParent = () => import('./ParentDashboardDemo') as Promise<DemoModule>
const importWebsite = () => import('./WebsiteDashboardDemo') as Promise<DemoModule>
const importGardenEnrollment = () => import('@/components/demo/shared/DemoStageEnrollment')


let adminPromise: Promise<DemoModule> | null = null
let teacherPromise: Promise<DemoModule> | null = null
let parentPromise: Promise<DemoModule> | null = null
let websitePromise: Promise<DemoModule> | null = null

function loadAdminCached() {
  if (!adminPromise) {
    adminPromise = importAdmin().catch((error) => {
      adminPromise = null
      console.error('Failed to load demo "admin":', error)
      throw error
    })
  }
  return adminPromise
}

function loadTeacherCached() {
  if (!teacherPromise) {
    teacherPromise = importTeacher().catch((error) => {
      teacherPromise = null
      console.error('Failed to load demo "teacher":', error)
      throw error
    })
  }
  return teacherPromise
}

function loadParentCached() {
  if (!parentPromise) {
    parentPromise = importParent().catch((error) => {
      parentPromise = null
      console.error('Failed to load demo "parent":', error)
      throw error
    })
  }
  return parentPromise
}

function loadWebsiteCached() {
  if (!websitePromise) {
    websitePromise = importWebsite().catch((error) => {
      websitePromise = null
      console.error('Failed to load demo "website":', error)
      throw error
    })
  }
  return websitePromise
}

/** Cache a demo chunk import so prefetch and render share one request. */
function cachedImport<T>(name: string, load: () => Promise<T>) {
  let promise: Promise<T> | null = null
  return () => {
    if (!promise) {
      promise = load().catch((error) => {
        promise = null
        console.error(`Failed to load demo "${name}":`, error)
        throw error
      })
    }
    return promise
  }
}

const loadGardenEnrollmentCached = cachedImport('garden-enrollment', importGardenEnrollment)
const loadGardenAdminDashboardCached = cachedImport('garden-admin-dashboard', () =>
  import('@/components/demo/shared/DemoStageAdminDashboard'),
)
const loadGardenAdminMarketingCached = cachedImport('garden-admin-marketing', () =>
  import('@/components/demo/shared/DemoStageAdminMarketing'),
)

const GardenEnrollmentDemo = dynamic(() => loadGardenEnrollmentCached(), {
  ssr: false,
  loading: DemoChunkLoading,
})
const GardenAdminDashboardDemo = dynamic(() => loadGardenAdminDashboardCached(), {
  ssr: false,
  loading: DemoChunkLoading,
})
const GardenAdminMarketingDemo = dynamic(() => loadGardenAdminMarketingCached(), {
  ssr: false,
  loading: DemoChunkLoading,
})

const AdminDashboardDemo = dynamic(() => loadAdminCached(), {
  ssr: false,
  loading: DemoChunkLoading,
})
const TeacherDashboardDemo = dynamic(() => loadTeacherCached(), {
  ssr: false,
  loading: DemoChunkLoading,
})
const ParentDashboardDemo = dynamic(() => loadParentCached(), {
  ssr: false,
  loading: DemoChunkLoading,
})
const WebsiteDashboardDemo = dynamic(() => loadWebsiteCached(), {
  ssr: false,
  loading: DemoChunkLoading,
})

export function LazyAdminDashboardDemo(props: ComponentProps<typeof AdminDashboardDemo>) {
  return <AdminDashboardDemo {...props} />
}

export function LazyTeacherDashboardDemo(props: ComponentProps<typeof TeacherDashboardDemo>) {
  return <TeacherDashboardDemo {...props} />
}

export function LazyParentDashboardDemo(props: ComponentProps<typeof ParentDashboardDemo>) {
  return <ParentDashboardDemo {...props} />
}

export function LazyWebsiteDashboardDemo(props: ComponentProps<typeof WebsiteDashboardDemo>) {
  return <WebsiteDashboardDemo {...props} />
}

/**
 * A hover/near-viewport prefetch is only a head start: when it fails (stale chunk after a
 * deploy, flaky network) the cache is cleared and the real render retries and reports. Its
 * rejection must not reach `unhandledrejection`, which on public pages reloads the tab.
 */
function ignorePrefetchFailure() {}

export function prefetchAdminDemo() {
  void loadAdminCached().catch(ignorePrefetchFailure)
}

export function prefetchTeacherDemo() {
  void loadTeacherCached().catch(ignorePrefetchFailure)
}

export function prefetchParentDemo() {
  void loadParentCached().catch(ignorePrefetchFailure)
}

export function prefetchWebsiteDemo() {
  void loadWebsiteCached().catch(ignorePrefetchFailure)
}

/** The real Garden enrollment checklist (DemoStage "enrollment"). */
export function LazyGardenEnrollmentDemo() {
  return <GardenEnrollmentDemo />
}

export function prefetchGardenEnrollmentDemo() {
  void loadGardenEnrollmentCached().catch(ignorePrefetchFailure)
}

/** The real Garden admin Dashboard (DemoStage "admin"). */
export function LazyGardenAdminDashboardDemo() {
  return <GardenAdminDashboardDemo />
}

export function prefetchGardenAdminDashboardDemo() {
  void loadGardenAdminDashboardCached().catch(ignorePrefetchFailure)
}

/** The Garden marketing automations demo (DemoStage "marketing"). */
export function LazyGardenAdminMarketingDemo() {
  return <GardenAdminMarketingDemo />
}

export function prefetchGardenAdminMarketingDemo() {
  void loadGardenAdminMarketingCached().catch(ignorePrefetchFailure)
}
