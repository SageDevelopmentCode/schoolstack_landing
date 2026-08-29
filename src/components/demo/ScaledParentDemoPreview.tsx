"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";
import type { DemoWalkthroughParentTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;
const ROOTED_MEADOWS_SLUG = "rooted-meadows";

type DemoComponent = ComponentType<Record<string, unknown>>;

type LoadedParentDemo =
  | { kind: "shared"; slug: string }
  | { kind: "custom"; slug: string; Component: DemoComponent };

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
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);
  const [loadedDemo, setLoadedDemo] = useState<LoadedParentDemo | null>(null);
  const [SharedParent, setSharedParent] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const isRootedMeadows = demoSlug === ROOTED_MEADOWS_SLUG;

  useEffect(() => {
    let cancelled = false;
    void loadParentDemo(demoSlug).then(async (loaded) => {
      if (cancelled) return;
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
  }, [demoSlug]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          className="h-full"
          style={{
            width: DESIGN_WIDTH,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {loadedDemo?.kind === "shared" && SharedParent ? (
            <SharedParent demoSlug={demoSlug} {...demoProps} />
          ) : null}
          {loadedDemo?.kind === "custom" ? (
            <loadedDemo.Component {...demoProps} />
          ) : null}
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
