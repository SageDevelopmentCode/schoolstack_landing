import type { GChipTone } from "@/components/school-parent/garden/ui";
import type { ChargeStatusBadgeTone } from "@/lib/tuition/charge-status-display";

/** Map billing status tones onto Garden chip tones. */
export function chargeToneToGChip(tone: ChargeStatusBadgeTone | string): GChipTone {
  switch (tone) {
    case "success":
      return "success";
    case "info":
      return "info";
    case "warning":
      return "warning";
    case "accent":
    case "danger":
    case "alert":
      return "alert";
    default:
      return "neutral";
  }
}
