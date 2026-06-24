'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importWonderingOaksAdmin = () =>
  import('@/components/demo/wonderingoakslearning/WonderingOaksLearningAdminDashboardDemo')
const importWonderingOaksWebsite = () =>
  import('@/components/demo/wonderingoakslearning/WonderingOaksLearningWebsiteDashboardDemo')
const importWonderingOaksParent = () =>
  import('@/components/demo/wonderingoakslearning/WonderingOaksLearningParentDashboardDemo')
const importWonderingOaksTeacher = () =>
  import('@/components/demo/wonderingoakslearning/WonderingOaksLearningTeacherDashboardDemo')

type WonderingOaksAdminModule = Awaited<ReturnType<typeof importWonderingOaksAdmin>>
type WonderingOaksWebsiteModule = Awaited<ReturnType<typeof importWonderingOaksWebsite>>
type WonderingOaksParentModule = Awaited<ReturnType<typeof importWonderingOaksParent>>
type WonderingOaksTeacherModule = Awaited<ReturnType<typeof importWonderingOaksTeacher>>

let wonderingOaksAdminPromise: Promise<WonderingOaksAdminModule> | null = null
let wonderingOaksWebsitePromise: Promise<WonderingOaksWebsiteModule> | null = null
let wonderingOaksParentPromise: Promise<WonderingOaksParentModule> | null = null
let wonderingOaksTeacherPromise: Promise<WonderingOaksTeacherModule> | null = null

function loadWonderingOaksAdminCached() {
  if (!wonderingOaksAdminPromise) {
    wonderingOaksAdminPromise = importWonderingOaksAdmin().catch((error) => {
      wonderingOaksAdminPromise = null
      console.error('Failed to load demo "wondering-oaks-admin":', error)
      throw error
    })
  }
  return wonderingOaksAdminPromise
}

function loadWonderingOaksWebsiteCached() {
  if (!wonderingOaksWebsitePromise) {
    wonderingOaksWebsitePromise = importWonderingOaksWebsite().catch((error) => {
      wonderingOaksWebsitePromise = null
      console.error('Failed to load demo "wondering-oaks-website":', error)
      throw error
    })
  }
  return wonderingOaksWebsitePromise
}

function loadWonderingOaksParentCached() {
  if (!wonderingOaksParentPromise) {
    wonderingOaksParentPromise = importWonderingOaksParent().catch((error) => {
      wonderingOaksParentPromise = null
      console.error('Failed to load demo "wondering-oaks-parent":', error)
      throw error
    })
  }
  return wonderingOaksParentPromise
}

function loadWonderingOaksTeacherCached() {
  if (!wonderingOaksTeacherPromise) {
    wonderingOaksTeacherPromise = importWonderingOaksTeacher().catch((error) => {
      wonderingOaksTeacherPromise = null
      console.error('Failed to load demo "wondering-oaks-teacher":', error)
      throw error
    })
  }
  return wonderingOaksTeacherPromise
}

const WonderingOaksLearningAdminDashboardDemo = dynamic(() => loadWonderingOaksAdminCached(), {
  ssr: false,
})
const WonderingOaksLearningWebsiteDashboardDemo = dynamic(() => loadWonderingOaksWebsiteCached(), {
  ssr: false,
})
const WonderingOaksLearningParentDashboardDemo = dynamic(() => loadWonderingOaksParentCached(), {
  ssr: false,
})
const WonderingOaksLearningTeacherDashboardDemo = dynamic(() => loadWonderingOaksTeacherCached(), {
  ssr: false,
})

export function LazyWonderingOaksLearningAdminDashboardDemo(
  props: ComponentProps<typeof WonderingOaksLearningAdminDashboardDemo>,
) {
  return <WonderingOaksLearningAdminDashboardDemo {...props} />
}

export function LazyWonderingOaksLearningWebsiteDashboardDemo(
  props: ComponentProps<typeof WonderingOaksLearningWebsiteDashboardDemo>,
) {
  return <WonderingOaksLearningWebsiteDashboardDemo {...props} />
}

export function LazyWonderingOaksLearningParentDashboardDemo(
  props: ComponentProps<typeof WonderingOaksLearningParentDashboardDemo>,
) {
  return <WonderingOaksLearningParentDashboardDemo {...props} />
}

export function LazyWonderingOaksLearningTeacherDashboardDemo(
  props: ComponentProps<typeof WonderingOaksLearningTeacherDashboardDemo>,
) {
  return <WonderingOaksLearningTeacherDashboardDemo {...props} />
}

export function prefetchWonderingOaksLearningAdminDemo() {
  void loadWonderingOaksAdminCached()
}

export function prefetchWonderingOaksLearningWebsiteDemo() {
  void loadWonderingOaksWebsiteCached()
}

export function prefetchWonderingOaksLearningParentDemo() {
  void loadWonderingOaksParentCached()
}

export function prefetchWonderingOaksLearningTeacherDemo() {
  void loadWonderingOaksTeacherCached()
}
