'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importZoeLearningHouseAdmin = () =>
  import('@/components/demo/zoelearninghouse/ZoeLearningHouseAdminDashboardDemo') as Promise<DemoModule>
const importZoeLearningHouseWebsite = () =>
  import('@/components/demo/zoelearninghouse/ZoeLearningHouseWebsiteDashboardDemo') as Promise<DemoModule>
const importZoeLearningHouseParent = () =>
  import('@/components/demo/zoelearninghouse/ZoeLearningHouseParentDashboardDemo') as Promise<DemoModule>
const importZoeLearningHouseTeacher = () =>
  import('@/components/demo/zoelearninghouse/ZoeLearningHouseTeacherDashboardDemo') as Promise<DemoModule>


let zoeLearningHouseAdminPromise: Promise<DemoModule> | null = null
let zoeLearningHouseWebsitePromise: Promise<DemoModule> | null = null
let zoeLearningHouseParentPromise: Promise<DemoModule> | null = null
let zoeLearningHouseTeacherPromise: Promise<DemoModule> | null = null

function loadZoeLearningHouseAdminCached() {
  if (!zoeLearningHouseAdminPromise) {
    zoeLearningHouseAdminPromise = importZoeLearningHouseAdmin().catch((error) => {
      zoeLearningHouseAdminPromise = null
      console.error('Failed to load demo "zoe-learning-house-admin":', error)
      throw error
    })
  }
  return zoeLearningHouseAdminPromise
}

function loadZoeLearningHouseWebsiteCached() {
  if (!zoeLearningHouseWebsitePromise) {
    zoeLearningHouseWebsitePromise = importZoeLearningHouseWebsite().catch((error) => {
      zoeLearningHouseWebsitePromise = null
      console.error('Failed to load demo "zoe-learning-house-website":', error)
      throw error
    })
  }
  return zoeLearningHouseWebsitePromise
}

function loadZoeLearningHouseParentCached() {
  if (!zoeLearningHouseParentPromise) {
    zoeLearningHouseParentPromise = importZoeLearningHouseParent().catch((error) => {
      zoeLearningHouseParentPromise = null
      console.error('Failed to load demo "zoe-learning-house-parent":', error)
      throw error
    })
  }
  return zoeLearningHouseParentPromise
}

function loadZoeLearningHouseTeacherCached() {
  if (!zoeLearningHouseTeacherPromise) {
    zoeLearningHouseTeacherPromise = importZoeLearningHouseTeacher().catch((error) => {
      zoeLearningHouseTeacherPromise = null
      console.error('Failed to load demo "zoe-learning-house-teacher":', error)
      throw error
    })
  }
  return zoeLearningHouseTeacherPromise
}

const ZoeLearningHouseAdminDashboardDemo = dynamic(() => loadZoeLearningHouseAdminCached(), {
  ssr: false,
})
const ZoeLearningHouseWebsiteDashboardDemo = dynamic(() => loadZoeLearningHouseWebsiteCached(), {
  ssr: false,
})
const ZoeLearningHouseParentDashboardDemo = dynamic(() => loadZoeLearningHouseParentCached(), {
  ssr: false,
})
const ZoeLearningHouseTeacherDashboardDemo = dynamic(() => loadZoeLearningHouseTeacherCached(), {
  ssr: false,
})

export function LazyZoeLearningHouseAdminDashboardDemo(
  props: ComponentProps<typeof ZoeLearningHouseAdminDashboardDemo>,
) {
  return <ZoeLearningHouseAdminDashboardDemo {...props} />
}

export function LazyZoeLearningHouseWebsiteDashboardDemo(
  props: ComponentProps<typeof ZoeLearningHouseWebsiteDashboardDemo>,
) {
  return <ZoeLearningHouseWebsiteDashboardDemo {...props} />
}

export function LazyZoeLearningHouseParentDashboardDemo(
  props: ComponentProps<typeof ZoeLearningHouseParentDashboardDemo>,
) {
  return <ZoeLearningHouseParentDashboardDemo {...props} />
}

export function LazyZoeLearningHouseTeacherDashboardDemo(
  props: ComponentProps<typeof ZoeLearningHouseTeacherDashboardDemo>,
) {
  return <ZoeLearningHouseTeacherDashboardDemo {...props} />
}

export function prefetchZoeLearningHouseAdminDemo() {
  void loadZoeLearningHouseAdminCached()
}

export function prefetchZoeLearningHouseWebsiteDemo() {
  void loadZoeLearningHouseWebsiteCached()
}

export function prefetchZoeLearningHouseParentDemo() {
  void loadZoeLearningHouseParentCached()
}

export function prefetchZoeLearningHouseTeacherDemo() {
  void loadZoeLearningHouseTeacherCached()
}
