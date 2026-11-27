"use client";

import { useEffect, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import DemoScaledCanvas from "@/components/demo/shared/DemoScaledCanvas";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";
import type { DemoWalkthroughParentTab } from "@/data/school-demos/walkthrough-placeholder";

const ROOTED_MEADOWS_SLUG = "rooted-meadows";

type DemoComponent = ComponentType<Record<string, unknown>>;

type LoadedParentDemo =
  | { kind: "shared"; slug: string }
  | { kind: "garden"; slug: string }
  | { kind: "custom"; slug: string; Component: DemoComponent };

type GardenParentDemos = typeof import("@/components/demo/shared/lazySchoolParentGardenDemo");

/** Shared-school tabs that render the real Garden parent pages (others keep the story demo). */
function usesGardenParentDemo(tab: DemoWalkthroughParentTab): boolean {
  return tab === "enrollment" || tab === "home" || tab === "billing";
}

function loadParentDemo(slug: string): Promise<LoadedParentDemo> {
  if (slug === ROOTED_MEADOWS_SLUG) {
    return import("@/components/demo/rootedmeadows/lazyRootedMeadowsDemos").then(
      (m) => ({
        kind: "custom" as const,
        slug,
        Component: m.LazyRootedMeadowsParentDashboardDemo as DemoComponent,
      }),
    );
  }
  return Promise.resolve({ kind: "shared" as const, slug });
}

export default function ScaledParentDemoPreview({
  demoSlug = "athena-microacademy",
  initialParentTab = "enrollment",
  parentEnrollmentVariant,
  billingChildIds,
  tuitionOverride,
  initialCommitteeId,
  initialCommitteeSection,
}: {
  demoSlug?: string;
  initialParentTab?: DemoWalkthroughParentTab;
  parentEnrollmentVariant?: "prototype";
  billingChildIds?: readonly ("emma" | "jake" | "liam")[];
  tuitionOverride?: DemoTuitionOverride | null;
  initialCommitteeId?: string;
  initialCommitteeSection?:
    | "home"
    | "about"
    | "resources"
    | "calendar"
    | "tasks"
    | "messages"
    | "members"
    | "settings";
}) {
  const [loadedDemo, setLoadedDemo] = useState<LoadedParentDemo | null>(null);
  const [SharedParent, setSharedParent] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const [gardenDemos, setGardenDemos] = useState<GardenParentDemos | null>(null);
  const isRootedMeadows = demoSlug === ROOTED_MEADOWS_SLUG;

  useEffect(() => {
    let cancelled = false;
    void loadParentDemo(demoSlug).then(async (loaded) => {
      if (cancelled) return;
      if (loaded.kind === "shared" && usesGardenParentDemo(initialParentTab)) {
        const mod = await import("@/components/demo/shared/lazySchoolParentGardenDemo");
        if (!cancelled) {
          setGardenDemos(mod);
          setLoadedDemo({ kind: "garden", slug: loaded.slug });
        }
        return;
      }
      if (loaded.kind === "shared") {
        const mod = await import("@/components/demo/shared/lazySchoolParentDemo");
        if (!cancelled) {
          setSharedParent(
            () =>
              mod.LazySchoolParentDashboardDemo as ComponentType<
                Record<string, unknown>
              >,
          );
          setLoadedDemo(loaded);
        }
        return;
      }
      setLoadedDemo(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [demoSlug, initialParentTab]);


  const demoProps = {
    initialTab: initialParentTab as "home" | "enrollment" | "billing",
    disableTour: true,
    hideNav: false,
    enrollmentVariant:
      isRootedMeadows && parentEnrollmentVariant === "prototype"
        ? "prototype"
        : "default",
    billingChildIds: isRootedMeadows ? billingChildIds : undefined,
    tuitionOverride: isRootedMeadows ? tuitionOverride : undefined,
    initialCommitteeId: isRootedMeadows ? initialCommitteeId : undefined,
    initialCommitteeSection: isRootedMeadows ? initialCommitteeSection : undefined,
  };

  return (
    <DemoPreviewFrame variant="parent">
      <DemoScaledCanvas>
        {loadedDemo?.kind === "garden" && gardenDemos ? (
          initialParentTab === "enrollment" ? (
            <gardenDemos.LazyDemoParentEnrollmentChecklist demoSlug={demoSlug} />
          ) : (
            <gardenDemos.LazyDemoParentGardenPortal
              demoSlug={demoSlug}
              initialTab={initialParentTab === "home" ? "home" : "billing"}
              billingChildIds={billingChildIds}
            />
          )
        ) : null}
        {loadedDemo?.kind === "shared" && SharedParent ? (
          <SharedParent demoSlug={demoSlug} {...demoProps} />
        ) : null}
        {loadedDemo?.kind === "custom" ? (
          <loadedDemo.Component {...demoProps} />
        ) : null}
      </DemoScaledCanvas>
    </DemoPreviewFrame>
  );
}
