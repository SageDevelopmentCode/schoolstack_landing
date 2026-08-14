'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importAdmin = () => import('./AdminDashboardDemo') as Promise<DemoModule>
const importTeacher = () => import('./TeacherDashboardDemo') as Promise<DemoModule>
const importParent = () => import('./ParentDashboardDemo') as Promise<DemoModule>
const importWebsite = () => import('./WebsiteDashboardDemo') as Promise<DemoModule>


let adminPromise: Promise<DemoModule> | null = null
let teacherPromise: Promise<DemoModule> | null = null
let parentPromise: Promise<DemoModule> | null = null
let websitePromise: Promise<DemoModule> | null = null

function loadAdminCached() {
  if (!adminPromise) {
    adminPromise = importAdmin().catch((error) => {
      adminPromise = null
      console.error('Failed to load demo "admin":', error)
      throw error
    })
  }
  return adminPromise
}

function loadTeacherCached() {
  if (!teacherPromise) {
    teacherPromise = importTeacher().catch((error) => {
      teacherPromise = null
      console.error('Failed to load demo "teacher":', error)
      throw error
    })
  }
  return teacherPromise
}

function loadParentCached() {
  if (!parentPromise) {
    parentPromise = importParent().catch((error) => {
      parentPromise = null
      console.error('Failed to load demo "parent":', error)
      throw error
    })
  }
  return parentPromise
}

function loadWebsiteCached() {
  if (!websitePromise) {
    websitePromise = importWebsite().catch((error) => {
      websitePromise = null
      console.error('Failed to load demo "website":', error)
      throw error
    })
  }
  return websitePromise
}

const AdminDashboardDemo = dynamic(() => loadAdminCached(), { ssr: false })
const TeacherDashboardDemo = dynamic(() => loadTeacherCached(), { ssr: false })
const ParentDashboardDemo = dynamic(() => loadParentCached(), { ssr: false })
const WebsiteDashboardDemo = dynamic(() => loadWebsiteCached(), { ssr: false })

export function LazyAdminDashboardDemo(props: ComponentProps<typeof AdminDashboardDemo>) {
  return <AdminDashboardDemo {...props} />
}

export function LazyTeacherDashboardDemo(props: ComponentProps<typeof TeacherDashboardDemo>) {
  return <TeacherDashboardDemo {...props} />
}

export function LazyParentDashboardDemo(props: ComponentProps<typeof ParentDashboardDemo>) {
  return <ParentDashboardDemo {...props} />
}

export function LazyWebsiteDashboardDemo(props: ComponentProps<typeof WebsiteDashboardDemo>) {
  return <WebsiteDashboardDemo {...props} />
}

export function prefetchAdminDemo() {
  void loadAdminCached()
}

export function prefetchTeacherDemo() {
  void loadTeacherCached()
}

export function prefetchParentDemo() {
  void loadParentCached()
}

export function prefetchWebsiteDemo() {
  void loadWebsiteCached()
}
