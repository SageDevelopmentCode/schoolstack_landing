import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import PublicSupportForm from "@/components/support/PublicSupportForm";
import { Badge } from "@/components/ui/Badge";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "Contact the MudKitchen team for product help, billing questions, or general support.",
  path: "/support",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Support", path: "/support" });

export default function SupportPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <main className="bg-bg min-h-screen">
        <section className="pt-[140px] pb-20">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
            <Badge>Support</Badge>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text mt-5 max-w-[720px]">
              How can we help?
            </h1>
            <p className="text-[17px] font-secondary text-text-muted leading-relaxed mt-6 max-w-[720px]">
              Send us a message and the MudKitchen team will follow up — usually
              within one business day. For a live walkthrough, you can also{" "}
              <a href="/get-started" className="text-clay hover:underline">
                book a demo
              </a>
              .
            </p>

            <div className="mt-10 max-w-[720px]">
              <PublicSupportForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
