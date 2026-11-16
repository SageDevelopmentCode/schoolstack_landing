"use client";

import HomeGardenShell from "@/components/garden/HomeGardenShell";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import SagefieldGardenBeforeAfter from "./SagefieldGardenBeforeAfter";
import SagefieldGardenChallenge from "./SagefieldGardenChallenge";
import SagefieldGardenGallery from "./SagefieldGardenGallery";
import SagefieldGardenHero from "./SagefieldGardenHero";
import SagefieldGardenLiveSite from "./SagefieldGardenLiveSite";
import SagefieldGardenOutcomes from "./SagefieldGardenOutcomes";
import SagefieldGardenTakeaways from "./SagefieldGardenTakeaways";
import SagefieldGardenTimeline from "./SagefieldGardenTimeline";
import SagefieldGardenWhy from "./SagefieldGardenWhy";

/** /customers/sagefield case study in the Garden design system. */
export default function SagefieldGardenPage() {
  return (
    <HomeGardenShell>
      <SagefieldGardenHero />
      <SagefieldGardenChallenge />
      <SagefieldGardenTimeline />
      <SagefieldGardenLiveSite />
      <SagefieldGardenOutcomes />
      <SagefieldGardenBeforeAfter />
      <SagefieldGardenWhy />
      <SagefieldGardenGallery />
      <SagefieldGardenTakeaways />
      <GardenBookDemo className="bg-[var(--sf-sky)]/45" />
    </HomeGardenShell>
  );
}
