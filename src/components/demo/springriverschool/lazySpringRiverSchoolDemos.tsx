'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importSpringRiverSchoolAdmin = () =>
  import('@/components/demo/springriverschool/SpringRiverSchoolAdminDashboardDemo') as Promise<DemoModule>
const importSpringRiverSchoolWebsite = () =>
  import('@/components/demo/springriverschool/SpringRiverSchoolWebsiteDashboardDemo') as Promise<DemoModule>
const importSpringRiverSchoolParent = () =>
  import('@/components/demo/springriverschool/SpringRiverSchoolParentDashboardDemo') as Promise<DemoModule>
const importSpringRiverSchoolTeacher = () =>
  import('@/components/demo/springriverschool/SpringRiverSchoolTeacherDashboardDemo') as Promise<DemoModule>

type SpringRiverSchoolAdminModule = Awaited<
  ReturnType<typeof importSpringRiverSchoolAdmin>
>
type SpringRiverSchoolWebsiteModule = Awaited<
  ReturnType<typeof importSpringRiverSchoolWebsite>
>
type SpringRiverSchoolParentModule = Awaited<
  ReturnType<typeof importSpringRiverSchoolParent>
>
type SpringRiverSchoolTeacherModule = Awaited<
  ReturnType<typeof importSpringRiverSchoolTeacher>
>

let springRiverSchoolAdminPromise: Promise<DemoModule> | null =
  null
let springRiverSchoolWebsitePromise: Promise<DemoModule> | null =
  null
let springRiverSchoolParentPromise: Promise<DemoModule> | null =
  null
let springRiverSchoolTeacherPromise: Promise<DemoModule> | null =
  null

function loadSpringRiverSchoolAdminCached() {
  if (!springRiverSchoolAdminPromise) {
    springRiverSchoolAdminPromise = importSpringRiverSchoolAdmin().catch(
      (error) => {
        springRiverSchoolAdminPromise = null
        console.error('Failed to load demo "spring-river-school-admin":', error)
        throw error
      },
    )
  }
  return springRiverSchoolAdminPromise
}

function loadSpringRiverSchoolWebsiteCached() {
  if (!springRiverSchoolWebsitePromise) {
    springRiverSchoolWebsitePromise = importSpringRiverSchoolWebsite().catch(
      (error) => {
        springRiverSchoolWebsitePromise = null
        console.error('Failed to load demo "spring-river-school-website":', error)
        throw error
      },
    )
  }
  return springRiverSchoolWebsitePromise
}

function loadSpringRiverSchoolParentCached() {
  if (!springRiverSchoolParentPromise) {
    springRiverSchoolParentPromise = importSpringRiverSchoolParent().catch(
      (error) => {
        springRiverSchoolParentPromise = null
        console.error('Failed to load demo "spring-river-school-parent":', error)
        throw error
      },
    )
  }
  return springRiverSchoolParentPromise
}

function loadSpringRiverSchoolTeacherCached() {
  if (!springRiverSchoolTeacherPromise) {
    springRiverSchoolTeacherPromise = importSpringRiverSchoolTeacher().catch(
      (error) => {
        springRiverSchoolTeacherPromise = null
        console.error('Failed to load demo "spring-river-school-teacher":', error)
        throw error
      },
    )
  }
  return springRiverSchoolTeacherPromise
}

const SpringRiverSchoolAdminDashboardDemo = dynamic(
  () => loadSpringRiverSchoolAdminCached(),
  { ssr: false },
)
const SpringRiverSchoolWebsiteDashboardDemo = dynamic(
  () => loadSpringRiverSchoolWebsiteCached(),
  { ssr: false },
)
const SpringRiverSchoolParentDashboardDemo = dynamic(
  () => loadSpringRiverSchoolParentCached(),
  { ssr: false },
)
const SpringRiverSchoolTeacherDashboardDemo = dynamic(
  () => loadSpringRiverSchoolTeacherCached(),
  { ssr: false },
)

export function LazySpringRiverSchoolAdminDashboardDemo(
  props: ComponentProps<typeof SpringRiverSchoolAdminDashboardDemo>,
) {
  return <SpringRiverSchoolAdminDashboardDemo {...props} />
}

export function LazySpringRiverSchoolWebsiteDashboardDemo(
  props: ComponentProps<typeof SpringRiverSchoolWebsiteDashboardDemo>,
) {
  return <SpringRiverSchoolWebsiteDashboardDemo {...props} />
}

export function LazySpringRiverSchoolParentDashboardDemo(
  props: ComponentProps<typeof SpringRiverSchoolParentDashboardDemo>,
) {
  return <SpringRiverSchoolParentDashboardDemo {...props} />
}

export function LazySpringRiverSchoolTeacherDashboardDemo(
  props: ComponentProps<typeof SpringRiverSchoolTeacherDashboardDemo>,
) {
  return <SpringRiverSchoolTeacherDashboardDemo {...props} />
}

export function prefetchSpringRiverSchoolAdminDemo() {
  void loadSpringRiverSchoolAdminCached()
}

export function prefetchSpringRiverSchoolWebsiteDemo() {
  void loadSpringRiverSchoolWebsiteCached()
}

export function prefetchSpringRiverSchoolParentDemo() {
  void loadSpringRiverSchoolParentCached()
}

export function prefetchSpringRiverSchoolTeacherDemo() {
  void loadSpringRiverSchoolTeacherCached()
}
