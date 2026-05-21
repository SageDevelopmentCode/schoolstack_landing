'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importAdmin = () => import('./AdminDashboardDemo')
const importTeacher = () => import('./TeacherDashboardDemo')
const importParent = () => import('./ParentDashboardDemo')
const importWebsite = () => import('./WebsiteDashboardDemo')

type AdminModule = Awaited<ReturnType<typeof importAdmin>>
type TeacherModule = Awaited<ReturnType<typeof importTeacher>>
type ParentModule = Awaited<ReturnType<typeof importParent>>
type WebsiteModule = Awaited<ReturnType<typeof importWebsite>>

let adminPromise: Promise<AdminModule> | null = null
let teacherPromise: Promise<TeacherModule> | null = null
let parentPromise: Promise<ParentModule> | null = null
let websitePromise: Promise<WebsiteModule> | null = null

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
