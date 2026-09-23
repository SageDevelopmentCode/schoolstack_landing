import type { LegalDocument } from "./types";

export const TERMS_OF_USE: LegalDocument = {
  title: "Terms of Use",
  lastUpdated: "September 23, 2026",
  intro:
    "These Terms of Use (\"Terms\") govern access to and use of the MudKitchen website, mobile app, and school-branded portals operated by MudKitchen by Sage Field LLC, a Texas limited liability company (\"MudKitchen,\" \"we,\" \"us,\" or \"our\"). By using MudKitchen, you agree to these Terms.",
  sections: [
    {
      id: "agreement",
      title: "Agreement to terms",
      blocks: [
        {
          type: "paragraph",
          text:
            "These Terms form a binding agreement between you and MudKitchen by Sage Field LLC. If you do not agree, do not use the service.",
        },
      ],
    },
    {
      id: "who-applies",
      title: "Who these Terms apply to",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen serves two types of users:",
        },
        {
          type: "list",
          items: [
            "School Customers: schools or educational organizations that subscribe to or use MudKitchen to manage their operations. School Customers are also subject to any separate service agreement and our Data Processing Addendum (DPA) at trymudkitchen.com/dpa.",
            "Portal Users: parents, guardians, teachers, applicants, and other individuals who access a school-branded MudKitchen portal authorized by a School Customer.",
          ],
        },
        {
          type: "paragraph",
          text:
            "If there is a conflict between these Terms and a written service agreement or the DPA regarding School Data, the service agreement and DPA control for School Customers.",
        },
      ],
    },
    {
      id: "service",
      title: "The service",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen provides software for microschools and private schools, including tools for admissions, enrollment, tuition and billing, parent and teacher portals, messaging, student records, and school operations. Features may change over time as we maintain and improve the platform.",
        },
        {
          type: "paragraph",
          text:
            "We use reasonable efforts to keep the service available, but we do not guarantee uninterrupted access. We may perform maintenance, updates, or changes that temporarily affect availability.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility",
      blocks: [
        {
          type: "list",
          items: [
            "School administrators and staff must be at least 18 years old and authorized to act on behalf of their school.",
            "Parents, teachers, and applicants generally access MudKitchen through a school that has enabled the platform.",
            "Students do not create their own MudKitchen login accounts.",
            "You are responsible for ensuring that your use of MudKitchen complies with applicable law and school policies.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      title: "Accounts and security",
      blocks: [
        {
          type: "paragraph",
          text:
            "You may sign in using email-based authentication methods made available by MudKitchen, such as one-time passcodes or passwords. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
        },
        {
          type: "paragraph",
          text:
            "Notify your school or MudKitchen promptly if you believe your account has been compromised.",
        },
      ],
    },
    {
      id: "school-duties",
      title: "School Customer responsibilities",
      blocks: [
        {
          type: "paragraph",
          text: "School Customers agree to:",
        },
        {
          type: "list",
          items: [
            "Have authority to submit School Data and configure the platform for their organization.",
            "Provide required notices and obtain required consents from families, staff, and applicants.",
            "Configure user permissions, roles, and access controls appropriately.",
            "Ensure enrollment, billing, and communication policies are accurate and lawful.",
            "Respond to individual rights requests relating to School Data, with MudKitchen's assistance as described in the DPA.",
            "Use the service in compliance with applicable education, privacy, and employment laws.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      blocks: [
        {
          type: "paragraph",
          text: "You agree not to:",
        },
        {
          type: "list",
          items: [
            "Use MudKitchen for unlawful, harmful, or fraudulent purposes.",
            "Access or attempt to access accounts, data, or systems without authorization.",
            "Interfere with or disrupt the integrity or performance of the service.",
            "Upload malware or content that infringes intellectual property or privacy rights.",
            "Scrape, reverse engineer, or attempt to extract source code except as permitted by law.",
            "Misrepresent your identity or affiliation with a school.",
          ],
        },
      ],
    },
    {
      id: "school-content",
      title: "School content and data",
      blocks: [
        {
          type: "paragraph",
          text:
            "Schools retain ownership of the content and data they submit to MudKitchen, including branding, forms, documents, and family or student information. Schools grant MudKitchen a limited license to host, store, process, back up, display, and support that content solely to provide and secure the service for the school.",
        },
        {
          type: "paragraph",
          text:
            "This license does not permit MudKitchen to use identifiable student or family records for unrelated product development or artificial intelligence model training. MudKitchen may use de-identified or aggregated information that does not identify individuals for service reliability, security, and product improvement where permitted by law and the DPA.",
        },
      ],
    },
    {
      id: "payments",
      title: "Payments",
      blocks: [
        {
          type: "paragraph",
          text:
            "Application fees, tuition, and other school charges may be processed through third-party payment providers. Payment card information is handled by those providers according to their terms and privacy practices. MudKitchen does not control school tuition funds and does not store full payment card numbers.",
        },
        {
          type: "paragraph",
          text:
            "Schools configure pricing, fees, refunds, and billing policies for their families. Disputes over school charges, refunds, failed payments, or chargebacks are between the family and the school, except for fees owed directly to MudKitchen under a separate service agreement.",
        },
      ],
    },
    {
      id: "third-party",
      title: "Third-party services",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen integrates with third-party services such as payment processors, cloud infrastructure providers, email providers, analytics, and push notification services. A current list is available at trymudkitchen.com/subprocessors. Your use of those services may be subject to their own terms and policies.",
        },
      ],
    },
    {
      id: "support-export",
      title: "Support and data export",
      blocks: [
        {
          type: "paragraph",
          text:
            "School Customers may contact julius@trymudkitchen.com for support. Upon termination, School Customers may export School Data during the export period described in the DPA before deletion.",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen and its licensors own the platform, software, design, and branding, excluding school-provided content. You may not copy, modify, or distribute MudKitchen materials except as allowed by these Terms or a separate written agreement.",
        },
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen is provided on an \"as is\" and \"as available\" basis. To the fullest extent permitted by law, MudKitchen disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.",
        },
        {
          type: "paragraph",
          text:
            "MudKitchen does not provide legal, educational, medical, or financial advice. Schools remain responsible for their educational programs, policies, and regulatory obligations.",
        },
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      blocks: [
        {
          type: "paragraph",
          text:
            "To the fullest extent permitted by law, MudKitchen will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenues, data, or goodwill arising from your use of the service.",
        },
        {
          type: "paragraph",
          text:
            "Except for liability that cannot be limited under applicable law, including liability arising from gross negligence or willful misconduct, MudKitchen's total liability for any claim arising out of or relating to the service will not exceed the greater of one hundred U.S. dollars (USD $100) or the amount you paid MudKitchen, if any, in the twelve months before the event giving rise to the claim. For School Customers with a paid service agreement, the cap is the fees paid to MudKitchen in the twelve months before the claim, unless a different cap is stated in the service agreement.",
        },
      ],
    },
    {
      id: "indemnification",
      title: "Indemnification",
      blocks: [
        {
          type: "paragraph",
          text:
            "You agree to indemnify and hold harmless MudKitchen from claims, damages, losses, and expenses (including reasonable attorneys' fees) arising from your misuse of the service, violation of these Terms, or infringement of another party's rights, except to the extent caused by MudKitchen's gross negligence or willful misconduct.",
        },
        {
          type: "paragraph",
          text:
            "School Customers and MudKitchen may agree to additional mutual indemnity obligations in a separate service agreement, including for confidentiality and data protection matters.",
        },
      ],
    },
    {
      id: "termination",
      title: "Suspension, termination, and data handling",
      blocks: [
        {
          type: "paragraph",
          text:
            "We may suspend or terminate access to MudKitchen if we reasonably believe you violated these Terms, pose a security risk, or if required by law. Schools may also revoke access for their users.",
        },
        {
          type: "paragraph",
          text:
            "When a School Customer's subscription ends, School Data will be made available for export during the period described in the DPA and then deleted or de-identified, except where retention is required by law or subject to a legal hold. Provisions that by their nature should survive termination will survive.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing law and venue",
      blocks: [
        {
          type: "paragraph",
          text:
            "These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Except where applicable law requires otherwise, any dispute arising from these Terms or the service will be brought in the state or federal courts located in Texas, and each party consents to personal jurisdiction in those courts.",
        },
      ],
    },
    {
      id: "changes-contact",
      title: "Changes and contact",
      blocks: [
        {
          type: "paragraph",
          text:
            "We may update these Terms from time to time. If we make material changes, we will post the updated Terms and revise the \"Last updated\" date. Continued use after changes become effective constitutes acceptance.",
        },
        {
          type: "paragraph",
          text:
            "MudKitchen by Sage Field LLC\nTexas, United States\njulius@trymudkitchen.com",
        },
      ],
    },
  ],
};
