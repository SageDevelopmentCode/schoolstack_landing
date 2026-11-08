import type { ReactNode } from "react";

type GetStartedStoryShellProps = {
  /** Step 1 scheduler width */
  wide?: boolean;
  /** Step 0 introduction form width */
  medium?: boolean;
  variant?: "page" | "nested";
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function GetStartedStoryShell({
  wide = false,
  medium = false,
  variant = "page",
  id,
  className = "",
  children,
}: GetStartedStoryShellProps) {
  const isPage = variant === "page";
  const nestedTopPad = className || "pt-6";
  const maxWidthClass = wide
    ? "max-w-[1020px]"
    : medium
      ? "max-w-[760px]"
      : "max-w-[600px]";

  return (
    <div
      id={id}
      className={
        isPage
          ? `min-h-screen scroll-mt-[100px] bg-white pb-28 px-4 pt-28 sm:px-6 font-secondary text-[#1d1a16] sm:pt-32 ${className}`.trim()
          : `scroll-mt-[100px] bg-white px-4 pb-28 sm:px-6 font-secondary text-[#1d1a16] ${nestedTopPad}`.trim()
      }
    >
      <div
        className={`${maxWidthClass} mx-auto transition-[max-width] duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
