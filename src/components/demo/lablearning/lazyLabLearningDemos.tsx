'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importLabLearningAdmin = () =>
  import('@/components/demo/lablearning/LabLearningAdminDashboardDemo')
const importLabLearningWebsite = () =>
  import('@/components/demo/lablearning/LabLearningWebsiteDashboardDemo')
const importLabLearningParent = () =>
  import('@/components/demo/lablearning/LabLearningParentDashboardDemo')
const importLabLearningTeacher = () =>
  import('@/components/demo/lablearning/LabLearningTeacherDashboardDemo')

type LabLearningAdminModule = Awaited<ReturnType<typeof importLabLearningAdmin>>
type LabLearningWebsiteModule = Awaited<ReturnType<typeof importLabLearningWebsite>>
type LabLearningParentModule = Awaited<ReturnType<typeof importLabLearningParent>>
type LabLearningTeacherModule = Awaited<ReturnType<typeof importLabLearningTeacher>>

let labLearningAdminPromise: Promise<LabLearningAdminModule> | null = null
let labLearningWebsitePromise: Promise<LabLearningWebsiteModule> | null = null
let labLearningParentPromise: Promise<LabLearningParentModule> | null = null
let labLearningTeacherPromise: Promise<LabLearningTeacherModule> | null = null

function loadLabLearningAdminCached() {
  if (!labLearningAdminPromise) {
    labLearningAdminPromise = importLabLearningAdmin().catch((error) => {
      labLearningAdminPromise = null
      console.error('Failed to load demo "lab-learning-admin":', error)
      throw error
    })
  }
  return labLearningAdminPromise
}

function loadLabLearningWebsiteCached() {
  if (!labLearningWebsitePromise) {
    labLearningWebsitePromise = importLabLearningWebsite().catch((error) => {
      labLearningWebsitePromise = null
      console.error('Failed to load demo "lab-learning-website":', error)
      throw error
    })
  }
  return labLearningWebsitePromise
}

function loadLabLearningParentCached() {
  if (!labLearningParentPromise) {
    labLearningParentPromise = importLabLearningParent().catch((error) => {
      labLearningParentPromise = null
      console.error('Failed to load demo "lab-learning-parent":', error)
      throw error
    })
  }
  return labLearningParentPromise
}

function loadLabLearningTeacherCached() {
  if (!labLearningTeacherPromise) {
    labLearningTeacherPromise = importLabLearningTeacher().catch((error) => {
      labLearningTeacherPromise = null
      console.error('Failed to load demo "lab-learning-teacher":', error)
      throw error
    })
  }
  return labLearningTeacherPromise
}

const LabLearningAdminDashboardDemo = dynamic(() => loadLabLearningAdminCached(), {
  ssr: false,
})
const LabLearningWebsiteDashboardDemo = dynamic(() => loadLabLearningWebsiteCached(), {
  ssr: false,
})
const LabLearningParentDashboardDemo = dynamic(() => loadLabLearningParentCached(), {
  ssr: false,
})
const LabLearningTeacherDashboardDemo = dynamic(() => loadLabLearningTeacherCached(), {
  ssr: false,
})

export function LazyLabLearningAdminDashboardDemo(
  props: ComponentProps<typeof LabLearningAdminDashboardDemo>,
) {
  return <LabLearningAdminDashboardDemo {...props} />
}

export function LazyLabLearningWebsiteDashboardDemo(
  props: ComponentProps<typeof LabLearningWebsiteDashboardDemo>,
) {
  return <LabLearningWebsiteDashboardDemo {...props} />
}

export function LazyLabLearningParentDashboardDemo(
  props: ComponentProps<typeof LabLearningParentDashboardDemo>,
) {
  return <LabLearningParentDashboardDemo {...props} />
}

export function LazyLabLearningTeacherDashboardDemo(
  props: ComponentProps<typeof LabLearningTeacherDashboardDemo>,
) {
  return <LabLearningTeacherDashboardDemo {...props} />
}

export function prefetchLabLearningAdminDemo() {
  void loadLabLearningAdminCached()
}

export function prefetchLabLearningWebsiteDemo() {
  void loadLabLearningWebsiteCached()
}

export function prefetchLabLearningParentDemo() {
  void loadLabLearningParentCached()
}

export function prefetchLabLearningTeacherDemo() {
  void loadLabLearningTeacherCached()
}
