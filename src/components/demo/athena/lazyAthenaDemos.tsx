'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importAthenaAdmin = () =>
  import('@/components/demo/athena/AthenaAdminDashboardDemo') as Promise<DemoModule>
const importAthenaWebsite = () =>
  import('@/components/demo/athena/AthenaWebsiteDashboardDemo') as Promise<DemoModule>
const importAthenaParent = () =>
  import('@/components/demo/athena/AthenaParentDashboardDemo') as Promise<DemoModule>
const importAthenaTeacher = () =>
  import('@/components/demo/athena/AthenaTeacherDashboardDemo') as Promise<DemoModule>


let athenaAdminPromise: Promise<DemoModule> | null = null
let athenaWebsitePromise: Promise<DemoModule> | null = null
let athenaParentPromise: Promise<DemoModule> | null = null
let athenaTeacherPromise: Promise<DemoModule> | null = null

function loadAthenaAdminCached() {
  if (!athenaAdminPromise) {
    athenaAdminPromise = importAthenaAdmin().catch((error) => {
      athenaAdminPromise = null
      console.error('Failed to load demo "athena-admin":', error)
      throw error
    })
  }
  return athenaAdminPromise
}

function loadAthenaWebsiteCached() {
  if (!athenaWebsitePromise) {
    athenaWebsitePromise = importAthenaWebsite().catch((error) => {
      athenaWebsitePromise = null
      console.error('Failed to load demo "athena-website":', error)
      throw error
    })
  }
  return athenaWebsitePromise
}

function loadAthenaParentCached() {
  if (!athenaParentPromise) {
    athenaParentPromise = importAthenaParent().catch((error) => {
      athenaParentPromise = null
      console.error('Failed to load demo "athena-parent":', error)
      throw error
    })
  }
  return athenaParentPromise
}

function loadAthenaTeacherCached() {
  if (!athenaTeacherPromise) {
    athenaTeacherPromise = importAthenaTeacher().catch((error) => {
      athenaTeacherPromise = null
      console.error('Failed to load demo "athena-teacher":', error)
      throw error
    })
  }
  return athenaTeacherPromise
}

const AthenaAdminDashboardDemo = dynamic(() => loadAthenaAdminCached(), {
  ssr: false,
})
const AthenaWebsiteDashboardDemo = dynamic(() => loadAthenaWebsiteCached(), {
  ssr: false,
})
const AthenaParentDashboardDemo = dynamic(() => loadAthenaParentCached(), {
  ssr: false,
})
const AthenaTeacherDashboardDemo = dynamic(() => loadAthenaTeacherCached(), {
  ssr: false,
})

export function LazyAthenaAdminDashboardDemo(
  props: ComponentProps<typeof AthenaAdminDashboardDemo>,
) {
  return <AthenaAdminDashboardDemo {...props} />
}

export function LazyAthenaWebsiteDashboardDemo(
  props: ComponentProps<typeof AthenaWebsiteDashboardDemo>,
) {
  return <AthenaWebsiteDashboardDemo {...props} />
}

export function LazyAthenaParentDashboardDemo(
  props: ComponentProps<typeof AthenaParentDashboardDemo>,
) {
  return <AthenaParentDashboardDemo {...props} />
}

export function LazyAthenaTeacherDashboardDemo(
  props: ComponentProps<typeof AthenaTeacherDashboardDemo>,
) {
  return <AthenaTeacherDashboardDemo {...props} />
}

export function prefetchAthenaAdminDemo() {
  void loadAthenaAdminCached()
}

export function prefetchAthenaWebsiteDemo() {
  void loadAthenaWebsiteCached()
}

export function prefetchAthenaParentDemo() {
  void loadAthenaParentCached()
}

export function prefetchAthenaTeacherDemo() {
  void loadAthenaTeacherCached()
}
