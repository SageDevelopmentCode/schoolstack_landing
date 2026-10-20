import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import DownloadPageClient from "@/components/download/DownloadPageClient";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Download the app",
  description:
    "Get the MudKitchen mobile app for families, teachers, and school admins — messages, tuition, enrollment, and more.",
  path: "/download",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Download", path: "/download" });

export default function DownloadPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <main className="min-h-screen bg-bg font-secondary text-text">
        <DownloadPageClient />
      </main>
      <Footer />
    </>
  );
}
