import type { FreeToolsHubAccent } from "@/lib/marketing/free-tools-hub-content";

export function accentIconClasses(accent: FreeToolsHubAccent): string {
  switch (accent) {
    case "sky":
      return "bg-[#E9F4F7] text-[#39788C]";
    case "gold":
      return "bg-[#FFF4D9] text-[#986F14]";
    default:
      return "bg-[#EAF2EB] text-[#315E4F]";
  }
}
