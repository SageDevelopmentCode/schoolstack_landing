import type { ReactNode } from "react";

type GetStartedStoryShellProps = {
  wide?: boolean;
  variant?: "page" | "nested";
  children: ReactNode;
};

export default function GetStartedStoryShell({
  wide = false,
  variant = "page",
  children,
}: GetStartedStoryShellProps) {
  const isPage = variant === "page";

  return (
    <div
      className={
        isPage
          ? "min-h-screen bg-bg pt-[100px] pb-28 px-4 sm:px-6 font-secondary text-text"
          : "px-4 pb-28 pt-6 sm:px-6 font-secondary text-text"
      }
    >
      <div
        className={`${wide ? "max-w-[760px]" : "max-w-[600px]"} mx-auto transition-[max-width] duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
