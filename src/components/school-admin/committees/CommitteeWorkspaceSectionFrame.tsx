"use client";

import type { ReactNode } from "react";

const WIDTH_CLASS = {
  narrow: "max-w-3xl",
  wide: "max-w-5xl",
  full: "max-w-6xl",
} as const;

type CommitteeWorkspaceSectionFrameProps = {
  children: ReactNode;
  width?: keyof typeof WIDTH_CLASS;
  className?: string;
};

export default function CommitteeWorkspaceSectionFrame({
  children,
  width = "narrow",
  className = "",
}: CommitteeWorkspaceSectionFrameProps) {
  return (
    <div className={`mx-auto w-full ${WIDTH_CLASS[width]} ${className}`.trim()}>
      {children}
    </div>
  );
}
