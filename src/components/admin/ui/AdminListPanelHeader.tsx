import type { ReactNode } from "react";

type AdminListPanelHeaderProps = {
  children: ReactNode;
};

export function AdminListPanelHeader({ children }: AdminListPanelHeaderProps) {
  return (
    <div className="p-4 border-b border-admin-border space-y-2">{children}</div>
  );
}
