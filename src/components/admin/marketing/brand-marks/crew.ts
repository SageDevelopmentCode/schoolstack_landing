import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import type { PatternKind } from "@/components/admin/marketing/brand-marks/mark-kit";

/** The MudKitchen crew: who stands for which feature, plus their sticker backdrop. */
export const CREW: Array<{
  name: MascotName;
  label: string;
  feature: string;
  /** One-word feature label for small tags. */
  short: string;
  view: MascotView;
  base: string;
  pattern: PatternKind;
  dark?: boolean;
}> = [
  { name: "pip", label: "Pip", feature: "Enrollment", short: "Enrollment", view: "wave", base: "#F8DDCF", pattern: "dots" },
  { name: "terra", label: "Terra", feature: "School website", short: "Website", view: "happy", base: "#DDEBD5", pattern: "gingham" },
  { name: "nutmeg", label: "Nutmeg", feature: "Tuition & billing", short: "Billing", view: "thumbs", base: "#FFE58A", pattern: "stripes" },
  { name: "dig", label: "Dig", feature: "Admin portal", short: "Admin", view: "happy", base: "#E3EDFB", pattern: "grid" },
  { name: "fennel", label: "Fennel", feature: "Attendance", short: "Attendance", view: "excited", base: "#E4F2D9", pattern: "polka" },
  { name: "clover", label: "Clover", feature: "Timeclock", short: "Timeclock", view: "wave", base: "#FFF1B8", pattern: "checker" },
  { name: "marigold", label: "Marigold", feature: "Marketing", short: "Marketing", view: "love", base: "#FCE3C8", pattern: "sprinkles" },
  { name: "loam", label: "Loam", feature: "Messages", short: "Messages", view: "wink", base: "#F6D9D2", pattern: "waves" },
  { name: "dot", label: "Dot", feature: "Calendar & events", short: "Calendar", view: "happy", base: "#FDE7E4", pattern: "polka" },
  { name: "flicker", label: "Flicker", feature: "Photos", short: "Photos", view: "excited", base: "#2A2238", pattern: "stars", dark: true },
  { name: "bramble", label: "Bramble", feature: "Forms", short: "Forms", view: "cheeky", base: "#EFE3D3", pattern: "gingham" },
  { name: "tansy", label: "Tansy", feature: "Committees", short: "Committees", view: "celebrate", base: "#ECE2F3", pattern: "stripes" },
];

export const crewMember = (name: MascotName) => CREW.find((c) => c.name === name) ?? CREW[0];
