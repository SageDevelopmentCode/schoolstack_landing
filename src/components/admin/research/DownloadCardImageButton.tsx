"use client";

import { ImageDown } from "lucide-react";
import { useState } from "react";
import { downloadUrl, nodeToPng } from "@/components/admin/marketing/export-png";

/** The card is 4.25 × 5.5 in; at 96 CSS px per inch that's 408 × 528. */
const CARD_WIDTH = 408;
const CARD_HEIGHT = 528;
/** 3.125 × 96 = 300 DPI, so the PNG (1275 × 1650) prints sharp at the card's real size. */
const PRINT_PIXEL_RATIO = 3.125;

/** Saves one letter QR card (the first `[data-letter-card-export]` on the page) as a print-quality PNG. */
export function DownloadCardImageButton({ fileName, className = "" }: { fileName: string; className?: string }) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function save() {
    const card = document.querySelector<HTMLElement>("[data-letter-card-export]");
    if (!card) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      await document.fonts.ready;
      const dataUrl = await nodeToPng(card, CARD_WIDTH, CARD_HEIGHT, {
        pixelRatio: PRINT_PIXEL_RATIO,
        // The dashed edge is the cut line on the print sheet; leave it out of the image.
        style: { borderColor: "transparent" },
      });
      downloadUrl(dataUrl, fileName);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={save} disabled={status === "saving"} className={`${className} disabled:opacity-60`}>
        <ImageDown className="h-4 w-4" aria-hidden />
        {status === "saving" ? "Saving image…" : "Download image"}
      </button>
      <span aria-live="polite" className="absolute left-0 top-full mt-1 whitespace-nowrap text-xs font-bold text-red-700">
        {status === "error" ? "Couldn't save the image, try again" : ""}
      </span>
    </span>
  );
}
