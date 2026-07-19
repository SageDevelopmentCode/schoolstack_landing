import Image from "next/image";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { ROOTED_MEADOWS_ADMIN_LOGO } from "@/data/school-demos/rootedmeadows-admin-demo";
import {
  ROOTED_MEADOWS_TIMELINE_START,
  ROOTED_MEADOWS_TIMELINE_V1,
  ROOTED_MEADOWS_TIMELINE_THEME,
} from "@/data/school-demos/rooted-meadows-timeline";

function getProgressPercent(now = new Date()) {
  const start = ROOTED_MEADOWS_TIMELINE_START.getTime();
  const end = ROOTED_MEADOWS_TIMELINE_V1.getTime();
  const current = now.getTime();
  if (current <= start) return 0;
  if (current >= end) return 100;
  return Math.round(((current - start) / (end - start)) * 100);
}

export default function RootedMeadowsDualBranding() {
  const progress = getProgressPercent();

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: "rgba(250, 248, 244, 0.92)",
        borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
      }}
    >
      <div className="mx-auto flex max-w-[1100px] justify-center px-6 py-4 lg:px-16">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <Image
              src="/images/Logo.webp"
              alt="MudKitchen"
              width={28}
              height={28}
              priority
              className="h-7 w-auto shrink-0 object-contain"
            />
            <span
              className="font-secondary text-center text-[10px] font-semibold leading-tight sm:text-xs"
              style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.accent }}
            >
              MudKitchen
            </span>
          </div>
          <div
            className="h-10 w-px shrink-0 self-stretch"
            style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.border }}
            aria-hidden
          />
          <div className="flex shrink-0 items-center justify-center">
            <SchoolDemoWordmark
              logo={ROOTED_MEADOWS_ADMIN_LOGO}
              className="h-9 w-auto max-w-[160px] object-contain text-center sm:h-10 sm:max-w-[200px]"
              sizes="(max-width: 640px) 160px, 200px"
            />
          </div>
        </div>
      </div>
      <div
        className="h-1 w-full"
        style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.border }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Rollout progress toward v1"
      >
        <div
          className="h-full transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${progress}%`,
            backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.accent,
          }}
        />
      </div>
    </header>
  );
}
