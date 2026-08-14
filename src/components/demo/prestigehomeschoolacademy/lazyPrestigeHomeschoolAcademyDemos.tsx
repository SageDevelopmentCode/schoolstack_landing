'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importPrestigeHomeschoolAcademyAdmin = () =>
  import('@/components/demo/prestigehomeschoolacademy/PrestigeHomeschoolAcademyAdminDashboardDemo') as Promise<DemoModule>
const importPrestigeHomeschoolAcademyWebsite = () =>
  import('@/components/demo/prestigehomeschoolacademy/PrestigeHomeschoolAcademyWebsiteDashboardDemo') as Promise<DemoModule>
const importPrestigeHomeschoolAcademyParent = () =>
  import('@/components/demo/prestigehomeschoolacademy/PrestigeHomeschoolAcademyParentDashboardDemo') as Promise<DemoModule>
const importPrestigeHomeschoolAcademyTeacher = () =>
  import('@/components/demo/prestigehomeschoolacademy/PrestigeHomeschoolAcademyTeacherDashboardDemo') as Promise<DemoModule>

type PrestigeHomeschoolAcademyAdminModule = Awaited<
  ReturnType<typeof importPrestigeHomeschoolAcademyAdmin>
>
type PrestigeHomeschoolAcademyWebsiteModule = Awaited<
  ReturnType<typeof importPrestigeHomeschoolAcademyWebsite>
>
type PrestigeHomeschoolAcademyParentModule = Awaited<
  ReturnType<typeof importPrestigeHomeschoolAcademyParent>
>
type PrestigeHomeschoolAcademyTeacherModule = Awaited<
  ReturnType<typeof importPrestigeHomeschoolAcademyTeacher>
>

let prestigeHomeschoolAcademyAdminPromise: Promise<DemoModule> | null =
  null
let prestigeHomeschoolAcademyWebsitePromise: Promise<DemoModule> | null =
  null
let prestigeHomeschoolAcademyParentPromise: Promise<DemoModule> | null =
  null
let prestigeHomeschoolAcademyTeacherPromise: Promise<DemoModule> | null =
  null

function loadPrestigeHomeschoolAcademyAdminCached() {
  if (!prestigeHomeschoolAcademyAdminPromise) {
    prestigeHomeschoolAcademyAdminPromise = importPrestigeHomeschoolAcademyAdmin().catch(
      (error) => {
        prestigeHomeschoolAcademyAdminPromise = null
        console.error('Failed to load demo "prestige-homeschool-academy-admin":', error)
        throw error
      },
    )
  }
  return prestigeHomeschoolAcademyAdminPromise
}

function loadPrestigeHomeschoolAcademyWebsiteCached() {
  if (!prestigeHomeschoolAcademyWebsitePromise) {
    prestigeHomeschoolAcademyWebsitePromise = importPrestigeHomeschoolAcademyWebsite().catch(
      (error) => {
        prestigeHomeschoolAcademyWebsitePromise = null
        console.error('Failed to load demo "prestige-homeschool-academy-website":', error)
        throw error
      },
    )
  }
  return prestigeHomeschoolAcademyWebsitePromise
}

function loadPrestigeHomeschoolAcademyParentCached() {
  if (!prestigeHomeschoolAcademyParentPromise) {
    prestigeHomeschoolAcademyParentPromise = importPrestigeHomeschoolAcademyParent().catch(
      (error) => {
        prestigeHomeschoolAcademyParentPromise = null
        console.error('Failed to load demo "prestige-homeschool-academy-parent":', error)
        throw error
      },
    )
  }
  return prestigeHomeschoolAcademyParentPromise
}

function loadPrestigeHomeschoolAcademyTeacherCached() {
  if (!prestigeHomeschoolAcademyTeacherPromise) {
    prestigeHomeschoolAcademyTeacherPromise = importPrestigeHomeschoolAcademyTeacher().catch(
      (error) => {
        prestigeHomeschoolAcademyTeacherPromise = null
        console.error('Failed to load demo "prestige-homeschool-academy-teacher":', error)
        throw error
      },
    )
  }
  return prestigeHomeschoolAcademyTeacherPromise
}

const PrestigeHomeschoolAcademyAdminDashboardDemo = dynamic(
  () => loadPrestigeHomeschoolAcademyAdminCached(),
  { ssr: false },
)
const PrestigeHomeschoolAcademyWebsiteDashboardDemo = dynamic(
  () => loadPrestigeHomeschoolAcademyWebsiteCached(),
  { ssr: false },
)
const PrestigeHomeschoolAcademyParentDashboardDemo = dynamic(
  () => loadPrestigeHomeschoolAcademyParentCached(),
  { ssr: false },
)
const PrestigeHomeschoolAcademyTeacherDashboardDemo = dynamic(
  () => loadPrestigeHomeschoolAcademyTeacherCached(),
  { ssr: false },
)

export function LazyPrestigeHomeschoolAcademyAdminDashboardDemo(
  props: ComponentProps<typeof PrestigeHomeschoolAcademyAdminDashboardDemo>,
) {
  return <PrestigeHomeschoolAcademyAdminDashboardDemo {...props} />
}

export function LazyPrestigeHomeschoolAcademyWebsiteDashboardDemo(
  props: ComponentProps<typeof PrestigeHomeschoolAcademyWebsiteDashboardDemo>,
) {
  return <PrestigeHomeschoolAcademyWebsiteDashboardDemo {...props} />
}

export function LazyPrestigeHomeschoolAcademyParentDashboardDemo(
  props: ComponentProps<typeof PrestigeHomeschoolAcademyParentDashboardDemo>,
) {
  return <PrestigeHomeschoolAcademyParentDashboardDemo {...props} />
}

export function LazyPrestigeHomeschoolAcademyTeacherDashboardDemo(
  props: ComponentProps<typeof PrestigeHomeschoolAcademyTeacherDashboardDemo>,
) {
  return <PrestigeHomeschoolAcademyTeacherDashboardDemo {...props} />
}

export function prefetchPrestigeHomeschoolAcademyAdminDemo() {
  void loadPrestigeHomeschoolAcademyAdminCached()
}

export function prefetchPrestigeHomeschoolAcademyWebsiteDemo() {
  void loadPrestigeHomeschoolAcademyWebsiteCached()
}

export function prefetchPrestigeHomeschoolAcademyParentDemo() {
  void loadPrestigeHomeschoolAcademyParentCached()
}

export function prefetchPrestigeHomeschoolAcademyTeacherDemo() {
  void loadPrestigeHomeschoolAcademyTeacherCached()
}
