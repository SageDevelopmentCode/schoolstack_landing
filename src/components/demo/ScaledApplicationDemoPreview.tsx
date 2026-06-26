"use client";

import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import RootedMeadowsApplicationDemo from "@/components/demo/rootedmeadows/RootedMeadowsApplicationDemo";

export default function ScaledApplicationDemoPreview({
  demoSlug = "rooted-meadows",
  onPayApplicationFee,
}: {
  demoSlug?: string;
  onPayApplicationFee?: () => void;
}) {
  if (demoSlug !== "rooted-meadows") {
    return (
      <DemoPreviewFrame variant="application">
        <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
          Application preview is not available for this school yet.
        </div>
      </DemoPreviewFrame>
    );
  }

  return (
    <DemoPreviewFrame variant="application">
      <RootedMeadowsApplicationDemo onPayApplicationFee={onPayApplicationFee} />
    </DemoPreviewFrame>
  );
}
