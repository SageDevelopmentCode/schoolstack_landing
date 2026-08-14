'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importParadiseEarthAcademyAdmin = () =>
  import('@/components/demo/paradiseearthacademy/ParadiseEarthAcademyAdminDashboardDemo') as Promise<DemoModule>
const importParadiseEarthAcademyWebsite = () =>
  import('@/components/demo/paradiseearthacademy/ParadiseEarthAcademyWebsiteDashboardDemo') as Promise<DemoModule>
const importParadiseEarthAcademyParent = () =>
  import('@/components/demo/paradiseearthacademy/ParadiseEarthAcademyParentDashboardDemo') as Promise<DemoModule>
const importParadiseEarthAcademyTeacher = () =>
  import('@/components/demo/paradiseearthacademy/ParadiseEarthAcademyTeacherDashboardDemo') as Promise<DemoModule>


let paradiseEarthAcademyAdminPromise: Promise<DemoModule> | null = null
let paradiseEarthAcademyWebsitePromise: Promise<DemoModule> | null = null
let paradiseEarthAcademyParentPromise: Promise<DemoModule> | null = null
let paradiseEarthAcademyTeacherPromise: Promise<DemoModule> | null = null

function loadParadiseEarthAcademyAdminCached() {
  if (!paradiseEarthAcademyAdminPromise) {
    paradiseEarthAcademyAdminPromise = importParadiseEarthAcademyAdmin().catch((error) => {
      paradiseEarthAcademyAdminPromise = null
      console.error('Failed to load demo "paradise-earth-academy-admin":', error)
      throw error
    })
  }
  return paradiseEarthAcademyAdminPromise
}

function loadParadiseEarthAcademyWebsiteCached() {
  if (!paradiseEarthAcademyWebsitePromise) {
    paradiseEarthAcademyWebsitePromise = importParadiseEarthAcademyWebsite().catch((error) => {
      paradiseEarthAcademyWebsitePromise = null
      console.error('Failed to load demo "paradise-earth-academy-website":', error)
      throw error
    })
  }
  return paradiseEarthAcademyWebsitePromise
}

function loadParadiseEarthAcademyParentCached() {
  if (!paradiseEarthAcademyParentPromise) {
    paradiseEarthAcademyParentPromise = importParadiseEarthAcademyParent().catch((error) => {
      paradiseEarthAcademyParentPromise = null
      console.error('Failed to load demo "paradise-earth-academy-parent":', error)
      throw error
    })
  }
  return paradiseEarthAcademyParentPromise
}

function loadParadiseEarthAcademyTeacherCached() {
  if (!paradiseEarthAcademyTeacherPromise) {
    paradiseEarthAcademyTeacherPromise = importParadiseEarthAcademyTeacher().catch((error) => {
      paradiseEarthAcademyTeacherPromise = null
      console.error('Failed to load demo "paradise-earth-academy-teacher":', error)
      throw error
    })
  }
  return paradiseEarthAcademyTeacherPromise
}

const ParadiseEarthAcademyAdminDashboardDemo = dynamic(() => loadParadiseEarthAcademyAdminCached(), {
  ssr: false,
})
const ParadiseEarthAcademyWebsiteDashboardDemo = dynamic(() => loadParadiseEarthAcademyWebsiteCached(), {
  ssr: false,
})
const ParadiseEarthAcademyParentDashboardDemo = dynamic(() => loadParadiseEarthAcademyParentCached(), {
  ssr: false,
})
const ParadiseEarthAcademyTeacherDashboardDemo = dynamic(() => loadParadiseEarthAcademyTeacherCached(), {
  ssr: false,
})

export function LazyParadiseEarthAcademyAdminDashboardDemo(
  props: ComponentProps<typeof ParadiseEarthAcademyAdminDashboardDemo>,
) {
  return <ParadiseEarthAcademyAdminDashboardDemo {...props} />
}

export function LazyParadiseEarthAcademyWebsiteDashboardDemo(
  props: ComponentProps<typeof ParadiseEarthAcademyWebsiteDashboardDemo>,
) {
  return <ParadiseEarthAcademyWebsiteDashboardDemo {...props} />
}

export function LazyParadiseEarthAcademyParentDashboardDemo(
  props: ComponentProps<typeof ParadiseEarthAcademyParentDashboardDemo>,
) {
  return <ParadiseEarthAcademyParentDashboardDemo {...props} />
}

export function LazyParadiseEarthAcademyTeacherDashboardDemo(
  props: ComponentProps<typeof ParadiseEarthAcademyTeacherDashboardDemo>,
) {
  return <ParadiseEarthAcademyTeacherDashboardDemo {...props} />
}

export function prefetchParadiseEarthAcademyAdminDemo() {
  void loadParadiseEarthAcademyAdminCached()
}

export function prefetchParadiseEarthAcademyWebsiteDemo() {
  void loadParadiseEarthAcademyWebsiteCached()
}

export function prefetchParadiseEarthAcademyParentDemo() {
  void loadParadiseEarthAcademyParentCached()
}

export function prefetchParadiseEarthAcademyTeacherDemo() {
  void loadParadiseEarthAcademyTeacherCached()
}
