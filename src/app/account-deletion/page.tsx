import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import AccountDeletionRequestForm from "@/components/support/AccountDeletionRequestForm";
import { Badge } from "@/components/ui/Badge";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Delete Your Account",
  description:
    "Request deletion of your MudKitchen login account. Learn what is removed, what school records remain, and how to submit a request.",
  path: "/account-deletion",
});

const BREADCRUMBS = buildBreadcrumbs({
  name: "Delete Your Account",
  path: "/account-deletion",
});

export default function AccountDeletionPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <main className="bg-bg min-h-screen">
        <section className="pt-[140px] pb-20">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
            <Badge>Account</Badge>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text mt-5 max-w-[720px]">
              Delete your MudKitchen account
            </h1>
            <p className="text-[17px] font-secondary text-text-muted leading-relaxed mt-6 max-w-[720px]">
              Use this page to request deletion of your MudKitchen login account.
              If you are signed in to the MudKitchen mobile app, you can also
              start a request from your Account screen.
            </p>

            <div className="mt-10 max-w-[720px] space-y-8">
              <section className="rounded-2xl border border-black/[0.08] bg-white px-6 py-8 sm:px-8">
                <h2 className="font-display text-xl text-text">
                  What we delete
                </h2>
                <p className="mt-3 text-[15px] font-secondary text-text-muted leading-relaxed">
                  When we complete your request, MudKitchen removes:
                </p>
                <ul className="mt-4 space-y-2 text-[15px] font-secondary text-text-muted leading-relaxed list-disc pl-5">
                  <li>Your login account (email sign-in access)</li>
                  <li>Mobile push notification tokens tied to your account</li>
                  <li>Your profile photo stored in MudKitchen</li>
                  <li>Portal access links associated with your email</li>
                </ul>
              </section>

              <section className="rounded-2xl border border-black/[0.08] bg-white px-6 py-8 sm:px-8">
                <h2 className="font-display text-xl text-text">
                  What is not deleted automatically
                </h2>
                <p className="mt-3 text-[15px] font-secondary text-text-muted leading-relaxed">
                  Schools control many records in MudKitchen. Deleting your login
                  does not automatically remove school-held information such as
                  applications, enrollment records, student information,
                  messages, or billing history. Contact your school directly for
                  those requests. MudKitchen can help route or assist when a
                  school asks us to.
                </p>
              </section>

              <section className="rounded-2xl border border-black/[0.08] bg-white px-6 py-8 sm:px-8">
                <h2 className="font-display text-xl text-text">Timeline</h2>
                <p className="mt-3 text-[15px] font-secondary text-text-muted leading-relaxed">
                  We typically confirm and complete account deletion within 30
                  days. Some information may be retained where required by law,
                  for fraud prevention, or to resolve an open billing or support
                  matter. See our{" "}
                  <a href="/privacy" className="text-clay hover:underline">
                    Privacy Policy
                  </a>{" "}
                  for more detail.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-text mb-6">
                  Submit a deletion request
                </h2>
                <AccountDeletionRequestForm />
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
