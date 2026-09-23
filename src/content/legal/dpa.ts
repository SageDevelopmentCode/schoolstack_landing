import type { LegalDocument } from "./types";

export const DATA_PROCESSING_ADDENDUM: LegalDocument = {
  title: "Data Processing Addendum",
  lastUpdated: "September 23, 2026",
  intro:
    "This Data Processing Addendum (\"DPA\") forms part of the agreement between a school or educational organization (\"School\" or \"you\") and MudKitchen by Sage Field LLC, a Texas limited liability company (\"MudKitchen,\" \"we,\" \"us,\" or \"our\"), when the School uses the MudKitchen platform to process personal information about students, families, staff, and applicants. This DPA supplements our Terms of Use and Privacy Policy. If there is a conflict regarding the processing of School-controlled data, this DPA and any separate written service agreement with the School control.",
  sections: [
    {
      id: "definitions",
      title: "Definitions",
      blocks: [
        {
          type: "list",
          items: [
            "\"Personal Information\" means information that identifies or relates to an identifiable individual and is submitted to or processed through the MudKitchen platform on behalf of the School.",
            "\"School Data\" means Personal Information that the School or its authorized users submit to or generate through the platform, including student, family, staff, and applicant information.",
            "\"Process\" or \"Processing\" means any operation performed on Personal Information, including collection, storage, use, disclosure, and deletion.",
            "\"Subprocessor\" means a third party engaged by MudKitchen to process Personal Information on MudKitchen's behalf.",
          ],
        },
      ],
    },
    {
      id: "roles",
      title: "Roles of the parties",
      blocks: [
        {
          type: "paragraph",
          text:
            "The School is the controller of School Data and determines the purposes and means of processing that data. MudKitchen acts as a processor and processes School Data only on the School's documented instructions, as described in this DPA, the School's use of the platform, and applicable law.",
        },
        {
          type: "paragraph",
          text:
            "MudKitchen may act as an independent controller for information it collects for its own business purposes, such as marketing inquiries, account security logs, and billing for MudKitchen services.",
        },
      ],
    },
    {
      id: "scope-instructions",
      title: "Scope and processing instructions",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen will process School Data only to provide, maintain, secure, and support the services described in the School's agreement with MudKitchen and the features the School enables, including admissions, enrollment, attendance, messaging, billing workflows, document management, and related school operations.",
        },
        {
          type: "paragraph",
          text:
            "MudKitchen will not sell School Data, use identifiable School Data for unrelated advertising, or use identifiable student or family data for artificial intelligence model training or general product development. MudKitchen may use de-identified or aggregated information that does not identify individuals for service reliability, security, and product improvement where permitted by law and this DPA.",
        },
        {
          type: "paragraph",
          text:
            "The School instructs MudKitchen to process School Data as needed to carry out the School's configuration of the platform, including permissions granted to administrators, teachers, and other authorized users.",
        },
      ],
    },
    {
      id: "data-types",
      title: "Categories of data processed",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on the features the School uses, School Data may include:",
        },
        {
          type: "list",
          items: [
            "Student and family identifying information, enrollment records, and application responses.",
            "Emergency contacts, authorized pickup contacts, and attendance records.",
            "Health, allergy, medication, and immunization information submitted through school workflows.",
            "Photos, documents, forms, signatures, and messages uploaded or exchanged through the platform.",
            "Staff and teacher account and profile information.",
            "Payment metadata related to school charges, such as card brand, last four digits, and transaction status. Full payment card numbers are processed by our payment processor and are not stored by MudKitchen.",
          ],
        },
      ],
    },
    {
      id: "confidentiality",
      title: "Confidentiality and personnel",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen ensures that personnel authorized to process School Data are bound by confidentiality obligations. MudKitchen limits access to School Data to personnel who need it to provide support, maintain security, troubleshoot issues, or comply with law. Access to sensitive health information is restricted to authorized personnel and only as reasonably necessary for those purposes.",
        },
      ],
    },
    {
      id: "security",
      title: "Security measures",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen maintains administrative, technical, and organizational safeguards designed to protect School Data, including encryption in transit, role-based access controls, authentication protections, and organizational access restrictions within each school's environment. No security measure is perfect, and the School is responsible for configuring user permissions appropriately.",
        },
      ],
    },
    {
      id: "subprocessors",
      title: "Subprocessors",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen uses Subprocessors to host, operate, and support the platform. A current list is published at trymudkitchen.com/subprocessors. MudKitchen will impose data protection obligations on Subprocessors through contract or equivalent measures.",
        },
        {
          type: "paragraph",
          text:
            "MudKitchen will notify School administrators by email of material changes to Subprocessors that affect how School Data is processed. The School may object to a new Subprocessor on reasonable grounds related to data protection by contacting julius@trymudkitchen.com within thirty (30) days of notice. If the parties cannot resolve the objection, the School may terminate the affected services in accordance with its agreement with MudKitchen.",
        },
      ],
    },
    {
      id: "assistance",
      title: "Assistance with requests",
      blocks: [
        {
          type: "paragraph",
          text:
            "MudKitchen will reasonably assist the School in responding to requests from individuals exercising rights under applicable law, to the extent those requests relate to School Data and MudKitchen's processing activities. Individuals seeking access, correction, or deletion of School Data should generally contact the School first. MudKitchen will forward or assist with requests it receives directly when appropriate.",
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
            "MudKitchen will notify the School without undue delay after becoming aware of a confirmed security incident that materially affects School Data in MudKitchen's possession or control. Notification will include, to the extent known, a description of the incident, the categories of data involved, and the steps MudKitchen is taking to investigate and mitigate the incident. MudKitchen will cooperate with the School's reasonable requests for additional information related to the incident, subject to confidentiality and security considerations.",
        },
      ],
    },
    {
      id: "audits",
      title: "Audits and compliance information",
      blocks: [
        {
          type: "paragraph",
          text:
            "Upon reasonable written request no more than once per year, MudKitchen will provide the School with information reasonably necessary to demonstrate compliance with this DPA, such as summaries of security practices or responses to written security questionnaires. Any onsite audit must be agreed in advance, conducted during normal business hours, and subject to confidentiality obligations.",
        },
      ],
    },
    {
      id: "return-deletion",
      title: "Return and deletion",
      blocks: [
        {
          type: "paragraph",
          text:
            "Upon termination of the School's use of the platform, MudKitchen will make School Data available for export for thirty (30) days, unless a shorter or longer period is stated in the School's service agreement. After the export period, MudKitchen will delete or de-identify School Data within ninety (90) days, except where retention is required by law, needed to resolve disputes, or covered by an active legal hold.",
        },
        {
          type: "paragraph",
          text:
            "Backup copies may persist for a limited period in secure backup systems before being overwritten in the ordinary course of business. Billing, tax, and security records may be retained longer where required by law.",
        },
      ],
    },
    {
      id: "international",
      title: "International processing",
      blocks: [
        {
          type: "paragraph",
          text:
            "School Data is primarily processed in the United States. Subprocessors may process data in the United States or other locations listed at trymudkitchen.com/subprocessors. Where required by applicable law, MudKitchen will implement appropriate safeguards for cross-border transfers.",
        },
      ],
    },
    {
      id: "term",
      title: "Term and precedence",
      blocks: [
        {
          type: "paragraph",
          text:
            "This DPA remains in effect for as long as MudKitchen processes School Data on the School's behalf. Provisions that by their nature should survive termination, including confidentiality, return and deletion, and incident cooperation, will survive.",
        },
        {
          type: "paragraph",
          text:
            "Questions about this DPA can be sent to julius@trymudkitchen.com.",
        },
      ],
    },
  ],
};
