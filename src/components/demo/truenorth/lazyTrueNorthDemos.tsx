'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importTrueNorthAdmin = () =>
  import('@/components/demo/truenorth/TrueNorthAdminDashboardDemo')
const importTrueNorthWebsite = () =>
  import('@/components/demo/truenorth/TrueNorthWebsiteDashboardDemo')
const importTrueNorthParent = () =>
  import('@/components/demo/truenorth/TrueNorthParentDashboardDemo')
const importTrueNorthTeacher = () =>
  import('@/components/demo/truenorth/TrueNorthTeacherDashboardDemo')

type TrueNorthAdminModule = Awaited<ReturnType<typeof importTrueNorthAdmin>>
type TrueNorthWebsiteModule = Awaited<ReturnType<typeof importTrueNorthWebsite>>
type TrueNorthParentModule = Awaited<ReturnType<typeof importTrueNorthParent>>
type TrueNorthTeacherModule = Awaited<ReturnType<typeof importTrueNorthTeacher>>

let trueNorthAdminPromise: Promise<TrueNorthAdminModule> | null = null
let trueNorthWebsitePromise: Promise<TrueNorthWebsiteModule> | null = null
let trueNorthParentPromise: Promise<TrueNorthParentModule> | null = null
let trueNorthTeacherPromise: Promise<TrueNorthTeacherModule> | null = null

function loadTrueNorthAdminCached() {
  if (!trueNorthAdminPromise) {
    trueNorthAdminPromise = importTrueNorthAdmin().catch((error) => {
      trueNorthAdminPromise = null
      console.error('Failed to load demo "true-north-admin":', error)
      throw error
    })
  }
  return trueNorthAdminPromise
}

function loadTrueNorthWebsiteCached() {
  if (!trueNorthWebsitePromise) {
    trueNorthWebsitePromise = importTrueNorthWebsite().catch((error) => {
      trueNorthWebsitePromise = null
      console.error('Failed to load demo "true-north-website":', error)
      throw error
    })
  }
  return trueNorthWebsitePromise
}

function loadTrueNorthParentCached() {
  if (!trueNorthParentPromise) {
    trueNorthParentPromise = importTrueNorthParent().catch((error) => {
      trueNorthParentPromise = null
      console.error('Failed to load demo "true-north-parent":', error)
      throw error
    })
  }
  return trueNorthParentPromise
}

function loadTrueNorthTeacherCached() {
  if (!trueNorthTeacherPromise) {
    trueNorthTeacherPromise = importTrueNorthTeacher().catch((error) => {
      trueNorthTeacherPromise = null
      console.error('Failed to load demo "true-north-teacher":', error)
      throw error
    })
  }
  return trueNorthTeacherPromise
}

const TrueNorthAdminDashboardDemo = dynamic(() => loadTrueNorthAdminCached(), {
  ssr: false,
})
const TrueNorthWebsiteDashboardDemo = dynamic(() => loadTrueNorthWebsiteCached(), {
  ssr: false,
})
const TrueNorthParentDashboardDemo = dynamic(() => loadTrueNorthParentCached(), {
  ssr: false,
})
const TrueNorthTeacherDashboardDemo = dynamic(() => loadTrueNorthTeacherCached(), {
  ssr: false,
})

export function LazyTrueNorthAdminDashboardDemo(
  props: ComponentProps<typeof TrueNorthAdminDashboardDemo>,
) {
  return <TrueNorthAdminDashboardDemo {...props} />
}

export function LazyTrueNorthWebsiteDashboardDemo(
  props: ComponentProps<typeof TrueNorthWebsiteDashboardDemo>,
) {
  return <TrueNorthWebsiteDashboardDemo {...props} />
}

export function LazyTrueNorthParentDashboardDemo(
  props: ComponentProps<typeof TrueNorthParentDashboardDemo>,
) {
  return <TrueNorthParentDashboardDemo {...props} />
}

export function LazyTrueNorthTeacherDashboardDemo(
  props: ComponentProps<typeof TrueNorthTeacherDashboardDemo>,
) {
  return <TrueNorthTeacherDashboardDemo {...props} />
}

export function prefetchTrueNorthAdminDemo() {
  void loadTrueNorthAdminCached()
}

export function prefetchTrueNorthWebsiteDemo() {
  void loadTrueNorthWebsiteCached()
}

export function prefetchTrueNorthParentDemo() {
  void loadTrueNorthParentCached()
}

export function prefetchTrueNorthTeacherDemo() {
  void loadTrueNorthTeacherCached()
}
