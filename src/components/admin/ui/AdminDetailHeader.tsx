import type { ReactNode } from "react";

type AdminDetailHeaderProps = {
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  actions?: ReactNode;
};

export function AdminDetailHeader({
  title,
  subtitle,
  badges,
  actions,
}: AdminDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-admin-text">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-admin-muted mt-0.5">{subtitle}</p>
        ) : null}
        {badges ? <div className="flex flex-wrap items-center gap-2 mt-2">{badges}</div> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
