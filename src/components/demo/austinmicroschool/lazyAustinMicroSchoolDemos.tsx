'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importAustinMicroSchoolAdmin = () =>
  import('@/components/demo/austinmicroschool/AustinMicroSchoolAdminDashboardDemo')
const importAustinMicroSchoolWebsite = () =>
  import('@/components/demo/austinmicroschool/AustinMicroSchoolWebsiteDashboardDemo')
const importAustinMicroSchoolParent = () =>
  import('@/components/demo/austinmicroschool/AustinMicroSchoolParentDashboardDemo')
const importAustinMicroSchoolTeacher = () =>
  import('@/components/demo/austinmicroschool/AustinMicroSchoolTeacherDashboardDemo')

type AustinMicroSchoolAdminModule = Awaited<ReturnType<typeof importAustinMicroSchoolAdmin>>
type AustinMicroSchoolWebsiteModule = Awaited<ReturnType<typeof importAustinMicroSchoolWebsite>>
type AustinMicroSchoolParentModule = Awaited<ReturnType<typeof importAustinMicroSchoolParent>>
type AustinMicroSchoolTeacherModule = Awaited<ReturnType<typeof importAustinMicroSchoolTeacher>>

let austinMicroSchoolAdminPromise: Promise<AustinMicroSchoolAdminModule> | null = null
let austinMicroSchoolWebsitePromise: Promise<AustinMicroSchoolWebsiteModule> | null = null
let austinMicroSchoolParentPromise: Promise<AustinMicroSchoolParentModule> | null = null
let austinMicroSchoolTeacherPromise: Promise<AustinMicroSchoolTeacherModule> | null = null

function loadAustinMicroSchoolAdminCached() {
  if (!austinMicroSchoolAdminPromise) {
    austinMicroSchoolAdminPromise = importAustinMicroSchoolAdmin().catch((error) => {
      austinMicroSchoolAdminPromise = null
      console.error('Failed to load demo "austin-micro-school-admin":', error)
      throw error
    })
  }
  return austinMicroSchoolAdminPromise
}

function loadAustinMicroSchoolWebsiteCached() {
  if (!austinMicroSchoolWebsitePromise) {
    austinMicroSchoolWebsitePromise = importAustinMicroSchoolWebsite().catch((error) => {
      austinMicroSchoolWebsitePromise = null
      console.error('Failed to load demo "austin-micro-school-website":', error)
      throw error
    })
  }
  return austinMicroSchoolWebsitePromise
}

function loadAustinMicroSchoolParentCached() {
  if (!austinMicroSchoolParentPromise) {
    austinMicroSchoolParentPromise = importAustinMicroSchoolParent().catch((error) => {
      austinMicroSchoolParentPromise = null
      console.error('Failed to load demo "austin-micro-school-parent":', error)
      throw error
    })
  }
  return austinMicroSchoolParentPromise
}

function loadAustinMicroSchoolTeacherCached() {
  if (!austinMicroSchoolTeacherPromise) {
    austinMicroSchoolTeacherPromise = importAustinMicroSchoolTeacher().catch((error) => {
      austinMicroSchoolTeacherPromise = null
      console.error('Failed to load demo "austin-micro-school-teacher":', error)
      throw error
    })
  }
  return austinMicroSchoolTeacherPromise
}

const AustinMicroSchoolAdminDashboardDemo = dynamic(() => loadAustinMicroSchoolAdminCached(), {
  ssr: false,
})
const AustinMicroSchoolWebsiteDashboardDemo = dynamic(() => loadAustinMicroSchoolWebsiteCached(), {
  ssr: false,
})
const AustinMicroSchoolParentDashboardDemo = dynamic(() => loadAustinMicroSchoolParentCached(), {
  ssr: false,
})
const AustinMicroSchoolTeacherDashboardDemo = dynamic(() => loadAustinMicroSchoolTeacherCached(), {
  ssr: false,
})

export function LazyAustinMicroSchoolAdminDashboardDemo(
  props: ComponentProps<typeof AustinMicroSchoolAdminDashboardDemo>,
) {
  return <AustinMicroSchoolAdminDashboardDemo {...props} />
}

export function LazyAustinMicroSchoolWebsiteDashboardDemo(
  props: ComponentProps<typeof AustinMicroSchoolWebsiteDashboardDemo>,
) {
  return <AustinMicroSchoolWebsiteDashboardDemo {...props} />
}

export function LazyAustinMicroSchoolParentDashboardDemo(
  props: ComponentProps<typeof AustinMicroSchoolParentDashboardDemo>,
) {
  return <AustinMicroSchoolParentDashboardDemo {...props} />
}

export function LazyAustinMicroSchoolTeacherDashboardDemo(
  props: ComponentProps<typeof AustinMicroSchoolTeacherDashboardDemo>,
) {
  return <AustinMicroSchoolTeacherDashboardDemo {...props} />
}

export function prefetchAustinMicroSchoolAdminDemo() {
  void loadAustinMicroSchoolAdminCached()
}

export function prefetchAustinMicroSchoolWebsiteDemo() {
  void loadAustinMicroSchoolWebsiteCached()
}

export function prefetchAustinMicroSchoolParentDemo() {
  void loadAustinMicroSchoolParentCached()
}

export function prefetchAustinMicroSchoolTeacherDemo() {
  void loadAustinMicroSchoolTeacherCached()
}
