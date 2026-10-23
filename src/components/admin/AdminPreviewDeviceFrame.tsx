"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  ADMIN_PREVIEW_DEVICE_BEZEL_PX,
  ADMIN_PREVIEW_MOBILE_HEIGHT,
  ADMIN_PREVIEW_MOBILE_WIDTH,
  buildPreviewEmbedHref,
  type AdminPreviewViewportMode,
} from "@/lib/admin/preview-device-viewport";

type AdminPreviewDeviceFrameProps = {
  children: ReactNode;
  viewport: AdminPreviewViewportMode;
};

export default function AdminPreviewDeviceFrame({
  children,
  viewport,
}: AdminPreviewDeviceFrameProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState(ADMIN_PREVIEW_MOBILE_HEIGHT);

  useLayoutEffect(() => {
    const element = canvasRef.current;
    if (!element) {
      return;
    }

    const update = (entry?: ResizeObserverEntry) => {
      const height = entry?.contentRect.height ?? element.clientHeight;
      if (height > 0) {
        setAvailableHeight(height);
      }
    };

    update();
    const observer = new ResizeObserver((entries) => update(entries[0]));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (viewport !== "mobile") {
    return <>{children}</>;
  }

  const iframeSrc = buildPreviewEmbedHref(pathname, searchParams);
  const scale = Math.min(1, availableHeight / ADMIN_PREVIEW_MOBILE_HEIGHT);
  const displayWidth = ADMIN_PREVIEW_MOBILE_WIDTH * scale;
  const displayHeight = ADMIN_PREVIEW_MOBILE_HEIGHT * scale;
  const bezel = ADMIN_PREVIEW_DEVICE_BEZEL_PX;
  const chassisWidth = displayWidth + bezel * 2;
  const chassisHeight = displayHeight + bezel * 2;

  return (
    <div
      ref={canvasRef}
      className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-neutral-200/90 p-4 sm:p-6"
    >
      <div
        className="box-border shrink-0 overflow-hidden rounded-[2rem] border-neutral-800 bg-neutral-900 shadow-2xl"
        style={{
          width: chassisWidth,
          height: chassisHeight,
          borderWidth: bezel,
          borderStyle: "solid",
        }}
      >
        <div
          className="overflow-hidden bg-bg"
          style={{
            width: displayWidth,
            height: displayHeight,
          }}
        >
          <div
            style={{
              width: ADMIN_PREVIEW_MOBILE_WIDTH,
              height: ADMIN_PREVIEW_MOBILE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              title="Mobile preview"
              className="border-0 bg-bg"
              style={{
                width: ADMIN_PREVIEW_MOBILE_WIDTH,
                height: ADMIN_PREVIEW_MOBILE_HEIGHT,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
