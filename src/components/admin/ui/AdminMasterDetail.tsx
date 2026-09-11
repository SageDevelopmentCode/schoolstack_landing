import type { ReactNode } from "react";

type AdminMasterDetailProps = {
  list: ReactNode;
  detail: ReactNode;
  listWidth?: "sm" | "md";
  className?: string;
};

const LIST_WIDTH = {
  sm: "w-72",
  md: "w-80",
} as const;

export function AdminMasterDetail({
  list,
  detail,
  listWidth = "md",
  className,
}: AdminMasterDetailProps) {
  return (
    <div
      className={`flex overflow-hidden ${className ?? "h-[calc(100vh-3rem)]"}`}
    >
      <div
        className={`${LIST_WIDTH[listWidth]} shrink-0 border-r border-admin-border flex flex-col bg-admin-surface`}
      >
        {list}
      </div>
      <div className="flex-1 overflow-y-auto bg-admin-bg">{detail}</div>
    </div>
  );
}
