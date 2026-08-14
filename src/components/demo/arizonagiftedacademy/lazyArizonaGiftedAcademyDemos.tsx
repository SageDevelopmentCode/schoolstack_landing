'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importArizonaGiftedAcademyAdmin = () =>
  import('@/components/demo/arizonagiftedacademy/ArizonaGiftedAcademyAdminDashboardDemo') as Promise<DemoModule>
const importArizonaGiftedAcademyWebsite = () =>
  import('@/components/demo/arizonagiftedacademy/ArizonaGiftedAcademyWebsiteDashboardDemo') as Promise<DemoModule>
const importArizonaGiftedAcademyParent = () =>
  import('@/components/demo/arizonagiftedacademy/ArizonaGiftedAcademyParentDashboardDemo') as Promise<DemoModule>
const importArizonaGiftedAcademyTeacher = () =>
  import('@/components/demo/arizonagiftedacademy/ArizonaGiftedAcademyTeacherDashboardDemo') as Promise<DemoModule>

type ArizonaGiftedAcademyAdminModule = Awaited<
  ReturnType<typeof importArizonaGiftedAcademyAdmin>
>
type ArizonaGiftedAcademyWebsiteModule = Awaited<
  ReturnType<typeof importArizonaGiftedAcademyWebsite>
>
type ArizonaGiftedAcademyParentModule = Awaited<
  ReturnType<typeof importArizonaGiftedAcademyParent>
>
type ArizonaGiftedAcademyTeacherModule = Awaited<
  ReturnType<typeof importArizonaGiftedAcademyTeacher>
>

let arizonaGiftedAcademyAdminPromise: Promise<DemoModule> | null =
  null
let arizonaGiftedAcademyWebsitePromise: Promise<DemoModule> | null =
  null
let arizonaGiftedAcademyParentPromise: Promise<DemoModule> | null =
  null
let arizonaGiftedAcademyTeacherPromise: Promise<DemoModule> | null =
  null

function loadArizonaGiftedAcademyAdminCached() {
  if (!arizonaGiftedAcademyAdminPromise) {
    arizonaGiftedAcademyAdminPromise = importArizonaGiftedAcademyAdmin().catch(
      (error) => {
        arizonaGiftedAcademyAdminPromise = null
        console.error('Failed to load demo "arizona-gifted-academy-admin":', error)
        throw error
      },
    )
  }
  return arizonaGiftedAcademyAdminPromise
}

function loadArizonaGiftedAcademyWebsiteCached() {
  if (!arizonaGiftedAcademyWebsitePromise) {
    arizonaGiftedAcademyWebsitePromise = importArizonaGiftedAcademyWebsite().catch(
      (error) => {
        arizonaGiftedAcademyWebsitePromise = null
        console.error('Failed to load demo "arizona-gifted-academy-website":', error)
        throw error
      },
    )
  }
  return arizonaGiftedAcademyWebsitePromise
}

function loadArizonaGiftedAcademyParentCached() {
  if (!arizonaGiftedAcademyParentPromise) {
    arizonaGiftedAcademyParentPromise = importArizonaGiftedAcademyParent().catch(
      (error) => {
        arizonaGiftedAcademyParentPromise = null
        console.error('Failed to load demo "arizona-gifted-academy-parent":', error)
        throw error
      },
    )
  }
  return arizonaGiftedAcademyParentPromise
}

function loadArizonaGiftedAcademyTeacherCached() {
  if (!arizonaGiftedAcademyTeacherPromise) {
    arizonaGiftedAcademyTeacherPromise = importArizonaGiftedAcademyTeacher().catch(
      (error) => {
        arizonaGiftedAcademyTeacherPromise = null
        console.error('Failed to load demo "arizona-gifted-academy-teacher":', error)
        throw error
      },
    )
  }
  return arizonaGiftedAcademyTeacherPromise
}

const ArizonaGiftedAcademyAdminDashboardDemo = dynamic(
  () => loadArizonaGiftedAcademyAdminCached(),
  { ssr: false },
)
const ArizonaGiftedAcademyWebsiteDashboardDemo = dynamic(
  () => loadArizonaGiftedAcademyWebsiteCached(),
  { ssr: false },
)
const ArizonaGiftedAcademyParentDashboardDemo = dynamic(
  () => loadArizonaGiftedAcademyParentCached(),
  { ssr: false },
)
const ArizonaGiftedAcademyTeacherDashboardDemo = dynamic(
  () => loadArizonaGiftedAcademyTeacherCached(),
  { ssr: false },
)

export function LazyArizonaGiftedAcademyAdminDashboardDemo(
  props: ComponentProps<typeof ArizonaGiftedAcademyAdminDashboardDemo>,
) {
  return <ArizonaGiftedAcademyAdminDashboardDemo {...props} />
}

export function LazyArizonaGiftedAcademyWebsiteDashboardDemo(
  props: ComponentProps<typeof ArizonaGiftedAcademyWebsiteDashboardDemo>,
) {
  return <ArizonaGiftedAcademyWebsiteDashboardDemo {...props} />
}

export function LazyArizonaGiftedAcademyParentDashboardDemo(
  props: ComponentProps<typeof ArizonaGiftedAcademyParentDashboardDemo>,
) {
  return <ArizonaGiftedAcademyParentDashboardDemo {...props} />
}

export function LazyArizonaGiftedAcademyTeacherDashboardDemo(
  props: ComponentProps<typeof ArizonaGiftedAcademyTeacherDashboardDemo>,
) {
  return <ArizonaGiftedAcademyTeacherDashboardDemo {...props} />
}

export function prefetchArizonaGiftedAcademyAdminDemo() {
  void loadArizonaGiftedAcademyAdminCached()
}

export function prefetchArizonaGiftedAcademyWebsiteDemo() {
  void loadArizonaGiftedAcademyWebsiteCached()
}

export function prefetchArizonaGiftedAcademyParentDemo() {
  void loadArizonaGiftedAcademyParentCached()
}

export function prefetchArizonaGiftedAcademyTeacherDemo() {
  void loadArizonaGiftedAcademyTeacherCached()
}
