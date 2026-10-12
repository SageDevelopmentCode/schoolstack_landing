"use client";

import type { ReactNode } from "react";

type AdminPageContentShellProps = {
  children: ReactNode;
};

export default function AdminPageContentShell({
  children,
}: AdminPageContentShellProps) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col transition-opacity duration-200">
      {children}
    </div>
  );
}
