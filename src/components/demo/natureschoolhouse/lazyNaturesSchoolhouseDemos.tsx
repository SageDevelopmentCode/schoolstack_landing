'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importNaturesSchoolhouseAdmin = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseAdminDashboardDemo')
const importNaturesSchoolhouseWebsite = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseWebsiteDashboardDemo')
const importNaturesSchoolhouseParent = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseParentDashboardDemo')
const importNaturesSchoolhouseTeacher = () =>
  import('@/components/demo/natureschoolhouse/NaturesSchoolhouseTeacherDashboardDemo')

type NaturesSchoolhouseAdminModule = Awaited<ReturnType<typeof importNaturesSchoolhouseAdmin>>
type NaturesSchoolhouseWebsiteModule = Awaited<ReturnType<typeof importNaturesSchoolhouseWebsite>>
type NaturesSchoolhouseParentModule = Awaited<ReturnType<typeof importNaturesSchoolhouseParent>>
type NaturesSchoolhouseTeacherModule = Awaited<ReturnType<typeof importNaturesSchoolhouseTeacher>>

let naturesSchoolhouseAdminPromise: Promise<NaturesSchoolhouseAdminModule> | null = null
let naturesSchoolhouseWebsitePromise: Promise<NaturesSchoolhouseWebsiteModule> | null = null
let naturesSchoolhouseParentPromise: Promise<NaturesSchoolhouseParentModule> | null = null
let naturesSchoolhouseTeacherPromise: Promise<NaturesSchoolhouseTeacherModule> | null = null

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
