'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importOneAcreFarmAdmin = () =>
  import('@/components/demo/oneacrefarm/OneAcreFarmAdminDashboardDemo')
const importOneAcreFarmWebsite = () =>
  import('@/components/demo/oneacrefarm/OneAcreFarmWebsiteDashboardDemo')
const importOneAcreFarmParent = () =>
  import('@/components/demo/oneacrefarm/OneAcreFarmParentDashboardDemo')
const importOneAcreFarmTeacher = () =>
  import('@/components/demo/oneacrefarm/OneAcreFarmTeacherDashboardDemo')

type OneAcreFarmAdminModule = Awaited<ReturnType<typeof importOneAcreFarmAdmin>>
type OneAcreFarmWebsiteModule = Awaited<ReturnType<typeof importOneAcreFarmWebsite>>
type OneAcreFarmParentModule = Awaited<ReturnType<typeof importOneAcreFarmParent>>
type OneAcreFarmTeacherModule = Awaited<ReturnType<typeof importOneAcreFarmTeacher>>

let oneAcreFarmAdminPromise: Promise<OneAcreFarmAdminModule> | null = null
let oneAcreFarmWebsitePromise: Promise<OneAcreFarmWebsiteModule> | null = null
let oneAcreFarmParentPromise: Promise<OneAcreFarmParentModule> | null = null
let oneAcreFarmTeacherPromise: Promise<OneAcreFarmTeacherModule> | null = null

function loadOneAcreFarmAdminCached() {
  if (!oneAcreFarmAdminPromise) {
    oneAcreFarmAdminPromise = importOneAcreFarmAdmin().catch((error) => {
      oneAcreFarmAdminPromise = null
      console.error('Failed to load demo "one-acre-farm-admin":', error)
      throw error
    })
  }
  return oneAcreFarmAdminPromise
}

function loadOneAcreFarmWebsiteCached() {
  if (!oneAcreFarmWebsitePromise) {
    oneAcreFarmWebsitePromise = importOneAcreFarmWebsite().catch((error) => {
      oneAcreFarmWebsitePromise = null
      console.error('Failed to load demo "one-acre-farm-website":', error)
      throw error
    })
  }
  return oneAcreFarmWebsitePromise
}

function loadOneAcreFarmParentCached() {
  if (!oneAcreFarmParentPromise) {
    oneAcreFarmParentPromise = importOneAcreFarmParent().catch((error) => {
      oneAcreFarmParentPromise = null
      console.error('Failed to load demo "one-acre-farm-parent":', error)
      throw error
    })
  }
  return oneAcreFarmParentPromise
}

function loadOneAcreFarmTeacherCached() {
  if (!oneAcreFarmTeacherPromise) {
    oneAcreFarmTeacherPromise = importOneAcreFarmTeacher().catch((error) => {
      oneAcreFarmTeacherPromise = null
      console.error('Failed to load demo "one-acre-farm-teacher":', error)
      throw error
    })
  }
  return oneAcreFarmTeacherPromise
}

const OneAcreFarmAdminDashboardDemo = dynamic(() => loadOneAcreFarmAdminCached(), {
  ssr: false,
})
const OneAcreFarmWebsiteDashboardDemo = dynamic(() => loadOneAcreFarmWebsiteCached(), {
  ssr: false,
})
const OneAcreFarmParentDashboardDemo = dynamic(() => loadOneAcreFarmParentCached(), {
  ssr: false,
})
const OneAcreFarmTeacherDashboardDemo = dynamic(() => loadOneAcreFarmTeacherCached(), {
  ssr: false,
})

export function LazyOneAcreFarmAdminDashboardDemo(
  props: ComponentProps<typeof OneAcreFarmAdminDashboardDemo>,
) {
  return <OneAcreFarmAdminDashboardDemo {...props} />
}

export function LazyOneAcreFarmWebsiteDashboardDemo(
  props: ComponentProps<typeof OneAcreFarmWebsiteDashboardDemo>,
) {
  return <OneAcreFarmWebsiteDashboardDemo {...props} />
}

export function LazyOneAcreFarmParentDashboardDemo(
  props: ComponentProps<typeof OneAcreFarmParentDashboardDemo>,
) {
  return <OneAcreFarmParentDashboardDemo {...props} />
}

export function LazyOneAcreFarmTeacherDashboardDemo(
  props: ComponentProps<typeof OneAcreFarmTeacherDashboardDemo>,
) {
  return <OneAcreFarmTeacherDashboardDemo {...props} />
}

export function prefetchOneAcreFarmAdminDemo() {
  void loadOneAcreFarmAdminCached()
}

export function prefetchOneAcreFarmWebsiteDemo() {
  void loadOneAcreFarmWebsiteCached()
}

export function prefetchOneAcreFarmParentDemo() {
  void loadOneAcreFarmParentCached()
}

export function prefetchOneAcreFarmTeacherDemo() {
  void loadOneAcreFarmTeacherCached()
}
