"use client";

import HomeGardenShell from "@/components/garden/HomeGardenShell";
import FreeToolsPostcards from "./FreeToolsPostcards";
import GardenBookDemo from "./GardenBookDemo";
import GardenFaq from "./GardenFaq";
import AppStrip from "./sections/AppStrip";
import DayTrack from "./sections/DayTrack";
import Hero from "./sections/Hero";
import MessyDesk from "./sections/MessyDesk";
import PricingPaper from "./sections/PricingPaper";
import RolePanels from "./sections/RolePanels";
import SetupNotes from "./sections/SetupNotes";
import StoryTicket from "./sections/StoryTicket";

/** MudKitchen home page ("A Day at School"), built with the Garden design system. */
export default function HomeGardenPage() {
  return (
    <HomeGardenShell>
      <Hero />
      <MessyDesk />
      <DayTrack />
      <RolePanels />
      <AppStrip />
      <StoryTicket />
      <SetupNotes />
      <PricingPaper />
      <FreeToolsPostcards className="bg-[var(--sf-paper)]" />
      <GardenFaq />
      <GardenBookDemo className="bg-[var(--sf-sky)]/45" />
    </HomeGardenShell>
  );
}
