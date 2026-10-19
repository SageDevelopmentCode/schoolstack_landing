import type { ReactNode } from "react";
import {
  freeToolsStorySurfaceClassName,
  freeToolsStorySurfaceStyle,
} from "@/components/marketing/free-tools/free-tools-story-surface";

export default function FreeToolsStoryShell({ children }: { children: ReactNode }) {
  return (
    <main
      className={`${freeToolsStorySurfaceClassName} min-h-screen overflow-x-clip px-4 pb-16 pt-[108px] sm:px-7 lg:px-8`}
      style={freeToolsStorySurfaceStyle()}
    >
      <div className="mx-auto min-w-0 max-w-[1180px]">{children}</div>
    </main>
  );
}
