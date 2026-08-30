"use client";

import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminHoverTipProps = {
  title: string;
  body?: string;
  children: ReactNode;
  theme?: ParentThemeTokens;
  className?: string;
};

export default function AdminHoverTip({
  title,
  body,
  children,
  theme,
  className = "",
}: AdminHoverTipProps) {
  const ink = theme?.ink ?? "#293943";
  const muted = theme?.muted ?? "#718088";

  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 w-max max-w-[220px] -translate-x-1/2 rounded-[10px] border bg-white px-2.5 py-2 text-left opacity-0 shadow-[0_9px_26px_rgba(45,70,55,0.12)] transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
        style={{ borderColor: "#E0E7E0" }}
      >
        <span className="block text-[11px] font-bold leading-snug" style={{ color: ink }}>
          {title}
        </span>
        {body ? (
          <span className="mt-0.5 block text-[10px] leading-snug" style={{ color: muted }}>
            {body}
          </span>
        ) : null}
      </span>
    </span>
  );
}
