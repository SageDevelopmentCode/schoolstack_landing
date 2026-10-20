import type { ReactNode } from "react";

type GetStartedStoryShellProps = {
  /** Step 1 scheduler width */
  wide?: boolean;
  /** Step 0 introduction form width */
  medium?: boolean;
  variant?: "page" | "nested";
  id?: string;
  children: ReactNode;
};

export default function GetStartedStoryShell({
  wide = false,
  medium = false,
  variant = "page",
  id,
  children,
}: GetStartedStoryShellProps) {
  const isPage = variant === "page";
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
          ? "min-h-screen scroll-mt-[100px] bg-bg pt-[100px] pb-28 px-4 sm:px-6 font-secondary text-text"
          : "scroll-mt-[100px] px-4 pb-28 pt-6 sm:px-6 font-secondary text-text"
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
