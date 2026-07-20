"use client";

import type { ReactNode } from "react";

type AdminPageContentShellProps = {
  children: ReactNode;
};

export default function AdminPageContentShell({
  children,
}: AdminPageContentShellProps) {
  return (
    <div className="h-full transition-opacity duration-200">
      {children}
    </div>
  );
}
