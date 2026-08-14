'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importLuffLearningAdmin = () =>
  import('@/components/demo/lufflearning/LuffLearningAdminDashboardDemo') as Promise<DemoModule>
const importLuffLearningWebsite = () =>
  import('@/components/demo/lufflearning/LuffLearningWebsiteDashboardDemo') as Promise<DemoModule>
const importLuffLearningParent = () =>
  import('@/components/demo/lufflearning/LuffLearningParentDashboardDemo') as Promise<DemoModule>
const importLuffLearningTeacher = () =>
  import('@/components/demo/lufflearning/LuffLearningTeacherDashboardDemo') as Promise<DemoModule>


let luffLearningAdminPromise: Promise<DemoModule> | null = null
let luffLearningWebsitePromise: Promise<DemoModule> | null = null
let luffLearningParentPromise: Promise<DemoModule> | null = null
let luffLearningTeacherPromise: Promise<DemoModule> | null = null

function loadLuffLearningAdminCached() {
  if (!luffLearningAdminPromise) {
    luffLearningAdminPromise = importLuffLearningAdmin().catch((error) => {
      luffLearningAdminPromise = null
      console.error('Failed to load demo "luff-learning-admin":', error)
      throw error
    })
  }
  return luffLearningAdminPromise
}

function loadLuffLearningWebsiteCached() {
  if (!luffLearningWebsitePromise) {
    luffLearningWebsitePromise = importLuffLearningWebsite().catch((error) => {
      luffLearningWebsitePromise = null
      console.error('Failed to load demo "luff-learning-website":', error)
      throw error
    })
  }
  return luffLearningWebsitePromise
}

function loadLuffLearningParentCached() {
  if (!luffLearningParentPromise) {
    luffLearningParentPromise = importLuffLearningParent().catch((error) => {
      luffLearningParentPromise = null
      console.error('Failed to load demo "luff-learning-parent":', error)
      throw error
    })
  }
  return luffLearningParentPromise
}

function loadLuffLearningTeacherCached() {
  if (!luffLearningTeacherPromise) {
    luffLearningTeacherPromise = importLuffLearningTeacher().catch((error) => {
      luffLearningTeacherPromise = null
      console.error('Failed to load demo "luff-learning-teacher":', error)
      throw error
    })
  }
  return luffLearningTeacherPromise
}

const LuffLearningAdminDashboardDemo = dynamic(() => loadLuffLearningAdminCached(), {
  ssr: false,
})
const LuffLearningWebsiteDashboardDemo = dynamic(() => loadLuffLearningWebsiteCached(), {
  ssr: false,
})
const LuffLearningParentDashboardDemo = dynamic(() => loadLuffLearningParentCached(), {
  ssr: false,
})
const LuffLearningTeacherDashboardDemo = dynamic(() => loadLuffLearningTeacherCached(), {
  ssr: false,
})

export function LazyLuffLearningAdminDashboardDemo(
  props: ComponentProps<typeof LuffLearningAdminDashboardDemo>,
) {
  return <LuffLearningAdminDashboardDemo {...props} />
}

export function LazyLuffLearningWebsiteDashboardDemo(
  props: ComponentProps<typeof LuffLearningWebsiteDashboardDemo>,
) {
  return <LuffLearningWebsiteDashboardDemo {...props} />
}

export function LazyLuffLearningParentDashboardDemo(
  props: ComponentProps<typeof LuffLearningParentDashboardDemo>,
) {
  return <LuffLearningParentDashboardDemo {...props} />
}

export function LazyLuffLearningTeacherDashboardDemo(
  props: ComponentProps<typeof LuffLearningTeacherDashboardDemo>,
) {
  return <LuffLearningTeacherDashboardDemo {...props} />
}

export function prefetchLuffLearningAdminDemo() {
  void loadLuffLearningAdminCached()
}

export function prefetchLuffLearningWebsiteDemo() {
  void loadLuffLearningWebsiteCached()
}

export function prefetchLuffLearningParentDemo() {
  void loadLuffLearningParentCached()
}

export function prefetchLuffLearningTeacherDemo() {
  void loadLuffLearningTeacherCached()
}
