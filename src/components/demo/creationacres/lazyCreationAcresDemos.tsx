'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { DemoModule } from '@/components/demo/demo-module-types'

const importCreationAcresAdmin = () =>
  import('@/components/demo/creationacres/CreationAcresAdminDashboardDemo') as Promise<DemoModule>
const importCreationAcresWebsite = () =>
  import('@/components/demo/creationacres/CreationAcresWebsiteDashboardDemo') as Promise<DemoModule>
const importCreationAcresParent = () =>
  import('@/components/demo/creationacres/CreationAcresParentDashboardDemo') as Promise<DemoModule>
const importCreationAcresTeacher = () =>
  import('@/components/demo/creationacres/CreationAcresTeacherDashboardDemo') as Promise<DemoModule>


let creationAcresAdminPromise: Promise<DemoModule> | null = null
let creationAcresWebsitePromise: Promise<DemoModule> | null = null
let creationAcresParentPromise: Promise<DemoModule> | null = null
let creationAcresTeacherPromise: Promise<DemoModule> | null = null

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
