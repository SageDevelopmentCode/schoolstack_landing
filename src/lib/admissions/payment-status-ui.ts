import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import type { PaymentStatus } from "@/lib/stripe/application-payments";

export type PaymentStatusChipTone = "success" | "warning" | "alert" | "info";

export function paymentStatusChipTone(status: PaymentStatus): AdminChipTone {
  switch (status) {
    case "succeeded":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "alert";
    case "refunded":
      return "info";
  }
}

export function paymentStatusStoryChipTone(
  status: PaymentStatus,
): PaymentStatusChipTone {
  switch (status) {
    case "succeeded":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "alert";
    case "refunded":
      return "info";
  }
}
