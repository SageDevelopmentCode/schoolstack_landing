import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import TuitionPlannerExperience from "@/components/marketing/tuition-planner/TuitionPlannerExperience";
import TuitionPlannerMarketingTail from "@/components/marketing/tuition-planner/TuitionPlannerMarketingTail";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

const PATH = "/tuition-planner";

const DESCRIPTION =
  "Start with what you collect today. Change tuition or enrollment and see the difference in annual revenue before you tell families.";

export const metadata: Metadata = pageMetadata({
  title: "What would your annual tuition revenue be?",
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "microschool tuition planner",
    "tuition increase calculator",
    "microschool sibling discount",
    "part-time microschool tuition",
  ],
  ogImageAlt: "What would your annual tuition revenue be? — MudKitchen",
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
      <TuitionPlannerMarketingTail />
      <Footer />
    </>
  );
}
