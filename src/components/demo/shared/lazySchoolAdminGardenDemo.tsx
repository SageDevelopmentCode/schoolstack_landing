"use client";

import dynamic from "next/dynamic";
import { schoolAdminDemoConfigs } from "@/data/school-demos/dashboard-registry";
import { DemoSkeleton } from "@/components/ui/DemoSkeleton";

/** Demo school the home-page Admin Portal / Marketing cards show. */
export const DEFAULT_ADMIN_GARDEN_DEMO_SLUG = "luff-learning";

const importDashboard = () => import("@/components/demo/shared/DemoAdminGardenDashboard");
const importMarketing = () =>
  import("@/components/demo/shared/marketing-garden/DemoAdminGardenMarketing");

function cached<T>(name: string, load: () => Promise<T>) {
  let promise: Promise<T> | null = null;
  return () => {
    if (!promise) {
      promise = load().catch((error) => {
        promise = null;
        console.error(`Failed to load demo "${name}":`, error);
        throw error;
      });
    }
    return promise;
  };
}

const loadDashboard = cached("admin-garden-dashboard", importDashboard);
const loadMarketing = cached("admin-garden-marketing", importMarketing);

function DemoChunkLoading() {
  return <DemoSkeleton className="rounded-2xl border border-gray-200" />;
}

const DemoAdminGardenDashboard = dynamic(() => loadDashboard(), {
  ssr: false,
  loading: DemoChunkLoading,
});

const DemoAdminGardenMarketing = dynamic(() => loadMarketing(), {
  ssr: false,
  loading: DemoChunkLoading,
});

/** Warm the Admin Portal demo chunk (hover / idle prefetch). */
export function prefetchDemoAdminGardenDashboard() {
  void loadDashboard();
}

/** Warm the Marketing demo chunk (hover / idle prefetch). */
export function prefetchDemoAdminGardenMarketing() {
  void loadMarketing();
}

/** Home-page "Admin Portal" card: the real Garden admin Dashboard on demo fixtures. */
export function LazyDemoAdminGardenDashboard({
  demoSlug = DEFAULT_ADMIN_GARDEN_DEMO_SLUG,
}: {
  demoSlug?: string;
}) {
  const config = schoolAdminDemoConfigs[demoSlug];
  if (!config) return null;
  return <DemoAdminGardenDashboard config={config} />;
}

/** Home-page "Marketing" card: the Garden rebuild of the marketing automations mock. */
export function LazyDemoAdminGardenMarketing({
  demoSlug = DEFAULT_ADMIN_GARDEN_DEMO_SLUG,
}: {
  demoSlug?: string;
}) {
  const config = schoolAdminDemoConfigs[demoSlug];
  if (!config) return null;
  return <DemoAdminGardenMarketing config={config} />;
}
