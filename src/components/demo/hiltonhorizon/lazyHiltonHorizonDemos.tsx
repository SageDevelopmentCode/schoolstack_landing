'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importHiltonHorizonAdmin = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonAdminDashboardDemo')
const importHiltonHorizonWebsite = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonWebsiteDashboardDemo')
const importHiltonHorizonParent = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonParentDashboardDemo')
const importHiltonHorizonTeacher = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonTeacherDashboardDemo')

type HiltonHorizonAdminModule = Awaited<ReturnType<typeof importHiltonHorizonAdmin>>
type HiltonHorizonWebsiteModule = Awaited<ReturnType<typeof importHiltonHorizonWebsite>>
type HiltonHorizonParentModule = Awaited<ReturnType<typeof importHiltonHorizonParent>>
type HiltonHorizonTeacherModule = Awaited<ReturnType<typeof importHiltonHorizonTeacher>>

let hiltonHorizonAdminPromise: Promise<HiltonHorizonAdminModule> | null = null
let hiltonHorizonWebsitePromise: Promise<HiltonHorizonWebsiteModule> | null = null
let hiltonHorizonParentPromise: Promise<HiltonHorizonParentModule> | null = null
let hiltonHorizonTeacherPromise: Promise<HiltonHorizonTeacherModule> | null = null

function loadHiltonHorizonAdminCached() {
  if (!hiltonHorizonAdminPromise) {
    hiltonHorizonAdminPromise = importHiltonHorizonAdmin().catch((error) => {
      hiltonHorizonAdminPromise = null
      console.error('Failed to load demo "hilton-horizons-academy-admin":', error)
      throw error
    })
  }
  return hiltonHorizonAdminPromise
}

function loadHiltonHorizonWebsiteCached() {
  if (!hiltonHorizonWebsitePromise) {
    hiltonHorizonWebsitePromise = importHiltonHorizonWebsite().catch((error) => {
      hiltonHorizonWebsitePromise = null
      console.error('Failed to load demo "hilton-horizons-academy-website":', error)
      throw error
    })
  }
  return hiltonHorizonWebsitePromise
}

function loadHiltonHorizonParentCached() {
  if (!hiltonHorizonParentPromise) {
    hiltonHorizonParentPromise = importHiltonHorizonParent().catch((error) => {
      hiltonHorizonParentPromise = null
      console.error('Failed to load demo "hilton-horizons-academy-parent":', error)
      throw error
    })
  }
  return hiltonHorizonParentPromise
}

function loadHiltonHorizonTeacherCached() {
  if (!hiltonHorizonTeacherPromise) {
    hiltonHorizonTeacherPromise = importHiltonHorizonTeacher().catch((error) => {
      hiltonHorizonTeacherPromise = null
      console.error('Failed to load demo "hilton-horizons-academy-teacher":', error)
      throw error
    })
  }
  return hiltonHorizonTeacherPromise
}

const HiltonHorizonAdminDashboardDemo = dynamic(() => loadHiltonHorizonAdminCached(), {
  ssr: false,
})
const HiltonHorizonWebsiteDashboardDemo = dynamic(() => loadHiltonHorizonWebsiteCached(), {
  ssr: false,
})
const HiltonHorizonParentDashboardDemo = dynamic(() => loadHiltonHorizonParentCached(), {
  ssr: false,
})
const HiltonHorizonTeacherDashboardDemo = dynamic(() => loadHiltonHorizonTeacherCached(), {
  ssr: false,
})

export function LazyHiltonHorizonAdminDashboardDemo(
  props: ComponentProps<typeof HiltonHorizonAdminDashboardDemo>,
) {
  return <HiltonHorizonAdminDashboardDemo {...props} />
}

export function LazyHiltonHorizonWebsiteDashboardDemo(
  props: ComponentProps<typeof HiltonHorizonWebsiteDashboardDemo>,
) {
  return <HiltonHorizonWebsiteDashboardDemo {...props} />
}

export function LazyHiltonHorizonParentDashboardDemo(
  props: ComponentProps<typeof HiltonHorizonParentDashboardDemo>,
) {
  return <HiltonHorizonParentDashboardDemo {...props} />
}

export function LazyHiltonHorizonTeacherDashboardDemo(
  props: ComponentProps<typeof HiltonHorizonTeacherDashboardDemo>,
) {
  return <HiltonHorizonTeacherDashboardDemo {...props} />
}

export function prefetchHiltonHorizonAdminDemo() {
  void loadHiltonHorizonAdminCached()
}

export function prefetchHiltonHorizonWebsiteDemo() {
  void loadHiltonHorizonWebsiteCached()
}

export function prefetchHiltonHorizonParentDemo() {
  void loadHiltonHorizonParentCached()
}

export function prefetchHiltonHorizonTeacherDemo() {
  void loadHiltonHorizonTeacherCached()
}
