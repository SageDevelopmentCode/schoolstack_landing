import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import HomeShell from "@/components/home/HomeShell";
import EnrollmentCalculatorExperience from "@/components/marketing/enrollment-calculator/EnrollmentCalculatorExperience";
import MarketingToolTail from "@/components/marketing/shared/MarketingToolTail";
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
    <HomeShell className="bg-white">
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <EnrollmentCalculatorExperience />
      <MarketingToolTail />
    </HomeShell>
  );
}
