'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importHomeworkHubAdmin = () =>
  import('@/components/demo/homeworkhub/HomeworkHubAdminDashboardDemo')
const importHomeworkHubWebsite = () =>
  import('@/components/demo/homeworkhub/HomeworkHubWebsiteDashboardDemo')
const importHomeworkHubParent = () =>
  import('@/components/demo/homeworkhub/HomeworkHubParentDashboardDemo')
const importHomeworkHubTeacher = () =>
  import('@/components/demo/homeworkhub/HomeworkHubTeacherDashboardDemo')

type HomeworkHubAdminModule = Awaited<ReturnType<typeof importHomeworkHubAdmin>>
type HomeworkHubWebsiteModule = Awaited<ReturnType<typeof importHomeworkHubWebsite>>
type HomeworkHubParentModule = Awaited<ReturnType<typeof importHomeworkHubParent>>
type HomeworkHubTeacherModule = Awaited<ReturnType<typeof importHomeworkHubTeacher>>

let homeworkHubAdminPromise: Promise<HomeworkHubAdminModule> | null = null
let homeworkHubWebsitePromise: Promise<HomeworkHubWebsiteModule> | null = null
let homeworkHubParentPromise: Promise<HomeworkHubParentModule> | null = null
let homeworkHubTeacherPromise: Promise<HomeworkHubTeacherModule> | null = null

function loadHomeworkHubAdminCached() {
  if (!homeworkHubAdminPromise) {
    homeworkHubAdminPromise = importHomeworkHubAdmin().catch((error) => {
      homeworkHubAdminPromise = null
      console.error('Failed to load demo "homework-hub-admin":', error)
      throw error
    })
  }
  return homeworkHubAdminPromise
}

function loadHomeworkHubWebsiteCached() {
  if (!homeworkHubWebsitePromise) {
    homeworkHubWebsitePromise = importHomeworkHubWebsite().catch((error) => {
      homeworkHubWebsitePromise = null
      console.error('Failed to load demo "homework-hub-website":', error)
      throw error
    })
  }
  return homeworkHubWebsitePromise
}

function loadHomeworkHubParentCached() {
  if (!homeworkHubParentPromise) {
    homeworkHubParentPromise = importHomeworkHubParent().catch((error) => {
      homeworkHubParentPromise = null
      console.error('Failed to load demo "homework-hub-parent":', error)
      throw error
    })
  }
  return homeworkHubParentPromise
}

function loadHomeworkHubTeacherCached() {
  if (!homeworkHubTeacherPromise) {
    homeworkHubTeacherPromise = importHomeworkHubTeacher().catch((error) => {
      homeworkHubTeacherPromise = null
      console.error('Failed to load demo "homework-hub-teacher":', error)
      throw error
    })
  }
  return homeworkHubTeacherPromise
}

const HomeworkHubAdminDashboardDemo = dynamic(() => loadHomeworkHubAdminCached(), {
  ssr: false,
})
const HomeworkHubWebsiteDashboardDemo = dynamic(() => loadHomeworkHubWebsiteCached(), {
  ssr: false,
})
const HomeworkHubParentDashboardDemo = dynamic(() => loadHomeworkHubParentCached(), {
  ssr: false,
})
const HomeworkHubTeacherDashboardDemo = dynamic(() => loadHomeworkHubTeacherCached(), {
  ssr: false,
})

export function LazyHomeworkHubAdminDashboardDemo(
  props: ComponentProps<typeof HomeworkHubAdminDashboardDemo>,
) {
  return <HomeworkHubAdminDashboardDemo {...props} />
}

export function LazyHomeworkHubWebsiteDashboardDemo(
  props: ComponentProps<typeof HomeworkHubWebsiteDashboardDemo>,
) {
  return <HomeworkHubWebsiteDashboardDemo {...props} />
}

export function LazyHomeworkHubParentDashboardDemo(
  props: ComponentProps<typeof HomeworkHubParentDashboardDemo>,
) {
  return <HomeworkHubParentDashboardDemo {...props} />
}

export function LazyHomeworkHubTeacherDashboardDemo(
  props: ComponentProps<typeof HomeworkHubTeacherDashboardDemo>,
) {
  return <HomeworkHubTeacherDashboardDemo {...props} />
}

export function prefetchHomeworkHubAdminDemo() {
  void loadHomeworkHubAdminCached()
}

export function prefetchHomeworkHubWebsiteDemo() {
  void loadHomeworkHubWebsiteCached()
}

export function prefetchHomeworkHubParentDemo() {
  void loadHomeworkHubParentCached()
}

export function prefetchHomeworkHubTeacherDemo() {
  void loadHomeworkHubTeacherCached()
}
