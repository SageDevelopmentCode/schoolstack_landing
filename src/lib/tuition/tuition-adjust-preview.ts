import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";

export type TuitionAdjustPreviewSnapshot = {
  baseAmountCents: number;
  pendingSchedule: boolean;
  reasonOptions: string[];
  existing: TuitionAdjustment[];
  charges: TuitionCharge[];
};

export function buildDemoTuitionAdjustPreviewSnapshot(): TuitionAdjustPreviewSnapshot {
  return {
    baseAmountCents: 128_000,
    pendingSchedule: true,
    reasonOptions: ["Sibling discount", "Financial aid", "Staff discount"],
    existing: [],
    charges: [],
  };
}
