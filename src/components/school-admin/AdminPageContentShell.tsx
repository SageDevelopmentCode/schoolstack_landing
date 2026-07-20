"use client";

import { useState, type ReactNode } from "react";

type AdminPageContentShellProps = {
  children: ReactNode;
};

export default function AdminPageContentShell({
  children,
}: AdminPageContentShellProps) {
  const [persistedChildren, setPersistedChildren] = useState(children);

  if (children) {
    setPersistedChildren(children);
  }

  return (
    <div className="h-full transition-opacity duration-200">
      {children ?? persistedChildren}
    </div>
  );
}
