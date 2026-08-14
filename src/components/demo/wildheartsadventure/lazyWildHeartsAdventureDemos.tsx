'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importWildHeartsAdmin = () =>
  import('@/components/demo/wildheartsadventure/WildHeartsAdventureAdminDashboardDemo') as Promise<DemoModule>
const importWildHeartsWebsite = () =>
  import('@/components/demo/wildheartsadventure/WildHeartsAdventureWebsiteDashboardDemo') as Promise<DemoModule>
const importWildHeartsParent = () =>
  import('@/components/demo/wildheartsadventure/WildHeartsAdventureParentDashboardDemo') as Promise<DemoModule>
const importWildHeartsTeacher = () =>
  import('@/components/demo/wildheartsadventure/WildHeartsAdventureTeacherDashboardDemo') as Promise<DemoModule>


let wildHeartsAdminPromise: Promise<DemoModule> | null = null
let wildHeartsWebsitePromise: Promise<DemoModule> | null = null
let wildHeartsParentPromise: Promise<DemoModule> | null = null
let wildHeartsTeacherPromise: Promise<DemoModule> | null = null

function loadWildHeartsAdminCached() {
  if (!wildHeartsAdminPromise) {
    wildHeartsAdminPromise = importWildHeartsAdmin().catch((error) => {
      wildHeartsAdminPromise = null
      console.error('Failed to load demo "wild-hearts-admin":', error)
      throw error
    })
  }
  return wildHeartsAdminPromise
}

function loadWildHeartsWebsiteCached() {
  if (!wildHeartsWebsitePromise) {
    wildHeartsWebsitePromise = importWildHeartsWebsite().catch((error) => {
      wildHeartsWebsitePromise = null
      console.error('Failed to load demo "wild-hearts-website":', error)
      throw error
    })
  }
  return wildHeartsWebsitePromise
}

function loadWildHeartsParentCached() {
  if (!wildHeartsParentPromise) {
    wildHeartsParentPromise = importWildHeartsParent().catch((error) => {
      wildHeartsParentPromise = null
      console.error('Failed to load demo "wild-hearts-parent":', error)
      throw error
    })
  }
  return wildHeartsParentPromise
}

function loadWildHeartsTeacherCached() {
  if (!wildHeartsTeacherPromise) {
    wildHeartsTeacherPromise = importWildHeartsTeacher().catch((error) => {
      wildHeartsTeacherPromise = null
      console.error('Failed to load demo "wild-hearts-teacher":', error)
      throw error
    })
  }
  return wildHeartsTeacherPromise
}

const WildHeartsAdventureAdminDashboardDemo = dynamic(() => loadWildHeartsAdminCached(), {
  ssr: false,
})
const WildHeartsAdventureWebsiteDashboardDemo = dynamic(() => loadWildHeartsWebsiteCached(), {
  ssr: false,
})
const WildHeartsAdventureParentDashboardDemo = dynamic(() => loadWildHeartsParentCached(), {
  ssr: false,
})
const WildHeartsAdventureTeacherDashboardDemo = dynamic(() => loadWildHeartsTeacherCached(), {
  ssr: false,
})

export function LazyWildHeartsAdventureAdminDashboardDemo(
  props: ComponentProps<typeof WildHeartsAdventureAdminDashboardDemo>,
) {
  return <WildHeartsAdventureAdminDashboardDemo {...props} />
}

export function LazyWildHeartsAdventureWebsiteDashboardDemo(
  props: ComponentProps<typeof WildHeartsAdventureWebsiteDashboardDemo>,
) {
  return <WildHeartsAdventureWebsiteDashboardDemo {...props} />
}

export function LazyWildHeartsAdventureParentDashboardDemo(
  props: ComponentProps<typeof WildHeartsAdventureParentDashboardDemo>,
) {
  return <WildHeartsAdventureParentDashboardDemo {...props} />
}

export function LazyWildHeartsAdventureTeacherDashboardDemo(
  props: ComponentProps<typeof WildHeartsAdventureTeacherDashboardDemo>,
) {
  return <WildHeartsAdventureTeacherDashboardDemo {...props} />
}

export function prefetchWildHeartsAdventureAdminDemo() {
  void loadWildHeartsAdminCached()
}

export function prefetchWildHeartsAdventureWebsiteDemo() {
  void loadWildHeartsWebsiteCached()
}

export function prefetchWildHeartsAdventureParentDemo() {
  void loadWildHeartsParentCached()
}

export function prefetchWildHeartsAdventureTeacherDemo() {
  void loadWildHeartsTeacherCached()
}
