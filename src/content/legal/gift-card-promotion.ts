import type { LegalDocument } from "./types";

/**
 * Terms for the $200 Amazon gift card offer. Keep the dates, amount and windows
 * in step with GIFT_CARD_OFFER (src/lib/marketing/gift-card-offer.ts).
 */
export const GIFT_CARD_PROMOTION_TERMS: LegalDocument = {
  title: "$200 Amazon Gift Card Offer Terms",
  lastUpdated: "November 18, 2026",
  intro:
    "These terms (\"Offer Terms\") govern the MudKitchen $200 Amazon gift card offer (the \"Offer\") run by MudKitchen by Sage Field LLC, a Texas limited liability company (\"MudKitchen,\" \"we,\" \"us,\" or \"our\"). By booking a demo under the Offer, you agree to these Offer Terms. No purchase is required to book or attend a demo, but a paid MudKitchen plan is required to receive the gift card.",
  sections: [
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "list",
          items: [
            "Book and attend a full MudKitchen product demo held on or before December 31, 2026.",
            "Start a paid MudKitchen plan within 30 days after that demo, with your first payment successfully processed.",
            "We email a $200 Amazon.com eGift card within 10 business days after that first payment.",
          ],
        },
      ],
    },
    {
      id: "offer-period",
      title: "Offer period",
      blocks: [
        {
          type: "paragraph",
          text:
            "The Offer begins November 18, 2026. To qualify, your demo must be held on or before 11:59 p.m. Central Time on December 31, 2026. A demo booked before that time but held after it does not qualify.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "Who is eligible",
      blocks: [
        {
          type: "paragraph",
          text: "To be eligible, you must be:",
        },
        {
          type: "list",
          items: [
            "At least 18 years old and a resident of the United States.",
            "A founder, owner, director or other decision-maker of a microschool, small private school, homeschool co-op, or similar learning program that operates in the United States or plans to open within 12 months of your demo.",
            "A new prospect. Current MudKitchen customers, and schools that have had a paid MudKitchen plan in the past, are not eligible.",
          ],
        },
        {
          type: "paragraph",
          text:
            "Employees of MudKitchen and Sage Field LLC and their immediate family members are not eligible. Employees of government agencies and public schools, and anyone whose employer's policies or applicable law prohibit them from accepting a gift card, are not eligible. You are responsible for confirming that you are allowed to accept the gift card.",
        },
      ],
    },
    {
      id: "how-to-qualify",
      title: "How to qualify",
      blocks: [
        {
          type: "list",
          items: [
            "Book a demo through trymudkitchen.com using your real name and an email address you can receive mail at.",
            "Attend the full scheduled demo. No-shows, demos that end early at your request, and demos with someone other than an eligible person do not qualify.",
            "Within 30 days after the demo, start a paid MudKitchen plan for your school. The plan counts once your first payment has been successfully processed. A free account, a trial, or an unpaid invoice does not count.",
          ],
        },
      ],
    },
    {
      id: "reward",
      title: "The gift card",
      blocks: [
        {
          type: "paragraph",
          text:
            "Each qualifying school receives one $200 Amazon.com eGift card. We send it by email to the address used to book the demo, within 10 business days after your first payment is processed. If that payment is refunded, charged back, or reversed before the gift card is sent, the gift card will not be issued.",
        },
        {
          type: "paragraph",
          text:
            "The gift card has no cash value and cannot be exchanged for cash, credit toward MudKitchen fees, or any other reward. It is not transferable. We are not responsible for gift cards that are lost, stolen, or misdirected after delivery to the email address you provided.",
        },
      ],
    },
    {
      id: "limits",
      title: "Limits",
      blocks: [
        {
          type: "paragraph",
          text:
            "Limit one gift card per person and one per school, regardless of how many people attend the demo or how many demos are booked. The Offer cannot be combined with other MudKitchen promotions unless we say so in writing.",
        },
      ],
    },
    {
      id: "amazon",
      title: "Amazon is not a sponsor",
      blocks: [
        {
          type: "paragraph",
          text:
            "Amazon is not a sponsor of this Offer. Amazon.com Gift Cards are subject to Amazon's own terms and conditions, which are available at amazon.com/gc-legal. Amazon and all related marks are trademarks of Amazon.com, Inc. or its affiliates.",
        },
      ],
    },
    {
      id: "verification",
      title: "Verification and fraud",
      blocks: [
        {
          type: "paragraph",
          text:
            "We may verify your identity, role, and school before issuing a gift card, and may ask for reasonable information to do so. We may withhold a gift card, or disqualify anyone, if we reasonably believe the information provided is false, the Offer is being abused, or these Offer Terms have not been met. Our decisions about eligibility are final.",
        },
      ],
    },
    {
      id: "taxes",
      title: "Taxes",
      blocks: [
        {
          type: "paragraph",
          text:
            "You are responsible for any taxes and any reporting associated with receiving or using the gift card.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes and ending the Offer",
      blocks: [
        {
          type: "paragraph",
          text:
            "We may change or end the Offer at any time. Changes will not take away a gift card from anyone who has already booked and attended a qualifying demo under the earlier terms and then meets the remaining requirements. The Offer is void where prohibited or restricted by law.",
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      blocks: [
        {
          type: "paragraph",
          text:
            "We use the information you give us when booking a demo to schedule and run the demo, to determine whether you qualify, and to send the gift card, as described in our Privacy Policy at trymudkitchen.com/privacy.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing law",
      blocks: [
        {
          type: "paragraph",
          text:
            "These Offer Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Our Terms of Use at trymudkitchen.com/terms also apply.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        {
          type: "paragraph",
          text: "Questions about the Offer or your gift card:\nMudKitchen by Sage Field LLC\nTexas, United States\njulius@trymudkitchen.com",
        },
      ],
    },
  ],
};
