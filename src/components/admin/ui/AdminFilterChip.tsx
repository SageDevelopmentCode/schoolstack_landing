type AdminFilterChipProps = {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  title?: string;
};

export function AdminFilterChip({
  label,
  count,
  active,
  onClick,
  title,
}: AdminFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`text-xs px-2.5 py-1 rounded-admin-md border transition-colors max-w-full truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 ${
        active
          ? "bg-admin-accent-soft text-admin-accent border-admin-accent/20 font-medium"
          : "bg-admin-bg text-admin-muted border-admin-border hover:bg-admin-neutral-bg hover:text-admin-text"
      }`}
    >
      {label}
      {count !== undefined && count > 0 ? ` (${count})` : ""}
    </button>
  );
}
