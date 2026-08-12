import type { ReactNode } from "react";

type AdminListItemProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  footer?: ReactNode;
  badge?: ReactNode;
  leading?: ReactNode;
};

export function AdminListItem({
  selected,
  onClick,
  title,
  subtitle,
  meta,
  footer,
  badge,
  leading,
}: AdminListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b border-admin-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-admin-accent/30 ${
        selected
          ? "bg-admin-accent-soft border-l-2 border-l-admin-accent pl-[10px]"
          : "border-l-2 border-l-transparent hover:bg-admin-bg"
      }`}
    >
      <div className="flex items-start gap-3">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-admin-text truncate">{title}</p>
              {subtitle ? (
                <p className="text-xs text-admin-muted truncate mt-0.5">{subtitle}</p>
              ) : null}
              {meta ? <div className="mt-1">{meta}</div> : null}
            </div>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>
          {footer ? (
            <p className="text-xs text-admin-faint mt-1.5">{footer}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
