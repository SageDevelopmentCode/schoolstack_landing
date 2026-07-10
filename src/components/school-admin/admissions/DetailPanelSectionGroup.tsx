"use client";

import { Children, type ReactNode } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type DetailPanelSectionGroupProps = {
  C: AdminThemeTokens;
  children: ReactNode;
  className?: string;
};

export default function DetailPanelSectionGroup({
  C,
  children,
  className = "",
}: DetailPanelSectionGroupProps) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <div className={`flex flex-col ${className}`}>
      {items.map((child, index) => (
        <div
          key={index}
          className={index > 0 ? "mt-8 border-t pt-8" : undefined}
          style={index > 0 ? { borderTopColor: C.border } : undefined}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
