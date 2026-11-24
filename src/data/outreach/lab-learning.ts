import type { OutreachPlan } from "./types";

export const labLearningOutreach: OutreachPlan = {
  slug: "lab-learning",
  schoolName: "The Lab Learning Space",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "",
    role: "Executive Director",
    source:
      "Our Team page as archived on May 16, 2026 (Torry Thompson, \"Mr. T\", Executive Director); the live site is down, so this can't be confirmed",
  },
  angle: "None: the school's website is down",
  facts: [
    {
      fact: "www.lablearning.org and lablearning.org return 404 with Wix's \"ConnectYourDomain Error\" page on the home page and every subpage tried (our-team, howtoenroll, wow-enrichment-program); the site audit found no readable pages",
      source: "The Lab Learning Space website",
      url: "https://www.lablearning.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The last archived copy of the home page (June 7, 2026) was live: \"Viva! Learning Space aka The Lab Learning Space\", a K–8 nonprofit enrichment and tutoring center in Belmont Heights, Long Beach, approved vendor for Blue Ridge Academy, Epic and Sky Mountain",
      source: "Internet Archive copy of lablearning.org, June 7, 2026",
      url: "https://web.archive.org/web/20260607142129/https://www.lablearning.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The domain is still registered (renewed through June 2027) and still points to Wix, so the Wix site itself has been unpublished or disconnected from the domain since June",
      source: "lablearning.org DNS and registry record",
      url: "https://lookup.icann.org/en/lookup?name=lablearning.org",
      readOn: "2026-11-22",
    },
    {
      fact: "MapQuest still lists the Termino Ave location as a business (not marked permanently closed), with Monday–Thursday hours; no closure announcement was found, and no recent social posts either",
      source: "MapQuest listing",
      url: "https://www.mapquest.com/us/california/the-lab-learning-space-421157446",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Find out whether The Lab Learning Space is still operating (the site went dark after June 2026) before any outreach.",
    "If it is open and the site comes back, re-run /school-outreach lab-learning to audit the live site and write the sequence and snapshot.",
  ],
  doNotEmail: {
    reason:
      "The website is down: every page on lablearning.org returns Wix's \"ConnectYourDomain\" 404 since sometime after June 7, 2026, and we couldn't confirm the school is still operating.",
    source: "https://www.lablearning.org/",
  },
  steps: [],
};
