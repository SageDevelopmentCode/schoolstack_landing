import { GChip, type GChipTone } from "@/components/school-parent/garden/ui";
import type { FridayBranchStatusTagVariant } from "@/lib/school-admin/friday-branch/friday-branch-types";

/** Status chip for Friday Branch tables and sheets (Garden page). */
const TONES: Record<FridayBranchStatusTagVariant, GChipTone> = {
  green: "success",
  blue: "info",
  amber: "warning",
  purple: "neutral",
  rose: "alert",
};

type FridayBranchStatusTagProps = {
  label: string;
  variant: FridayBranchStatusTagVariant;
  className?: string;
};

export default function FridayBranchStatusTag({ label, variant, className = "" }: FridayBranchStatusTagProps) {
  return (
    <GChip tone={TONES[variant]} className={className}>
      {label}
    </GChip>
  );
}
