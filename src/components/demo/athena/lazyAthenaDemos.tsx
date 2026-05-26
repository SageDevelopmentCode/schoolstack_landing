'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importAthenaAdmin = () =>
  import('@/components/demo/athena/AthenaAdminDashboardDemo')
const importAthenaWebsite = () =>
  import('@/components/demo/athena/AthenaWebsiteDashboardDemo')
const importAthenaParent = () =>
  import('@/components/demo/athena/AthenaParentDashboardDemo')

type AthenaAdminModule = Awaited<ReturnType<typeof importAthenaAdmin>>
type AthenaWebsiteModule = Awaited<ReturnType<typeof importAthenaWebsite>>
type AthenaParentModule = Awaited<ReturnType<typeof importAthenaParent>>

let athenaAdminPromise: Promise<AthenaAdminModule> | null = null
let athenaWebsitePromise: Promise<AthenaWebsiteModule> | null = null
let athenaParentPromise: Promise<AthenaParentModule> | null = null

function loadAthenaAdminCached() {
  if (!athenaAdminPromise) {
    athenaAdminPromise = importAthenaAdmin().catch((error) => {
      athenaAdminPromise = null
      console.error('Failed to load demo "athena-admin":', error)
      throw error
    })
  }
  return athenaAdminPromise
}

function loadAthenaWebsiteCached() {
  if (!athenaWebsitePromise) {
    athenaWebsitePromise = importAthenaWebsite().catch((error) => {
      athenaWebsitePromise = null
      console.error('Failed to load demo "athena-website":', error)
      throw error
    })
  }
  return athenaWebsitePromise
}

function loadAthenaParentCached() {
  if (!athenaParentPromise) {
    athenaParentPromise = importAthenaParent().catch((error) => {
      athenaParentPromise = null
      console.error('Failed to load demo "athena-parent":', error)
      throw error
    })
  }
  return athenaParentPromise
}

const AthenaAdminDashboardDemo = dynamic(() => loadAthenaAdminCached(), {
  ssr: false,
})
const AthenaWebsiteDashboardDemo = dynamic(() => loadAthenaWebsiteCached(), {
  ssr: false,
})
const AthenaParentDashboardDemo = dynamic(() => loadAthenaParentCached(), {
  ssr: false,
})

export function LazyAthenaAdminDashboardDemo(
  props: ComponentProps<typeof AthenaAdminDashboardDemo>,
) {
  return <AthenaAdminDashboardDemo {...props} />
}

export function LazyAthenaWebsiteDashboardDemo(
  props: ComponentProps<typeof AthenaWebsiteDashboardDemo>,
) {
  return <AthenaWebsiteDashboardDemo {...props} />
}

export function LazyAthenaParentDashboardDemo(
  props: ComponentProps<typeof AthenaParentDashboardDemo>,
) {
  return <AthenaParentDashboardDemo {...props} />
}

export function prefetchAthenaAdminDemo() {
  void loadAthenaAdminCached()
}

export function prefetchAthenaWebsiteDemo() {
  void loadAthenaWebsiteCached()
}

export function prefetchAthenaParentDemo() {
  void loadAthenaParentCached()
}
