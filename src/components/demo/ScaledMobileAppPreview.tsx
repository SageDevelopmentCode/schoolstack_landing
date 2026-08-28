"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import { MOBILE_DESIGN_HEIGHT } from "@/components/demo/mobile/MobilePhoneFrame";

const SHOWCASE_HEIGHT = MOBILE_DESIGN_HEIGHT + 160;

const MOBILE_SHOWCASE_LOADERS: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "rooted-meadows": () =>
    import("@/components/demo/rootedmeadows/mobile/RootedMeadowsMobileAppShowcase"),
  "kats-community-microschool": () =>
    import(
      "@/components/demo/katscommunity/KatsCommunityMicroschoolMobileAppShowcase"
    ),
  "kinder-academy-prep-school": () =>
    import(
      "@/components/demo/kinderacademyprep/KinderAcademyPrepSchoolMobileAppShowcase"
    ),
};

export default function ScaledMobileAppPreview({
  demoSlug = "rooted-meadows",
}: {
  demoSlug?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [scale, setScale] = useState(0.7);
  const [loadedShowcase, setLoadedShowcase] = useState<{
    slug: string;
    Component: ComponentType;
  } | null>(null);

  const loader = MOBILE_SHOWCASE_LOADERS[demoSlug];
  const ShowcaseComponent =
    loadedShowcase?.slug === demoSlug ? loadedShowcase.Component : null;

  useEffect(() => {
    const load = MOBILE_SHOWCASE_LOADERS[demoSlug];
    if (!load) return;

    let cancelled = false;
    void load().then((module) => {
      if (!cancelled) {
        setLoadedShowcase({ slug: demoSlug, Component: module.default });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [demoSlug]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      setContainerWidth(el.offsetWidth);
      const heightScale = el.offsetHeight / SHOWCASE_HEIGHT;
      setScale(Math.min(heightScale, 1));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!loader || !ShowcaseComponent) {
    return (
      <DemoPreviewFrame variant="mobile">
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          Mobile preview is not available for this school yet.
        </div>
      </DemoPreviewFrame>
    );
  }

  return (
    <DemoPreviewFrame variant="mobile">
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: containerWidth,
            height: SHOWCASE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <ShowcaseComponent />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
