'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importRootedMeadowsAdmin = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsAdminDashboardDemo')
const importRootedMeadowsWebsite = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsWebsiteDashboardDemo')
const importRootedMeadowsParent = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsParentDashboardDemo')
const importRootedMeadowsTeacher = () =>
  import('@/components/demo/rootedmeadows/RootedMeadowsTeacherDashboardDemo')

type RootedMeadowsAdminModule = Awaited<ReturnType<typeof importRootedMeadowsAdmin>>
type RootedMeadowsWebsiteModule = Awaited<ReturnType<typeof importRootedMeadowsWebsite>>
type RootedMeadowsParentModule = Awaited<ReturnType<typeof importRootedMeadowsParent>>
type RootedMeadowsTeacherModule = Awaited<ReturnType<typeof importRootedMeadowsTeacher>>

let rootedMeadowsAdminPromise: Promise<RootedMeadowsAdminModule> | null = null
let rootedMeadowsWebsitePromise: Promise<RootedMeadowsWebsiteModule> | null = null
let rootedMeadowsParentPromise: Promise<RootedMeadowsParentModule> | null = null
let rootedMeadowsTeacherPromise: Promise<RootedMeadowsTeacherModule> | null = null

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

export function prefetchRootedMeadowsAdminDemo() {
  void loadRootedMeadowsAdminCached()
}

export function prefetchRootedMeadowsWebsiteDemo() {
  void loadRootedMeadowsWebsiteCached()
}

export function prefetchRootedMeadowsParentDemo() {
  void loadRootedMeadowsParentCached()
}

export function prefetchRootedMeadowsTeacherDemo() {
  void loadRootedMeadowsTeacherCached()
}
