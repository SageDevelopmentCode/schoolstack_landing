'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importKatsCommunityMicroschoolAdmin = () =>
  import('@/components/demo/katscommunity/KatsCommunityMicroschoolAdminDashboardDemo') as Promise<DemoModule>
const importKatsCommunityMicroschoolWebsite = () =>
  import('@/components/demo/katscommunity/KatsCommunityMicroschoolWebsiteDashboardDemo') as Promise<DemoModule>
const importKatsCommunityMicroschoolParent = () =>
  import('@/components/demo/katscommunity/KatsCommunityMicroschoolParentDashboardDemo') as Promise<DemoModule>
const importKatsCommunityMicroschoolTeacher = () =>
  import('@/components/demo/katscommunity/KatsCommunityMicroschoolTeacherDashboardDemo') as Promise<DemoModule>


let katsCommunityMicroschoolAdminPromise: Promise<DemoModule> | null = null
let katsCommunityMicroschoolWebsitePromise: Promise<DemoModule> | null = null
let katsCommunityMicroschoolParentPromise: Promise<DemoModule> | null = null
let katsCommunityMicroschoolTeacherPromise: Promise<DemoModule> | null = null

function loadKatsCommunityMicroschoolAdminCached() {
  if (!katsCommunityMicroschoolAdminPromise) {
    katsCommunityMicroschoolAdminPromise = importKatsCommunityMicroschoolAdmin().catch((error) => {
      katsCommunityMicroschoolAdminPromise = null
      console.error('Failed to load demo "kats-community-microschool-admin":', error)
      throw error
    })
  }
  return katsCommunityMicroschoolAdminPromise
}

function loadKatsCommunityMicroschoolWebsiteCached() {
  if (!katsCommunityMicroschoolWebsitePromise) {
    katsCommunityMicroschoolWebsitePromise = importKatsCommunityMicroschoolWebsite().catch((error) => {
      katsCommunityMicroschoolWebsitePromise = null
      console.error('Failed to load demo "kats-community-microschool-website":', error)
      throw error
    })
  }
  return katsCommunityMicroschoolWebsitePromise
}

function loadKatsCommunityMicroschoolParentCached() {
  if (!katsCommunityMicroschoolParentPromise) {
    katsCommunityMicroschoolParentPromise = importKatsCommunityMicroschoolParent().catch((error) => {
      katsCommunityMicroschoolParentPromise = null
      console.error('Failed to load demo "kats-community-microschool-parent":', error)
      throw error
    })
  }
  return katsCommunityMicroschoolParentPromise
}

function loadKatsCommunityMicroschoolTeacherCached() {
  if (!katsCommunityMicroschoolTeacherPromise) {
    katsCommunityMicroschoolTeacherPromise = importKatsCommunityMicroschoolTeacher().catch((error) => {
      katsCommunityMicroschoolTeacherPromise = null
      console.error('Failed to load demo "kats-community-microschool-teacher":', error)
      throw error
    })
  }
  return katsCommunityMicroschoolTeacherPromise
}

const KatsCommunityMicroschoolAdminDashboardDemo = dynamic(() => loadKatsCommunityMicroschoolAdminCached(), {
  ssr: false,
})
const KatsCommunityMicroschoolWebsiteDashboardDemo = dynamic(() => loadKatsCommunityMicroschoolWebsiteCached(), {
  ssr: false,
})
const KatsCommunityMicroschoolParentDashboardDemo = dynamic(() => loadKatsCommunityMicroschoolParentCached(), {
  ssr: false,
})
const KatsCommunityMicroschoolTeacherDashboardDemo = dynamic(() => loadKatsCommunityMicroschoolTeacherCached(), {
  ssr: false,
})

export function LazyKatsCommunityMicroschoolAdminDashboardDemo(
  props: ComponentProps<typeof KatsCommunityMicroschoolAdminDashboardDemo>,
) {
  return <KatsCommunityMicroschoolAdminDashboardDemo {...props} />
}

export function LazyKatsCommunityMicroschoolWebsiteDashboardDemo(
  props: ComponentProps<typeof KatsCommunityMicroschoolWebsiteDashboardDemo>,
) {
  return <KatsCommunityMicroschoolWebsiteDashboardDemo {...props} />
}

export function LazyKatsCommunityMicroschoolParentDashboardDemo(
  props: ComponentProps<typeof KatsCommunityMicroschoolParentDashboardDemo>,
) {
  return <KatsCommunityMicroschoolParentDashboardDemo {...props} />
}

export function LazyKatsCommunityMicroschoolTeacherDashboardDemo(
  props: ComponentProps<typeof KatsCommunityMicroschoolTeacherDashboardDemo>,
) {
  return <KatsCommunityMicroschoolTeacherDashboardDemo {...props} />
}

export function prefetchKatsCommunityMicroschoolAdminDemo() {
  void loadKatsCommunityMicroschoolAdminCached()
}

export function prefetchKatsCommunityMicroschoolWebsiteDemo() {
  void loadKatsCommunityMicroschoolWebsiteCached()
}

export function prefetchKatsCommunityMicroschoolParentDemo() {
  void loadKatsCommunityMicroschoolParentCached()
}

export function prefetchKatsCommunityMicroschoolTeacherDemo() {
  void loadKatsCommunityMicroschoolTeacherCached()
}
