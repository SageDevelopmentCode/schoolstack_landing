'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importWonderHereAdmin = () =>
  import('@/components/demo/wonderhere/WonderHereAdminDashboardDemo') as Promise<DemoModule>
const importWonderHereWebsite = () =>
  import('@/components/demo/wonderhere/WonderHereWebsiteDashboardDemo') as Promise<DemoModule>
const importWonderHereParent = () =>
  import('@/components/demo/wonderhere/WonderHereParentDashboardDemo') as Promise<DemoModule>
const importWonderHereTeacher = () =>
  import('@/components/demo/wonderhere/WonderHereTeacherDashboardDemo') as Promise<DemoModule>


let wonderhereAdminPromise: Promise<DemoModule> | null = null
let wonderhereWebsitePromise: Promise<DemoModule> | null = null
let wonderhereParentPromise: Promise<DemoModule> | null = null
let wonderhereTeacherPromise: Promise<DemoModule> | null = null

function loadWonderHereAdminCached() {
  if (!wonderhereAdminPromise) {
    wonderhereAdminPromise = importWonderHereAdmin().catch((error) => {
      wonderhereAdminPromise = null
      console.error('Failed to load demo "wonderhere-admin":', error)
      throw error
    })
  }
  return wonderhereAdminPromise
}

function loadWonderHereWebsiteCached() {
  if (!wonderhereWebsitePromise) {
    wonderhereWebsitePromise = importWonderHereWebsite().catch((error) => {
      wonderhereWebsitePromise = null
      console.error('Failed to load demo "wonderhere-website":', error)
      throw error
    })
  }
  return wonderhereWebsitePromise
}

function loadWonderHereParentCached() {
  if (!wonderhereParentPromise) {
    wonderhereParentPromise = importWonderHereParent().catch((error) => {
      wonderhereParentPromise = null
      console.error('Failed to load demo "wonderhere-parent":', error)
      throw error
    })
  }
  return wonderhereParentPromise
}

function loadWonderHereTeacherCached() {
  if (!wonderhereTeacherPromise) {
    wonderhereTeacherPromise = importWonderHereTeacher().catch((error) => {
      wonderhereTeacherPromise = null
      console.error('Failed to load demo "wonderhere-teacher":', error)
      throw error
    })
  }
  return wonderhereTeacherPromise
}

const WonderHereAdminDashboardDemo = dynamic(() => loadWonderHereAdminCached(), {
  ssr: false,
})
const WonderHereWebsiteDashboardDemo = dynamic(() => loadWonderHereWebsiteCached(), {
  ssr: false,
})
const WonderHereParentDashboardDemo = dynamic(() => loadWonderHereParentCached(), {
  ssr: false,
})
const WonderHereTeacherDashboardDemo = dynamic(() => loadWonderHereTeacherCached(), {
  ssr: false,
})

export function LazyWonderHereAdminDashboardDemo(
  props: ComponentProps<typeof WonderHereAdminDashboardDemo>,
) {
  return <WonderHereAdminDashboardDemo {...props} />
}

export function LazyWonderHereWebsiteDashboardDemo(
  props: ComponentProps<typeof WonderHereWebsiteDashboardDemo>,
) {
  return <WonderHereWebsiteDashboardDemo {...props} />
}

export function LazyWonderHereParentDashboardDemo(
  props: ComponentProps<typeof WonderHereParentDashboardDemo>,
) {
  return <WonderHereParentDashboardDemo {...props} />
}

export function LazyWonderHereTeacherDashboardDemo(
  props: ComponentProps<typeof WonderHereTeacherDashboardDemo>,
) {
  return <WonderHereTeacherDashboardDemo {...props} />
}

export function prefetchWonderHereAdminDemo() {
  void loadWonderHereAdminCached()
}

export function prefetchWonderHereWebsiteDemo() {
  void loadWonderHereWebsiteCached()
}

export function prefetchWonderHereParentDemo() {
  void loadWonderHereParentCached()
}

export function prefetchWonderHereTeacherDemo() {
  void loadWonderHereTeacherCached()
}
