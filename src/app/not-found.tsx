import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import NotFoundExperience from "@/components/pages/NotFoundExperience";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Page not found",
  description:
    "This page doesn't exist—but MudKitchen can help you run your microschool.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <GardenRoot>
      <NotFoundExperience />
    </GardenRoot>
  );
}
