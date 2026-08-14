'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importAscendMicroschoolAdmin = () =>
  import('@/components/demo/ascendmicroschool/AscendMicroschoolAdminDashboardDemo') as Promise<DemoModule>
const importAscendMicroschoolWebsite = () =>
  import('@/components/demo/ascendmicroschool/AscendMicroschoolWebsiteDashboardDemo') as Promise<DemoModule>
const importAscendMicroschoolParent = () =>
  import('@/components/demo/ascendmicroschool/AscendMicroschoolParentDashboardDemo') as Promise<DemoModule>
const importAscendMicroschoolTeacher = () =>
  import('@/components/demo/ascendmicroschool/AscendMicroschoolTeacherDashboardDemo') as Promise<DemoModule>


let ascendMicroschoolAdminPromise: Promise<DemoModule> | null = null
let ascendMicroschoolWebsitePromise: Promise<DemoModule> | null = null
let ascendMicroschoolParentPromise: Promise<DemoModule> | null = null
let ascendMicroschoolTeacherPromise: Promise<DemoModule> | null = null

function loadAscendMicroschoolAdminCached() {
  if (!ascendMicroschoolAdminPromise) {
    ascendMicroschoolAdminPromise = importAscendMicroschoolAdmin().catch((error) => {
      ascendMicroschoolAdminPromise = null
      console.error('Failed to load demo "ascend-micro-school-admin":', error)
      throw error
    })
  }
  return ascendMicroschoolAdminPromise
}

function loadAscendMicroschoolWebsiteCached() {
  if (!ascendMicroschoolWebsitePromise) {
    ascendMicroschoolWebsitePromise = importAscendMicroschoolWebsite().catch((error) => {
      ascendMicroschoolWebsitePromise = null
      console.error('Failed to load demo "ascend-micro-school-website":', error)
      throw error
    })
  }
  return ascendMicroschoolWebsitePromise
}

function loadAscendMicroschoolParentCached() {
  if (!ascendMicroschoolParentPromise) {
    ascendMicroschoolParentPromise = importAscendMicroschoolParent().catch((error) => {
      ascendMicroschoolParentPromise = null
      console.error('Failed to load demo "ascend-micro-school-parent":', error)
      throw error
    })
  }
  return ascendMicroschoolParentPromise
}

function loadAscendMicroschoolTeacherCached() {
  if (!ascendMicroschoolTeacherPromise) {
    ascendMicroschoolTeacherPromise = importAscendMicroschoolTeacher().catch((error) => {
      ascendMicroschoolTeacherPromise = null
      console.error('Failed to load demo "ascend-micro-school-teacher":', error)
      throw error
    })
  }
  return ascendMicroschoolTeacherPromise
}

const AscendMicroschoolAdminDashboardDemo = dynamic(() => loadAscendMicroschoolAdminCached(), {
  ssr: false,
})
const AscendMicroschoolWebsiteDashboardDemo = dynamic(() => loadAscendMicroschoolWebsiteCached(), {
  ssr: false,
})
const AscendMicroschoolParentDashboardDemo = dynamic(() => loadAscendMicroschoolParentCached(), {
  ssr: false,
})
const AscendMicroschoolTeacherDashboardDemo = dynamic(() => loadAscendMicroschoolTeacherCached(), {
  ssr: false,
})

export function LazyAscendMicroschoolAdminDashboardDemo(
  props: ComponentProps<typeof AscendMicroschoolAdminDashboardDemo>,
) {
  return <AscendMicroschoolAdminDashboardDemo {...props} />
}

export function LazyAscendMicroschoolWebsiteDashboardDemo(
  props: ComponentProps<typeof AscendMicroschoolWebsiteDashboardDemo>,
) {
  return <AscendMicroschoolWebsiteDashboardDemo {...props} />
}

export function LazyAscendMicroschoolParentDashboardDemo(
  props: ComponentProps<typeof AscendMicroschoolParentDashboardDemo>,
) {
  return <AscendMicroschoolParentDashboardDemo {...props} />
}

export function LazyAscendMicroschoolTeacherDashboardDemo(
  props: ComponentProps<typeof AscendMicroschoolTeacherDashboardDemo>,
) {
  return <AscendMicroschoolTeacherDashboardDemo {...props} />
}

export function prefetchAscendMicroschoolAdminDemo() {
  void loadAscendMicroschoolAdminCached()
}

export function prefetchAscendMicroschoolWebsiteDemo() {
  void loadAscendMicroschoolWebsiteCached()
}

export function prefetchAscendMicroschoolParentDemo() {
  void loadAscendMicroschoolParentCached()
}

export function prefetchAscendMicroschoolTeacherDemo() {
  void loadAscendMicroschoolTeacherCached()
}
