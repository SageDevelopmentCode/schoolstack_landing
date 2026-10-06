import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import AboutPage from "@/components/about/AboutPage";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";
import { DEFAULT_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Meet MudKitchen founders Julius Cecilia and Sabrina Obnamia — microschool operators who built the platform while opening Sage Field in Round Rock, Texas. " +
    DEFAULT_DESCRIPTION,
  path: "/about",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "About", path: "/about" });

export default function AboutRoute() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <main className="bg-bg min-h-screen">
        <AboutPage />
      </main>
      <Footer />
    </>
  );
}
