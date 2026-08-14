'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importMonarchHillsAdmin = () =>
  import('@/components/demo/monarchhills/MonarchHillsAdminDashboardDemo') as Promise<DemoModule>
const importMonarchHillsWebsite = () =>
  import('@/components/demo/monarchhills/MonarchHillsWebsiteDashboardDemo') as Promise<DemoModule>
const importMonarchHillsParent = () =>
  import('@/components/demo/monarchhills/MonarchHillsParentDashboardDemo') as Promise<DemoModule>
const importMonarchHillsTeacher = () =>
  import('@/components/demo/monarchhills/MonarchHillsTeacherDashboardDemo') as Promise<DemoModule>


let monarchHillsAdminPromise: Promise<DemoModule> | null = null
let monarchHillsWebsitePromise: Promise<DemoModule> | null = null
let monarchHillsParentPromise: Promise<DemoModule> | null = null
let monarchHillsTeacherPromise: Promise<DemoModule> | null = null

function loadMonarchHillsAdminCached() {
  if (!monarchHillsAdminPromise) {
    monarchHillsAdminPromise = importMonarchHillsAdmin().catch((error) => {
      monarchHillsAdminPromise = null
      console.error('Failed to load demo "monarch-hills-admin":', error)
      throw error
    })
  }
  return monarchHillsAdminPromise
}

function loadMonarchHillsWebsiteCached() {
  if (!monarchHillsWebsitePromise) {
    monarchHillsWebsitePromise = importMonarchHillsWebsite().catch((error) => {
      monarchHillsWebsitePromise = null
      console.error('Failed to load demo "monarch-hills-website":', error)
      throw error
    })
  }
  return monarchHillsWebsitePromise
}

function loadMonarchHillsParentCached() {
  if (!monarchHillsParentPromise) {
    monarchHillsParentPromise = importMonarchHillsParent().catch((error) => {
      monarchHillsParentPromise = null
      console.error('Failed to load demo "monarch-hills-parent":', error)
      throw error
    })
  }
  return monarchHillsParentPromise
}

function loadMonarchHillsTeacherCached() {
  if (!monarchHillsTeacherPromise) {
    monarchHillsTeacherPromise = importMonarchHillsTeacher().catch((error) => {
      monarchHillsTeacherPromise = null
      console.error('Failed to load demo "monarch-hills-teacher":', error)
      throw error
    })
  }
  return monarchHillsTeacherPromise
}

const MonarchHillsAdminDashboardDemo = dynamic(() => loadMonarchHillsAdminCached(), {
  ssr: false,
})
const MonarchHillsWebsiteDashboardDemo = dynamic(() => loadMonarchHillsWebsiteCached(), {
  ssr: false,
})
const MonarchHillsParentDashboardDemo = dynamic(() => loadMonarchHillsParentCached(), {
  ssr: false,
})
const MonarchHillsTeacherDashboardDemo = dynamic(() => loadMonarchHillsTeacherCached(), {
  ssr: false,
})

export function LazyMonarchHillsAdminDashboardDemo(
  props: ComponentProps<typeof MonarchHillsAdminDashboardDemo>,
) {
  return <MonarchHillsAdminDashboardDemo {...props} />
}

export function LazyMonarchHillsWebsiteDashboardDemo(
  props: ComponentProps<typeof MonarchHillsWebsiteDashboardDemo>,
) {
  return <MonarchHillsWebsiteDashboardDemo {...props} />
}

export function LazyMonarchHillsParentDashboardDemo(
  props: ComponentProps<typeof MonarchHillsParentDashboardDemo>,
) {
  return <MonarchHillsParentDashboardDemo {...props} />
}

export function LazyMonarchHillsTeacherDashboardDemo(
  props: ComponentProps<typeof MonarchHillsTeacherDashboardDemo>,
) {
  return <MonarchHillsTeacherDashboardDemo {...props} />
}

export function prefetchMonarchHillsAdminDemo() {
  void loadMonarchHillsAdminCached()
}

export function prefetchMonarchHillsWebsiteDemo() {
  void loadMonarchHillsWebsiteCached()
}

export function prefetchMonarchHillsParentDemo() {
  void loadMonarchHillsParentCached()
}

export function prefetchMonarchHillsTeacherDemo() {
  void loadMonarchHillsTeacherCached()
}
