import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminSaveStateBarProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function AdminSaveStateBar({
  theme: _theme,
  children,
  action,
  className = "",
}: AdminSaveStateBarProps) {
  return (
    <div
      className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[11px] border px-3.5 py-3 text-xs ${className}`}
      style={{
        backgroundColor: "#EFF9F1",
        borderColor: "#CFE4D2",
        color: "#487354",
      }}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
