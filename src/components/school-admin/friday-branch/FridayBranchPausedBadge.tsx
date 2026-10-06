type FridayBranchPausedBadgeProps = {
  compact?: boolean;
  className?: string;
};

export default function FridayBranchPausedBadge({
  compact = false,
  className = "",
}: FridayBranchPausedBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full font-semibold uppercase tracking-wide ${
        compact ? "px-1.5 py-0 text-[9px]" : "px-2 py-0.5 text-[10px]"
      } ${className}`}
      style={{
        backgroundColor: "#FEF3C7",
        color: "#92400E",
        border: "1px solid #FDE68A",
      }}
    >
      Paused
    </span>
  );
}
