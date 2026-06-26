'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importTheWoodlandsMicroschoolAdmin = () =>
  import('@/components/demo/thewoodlandsmicroschool/TheWoodlandsMicroschoolAdminDashboardDemo')
const importTheWoodlandsMicroschoolWebsite = () =>
  import('@/components/demo/thewoodlandsmicroschool/TheWoodlandsMicroschoolWebsiteDashboardDemo')
const importTheWoodlandsMicroschoolParent = () =>
  import('@/components/demo/thewoodlandsmicroschool/TheWoodlandsMicroschoolParentDashboardDemo')
const importTheWoodlandsMicroschoolTeacher = () =>
  import('@/components/demo/thewoodlandsmicroschool/TheWoodlandsMicroschoolTeacherDashboardDemo')

type TheWoodlandsMicroschoolAdminModule = Awaited<ReturnType<typeof importTheWoodlandsMicroschoolAdmin>>
type TheWoodlandsMicroschoolWebsiteModule = Awaited<ReturnType<typeof importTheWoodlandsMicroschoolWebsite>>
type TheWoodlandsMicroschoolParentModule = Awaited<ReturnType<typeof importTheWoodlandsMicroschoolParent>>
type TheWoodlandsMicroschoolTeacherModule = Awaited<ReturnType<typeof importTheWoodlandsMicroschoolTeacher>>

let theWoodlandsMicroschoolAdminPromise: Promise<TheWoodlandsMicroschoolAdminModule> | null = null
let theWoodlandsMicroschoolWebsitePromise: Promise<TheWoodlandsMicroschoolWebsiteModule> | null = null
let theWoodlandsMicroschoolParentPromise: Promise<TheWoodlandsMicroschoolParentModule> | null = null
let theWoodlandsMicroschoolTeacherPromise: Promise<TheWoodlandsMicroschoolTeacherModule> | null = null

function loadTheWoodlandsMicroschoolAdminCached() {
  if (!theWoodlandsMicroschoolAdminPromise) {
    theWoodlandsMicroschoolAdminPromise = importTheWoodlandsMicroschoolAdmin().catch((error) => {
      theWoodlandsMicroschoolAdminPromise = null
      console.error('Failed to load demo "the-woodlands-microschool-admin":', error)
      throw error
    })
  }
  return theWoodlandsMicroschoolAdminPromise
}

function loadTheWoodlandsMicroschoolWebsiteCached() {
  if (!theWoodlandsMicroschoolWebsitePromise) {
    theWoodlandsMicroschoolWebsitePromise = importTheWoodlandsMicroschoolWebsite().catch((error) => {
      theWoodlandsMicroschoolWebsitePromise = null
      console.error('Failed to load demo "the-woodlands-microschool-website":', error)
      throw error
    })
  }
  return theWoodlandsMicroschoolWebsitePromise
}

function loadTheWoodlandsMicroschoolParentCached() {
  if (!theWoodlandsMicroschoolParentPromise) {
    theWoodlandsMicroschoolParentPromise = importTheWoodlandsMicroschoolParent().catch((error) => {
      theWoodlandsMicroschoolParentPromise = null
      console.error('Failed to load demo "the-woodlands-microschool-parent":', error)
      throw error
    })
  }
  return theWoodlandsMicroschoolParentPromise
}

function loadTheWoodlandsMicroschoolTeacherCached() {
  if (!theWoodlandsMicroschoolTeacherPromise) {
    theWoodlandsMicroschoolTeacherPromise = importTheWoodlandsMicroschoolTeacher().catch((error) => {
      theWoodlandsMicroschoolTeacherPromise = null
      console.error('Failed to load demo "the-woodlands-microschool-teacher":', error)
      throw error
    })
  }
  return theWoodlandsMicroschoolTeacherPromise
}

const TheWoodlandsMicroschoolAdminDashboardDemo = dynamic(() => loadTheWoodlandsMicroschoolAdminCached(), {
  ssr: false,
})
const TheWoodlandsMicroschoolWebsiteDashboardDemo = dynamic(() => loadTheWoodlandsMicroschoolWebsiteCached(), {
  ssr: false,
})
const TheWoodlandsMicroschoolParentDashboardDemo = dynamic(() => loadTheWoodlandsMicroschoolParentCached(), {
  ssr: false,
})
const TheWoodlandsMicroschoolTeacherDashboardDemo = dynamic(() => loadTheWoodlandsMicroschoolTeacherCached(), {
  ssr: false,
})

export function LazyTheWoodlandsMicroschoolAdminDashboardDemo(
  props: ComponentProps<typeof TheWoodlandsMicroschoolAdminDashboardDemo>,
) {
  return <TheWoodlandsMicroschoolAdminDashboardDemo {...props} />
}

export function LazyTheWoodlandsMicroschoolWebsiteDashboardDemo(
  props: ComponentProps<typeof TheWoodlandsMicroschoolWebsiteDashboardDemo>,
) {
  return <TheWoodlandsMicroschoolWebsiteDashboardDemo {...props} />
}

export function LazyTheWoodlandsMicroschoolParentDashboardDemo(
  props: ComponentProps<typeof TheWoodlandsMicroschoolParentDashboardDemo>,
) {
  return <TheWoodlandsMicroschoolParentDashboardDemo {...props} />
}

export function LazyTheWoodlandsMicroschoolTeacherDashboardDemo(
  props: ComponentProps<typeof TheWoodlandsMicroschoolTeacherDashboardDemo>,
) {
  return <TheWoodlandsMicroschoolTeacherDashboardDemo {...props} />
}

export function prefetchTheWoodlandsMicroschoolAdminDemo() {
  void loadTheWoodlandsMicroschoolAdminCached()
}

export function prefetchTheWoodlandsMicroschoolWebsiteDemo() {
  void loadTheWoodlandsMicroschoolWebsiteCached()
}

export function prefetchTheWoodlandsMicroschoolParentDemo() {
  void loadTheWoodlandsMicroschoolParentCached()
}

export function prefetchTheWoodlandsMicroschoolTeacherDemo() {
  void loadTheWoodlandsMicroschoolTeacherCached()
}
