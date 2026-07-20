"use client";

import { useRef, type ReactNode } from "react";

type AdminPageContentShellProps = {
  children: ReactNode;
};

export default function AdminPageContentShell({
  children,
}: AdminPageContentShellProps) {
  const contentRef = useRef(children);
  if (children) {
    contentRef.current = children;
  }

  return (
    <div className="h-full transition-opacity duration-200">
      {contentRef.current}
    </div>
  );
}
