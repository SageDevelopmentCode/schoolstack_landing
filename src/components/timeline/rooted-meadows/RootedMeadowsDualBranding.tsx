import MudKitchenDualBranding from "@/components/mudkitchen-portal/MudKitchenDualBranding";
import { ROOTED_MEADOWS_ADMIN_LOGO } from "@/data/school-demos/rootedmeadows-admin-demo";
import {
  ROOTED_MEADOWS_TIMELINE_START,
  ROOTED_MEADOWS_TIMELINE_V1,
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
    <MudKitchenDualBranding
      schoolName="Rooted Meadows"
      branding={{
        colors: {
          accent: "#827096",
          accentBright: "#6E5D7F",
          accentMid: "#6E5D7F",
          accentDark: "#5A4D68",
          accentLight: "rgba(130, 112, 150, 0.10)",
          accentGlow: "rgba(130, 112, 150, 0.12)",
          bg: "#F8FAFC",
          border: "#E2E8F0",
          borderStrong: "#CBD5E1",
          textPrimary: "#0F172A",
          textSecondary: "#64748B",
          clay: "#b3b462",
          clayBg: "rgba(179, 180, 98, 0.12)",
          clayBorder: "rgba(179, 180, 98, 0.30)",
          secondaryBtnBorder: "rgba(130, 112, 150, 0.22)",
        },
        logo: ROOTED_MEADOWS_ADMIN_LOGO,
        typography: {
          headingFont: "Lora",
          bodyFont: "Geist",
        },
      }}
      progressPercent={progress}
    />
  );
}
