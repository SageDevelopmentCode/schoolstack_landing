import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import type { ProgramStatus } from "@/lib/admissions/programs";

export function programStatusChipTone(status: ProgramStatus): AdminChipTone {
  switch (status) {
    case "open":
      return "success";
    case "waitlist":
      return "warning";
    case "full":
      return "alert";
    case "draft":
    case "closed":
      return "info";
  }
}
