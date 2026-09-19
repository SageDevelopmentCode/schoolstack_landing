import type { FridayBranchStatusTagVariant } from "@/lib/school-admin/friday-branch/friday-branch-types";

const TAG_STYLES: Record<
  FridayBranchStatusTagVariant,
  { backgroundColor: string; color: string }
> = {
  green: { backgroundColor: "#EAF7EE", color: "#348457" },
  blue: { backgroundColor: "#E9F4F7", color: "#39788D" },
  amber: { backgroundColor: "#FFF3DF", color: "#A26B22" },
  purple: { backgroundColor: "#F0EBF3", color: "#765E89" },
  rose: { backgroundColor: "#FBEDEB", color: "#B75A4B" },
};

type FridayBranchStatusTagProps = {
  label: string;
  variant: FridayBranchStatusTagVariant;
  className?: string;
};

export default function FridayBranchStatusTag({
  label,
  variant,
  className = "",
}: FridayBranchStatusTagProps) {
  const style = TAG_STYLES[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-[7px] py-1 text-[10px] font-extrabold ${className}`}
      style={style}
    >
      {label}
    </span>
  );
}
