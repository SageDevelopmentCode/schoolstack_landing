import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import EnrollmentCalculatorExperience from "@/components/marketing/enrollment-calculator/EnrollmentCalculatorExperience";
import TuitionPlannerMarketingTail from "@/components/marketing/tuition-planner/TuitionPlannerMarketingTail";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

const PATH = "/how-many-students";

const DESCRIPTION =
  "Free calculator for microschool founders. Find the enrollment you need to cover your costs and pay yourself.";

export const metadata: Metadata = pageMetadata({
  title: "Can Your School Pay You?",
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "microschool enrollment calculator",
    "how many students does a microschool need",
    "microschool tuition",
    "microschool budget",
  ],
  ogImageAlt: "Can your school pay you? — MudKitchen",
});

const BREADCRUMBS = buildBreadcrumbs({
  name: "Can your school pay you",
  path: PATH,
});

export default function HowManyStudentsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <EnrollmentCalculatorExperience />
      <TuitionPlannerMarketingTail />
      <Footer />
    </>
  );
}
