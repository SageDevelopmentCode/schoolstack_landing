import {
  adminStatusBadgeClassName,
  type AdminStatusVariant,
} from "@/lib/admin-ui/admin-status-styles";

type AdminStatusBadgeProps = {
  label: string;
  variant: AdminStatusVariant;
};

export function AdminStatusBadge({ label, variant }: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs px-1.5 py-0.5 rounded-admin-sm border ${adminStatusBadgeClassName(variant)}`}
    >
      {label}
    </span>
  );
}
