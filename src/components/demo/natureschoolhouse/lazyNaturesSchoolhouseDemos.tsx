'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importNaturesSchoolhouseAdmin = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseAdminDashboardDemo') as Promise<DemoModule>
const importNaturesSchoolhouseWebsite = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseWebsiteDashboardDemo') as Promise<DemoModule>
const importNaturesSchoolhouseParent = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseParentDashboardDemo') as Promise<DemoModule>
const importNaturesSchoolhouseTeacher = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseTeacherDashboardDemo') as Promise<DemoModule>


let naturesSchoolhouseAdminPromise: Promise<DemoModule> | null = null
let naturesSchoolhouseWebsitePromise: Promise<DemoModule> | null = null
let naturesSchoolhouseParentPromise: Promise<DemoModule> | null = null
let naturesSchoolhouseTeacherPromise: Promise<DemoModule> | null = null

function loadNaturesSchoolhouseAdminCached() {
  if (!naturesSchoolhouseAdminPromise) {
    naturesSchoolhouseAdminPromise = importNaturesSchoolhouseAdmin().catch((error) => {
      naturesSchoolhouseAdminPromise = null
      console.error('Failed to load demo "natures-schoolhouse-admin":', error)
      throw error
    })
  }
  return naturesSchoolhouseAdminPromise
}

function loadNaturesSchoolhouseWebsiteCached() {
  if (!naturesSchoolhouseWebsitePromise) {
    naturesSchoolhouseWebsitePromise = importNaturesSchoolhouseWebsite().catch((error) => {
      naturesSchoolhouseWebsitePromise = null
      console.error('Failed to load demo "natures-schoolhouse-website":', error)
      throw error
    })
  }
  return naturesSchoolhouseWebsitePromise
}

function loadNaturesSchoolhouseParentCached() {
  if (!naturesSchoolhouseParentPromise) {
    naturesSchoolhouseParentPromise = importNaturesSchoolhouseParent().catch((error) => {
      naturesSchoolhouseParentPromise = null
      console.error('Failed to load demo "natures-schoolhouse-parent":', error)
      throw error
    })
  }
  return naturesSchoolhouseParentPromise
}

function loadNaturesSchoolhouseTeacherCached() {
  if (!naturesSchoolhouseTeacherPromise) {
    naturesSchoolhouseTeacherPromise = importNaturesSchoolhouseTeacher().catch((error) => {
      naturesSchoolhouseTeacherPromise = null
      console.error('Failed to load demo "natures-schoolhouse-teacher":', error)
      throw error
    })
  }
  return naturesSchoolhouseTeacherPromise
}

const NaturesSchoolhouseAdminDashboardDemo = dynamic(() => loadNaturesSchoolhouseAdminCached(), {
  ssr: false,
})
const NaturesSchoolhouseWebsiteDashboardDemo = dynamic(() => loadNaturesSchoolhouseWebsiteCached(), {
  ssr: false,
})
const NaturesSchoolhouseParentDashboardDemo = dynamic(() => loadNaturesSchoolhouseParentCached(), {
  ssr: false,
})
const NaturesSchoolhouseTeacherDashboardDemo = dynamic(() => loadNaturesSchoolhouseTeacherCached(), {
  ssr: false,
})

export function LazyNaturesSchoolhouseAdminDashboardDemo(
  props: ComponentProps<typeof NaturesSchoolhouseAdminDashboardDemo>,
) {
  return <NaturesSchoolhouseAdminDashboardDemo {...props} />
}

export function LazyNaturesSchoolhouseWebsiteDashboardDemo(
  props: ComponentProps<typeof NaturesSchoolhouseWebsiteDashboardDemo>,
) {
  return <NaturesSchoolhouseWebsiteDashboardDemo {...props} />
}

export function LazyNaturesSchoolhouseParentDashboardDemo(
  props: ComponentProps<typeof NaturesSchoolhouseParentDashboardDemo>,
) {
  return <NaturesSchoolhouseParentDashboardDemo {...props} />
}

export function LazyNaturesSchoolhouseTeacherDashboardDemo(
  props: ComponentProps<typeof NaturesSchoolhouseTeacherDashboardDemo>,
) {
  return <NaturesSchoolhouseTeacherDashboardDemo {...props} />
}

export function prefetchNaturesSchoolhouseAdminDemo() {
  void loadNaturesSchoolhouseAdminCached()
}

export function prefetchNaturesSchoolhouseWebsiteDemo() {
  void loadNaturesSchoolhouseWebsiteCached()
}

export function prefetchNaturesSchoolhouseParentDemo() {
  void loadNaturesSchoolhouseParentCached()
}

export function prefetchNaturesSchoolhouseTeacherDemo() {
  void loadNaturesSchoolhouseTeacherCached()
}
