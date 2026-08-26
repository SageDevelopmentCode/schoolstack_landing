'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importKinderAcademyPrepSchoolAdmin = () =>
  import('@/components/demo/kinderacademyprep/KinderAcademyPrepSchoolAdminDashboardDemo') as Promise<DemoModule>
const importKinderAcademyPrepSchoolWebsite = () =>
  import('@/components/demo/kinderacademyprep/KinderAcademyPrepSchoolWebsiteDashboardDemo') as Promise<DemoModule>
const importKinderAcademyPrepSchoolParent = () =>
  import('@/components/demo/kinderacademyprep/KinderAcademyPrepSchoolParentDashboardDemo') as Promise<DemoModule>
const importKinderAcademyPrepSchoolTeacher = () =>
  import('@/components/demo/kinderacademyprep/KinderAcademyPrepSchoolTeacherDashboardDemo') as Promise<DemoModule>


let kinderAcademyPrepSchoolAdminPromise: Promise<DemoModule> | null = null
let kinderAcademyPrepSchoolWebsitePromise: Promise<DemoModule> | null = null
let kinderAcademyPrepSchoolParentPromise: Promise<DemoModule> | null = null
let kinderAcademyPrepSchoolTeacherPromise: Promise<DemoModule> | null = null

function loadKinderAcademyPrepSchoolAdminCached() {
  if (!kinderAcademyPrepSchoolAdminPromise) {
    kinderAcademyPrepSchoolAdminPromise = importKinderAcademyPrepSchoolAdmin().catch((error) => {
      kinderAcademyPrepSchoolAdminPromise = null
      console.error('Failed to load demo "kinder-academy-prep-school-admin":', error)
      throw error
    })
  }
  return kinderAcademyPrepSchoolAdminPromise
}

function loadKinderAcademyPrepSchoolWebsiteCached() {
  if (!kinderAcademyPrepSchoolWebsitePromise) {
    kinderAcademyPrepSchoolWebsitePromise = importKinderAcademyPrepSchoolWebsite().catch((error) => {
      kinderAcademyPrepSchoolWebsitePromise = null
      console.error('Failed to load demo "kinder-academy-prep-school-website":', error)
      throw error
    })
  }
  return kinderAcademyPrepSchoolWebsitePromise
}

function loadKinderAcademyPrepSchoolParentCached() {
  if (!kinderAcademyPrepSchoolParentPromise) {
    kinderAcademyPrepSchoolParentPromise = importKinderAcademyPrepSchoolParent().catch((error) => {
      kinderAcademyPrepSchoolParentPromise = null
      console.error('Failed to load demo "kinder-academy-prep-school-parent":', error)
      throw error
    })
  }
  return kinderAcademyPrepSchoolParentPromise
}

function loadKinderAcademyPrepSchoolTeacherCached() {
  if (!kinderAcademyPrepSchoolTeacherPromise) {
    kinderAcademyPrepSchoolTeacherPromise = importKinderAcademyPrepSchoolTeacher().catch((error) => {
      kinderAcademyPrepSchoolTeacherPromise = null
      console.error('Failed to load demo "kinder-academy-prep-school-teacher":', error)
      throw error
    })
  }
  return kinderAcademyPrepSchoolTeacherPromise
}

const KinderAcademyPrepSchoolAdminDashboardDemo = dynamic(() => loadKinderAcademyPrepSchoolAdminCached(), {
  ssr: false,
})
const KinderAcademyPrepSchoolWebsiteDashboardDemo = dynamic(() => loadKinderAcademyPrepSchoolWebsiteCached(), {
  ssr: false,
})
const KinderAcademyPrepSchoolParentDashboardDemo = dynamic(() => loadKinderAcademyPrepSchoolParentCached(), {
  ssr: false,
})
const KinderAcademyPrepSchoolTeacherDashboardDemo = dynamic(() => loadKinderAcademyPrepSchoolTeacherCached(), {
  ssr: false,
})

export function LazyKinderAcademyPrepSchoolAdminDashboardDemo(
  props: ComponentProps<typeof KinderAcademyPrepSchoolAdminDashboardDemo>,
) {
  return <KinderAcademyPrepSchoolAdminDashboardDemo {...props} />
}

export function LazyKinderAcademyPrepSchoolWebsiteDashboardDemo(
  props: ComponentProps<typeof KinderAcademyPrepSchoolWebsiteDashboardDemo>,
) {
  return <KinderAcademyPrepSchoolWebsiteDashboardDemo {...props} />
}

export function LazyKinderAcademyPrepSchoolParentDashboardDemo(
  props: ComponentProps<typeof KinderAcademyPrepSchoolParentDashboardDemo>,
) {
  return <KinderAcademyPrepSchoolParentDashboardDemo {...props} />
}

export function LazyKinderAcademyPrepSchoolTeacherDashboardDemo(
  props: ComponentProps<typeof KinderAcademyPrepSchoolTeacherDashboardDemo>,
) {
  return <KinderAcademyPrepSchoolTeacherDashboardDemo {...props} />
}

export function prefetchKinderAcademyPrepSchoolAdminDemo() {
  void loadKinderAcademyPrepSchoolAdminCached()
}

export function prefetchKinderAcademyPrepSchoolWebsiteDemo() {
  void loadKinderAcademyPrepSchoolWebsiteCached()
}

export function prefetchKinderAcademyPrepSchoolParentDemo() {
  void loadKinderAcademyPrepSchoolParentCached()
}

export function prefetchKinderAcademyPrepSchoolTeacherDemo() {
  void loadKinderAcademyPrepSchoolTeacherCached()
}
