'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importKineoSchoolAdmin = () =>
  import('@/components/demo/kineoschool/KineoSchoolAdminDashboardDemo')
const importKineoSchoolWebsite = () =>
  import('@/components/demo/kineoschool/KineoSchoolWebsiteDashboardDemo')
const importKineoSchoolParent = () =>
  import('@/components/demo/kineoschool/KineoSchoolParentDashboardDemo')
const importKineoSchoolTeacher = () =>
  import('@/components/demo/kineoschool/KineoSchoolTeacherDashboardDemo')

type KineoSchoolAdminModule = Awaited<ReturnType<typeof importKineoSchoolAdmin>>
type KineoSchoolWebsiteModule = Awaited<ReturnType<typeof importKineoSchoolWebsite>>
type KineoSchoolParentModule = Awaited<ReturnType<typeof importKineoSchoolParent>>
type KineoSchoolTeacherModule = Awaited<ReturnType<typeof importKineoSchoolTeacher>>

let kineoSchoolAdminPromise: Promise<KineoSchoolAdminModule> | null = null
let kineoSchoolWebsitePromise: Promise<KineoSchoolWebsiteModule> | null = null
let kineoSchoolParentPromise: Promise<KineoSchoolParentModule> | null = null
let kineoSchoolTeacherPromise: Promise<KineoSchoolTeacherModule> | null = null

function loadKineoSchoolAdminCached() {
  if (!kineoSchoolAdminPromise) {
    kineoSchoolAdminPromise = importKineoSchoolAdmin().catch((error) => {
      kineoSchoolAdminPromise = null
      console.error('Failed to load demo "kineo-school-admin":', error)
      throw error
    })
  }
  return kineoSchoolAdminPromise
}

function loadKineoSchoolWebsiteCached() {
  if (!kineoSchoolWebsitePromise) {
    kineoSchoolWebsitePromise = importKineoSchoolWebsite().catch((error) => {
      kineoSchoolWebsitePromise = null
      console.error('Failed to load demo "kineo-school-website":', error)
      throw error
    })
  }
  return kineoSchoolWebsitePromise
}

function loadKineoSchoolParentCached() {
  if (!kineoSchoolParentPromise) {
    kineoSchoolParentPromise = importKineoSchoolParent().catch((error) => {
      kineoSchoolParentPromise = null
      console.error('Failed to load demo "kineo-school-parent":', error)
      throw error
    })
  }
  return kineoSchoolParentPromise
}

function loadKineoSchoolTeacherCached() {
  if (!kineoSchoolTeacherPromise) {
    kineoSchoolTeacherPromise = importKineoSchoolTeacher().catch((error) => {
      kineoSchoolTeacherPromise = null
      console.error('Failed to load demo "kineo-school-teacher":', error)
      throw error
    })
  }
  return kineoSchoolTeacherPromise
}

const KineoSchoolAdminDashboardDemo = dynamic(() => loadKineoSchoolAdminCached(), {
  ssr: false,
})
const KineoSchoolWebsiteDashboardDemo = dynamic(() => loadKineoSchoolWebsiteCached(), {
  ssr: false,
})
const KineoSchoolParentDashboardDemo = dynamic(() => loadKineoSchoolParentCached(), {
  ssr: false,
})
const KineoSchoolTeacherDashboardDemo = dynamic(() => loadKineoSchoolTeacherCached(), {
  ssr: false,
})

export function LazyKineoSchoolAdminDashboardDemo(
  props: ComponentProps<typeof KineoSchoolAdminDashboardDemo>,
) {
  return <KineoSchoolAdminDashboardDemo {...props} />
}

export function LazyKineoSchoolWebsiteDashboardDemo(
  props: ComponentProps<typeof KineoSchoolWebsiteDashboardDemo>,
) {
  return <KineoSchoolWebsiteDashboardDemo {...props} />
}

export function LazyKineoSchoolParentDashboardDemo(
  props: ComponentProps<typeof KineoSchoolParentDashboardDemo>,
) {
  return <KineoSchoolParentDashboardDemo {...props} />
}

export function LazyKineoSchoolTeacherDashboardDemo(
  props: ComponentProps<typeof KineoSchoolTeacherDashboardDemo>,
) {
  return <KineoSchoolTeacherDashboardDemo {...props} />
}

export function prefetchKineoSchoolAdminDemo() {
  void loadKineoSchoolAdminCached()
}

export function prefetchKineoSchoolWebsiteDemo() {
  void loadKineoSchoolWebsiteCached()
}

export function prefetchKineoSchoolParentDemo() {
  void loadKineoSchoolParentCached()
}

export function prefetchKineoSchoolTeacherDemo() {
  void loadKineoSchoolTeacherCached()
}
