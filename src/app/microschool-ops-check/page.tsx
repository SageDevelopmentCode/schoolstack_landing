import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import MondayCheckExperience from "@/components/marketing/monday-check/MondayCheckExperience";
import { MONDAY_CHECK_INTRO_FAQS } from "@/lib/marketing/microschool-monday-check";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs, faqPageJsonLd, serializeJsonLd } from "@/lib/seo";

const PATH = "/microschool-ops-check";

const DESCRIPTION =
  "Free microschool operations assessment for founders: admissions, enrollment paperwork, tuition tracking, and parent communication. Get a personalized report in about three minutes.";

export const metadata: Metadata = pageMetadata({
  title: "Microschool Ops Check",
  description: DESCRIPTION,
  path: PATH,
  ogImageAlt: "Microschool Ops Check — MudKitchen",
});

const BREADCRUMBS = buildBreadcrumbs({
  name: "Microschool Ops Check",
  path: PATH,
});

export default function MicroschoolOpsCheckPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(faqPageJsonLd(MONDAY_CHECK_INTRO_FAQS)),
        }}
      />
      <Navbar />
      <MondayCheckExperience />
      <Footer />
    </>
  );
}
