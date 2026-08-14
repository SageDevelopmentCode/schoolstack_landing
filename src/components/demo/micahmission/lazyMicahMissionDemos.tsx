'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importMicahMissionAdmin = () =>
  import('@/components/demo/micahmission/MicahMissionAdminDashboardDemo') as Promise<DemoModule>
const importMicahMissionWebsite = () =>
  import('@/components/demo/micahmission/MicahMissionWebsiteDashboardDemo') as Promise<DemoModule>
const importMicahMissionParent = () =>
  import('@/components/demo/micahmission/MicahMissionParentDashboardDemo') as Promise<DemoModule>
const importMicahMissionTeacher = () =>
  import('@/components/demo/micahmission/MicahMissionTeacherDashboardDemo') as Promise<DemoModule>


let micahMissionAdminPromise: Promise<DemoModule> | null = null
let micahMissionWebsitePromise: Promise<DemoModule> | null = null
let micahMissionParentPromise: Promise<DemoModule> | null = null
let micahMissionTeacherPromise: Promise<DemoModule> | null = null

function loadMicahMissionAdminCached() {
  if (!micahMissionAdminPromise) {
    micahMissionAdminPromise = importMicahMissionAdmin().catch((error) => {
      micahMissionAdminPromise = null
      console.error('Failed to load demo "micahs-mission-school-admin":', error)
      throw error
    })
  }
  return micahMissionAdminPromise
}

function loadMicahMissionWebsiteCached() {
  if (!micahMissionWebsitePromise) {
    micahMissionWebsitePromise = importMicahMissionWebsite().catch((error) => {
      micahMissionWebsitePromise = null
      console.error('Failed to load demo "micahs-mission-school-website":', error)
      throw error
    })
  }
  return micahMissionWebsitePromise
}

function loadMicahMissionParentCached() {
  if (!micahMissionParentPromise) {
    micahMissionParentPromise = importMicahMissionParent().catch((error) => {
      micahMissionParentPromise = null
      console.error('Failed to load demo "micahs-mission-school-parent":', error)
      throw error
    })
  }
  return micahMissionParentPromise
}

function loadMicahMissionTeacherCached() {
  if (!micahMissionTeacherPromise) {
    micahMissionTeacherPromise = importMicahMissionTeacher().catch((error) => {
      micahMissionTeacherPromise = null
      console.error('Failed to load demo "micahs-mission-school-teacher":', error)
      throw error
    })
  }
  return micahMissionTeacherPromise
}

const MicahMissionAdminDashboardDemo = dynamic(() => loadMicahMissionAdminCached(), {
  ssr: false,
})
const MicahMissionWebsiteDashboardDemo = dynamic(() => loadMicahMissionWebsiteCached(), {
  ssr: false,
})
const MicahMissionParentDashboardDemo = dynamic(() => loadMicahMissionParentCached(), {
  ssr: false,
})
const MicahMissionTeacherDashboardDemo = dynamic(() => loadMicahMissionTeacherCached(), {
  ssr: false,
})

export function LazyMicahMissionAdminDashboardDemo(
  props: ComponentProps<typeof MicahMissionAdminDashboardDemo>,
) {
  return <MicahMissionAdminDashboardDemo {...props} />
}

export function LazyMicahMissionWebsiteDashboardDemo(
  props: ComponentProps<typeof MicahMissionWebsiteDashboardDemo>,
) {
  return <MicahMissionWebsiteDashboardDemo {...props} />
}

export function LazyMicahMissionParentDashboardDemo(
  props: ComponentProps<typeof MicahMissionParentDashboardDemo>,
) {
  return <MicahMissionParentDashboardDemo {...props} />
}

export function LazyMicahMissionTeacherDashboardDemo(
  props: ComponentProps<typeof MicahMissionTeacherDashboardDemo>,
) {
  return <MicahMissionTeacherDashboardDemo {...props} />
}

export function prefetchMicahMissionAdminDemo() {
  void loadMicahMissionAdminCached()
}

export function prefetchMicahMissionWebsiteDemo() {
  void loadMicahMissionWebsiteCached()
}

export function prefetchMicahMissionParentDemo() {
  void loadMicahMissionParentCached()
}

export function prefetchMicahMissionTeacherDemo() {
  void loadMicahMissionTeacherCached()
}
