'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importCreationAcresAdmin = () =>
  import('@/components/demo/creationacres/CreationAcresAdminDashboardDemo')
const importCreationAcresWebsite = () =>
  import('@/components/demo/creationacres/CreationAcresWebsiteDashboardDemo')
const importCreationAcresParent = () =>
  import('@/components/demo/creationacres/CreationAcresParentDashboardDemo')
const importCreationAcresTeacher = () =>
  import('@/components/demo/creationacres/CreationAcresTeacherDashboardDemo')

type CreationAcresAdminModule = Awaited<ReturnType<typeof importCreationAcresAdmin>>
type CreationAcresWebsiteModule = Awaited<ReturnType<typeof importCreationAcresWebsite>>
type CreationAcresParentModule = Awaited<ReturnType<typeof importCreationAcresParent>>
type CreationAcresTeacherModule = Awaited<ReturnType<typeof importCreationAcresTeacher>>

let creationAcresAdminPromise: Promise<CreationAcresAdminModule> | null = null
let creationAcresWebsitePromise: Promise<CreationAcresWebsiteModule> | null = null
let creationAcresParentPromise: Promise<CreationAcresParentModule> | null = null
let creationAcresTeacherPromise: Promise<CreationAcresTeacherModule> | null = null

function loadCreationAcresAdminCached() {
  if (!creationAcresAdminPromise) {
    creationAcresAdminPromise = importCreationAcresAdmin().catch((error) => {
      creationAcresAdminPromise = null
      console.error('Failed to load demo "creation-acres-admin":', error)
      throw error
    })
  }
  return creationAcresAdminPromise
}

function loadCreationAcresWebsiteCached() {
  if (!creationAcresWebsitePromise) {
    creationAcresWebsitePromise = importCreationAcresWebsite().catch((error) => {
      creationAcresWebsitePromise = null
      console.error('Failed to load demo "creation-acres-website":', error)
      throw error
    })
  }
  return creationAcresWebsitePromise
}

function loadCreationAcresParentCached() {
  if (!creationAcresParentPromise) {
    creationAcresParentPromise = importCreationAcresParent().catch((error) => {
      creationAcresParentPromise = null
      console.error('Failed to load demo "creation-acres-parent":', error)
      throw error
    })
  }
  return creationAcresParentPromise
}

function loadCreationAcresTeacherCached() {
  if (!creationAcresTeacherPromise) {
    creationAcresTeacherPromise = importCreationAcresTeacher().catch((error) => {
      creationAcresTeacherPromise = null
      console.error('Failed to load demo "creation-acres-teacher":', error)
      throw error
    })
  }
  return creationAcresTeacherPromise
}

const CreationAcresAdminDashboardDemo = dynamic(() => loadCreationAcresAdminCached(), {
  ssr: false,
})
const CreationAcresWebsiteDashboardDemo = dynamic(() => loadCreationAcresWebsiteCached(), {
  ssr: false,
})
const CreationAcresParentDashboardDemo = dynamic(() => loadCreationAcresParentCached(), {
  ssr: false,
})
const CreationAcresTeacherDashboardDemo = dynamic(() => loadCreationAcresTeacherCached(), {
  ssr: false,
})

export function LazyCreationAcresAdminDashboardDemo(
  props: ComponentProps<typeof CreationAcresAdminDashboardDemo>,
) {
  return <CreationAcresAdminDashboardDemo {...props} />
}

export function LazyCreationAcresWebsiteDashboardDemo(
  props: ComponentProps<typeof CreationAcresWebsiteDashboardDemo>,
) {
  return <CreationAcresWebsiteDashboardDemo {...props} />
}

export function LazyCreationAcresParentDashboardDemo(
  props: ComponentProps<typeof CreationAcresParentDashboardDemo>,
) {
  return <CreationAcresParentDashboardDemo {...props} />
}

export function LazyCreationAcresTeacherDashboardDemo(
  props: ComponentProps<typeof CreationAcresTeacherDashboardDemo>,
) {
  return <CreationAcresTeacherDashboardDemo {...props} />
}

export function prefetchCreationAcresAdminDemo() {
  void loadCreationAcresAdminCached()
}

export function prefetchCreationAcresWebsiteDemo() {
  void loadCreationAcresWebsiteCached()
}

export function prefetchCreationAcresParentDemo() {
  void loadCreationAcresParentCached()
}

export function prefetchCreationAcresTeacherDemo() {
  void loadCreationAcresTeacherCached()
}
