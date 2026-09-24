import type { LegalDocument } from "./types";

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "September 23, 2026",
  intro:
    "MudKitchen by Sage Field LLC (\"MudKitchen,\" \"we,\" \"us,\" or \"our\") provides school management software for microschools and private schools. This Privacy Policy explains how we collect, use, share, and retain information when you visit trymudkitchen.com, use our mobile app, or access a school-branded portal powered by MudKitchen. School customers should also review our Data Processing Addendum at trymudkitchen.com/dpa.",
  sections: [
    {
      id: "scope",
      title: "Scope",
      blocks: [
        {
          type: "paragraph",
          text:
            "This policy applies to our website, school-branded web portals (such as parent, teacher, and admin portals), our mobile app, and related services operated by MudKitchen by Sage Field LLC in Texas.",
        },
        {
          type: "paragraph",
          text:
            "When a school uses MudKitchen, the school is generally responsible for student and family information it collects and manages through the platform. MudKitchen processes that information on the school's behalf as described in our Data Processing Addendum.",
        },
      ],
    },
    {
      id: "roles",
      title: "Our role and school responsibilities",
      blocks: [
        {
          type: "paragraph",
          text:
            "Schools that use MudKitchen typically act as the data controller for education records and family information about their students. MudKitchen acts as a service provider that hosts, stores, and processes that information so schools can run admissions, enrollment, billing, communication, and daily operations.",
        },
        {
          type: "paragraph",
          text:
            "If you are a parent, teacher, or applicant, requests about how a school uses your information should usually be directed to the school. We will help schools respond when needed and handle direct requests about information MudKitchen collects for its own business purposes.",
        },
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      blocks: [
        {
          type: "paragraph",
          text: "The information we collect depends on how you interact with MudKitchen:",
        },
        {
          type: "list",
          items: [
            "Marketing visitors: name, email address, school name, role, message content, and other details you submit through demo requests, contact forms, or feedback widgets.",
            "Applicants and parents: name, email address, phone number, mailing address, child information, application responses, uploaded documents, enrollment agreements and signatures, emergency contacts, authorized pickup contacts, health and immunization information, attendance and pickup records, messages, form responses, and billing details.",
            "Teachers: name, email address, role title, profile photo, messages, and forms or documents they create or send to families.",
            "School administrators: account information, organization membership and role, support requests (including attachments), and access to school data needed to administer the platform.",
            "Payment information: payment card details are collected and processed by our payment processor. MudKitchen stores limited payment metadata such as card brand, last four digits, and expiration date when families save a payment method. MudKitchen does not store full bank account numbers.",
            "Device and notification data: mobile push notification tokens, web push subscription endpoints and encryption keys, and browser or device information needed to deliver notifications.",
            "Automatically collected data: authentication and security logs, page views on our marketing site when analytics cookies are accepted, error reports, and operational activity events such as sign-in attempts.",
          ],
        },
        {
          type: "paragraph",
          text:
            "Students do not create their own MudKitchen login accounts. Adults authorized by the school—such as parents, guardians, teachers, and school staff—access student information through school-configured portals.",
        },
      ],
    },
    {
      id: "data-summary",
      title: "Summary of data categories",
      blocks: [
        {
          type: "paragraph",
          text:
            "The table below summarizes major categories of information, who controls them, and how they are handled. It is a summary; additional detail appears in the sections below and in our DPA for school customers.",
        },
        {
          type: "table",
          headers: [
            "Data category",
            "Who controls it",
            "Why it is used",
            "Who may receive it",
            "Retention",
          ],
          rows: [
            [
              "Student and family records (enrollment, attendance, messages, documents)",
              "School",
              "School operations through MudKitchen",
              "School staff, families, and MudKitchen service providers",
              "Duration of school subscription plus export/deletion period in DPA",
            ],
            [
              "Health and immunization information",
              "School",
              "Health, safety, and enrollment workflows authorized by the school",
              "Authorized school staff, families, and limited MudKitchen personnel for support and security",
              "Duration of school subscription plus export/deletion period in DPA",
            ],
            [
              "Payment metadata for school charges",
              "School / family",
              "Processing tuition and fees configured by the school",
              "Payment processor and authorized school administrators",
              "As needed for transactions, disputes, and legal requirements",
            ],
            [
              "Portal account and authentication data",
              "MudKitchen / user",
              "Account access and security",
              "MudKitchen infrastructure and support providers",
              "While account is active, then per security log retention",
            ],
            [
              "Marketing and demo inquiries",
              "MudKitchen",
              "Respond to inquiries and operate our business",
              "MudKitchen and email/support providers",
              "Until deletion request or reasonable business need ends",
            ],
            [
              "Security and error logs",
              "MudKitchen",
              "Security, fraud prevention, and troubleshooting",
              "MudKitchen and monitoring providers",
              "Generally up to 12 months, unless longer retention is required",
            ],
          ],
        },
      ],
    },
    {
      id: "how-we-use",
      title: "How we use information",
      blocks: [
        {
          type: "list",
          items: [
            "Provide, operate, maintain, and secure the MudKitchen platform and mobile app.",
            "Authenticate users and protect accounts.",
            "Process admissions, enrollment, tuition, and other school workflows configured by the school.",
            "Send transactional emails and notifications related to school activity.",
            "Provide customer support and respond to inquiries.",
            "Monitor reliability, troubleshoot errors, and protect against abuse.",
            "Understand how our public marketing site is used when analytics cookies are accepted.",
            "Comply with legal obligations and enforce our terms.",
          ],
        },
        {
          type: "paragraph",
          text:
            "We use identifiable school, student, and family data only to provide, secure, and support the service for the school that submitted or controls that data. We do not use identifiable student or family data for artificial intelligence model training, unrelated advertising, or general product development.",
        },
        {
          type: "paragraph",
          text:
            "We may use de-identified or aggregated information that does not identify individuals for service reliability, security analysis, and product improvement where permitted by law and our agreements with schools.",
        },
      ],
    },
    {
      id: "sensitive-data",
      title: "Sensitive information",
      blocks: [
        {
          type: "paragraph",
          text:
            "Schools may collect sensitive information through MudKitchen, including student health conditions, allergies, medications, immunization records, and related documents. Schools are responsible for obtaining any notices and consents required to collect this information.",
        },
        {
          type: "paragraph",
          text:
            "MudKitchen personnel may access sensitive information only when reasonably necessary to provide support, maintain security, troubleshoot technical issues, or comply with law. Access is limited by role and organizational permissions configured by the school.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies, analytics, and session replay",
      blocks: [
        {
          type: "paragraph",
          text:
            "We use cookies and similar technologies to operate MudKitchen and understand how our marketing site is used.",
        },
        {
          type: "list",
          items: [
            "Essential cookies: required for authentication, session management, and security. These are set when you sign in to a MudKitchen portal and are necessary for the service to function.",
            "Analytics cookies: used only on our public marketing pages when you accept analytics through our cookie banner. These help us understand page visits and usage patterns on the marketing site.",
            "Error monitoring: we use error monitoring tools to capture errors and limited diagnostic information. Session replay is disabled on our homepage, parent portals, application flows, and public school forms. On other pages where replay may be enabled, text and media masking are applied, but masking may not capture every sensitive field entered into a form.",
          ],
        },
        {
          type: "paragraph",
          text:
            "You can manage analytics cookie preferences through the cookie banner on our marketing site. Essential cookies cannot be disabled while using authenticated portal features. Diagnostic logs and replay data are retained only as long as reasonably necessary for troubleshooting and security.",
        },
      ],
    },
    {
      id: "third-parties",
      title: "Third-party service providers",
      blocks: [
        {
          type: "paragraph",
          text:
            "We use trusted service providers to operate MudKitchen. These providers process information on our behalf and only as needed to deliver their services. A current list of subprocessors, including the services they provide and where data is processed, is available at trymudkitchen.com/subprocessors.",
        },
        {
          type: "paragraph",
          text:
            "We will notify school administrators by email of material changes to subprocessors that affect how school customer data is processed. Schools may also connect or configure third-party payment accounts to collect charges from families.",
        },
      ],
    },
    {
      id: "sharing",
      title: "How we share information",
      blocks: [
        {
          type: "list",
          items: [
            "With the school whose portal you are using, so administrators, teachers, and authorized staff can run school operations.",
            "With service providers listed on our subprocessor page, under contractual safeguards.",
            "When required by law, legal process, or to protect rights, safety, and security.",
            "In connection with a merger, acquisition, or similar business transaction, subject to appropriate protections.",
          ],
        },
        {
          type: "paragraph",
          text: "We do not sell personal information.",
        },
      ],
    },
    {
      id: "retention-security",
      title: "Data retention and security",
      blocks: [
        {
          type: "paragraph",
          text: "We retain information according to the following general schedule:",
        },
        {
          type: "list",
          items: [
            "School-controlled data: for the duration of the school's subscription and a post-termination export period, then deleted or de-identified as described in our DPA, except where retention is required by law or subject to a legal hold.",
            "Marketing and demo inquiries: until you request deletion or the information is no longer needed for our business purposes.",
            "Security and authentication logs: generally up to 12 months, unless a longer period is required for security investigations or legal compliance.",
            "Backup copies: retained in secure backups for a limited rolling period before being overwritten.",
            "Billing and transaction records: retained as required for accounting, tax, and dispute resolution.",
          ],
        },
        {
          type: "paragraph",
          text:
            "We use administrative, technical, and organizational safeguards designed to protect information, including access controls, encryption in transit, and role-based permissions within school organizations. No method of transmission or storage is completely secure.",
        },
      ],
    },
    {
      id: "incidents",
      title: "Security incidents",
      blocks: [
        {
          type: "paragraph",
          text:
            "If we become aware of a confirmed security incident that materially affects school customer data in our possession or control, we will notify the affected school without undue delay and cooperate with the school's reasonable requests for information, as further described in our DPA.",
        },
      ],
    },
    {
      id: "children",
      title: "Children's and student information",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen is designed for use by schools and the adults they authorize. We do not offer student login accounts and do not knowingly collect personal information directly from children under 13 outside of a school-authorized workflow.",
        },
        {
          type: "paragraph",
          text:
            "Schools are responsible for determining that they have appropriate authority, notices, and consents to collect student information through MudKitchen, including health records, photos, and enrollment documents. MudKitchen processes student information only to provide school-benefit services requested by the school.",
        },
        {
          type: "paragraph",
          text:
            "Parents and schools may review and update much student information through the school's configured portal. To request deletion or correction of school-controlled student information, contact the school first. If the school asks us to assist, or if you need help routing a request, contact us at julius@trymudkitchen.com.",
        },
        {
          type: "paragraph",
          text:
            "If a school's authorization to use MudKitchen ends, the school's access to student data through the platform will end and data will be handled according to our DPA, including any export period and subsequent deletion.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your choices and rights",
      blocks: [
        {
          type: "paragraph",
          text: "How to exercise rights depends on who controls the information:",
        },
        {
          type: "list",
          items: [
            "School-controlled records: contact the school. MudKitchen will forward or assist with requests we receive directly when appropriate.",
            "MudKitchen-controlled data (marketing inquiries, account security data, and similar information): contact julius@trymudkitchen.com.",
            "Portal account information: access or update through your portal where available.",
            "Marketing analytics cookies: manage preferences through our cookie banner on the marketing site.",
            "Push notifications: disable in your device or browser settings.",
          ],
        },
      ],
    },
    {
      id: "account-deletion",
      title: "Account deletion",
      blocks: [
        {
          type: "paragraph",
          text:
            "If you have a MudKitchen login (for example, as a parent, teacher, or school administrator), you can request deletion of your account from the Account screen in the MudKitchen mobile app or at trymudkitchen.com/account-deletion.",
        },
        {
          type: "paragraph",
          text:
            "When we complete an account deletion request, MudKitchen removes your login access, push notification tokens, and profile photo stored in MudKitchen. School-controlled records — such as applications, enrollment information, student records, messages, and billing history — are not deleted automatically and should be requested from the school. MudKitchen can assist when a school asks us to help.",
        },
      ],
    },
    {
      id: "california",
      title: "California residents",
      blocks: [
        {
          type: "paragraph",
          text:
            "If you are a California resident, you may have rights to know, access, correct, or delete certain personal information, and to opt out of the sale or sharing of personal information, where applicable law covers MudKitchen's processing and the information at issue. MudKitchen does not sell personal information.",
        },
        {
          type: "paragraph",
          text:
            "For information MudKitchen controls directly, contact julius@trymudkitchen.com. For student or family records controlled by a school, contact the school. MudKitchen will assist schools with applicable requests as described in our DPA.",
        },
      ],
    },
    {
      id: "international",
      title: "International users",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen by Sage Field LLC is based in the United States. School Data is primarily processed in the United States. If you access MudKitchen from outside the United States, your information may be processed in the United States and other countries where our subprocessors operate, as listed at trymudkitchen.com/subprocessors.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          type: "paragraph",
          text:
            "We may update this Privacy Policy from time to time. When we do, we will revise the \"Last updated\" date above. Continued use of MudKitchen after changes become effective means you accept the updated policy.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen by Sage Field LLC\nTexas, United States\njulius@trymudkitchen.com",
        },
      ],
    },
  ],
};
