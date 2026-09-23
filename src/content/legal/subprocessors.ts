import type { LegalDocument } from "./types";

export const SUBPROCESSORS: LegalDocument = {
  title: "Subprocessors",
  lastUpdated: "September 23, 2026",
  intro:
    "MudKitchen by Sage Field LLC uses the subprocessors listed below to host, operate, and support the MudKitchen platform. This list applies to services that may process personal information on our behalf. School customers with a Data Processing Addendum (DPA) will be notified of material changes to this list.",
  sections: [
    {
      id: "current-list",
      title: "Current subprocessors",
      blocks: [
        {
          type: "table",
          headers: ["Provider", "Service", "Data processed", "Location"],
          rows: [
            [
              "Supabase",
              "Authentication, database, and file storage",
              "Account credentials, school and family data, uploaded documents, and application files",
              "United States",
            ],
            [
              "Stripe",
              "Payment processing",
              "Payment card details (handled by Stripe), billing metadata, and transaction records",
              "United States",
            ],
            [
              "Zoho Mail",
              "Transactional email delivery",
              "Recipient name, email address, and message content for service-related emails",
              "United States",
            ],
            [
              "Vercel",
              "Website hosting and marketing analytics",
              "Page views and technical data from our public marketing site when analytics cookies are accepted",
              "United States",
            ],
            [
              "Sentry",
              "Error monitoring and diagnostics",
              "Error reports, stack traces, and limited session replay data on pages where replay is enabled",
              "United States",
            ],
            [
              "Expo",
              "Mobile push notification delivery",
              "Device push tokens and notification payloads for the MudKitchen mobile app",
              "United States",
            ],
          ],
        },
      ],
    },
    {
      id: "school-payments",
      title: "School-configured payment accounts",
      blocks: [
        {
          type: "paragraph",
          text:
            "Schools may connect their own payment accounts through Stripe to collect application fees, tuition, and related charges from families. When a school uses this feature, Stripe processes payment information as a service provider to the school in addition to any processing performed on MudKitchen's behalf.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this list",
      blocks: [
        {
          type: "paragraph",
          text:
            "We may update this list as we add or replace subprocessors. When we make a material change that affects how school customer data is processed, we will notify affected school administrators by email and update the \"Last updated\" date on this page. We require subprocessors that process personal information on our behalf to provide appropriate contractual protections.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        {
          type: "paragraph",
          text:
            "Questions about our subprocessors can be sent to julius@trymudkitchen.com.",
        },
      ],
    },
  ],
};
