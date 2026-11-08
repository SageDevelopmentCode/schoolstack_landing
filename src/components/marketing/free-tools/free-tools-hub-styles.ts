import type { FreeToolsHubAccent } from "@/lib/marketing/free-tools-hub-content";

export function accentIconClasses(accent: FreeToolsHubAccent): string {
  switch (accent) {
    case "sky":
      return "bg-[#EAF1FD] text-[#1d1a16]";
    case "gold":
      return "bg-[#FFF4EC] text-clay";
    default:
      return "bg-[#E4F5EC] text-[#1d1a16]";
  }
}
