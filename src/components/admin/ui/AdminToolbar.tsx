import type { ReactNode } from "react";

type AdminToolbarProps = {
  children: ReactNode;
  className?: string;
};

export function AdminToolbar({ children, className = "" }: AdminToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-4 border-b border-admin-border bg-admin-surface ${className}`}
    >
      {children}
    </div>
  );
}
