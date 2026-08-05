"use client";

import Image from "next/image";
import { createPortal } from "react-dom";

type MudKitchenLoadingOverlayProps = {
  visible: boolean;
  label?: string;
};

export default function MudKitchenLoadingOverlay({
  visible,
  label = "Loading",
}: MudKitchenLoadingOverlayProps) {
  if (!visible || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-white/95 backdrop-blur-[2px]"
      aria-busy="true"
      aria-label={label}
      role="status"
    >
      <div className="animate-[portal-switch-pulse_1.4s_ease-in-out_infinite]">
        <Image
          src="/images/Logo.png"
          alt="MudKitchen"
          width={72}
          height={72}
          className="h-[72px] w-[72px] object-contain"
          priority
        />
      </div>
    </div>,
    document.body,
  );
}
