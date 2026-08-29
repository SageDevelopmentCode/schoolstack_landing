"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import type { DemoWalkthroughTeacherTab } from "@/data/school-demos/walkthrough-placeholder";

const DESIGN_WIDTH = 1440;
const ROOTED_MEADOWS_SLUG = "rooted-meadows";

type DemoComponent = ComponentType<Record<string, unknown>>;

type LoadedTeacherDemo =
  | { kind: "shared"; slug: string }
  | { kind: "custom"; slug: string; Component: DemoComponent };

function loadTeacherDemo(slug: string): Promise<LoadedTeacherDemo> {
  if (slug === ROOTED_MEADOWS_SLUG) {
    return import("@/components/demo/rootedmeadows/lazyRootedMeadowsDemos").then(
      (m) => ({
        kind: "custom" as const,
        slug,
        Component: m.LazyRootedMeadowsTeacherDashboardDemo as DemoComponent,
      }),
    );
  }
  return Promise.resolve({ kind: "shared" as const, slug });
}

export default function ScaledTeacherDemoPreview({
  demoSlug = "athena-microacademy",
  initialTeacherTab = "attendance",
  initialSelectedTeacherStudentId,
  openInitialTeacherStudentDetailDelayMs,
}: {
  demoSlug?: string;
  initialTeacherTab?: DemoWalkthroughTeacherTab;
  initialSelectedTeacherStudentId?: string;
  openInitialTeacherStudentDetailDelayMs?: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);
  const [loadedDemo, setLoadedDemo] = useState<LoadedTeacherDemo | null>(null);
  const [SharedTeacher, setSharedTeacher] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const isRootedMeadows = demoSlug === ROOTED_MEADOWS_SLUG;

  useEffect(() => {
    let cancelled = false;
    void loadTeacherDemo(demoSlug).then(async (loaded) => {
      if (cancelled) return;
      if (loaded.kind === "shared") {
        const mod = await import("@/components/demo/shared/lazySchoolTeacherDemo");
        if (!cancelled) {
          setSharedTeacher(
            () =>
              mod.LazySchoolTeacherDashboardDemo as ComponentType<
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
    initialTab: initialTeacherTab,
    disableTour: true,
    hideNav: false,
    ...(isRootedMeadows
      ? {
          initialSelectedStudentId: initialSelectedTeacherStudentId,
          openInitialStudentDetailDelayMs:
            openInitialTeacherStudentDetailDelayMs,
        }
      : {}),
  };

  return (
    <DemoPreviewFrame variant="teacher">
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          style={{
            width: DESIGN_WIDTH,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {loadedDemo?.kind === "shared" && SharedTeacher ? (
            <SharedTeacher demoSlug={demoSlug} {...demoProps} />
          ) : null}
          {loadedDemo?.kind === "custom" ? (
            <loadedDemo.Component {...demoProps} />
          ) : null}
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
