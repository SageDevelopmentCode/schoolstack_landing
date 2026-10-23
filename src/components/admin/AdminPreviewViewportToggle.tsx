"use client";

import { Monitor, Smartphone } from "lucide-react";
import type { AdminPreviewViewportMode } from "@/lib/admin/preview-device-viewport";

type AdminPreviewViewportToggleProps = {
  viewport: AdminPreviewViewportMode;
  onViewportChange: (mode: AdminPreviewViewportMode) => void;
};

export default function AdminPreviewViewportToggle({
  viewport,
  onViewportChange,
}: AdminPreviewViewportToggleProps) {
  return (
    <div
      className="inline-flex rounded-md border border-violet-300 bg-white p-0.5"
      role="group"
      aria-label="Preview viewport"
    >
      <button
        type="button"
        onClick={() => onViewportChange("desktop")}
        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition"
        style={{
          backgroundColor: viewport === "desktop" ? "#EDE9FE" : "transparent",
          color: viewport === "desktop" ? "#5B21B6" : "#6D28D9",
        }}
        aria-pressed={viewport === "desktop"}
      >
        <Monitor className="h-3 w-3" aria-hidden />
        Desktop
      </button>
      <button
        type="button"
        onClick={() => onViewportChange("mobile")}
        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition"
        style={{
          backgroundColor: viewport === "mobile" ? "#EDE9FE" : "transparent",
          color: viewport === "mobile" ? "#5B21B6" : "#6D28D9",
        }}
        aria-pressed={viewport === "mobile"}
      >
        <Smartphone className="h-3 w-3" aria-hidden />
        Mobile
      </button>
    </div>
  );
}
