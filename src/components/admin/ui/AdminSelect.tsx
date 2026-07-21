import type { SelectHTMLAttributes } from "react";

type AdminSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function AdminSelect({ className = "", ...props }: AdminSelectProps) {
  return (
    <select
      className={`text-sm border border-admin-border rounded-admin-md px-2.5 py-1.5 bg-admin-surface text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent/30 ${className}`}
      {...props}
    />
  );
}
