import type { ReactNode } from "react";

type GetStartedStoryShellProps = {
  wide?: boolean;
  children: ReactNode;
};

export default function GetStartedStoryShell({
  wide = false,
  children,
}: GetStartedStoryShellProps) {
  return (
    <main className="min-h-screen bg-bg pt-[100px] pb-28 px-4 sm:px-6 font-secondary text-text">
      <div
        className={`${wide ? "max-w-[760px]" : "max-w-[600px]"} mx-auto transition-[max-width] duration-300`}
      >
        {children}
      </div>
    </main>
  );
}
