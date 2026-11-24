# School website

Slug: `school-website`. Researched Nov 22, 2026. Rivals: Brightwheel, Playground, Transparent Classroom (`_rivals.md`).

**Read this first:** the website is a **done-for-you service**, not a site builder inside the admin portal. I found no website editor in `src/components/school-admin/**` or the settings catalog. The only website field is the school's website URL in School Profile (`src/components/school-admin/school-profile/SchoolProfilePage.tsx`, section "About & links"). Copy must say "we build your website", never "build your site in minutes" or "drag-and-drop".

## Product truth (capabilities by role, with file paths; web/mobile)

### What the code and approved copy support

| Claim | Proof |
|---|---|
| Every school gets a "Branded school website" | `src/components/home/home-copy.ts` (`PRICING_COPY.features`); `src/lib/site.ts` (`SOFTWARE_FEATURES`) |
| "A full school website with programs, FAQs, team, and calls to action." | `src/lib/marketing/product-preview-tabs.ts` (`website` tab) |
| "MudKitchen includes a branded public school website with programs, team profiles, FAQs, and enrollment pathways." | `src/lib/faq.ts` |
| MudKitchen sets it up with you ("We build your setup inside MudKitchen.") | `home-copy.ts` (`WORKFLOW_COPY`) |
| Real example: Sage Field's live site (https://www.sagefield.co) publishes programs, tuition, team and enrollment pathways. "School website with program and tuition pages live" | `src/components/customers/sagefield-garden/sagefield-copy.ts`; `SagefieldGardenLiveSite.tsx` |
| Template sections: nav, hero, stats, welcome, programs, gallery, a day-in-the-life timeline, quote, story, founder, pillars, photo bands, enroll/inquiry section, FAQ, closing call to action, footer. Some sections are optional (mosaic, strip, parallax, founder, closing CTA) | `src/components/sections/WebsiteDashboardDemo.tsx`; `src/components/sections/website-demo/sections/*` |
| Each site uses the school's own logo and brand colors in the Garden template | `.cursor/skills/school-demo-builder/SKILL.md` (Phase 0: colors mapped to `theme.dark` / `theme.primary`, logo handling) |
| A public sample: "Explore a sample microschool website built with MudKitchen." | `src/app/website-demo/layout.tsx` |
| 44 school-specific demo sites built for prospects (sales demos, not live sites) | `src/app/demo/*` (e.g. `src/app/demo/athena-microacademy/`) |
| Website connects to the real product: the public **apply page** and the public **tour booking page** are designed to be linked from the site ("Put it on your school website", "Link a 'Book a tour' button on your admissions page.") | `src/app/school/[slug]/apply/`, `src/app/school/[slug]/tour/page.tsx`; strings in `src/components/school-admin/admissions/public-tour-wizard-copy.ts` and `PublicTourSchoolSettingsPanel.tsx`; `admin-documentation.ts` → `share-apply-link` ("add it to your website") |

### By role
- **Admin / founder (web):** receives a branded site built by MudKitchen. Links it to the apply page and tour page. Publishes tuition and programs. Admissions settings (apply form, tour page words) are self-serve in the portal. **Site content edits are not self-serve.** How edits are requested isn't documented; see Open questions.
- **Families (web, any device):** browse programs, tuition, team and FAQ, then apply or book a tour on the connected pages. Those pages are MudKitchen product pages, so submissions land in Submissions and Schedule.
- **Staff:** featured in team and founder sections only. No staff tooling.
- **Mobile:** it's a website. The template has wide and narrow layouts (`WIDE_FRAME_PX` in `WebsiteDashboardDemo.tsx`). I didn't run a full mobile responsiveness audit.

### Not supported by anything I found (don't claim)
Custom domain setup, hosting/uptime terms, SEO features, blog/CMS, page builder, analytics, ADA/accessibility guarantees, turnaround time, or whether the site is included in every plan. Also note: the demo inquiry form (`SiteEnroll.tsx`) is a demo component. I didn't confirm that live school sites post inquiries into MudKitchen.

## Founder pain (with quotes + sources)

- **Launch needs credibility before students exist.** "Before any student enrolled, Sage Field needed a credible public presence. That meant a polished website, visible tuition, clear program pages, and an enrollment pathway families could trust." (`sagefield-copy.ts`, our own customer story.)
- **A website isn't enough on its own.** "Launching a microschool means more than building a website. You need a way to present the school clearly, capture interest, guide families toward tours and enrollment…" (same file).
- **Parents struggle to find information:** many parents "report inconsistent experiences finding what they need" on school and district websites. GreatSchools press release, Dec 9, 2025. https://blog.greatschools.org/2025/12/09/new-national-survey-finds-parents-want-clearer-school-information-and-are-more-satisfied-when-they-can-find-it/
- **Founders are educators, not web designers:** "Most founders excel at education but struggle with basic business operations." The 74, Dec 15, 2025. https://www.the74million.org/article/we-launched-a-microschool-loan-program-and-were-surprised-by-what-we-learned/
- **The website and the enrollment tool live apart:** our approved pain copy says "Enrollment lives in a form builder." (`home-copy.ts`). Our outreach research found Google Forms in 14 and Jotform in 6 of 46 prospect stacks (`_rivals.md`), behind sites built on Wix, Weebly, Squarespace or WordPress (see Tool stack).
- I found no first-hand Reddit or forum quotes (not reachable).

## Evidence (numbered: quote — publisher, year — URL)

1. "70% of parents still use official school or district websites and third-party sites like GreatSchools.org" (fetch summary wording); "74% of parents highly likely to recommend their school say it is easy to find relevant information, compared with 20%" of those less likely to recommend. GreatSchools, national survey of 1,000+ K–12 parents, Dec 9, 2025. https://blog.greatschools.org/2025/12/09/new-national-survey-finds-parents-want-clearer-school-information-and-are-more-satisfied-when-they-can-find-it/
2. "Families prefer your school website over any other school communication channel." SchoolCEO (Apptegy), "What Parents Want", Jan 24, 2025 (1,400+ US parents; public/charter families). https://www.apptegy.com/schoolceo/what-parents-want/. *Vendor publication; not microschool families.*
3. School websites were the most influential channel in final enrollment decisions (54%), ahead of school visits (48%). Niche, 2022 Survey of Parents Searching for K-12 Schools. https://www.niche.com/about/enrollment-insights/2022-niche-survey-of-parents-searching-for-k-12-schools/. *Search-summary wording only; niche.com returned 403. Verify before quoting. A 2023 "60%" figure also appeared in summaries but couldn't be re-found. Don't use it.*
4. "53% of visits are abandoned if a mobile site takes longer than three seconds to load." Google (Think with Google / Google Ad Manager blog), 2016 data. https://blog.google/products/admanager/the-need-for-mobile-speed/. *Old benchmark (Google Analytics sample, n=3.7K sites, March 2016). Cite with the year.*
5. Nearly half (46.1%) of participants judged a site's credibility partly by its overall design or look. Stanford Persuasive Technology Lab, "How Do People Evaluate a Web Site's Credibility?", 2002 (2,684 participants). https://credibility.stanford.edu/research (figure via ClickZ coverage). *The popular "75%" version of this stat isn't in Stanford's primary study. Don't use 75%.*

## Tool stack alternative

- **Squarespace.** Basic $25/mo ($19/mo billed annually), Core $39 ($29), Plus $65 ($49), Advanced $139 ($99). Card fees run 2.9% + $0.30 on Basic/Core. https://www.squarespace.com/pricing (checked Nov 2026). Failure modes: the founder designs and writes it alone; the "Apply" button goes to a Google Form or Jotform; tuition and program info drift out of date; inquiries land in an inbox, not a pipeline.
- **Wix / Weebly / WordPress.** Same pattern. In our 46 prospect research files (`src/data/outreach/*.ts`), keyword counts are Wix 6, Weebly 2, Squarespace 1, WordPress 1. Concrete failures we recorded: one school's Wix site went offline, with the domain returning Wix's "ConnectYourDomain Error" on every page (`src/data/outreach/lab-learning.ts`). Another runs tour booking on Wix Bookings and puts its Parents page behind a Wix "Guest Area" password (`src/data/outreach/river-oak-academy.ts`). *Wix pricing wasn't checked this session.*
- **Facebook page or Instagram only.** A common placeholder. Parents can't find programs, tuition or how to apply. (Apptegy: only ~2% of parents chose social media as their preferred channel. https://www.apptegy.com/schoolceo/what-parents-want/)
- **Embedded form widgets** (Google Forms, Jotform, Calendly) inside the site. Three disconnected tools behind one "Enroll" button.

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel (checked Nov 2026)
- **Website: not offered as far as I could find.** No website builder appeared in searches of its site. Its "childcare website must-haves" blog describes Brightwheel as management software and mentions "brightwheel's online enrollment forms" that families complete from a program's site. It doesn't say Brightwheel builds websites. https://mybrightwheel.com/blog/childcare-website-must-haves. Its CRM lets you "share a link to an interest form or embed it on their site" (summary wording). https://mybrightwheel.com/crm-and-enrollment-forecasting/
- **Pricing:** quote only. https://mybrightwheel.com/pricing

### Playground (checked Nov 2026)
- **Website: yes, done-for-you. This is the direct competitor for this feature.** "Websites that fill your waitlist"; "delivered in two weeks, fully managed, and built to grow your enrollment" (the same page also says "One-week turnaround to go live"); "Custom-branded design tailored to your program"; "Custom domain setup"; "Search-engine optimized (SEO-friendly structure)"; "Hosting with best-in-class uptime"; "Lead forms that sync" into the pipeline; "Tour scheduling directly on your site"; "fully designed, developed, and managed for you". https://www.tryplayground.com/solutions/websites
- **Included or add-on:** the page asks "Is the website included in the Playground subscription?" but shows no answer. **Unconfirmed.** Pricing isn't published. https://www.tryplayground.com/pricing
- **Fit:** childcare programs ("Childcare management software directors love"). https://www.tryplayground.com/

### Transparent Classroom (checked Nov 2026)
- **Website: not offered.** The pricing page lists none. https://www.transparentclassroom.com/pricing. Schools can embed the TC application form on their own website. https://transparent-classroom.helpscoutdocs.com/article/52-applications-overview
- **Pricing:** $2.00 per child per month (records product).

### Procare: not used
Not researched for websites this session.

## Draft copy (sections as in 2e)

### Patterns from converting pages (Playground websites, Squarespace, Brightwheel CRM)
- Playground leads with the outcome ("fill your waitlist") and the service promise ("fully managed", turnaround time). This is the bar we're compared to.
- Builders like Squarespace sell templates and price. A done-for-you offer should sell "you don't have to build it".
- The strongest proof is a **live example**. We have one: Sage Field (sagefield.co) plus the `/website-demo` sample. Link both.

### Hero
- **Headline:** A school website we build, **connected to enrollment.** (8 words)
- **Body:** We build your branded site with programs, tuition, team and FAQs, then connect it to your apply form and tour booking. Families go from first visit to application without leaving your school's brand. (34 words)
- **One-liner:** Your school's website, built by us and wired to admissions. (10 words)

### Capabilities, admin / founder
1. **Built for you.** We design your site with your logo, colors, photos and story. You review it; you don't build it.
2. **Programs and tuition, published.** Clear program pages and visible tuition, so families know if you're a fit before they call.
3. **Apply button that works.** "Apply" opens your MudKitchen application. Submissions land in your pipeline, not a spreadsheet.
4. **Tours booked from your site.** Link your tour page so families pick a time themselves. Visits show on your schedule.
5. **Your founder story up front.** Founder, team and a day-in-the-life section show families who will teach their child.

### Capabilities, families
1. **Find answers fast.** Programs, tuition, schedule and FAQs on one site, readable on a phone.
2. **Apply in one flow.** Go from the website to the application without creating accounts elsewhere.
3. **Book a visit.** Choose a tour time from the school's open slots.

### Capabilities, staff
1. **Meet the team.** Teacher and founder profiles help families get to know staff before day one. *(Only if team sections are standard; see Open questions.)*

### Use cases
1. **Launching from zero.** *Scenario:* A founder plans to open in the fall and has no website yet. *Outcome:* MudKitchen builds the site with programs and tuition and links it to the apply form, so the first families can apply before the doors open. (Sage Field launched this way.)
2. **Replacing a DIY site.** *Scenario:* A school's Squarespace site links to a Google Form that nobody checks. *Outcome:* The rebuilt site sends "Apply" and "Book a tour" straight into MudKitchen, where the founder reviews them.
3. **Open-house season.** *Scenario:* The founder posts on Instagram about tours. *Outcome:* The post links to the website, families book a slot on the tour page, and they get a reminder the day before.

### FAQ
1. **Do I build the website myself?** No. We build it with you during setup, using your logo, colors, photos and words. You review it before it goes live.
2. **Is the website connected to enrollment?** Yes. "Apply" opens your MudKitchen application and "Book a tour" opens your tour page, so families land in your admissions pipeline.
3. **Can I see an example?** Yes: Sage Field in Round Rock, TX runs on a MudKitchen-built site, and our sample school website shows the full template.
4. **Can families use it on their phones?** Yes, the site adapts to phone screens, and the apply and tour pages work in any mobile browser. *(Verify with a mobile check before publishing.)*
5. **How do I update it after launch?** *Needs an answer from Julius:* request changes from us, or self-edit? Don't publish until confirmed.

### Comparison rows

| Row | MudKitchen | DIY Squarespace / Wix + forms | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Website included or offered | Yes, "Branded school website" (`home-copy.ts`) | You build it ($19–$99/mo billed annually on Squarespace). https://www.squarespace.com/pricing | Not found. https://mybrightwheel.com/blog/childcare-website-must-haves | Yes, "fully managed". https://www.tryplayground.com/solutions/websites | No. https://www.transparentclassroom.com/pricing |
| Who builds it | MudKitchen, with you | You | n/a | Playground | n/a |
| Apply button goes into admissions pipeline | Yes (`/school/[slug]/apply`) | No: goes to a separate form | Embeddable interest form. https://mybrightwheel.com/crm-and-enrollment-forecasting/ | "Lead forms that sync". https://www.tryplayground.com/solutions/websites | Embeddable application form. https://transparent-classroom.helpscoutdocs.com/article/52-applications-overview |
| Tour booking from the site | Yes (`/school/[slug]/tour`, when enabled) | Add Calendly | Self-serve tour booking in CRM. https://mybrightwheel.com/crm-and-enrollment-forecasting/ | "Tour scheduling directly on your site". https://www.tryplayground.com/solutions/websites | Not listed |
| Custom domain / SEO / hosting stated | **Not documented. Confirm before claiming** | Yes (builder features) | n/a | Stated: custom domain, SEO, hosting. https://www.tryplayground.com/solutions/websites | n/a |
| Built for | Microschools (K–8 programs, tuition, founder story) | Any business | Childcare | Childcare | Montessori records |

Honest takeaway: Playground is the only rival with a comparable done-for-you website and it states custom domain, SEO and hosting, which we don't document. Close that gap in our copy (if true) before running this comparison.

## Open questions / things you could not verify

- **Custom domain, hosting, SEO, turnaround time, edit process, and whether the site is included in every plan.** No code or copy covers these. Ask Julius. Playground advertises all of them.
- Does a live school site post its inquiry form into MudKitchen? (The demo `SiteEnroll.tsx` form is a demo.)
- How many live school sites exist besides Sage Field. The 44 `/demo/*` sites are prospect demos and shouldn't be shown as customers.
- **The public tour page is "When MudKitchen enables it"** (`admin-documentation.ts` → `public-tour-page`).
- The Niche 54%/60% figures need verification from the source PDF (niche.com blocked fetches).
- Builder counts above are keyword matches in our prospect files, not a verified tally of each school's current platform.
