import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
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
    <>
      <Navbar />
      <main>
        <NotFoundExperience />
      </main>
      <Footer />
    </>
  );
}
