'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importHiltonHorizonAdmin = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonAdminDashboardDemo') as Promise<DemoModule>
const importHiltonHorizonWebsite = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonWebsiteDashboardDemo') as Promise<DemoModule>
const importHiltonHorizonParent = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonParentDashboardDemo') as Promise<DemoModule>
const importHiltonHorizonTeacher = () =>
  import('@/components/demo/hiltonhorizon/HiltonHorizonTeacherDashboardDemo') as Promise<DemoModule>


let hiltonHorizonAdminPromise: Promise<DemoModule> | null = null
let hiltonHorizonWebsitePromise: Promise<DemoModule> | null = null
let hiltonHorizonParentPromise: Promise<DemoModule> | null = null
let hiltonHorizonTeacherPromise: Promise<DemoModule> | null = null

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
