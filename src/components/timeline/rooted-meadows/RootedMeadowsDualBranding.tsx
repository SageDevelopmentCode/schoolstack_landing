import MudKitchenDualBranding from "@/components/mudkitchen-portal/MudKitchenDualBranding";
import { ROOTED_MEADOWS_PORTAL_BRANDING } from "@/data/school-demos/rooted-meadows-portal-branding";
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
      branding={ROOTED_MEADOWS_PORTAL_BRANDING}
      progressPercent={progress}
    />
  );
}
