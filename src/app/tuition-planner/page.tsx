import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import TuitionPlannerExperience from "@/components/marketing/tuition-planner/TuitionPlannerExperience";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

const PATH = "/tuition-planner";

const DESCRIPTION =
  "Start with your school today. Try a different tuition or enrollment, and see how your annual tuition revenue changes.";

export const metadata: Metadata = pageMetadata({
  title: "A clearer view of your next tuition plan.",
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "microschool tuition planner",
    "tuition increase calculator",
    "microschool sibling discount",
    "part-time microschool tuition",
  ],
  ogImageAlt: "A clearer view of your next tuition plan. — MudKitchen",
});

const BREADCRUMBS = buildBreadcrumbs({
  name: "Tuition planner",
  path: PATH,
});

export default function TuitionPlannerPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <TuitionPlannerExperience />
      <Footer />
    </>
  );
}
