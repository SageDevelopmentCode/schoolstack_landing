'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importRootedMeadowsAdmin = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsAdminDashboardDemo') as Promise<DemoModule>
const importRootedMeadowsWebsite = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsWebsiteDashboardDemo') as Promise<DemoModule>
const importRootedMeadowsParent = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsParentDashboardDemo') as Promise<DemoModule>
const importRootedMeadowsTeacher = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsTeacherDashboardDemo') as Promise<DemoModule>


let rootedMeadowsAdminPromise: Promise<DemoModule> | null = null
let rootedMeadowsWebsitePromise: Promise<DemoModule> | null = null
let rootedMeadowsParentPromise: Promise<DemoModule> | null = null
let rootedMeadowsTeacherPromise: Promise<DemoModule> | null = null

function loadRootedMeadowsAdminCached() {
  if (!rootedMeadowsAdminPromise) {
    rootedMeadowsAdminPromise = importRootedMeadowsAdmin().catch((error) => {
      rootedMeadowsAdminPromise = null
      console.error('Failed to load demo "rooted-meadows-admin":', error)
      throw error
    })
  }
  return rootedMeadowsAdminPromise
}

function loadRootedMeadowsWebsiteCached() {
  if (!rootedMeadowsWebsitePromise) {
    rootedMeadowsWebsitePromise = importRootedMeadowsWebsite().catch((error) => {
      rootedMeadowsWebsitePromise = null
      console.error('Failed to load demo "rooted-meadows-website":', error)
      throw error
    })
  }
  return rootedMeadowsWebsitePromise
}

function loadRootedMeadowsParentCached() {
  if (!rootedMeadowsParentPromise) {
    rootedMeadowsParentPromise = importRootedMeadowsParent().catch((error) => {
      rootedMeadowsParentPromise = null
      console.error('Failed to load demo "rooted-meadows-parent":', error)
      throw error
    })
  }
  return rootedMeadowsParentPromise
}

function loadRootedMeadowsTeacherCached() {
  if (!rootedMeadowsTeacherPromise) {
    rootedMeadowsTeacherPromise = importRootedMeadowsTeacher().catch((error) => {
      rootedMeadowsTeacherPromise = null
      console.error('Failed to load demo "rooted-meadows-teacher":', error)
      throw error
    })
  }
  return rootedMeadowsTeacherPromise
}

const RootedMeadowsAdminDashboardDemo = dynamic(() => loadRootedMeadowsAdminCached(), {
  ssr: false,
})
const RootedMeadowsWebsiteDashboardDemo = dynamic(() => loadRootedMeadowsWebsiteCached(), {
  ssr: false,
})
const RootedMeadowsParentDashboardDemo = dynamic(() => loadRootedMeadowsParentCached(), {
  ssr: false,
})
const RootedMeadowsTeacherDashboardDemo = dynamic(() => loadRootedMeadowsTeacherCached(), {
  ssr: false,
})

export function LazyRootedMeadowsAdminDashboardDemo(
  props: ComponentProps<typeof RootedMeadowsAdminDashboardDemo>,
) {
  return <RootedMeadowsAdminDashboardDemo {...props} />
}

export function LazyRootedMeadowsWebsiteDashboardDemo(
  props: ComponentProps<typeof RootedMeadowsWebsiteDashboardDemo>,
) {
  return <RootedMeadowsWebsiteDashboardDemo {...props} />
}

export function LazyRootedMeadowsParentDashboardDemo(
  props: ComponentProps<typeof RootedMeadowsParentDashboardDemo>,
) {
  return <RootedMeadowsParentDashboardDemo {...props} />
}

export function LazyRootedMeadowsTeacherDashboardDemo(
  props: ComponentProps<typeof RootedMeadowsTeacherDashboardDemo>,
) {
  return <RootedMeadowsTeacherDashboardDemo {...props} />
}

/**
 * A hover/near-viewport prefetch is only a head start: when it fails (stale chunk after a
 * deploy, flaky network) the cache is cleared and the real render retries and reports. Its
 * rejection must not reach `unhandledrejection`, which on public pages reloads the tab.
 */
function ignorePrefetchFailure() {}

export function prefetchRootedMeadowsAdminDemo() {
  void loadRootedMeadowsAdminCached().catch(ignorePrefetchFailure)
}

export function prefetchRootedMeadowsWebsiteDemo() {
  void loadRootedMeadowsWebsiteCached().catch(ignorePrefetchFailure)
}

export function prefetchRootedMeadowsParentDemo() {
  void loadRootedMeadowsParentCached().catch(ignorePrefetchFailure)
}

export function prefetchRootedMeadowsTeacherDemo() {
  void loadRootedMeadowsTeacherCached().catch(ignorePrefetchFailure)
}
