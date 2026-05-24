import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Website Demo — MudKitchen",
  description: "Explore a sample microschool website built with MudKitchen.",
};

export default function WebsiteDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
