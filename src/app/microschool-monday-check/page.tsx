import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import MondayCheckExperience from "@/components/marketing/monday-check/MondayCheckExperience";
import { MONDAY_CHECK_INTRO_FAQS } from "@/lib/marketing/microschool-monday-check";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs, faqPageJsonLd } from "@/lib/seo";

const PATH = "/microschool-monday-check";

const DESCRIPTION =
  "Free microschool operations assessment for founders: admissions, enrollment paperwork, tuition tracking, and parent communication. Get a personalized report in about three minutes.";

export const metadata: Metadata = pageMetadata({
  title: "The Microschool Monday Check",
  description: DESCRIPTION,
  path: PATH,
  ogImageAlt: "The Microschool Monday Check — MudKitchen",
});

const BREADCRUMBS = buildBreadcrumbs({
  name: "Microschool Monday Check",
  path: PATH,
});

export default function MicroschoolMondayCheckPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageJsonLd(MONDAY_CHECK_INTRO_FAQS)),
        }}
      />
      <Navbar />
      <MondayCheckExperience />
      <Footer />
    </>
  );
}
