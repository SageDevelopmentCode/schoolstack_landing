"use client";

import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import RootedMeadowsObservationDemo from "@/components/demo/rootedmeadows/RootedMeadowsObservationDemo";

export default function ScaledObservationDemoPreview({
  demoSlug = "rooted-meadows",
}: {
  demoSlug?: string;
}) {
  if (demoSlug !== "rooted-meadows") {
    return (
      <DemoPreviewFrame variant="observation">
        <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
          Observation booking preview is not available for this school yet.
        </div>
      </DemoPreviewFrame>
    );
  }

  return (
    <DemoPreviewFrame variant="observation">
      <RootedMeadowsObservationDemo />
    </DemoPreviewFrame>
  );
}
