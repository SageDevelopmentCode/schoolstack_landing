'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importLighthouseHomeschoolAdmin = () =>
  import('@/components/demo/lighthousehomeschool/LighthouseHomeschoolAdminDashboardDemo')
const importLighthouseHomeschoolWebsite = () =>
  import('@/components/demo/lighthousehomeschool/LighthouseHomeschoolWebsiteDashboardDemo')
const importLighthouseHomeschoolParent = () =>
  import('@/components/demo/lighthousehomeschool/LighthouseHomeschoolParentDashboardDemo')
const importLighthouseHomeschoolTeacher = () =>
  import('@/components/demo/lighthousehomeschool/LighthouseHomeschoolTeacherDashboardDemo')

type LighthouseHomeschoolAdminModule = Awaited<ReturnType<typeof importLighthouseHomeschoolAdmin>>
type LighthouseHomeschoolWebsiteModule = Awaited<ReturnType<typeof importLighthouseHomeschoolWebsite>>
type LighthouseHomeschoolParentModule = Awaited<ReturnType<typeof importLighthouseHomeschoolParent>>
type LighthouseHomeschoolTeacherModule = Awaited<ReturnType<typeof importLighthouseHomeschoolTeacher>>

let lighthouseHomeschoolAdminPromise: Promise<LighthouseHomeschoolAdminModule> | null = null
let lighthouseHomeschoolWebsitePromise: Promise<LighthouseHomeschoolWebsiteModule> | null = null
let lighthouseHomeschoolParentPromise: Promise<LighthouseHomeschoolParentModule> | null = null
let lighthouseHomeschoolTeacherPromise: Promise<LighthouseHomeschoolTeacherModule> | null = null

function loadLighthouseHomeschoolAdminCached() {
  if (!lighthouseHomeschoolAdminPromise) {
    lighthouseHomeschoolAdminPromise = importLighthouseHomeschoolAdmin().catch((error) => {
      lighthouseHomeschoolAdminPromise = null
      console.error('Failed to load demo "lighthouse-homeschool-admin":', error)
      throw error
    })
  }
  return lighthouseHomeschoolAdminPromise
}

function loadLighthouseHomeschoolWebsiteCached() {
  if (!lighthouseHomeschoolWebsitePromise) {
    lighthouseHomeschoolWebsitePromise = importLighthouseHomeschoolWebsite().catch((error) => {
      lighthouseHomeschoolWebsitePromise = null
      console.error('Failed to load demo "lighthouse-homeschool-website":', error)
      throw error
    })
  }
  return lighthouseHomeschoolWebsitePromise
}

function loadLighthouseHomeschoolParentCached() {
  if (!lighthouseHomeschoolParentPromise) {
    lighthouseHomeschoolParentPromise = importLighthouseHomeschoolParent().catch((error) => {
      lighthouseHomeschoolParentPromise = null
      console.error('Failed to load demo "lighthouse-homeschool-parent":', error)
      throw error
    })
  }
  return lighthouseHomeschoolParentPromise
}

function loadLighthouseHomeschoolTeacherCached() {
  if (!lighthouseHomeschoolTeacherPromise) {
    lighthouseHomeschoolTeacherPromise = importLighthouseHomeschoolTeacher().catch((error) => {
      lighthouseHomeschoolTeacherPromise = null
      console.error('Failed to load demo "lighthouse-homeschool-teacher":', error)
      throw error
    })
  }
  return lighthouseHomeschoolTeacherPromise
}

const LighthouseHomeschoolAdminDashboardDemo = dynamic(() => loadLighthouseHomeschoolAdminCached(), {
  ssr: false,
})
const LighthouseHomeschoolWebsiteDashboardDemo = dynamic(() => loadLighthouseHomeschoolWebsiteCached(), {
  ssr: false,
})
const LighthouseHomeschoolParentDashboardDemo = dynamic(() => loadLighthouseHomeschoolParentCached(), {
  ssr: false,
})
const LighthouseHomeschoolTeacherDashboardDemo = dynamic(() => loadLighthouseHomeschoolTeacherCached(), {
  ssr: false,
})

export function LazyLighthouseHomeschoolAdminDashboardDemo(
  props: ComponentProps<typeof LighthouseHomeschoolAdminDashboardDemo>,
) {
  return <LighthouseHomeschoolAdminDashboardDemo {...props} />
}

export function LazyLighthouseHomeschoolWebsiteDashboardDemo(
  props: ComponentProps<typeof LighthouseHomeschoolWebsiteDashboardDemo>,
) {
  return <LighthouseHomeschoolWebsiteDashboardDemo {...props} />
}

export function LazyLighthouseHomeschoolParentDashboardDemo(
  props: ComponentProps<typeof LighthouseHomeschoolParentDashboardDemo>,
) {
  return <LighthouseHomeschoolParentDashboardDemo {...props} />
}

export function LazyLighthouseHomeschoolTeacherDashboardDemo(
  props: ComponentProps<typeof LighthouseHomeschoolTeacherDashboardDemo>,
) {
  return <LighthouseHomeschoolTeacherDashboardDemo {...props} />
}

export function prefetchLighthouseHomeschoolAdminDemo() {
  void loadLighthouseHomeschoolAdminCached()
}

export function prefetchLighthouseHomeschoolWebsiteDemo() {
  void loadLighthouseHomeschoolWebsiteCached()
}

export function prefetchLighthouseHomeschoolParentDemo() {
  void loadLighthouseHomeschoolParentCached()
}

export function prefetchLighthouseHomeschoolTeacherDemo() {
  void loadLighthouseHomeschoolTeacherCached()
}
