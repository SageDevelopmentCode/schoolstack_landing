# Admissions & enrollment

Slug: `admissions`. Researched Nov 22, 2026. Rivals: Brightwheel, Playground, Transparent Classroom. The last section lists what still needs checking.

## Product truth (capabilities by role, with file paths; web/mobile)

The source of truth is the in-app help guides: `src/lib/school-admin/admin-documentation.ts`, `src/lib/parent-portal/parent-documentation.ts` and `src/lib/school-teacher/teacher-documentation.ts`. Component paths back up each line. Nothing below is rendered as "coming soon".

### School admin / founder

| Capability | Proof | Web / mobile |
|---|---|---|
| Guided admissions setup checklist: programs, payments, apply form, enrollment checklist, going live | `admin-documentation.ts` → `complete-setup-checklist`; `free-school-home-copy.ts` ("Get admissions ready") | Web (the mobile dashboard shows setup progress: `apps/mobile/src/components/school-admin/dashboard`, "Setup progress", "Go-live setup steps") |
| Programs with name, type, status, dates and capacity. Status can be draft, open, **waitlist**, full or closed | `admin-documentation.ts` → `create-programs`; `src/lib/admissions/programs.ts` (`ProgramStatus`) | Web |
| Apply-form builder: steps, student and family sections, custom questions, acknowledgments, publish | `build-publish-apply-form`; `src/components/school-admin/admissions/ApplicationFormFocusCanvas.tsx`, `ApplicationFormAcknowledgmentsEditor.tsx` | Web |
| Public apply link to share by email, on the website or on social media. Families read your welcome message first | `share-apply-link`; `src/app/school/[slug]/apply/`; copy "Families land on your public apply page and read your welcome message before starting." | Web |
| Optional application fee, paid by card or bank (ACH) through Stripe before the family submits | `configure-application-fee`; `ApplicationFormFeePanel.tsx`; `src/app/api/admissions/applications/[id]/checkout/route.ts` | Web |
| Post-submit steps (tour, interview, shadow/observation day) that families book from their apply dashboard | `add-post-submit-steps`; `ApplicationFormPostSubmitEditor.tsx`, `PostSubmitTemplatePickerModal.tsx` | Web |
| Tour, interview and shadow-day availability, including group-tour capacity | `set-tour-interview-availability`, `set-shadow-day-availability`; `AdmissionsGroupTourControls.tsx` | Web |
| Public tour booking page with no login. Admins edit the headline, intro and intake questions. Note: "When MudKitchen enables it." | `public-tour-page`; `src/app/school/[slug]/tour/page.tsx`; `PublicTourSchoolSettingsPanel.tsx` | Web |
| Automatic visit reminders: families get one the day before. Admins get a Monday digest and a day-before summary | `scheduled-visit-reminder-emails`; `src/lib/emails.ts` (`sendScheduledVisitDayBeforeReminderEmail`, `sendScheduledVisitAdminDigestEmail`) | Email |
| Submissions list with guardian contact, student, status and enrollment progress. Filters by status and form | `review-submissions`; `ApplicationSubmissionsPage.tsx` | Web + mobile (`apps/mobile/src/app/school-admin/[slug]/admissions/submissions.tsx`) |
| Status workflow: under review, observation, accept, decline, withdraw | `accept-decline-application`; `ApplicationDecisionSection.tsx` | Web + mobile (mobile strings "Decline this application?", "Application status updated") |
| Start enrollment: send the enrollment checklist to an accepted family, with agreement variants if needed | `start-enrollment`; `StartEnrollmentModal.tsx`, `AgreementOptionsDialog.tsx` | Web only. Mobile says "Start enrollment on the web". |
| Enrollment checklist builder: documents, forms, uploads, payments, acknowledgments. Ships with templates and links to a program | `build-publish-checklist`, `link-checklist-to-program`; `EnrollmentChecklistBuilder.tsx`, `EnrollmentChecklistTemplatePicker.tsx` | Web |
| Enrollment agreements that families sign: an uploaded PDF with an optional signature, or sections written in the builder | `EnrollmentAgreementEditor.tsx`; strings "Upload a PDF for families to read; optionally require a signature below it", "Write agreement sections in the builder for families to read and sign" | Web |
| Enrollment fees collected inside the checklist | `src/app/api/admissions/enrollment-checklist-items/[id]/checkout/route.ts`; string "Collect a fee during enrollment" | Web |
| Mark as enrolled, which unlocks the full parent portal. Also works when paperwork was handled offline | `mark-enrolled`; `MarkEnrolledDialog.tsx` | Web + mobile ("Couldn't mark enrolled" in mobile controller) |
| Add a second parent or guardian to the same family | `add-second-parent`; `FamilyGuardiansSection.tsx` | Web |
| Per-application payments tab showing fee status, charges and history | `view-submission-payments`; `SubmissionPaymentsPanel.tsx` | Web + mobile ("Payment details", "Processing fee") |
| History timeline and a PDF download of each application | `AdmissionHistoryTimeline.tsx`, `ApplicationPdfDownloadButton.tsx` | Web (mobile shows "Admission history") |
| Automatic reminder emails when families leave an application draft or enrollment steps unfinished: first after 72 hours, second after 7 days, at most 2 | `src/lib/admissions/incomplete-admissions-reminders.ts` (`FIRST_INCOMPLETE_REMINDER_DELAY_HOURS = 72`, `SECOND_INCOMPLETE_REMINDER_DELAY_DAYS = 7`); wired in `src/lib/tuition/billing-cron.ts`; feature announcement "Admissions reminder emails" | Email |
| Email alerts to admins for applications, payments and visits | `src/lib/organization-settings/catalog.ts` (`notifications`: "Email alerts for applications, payments, and visits") | Email |
| Enrollment hands off to tuition. Enrolled students sync into tuition assignments | `admin-documentation.ts` → `manage-tuition-assignments` ("sync assignments for newly enrolled students") | Web |

Free-plan note: the free admin home (`free-school-home-copy.ts`) includes Programs, Enrollment Flows, Submissions, Tour page and Newsletters. **Payments** (Stripe) and the rest are "In the full plan", so application and enrollment fees need the paid plan.

### Families / parents

| Capability | Proof | Web / mobile |
|---|---|---|
| Apply from the school's public link and save a draft to finish later | `parent-documentation.ts` → `open-apply-dashboard` ("continue a draft") | Web |
| Apply dashboard showing status for each child, drafts and enrollment | `open-apply-dashboard` | Web |
| Book a tour, interview or shadow day after applying | `add-post-submit-steps` (admin); `src/app/school/[slug]/apply/schedule-tour` | Web |
| Pay application and enrollment fees by card or bank, with the processing fee shown before paying | `src/components/admissions/PaymentMethodSelectionModal.tsx` ("Card fee" / "Bank fee") | Web |
| Work through the enrollment checklist one item at a time: forms, uploads, payments, acknowledgments | `complete-enrollment-checklist`; string "Families work through documents, forms, uploads, payments, and acknowledgments — one item at a time." | Web |
| Sign the enrollment agreement | `sign-enrollment-agreement` | Web |
| A second guardian signs in with their own email and a one-time code | `add-second-parent` ("They sign in at your apply dashboard URL with that email and the usual one-time code") | Web |
| After enrollment: see each child's application and checklist status, health info and authorized pickup in the app | `apps/mobile/src/components/parent/children` ("Application steps", "Enrollment checklist", "Health information", "Authorized pickup"); `download-app-slides.ts` slide 5 | Mobile + web |

Important limit: **families can't apply in the mobile app.** Before enrollment, the app shows "Continue on the web: The {school} mobile app is available once your family is enrolled." (`apps/mobile/src/lib/admissions/parent-portal-access.ts`, `parent-apply-web-gate-screen.tsx`).

### Staff / teachers

Staff have no admissions role. The teacher docs (`teacher-documentation.ts`) have no admissions guides. Teachers see enrolled students in My Students, so admissions isn't a staff-facing selling point.

## Founder pain (with quotes + sources)

- **Business operations are the weak spot, not teaching.** "Most founders excel at education but struggle with basic business operations." Allison Serafin, The 74, Dec 15, 2025. https://www.the74million.org/article/we-launched-a-microschool-loan-program-and-were-surprised-by-what-we-learned/
- **Forms multiply and get lost.** "Now you have 14 forms in your Drive that you can never quite find when you need them." / "Now you have 14 spreadsheets, none connected to each other." NavEd blog (a vendor), "The Hidden Ops Job of Running a Microschool", 2026. Illustrative, not survey data. https://nav.education/blog/microschool-operations-guide/
- **Re-enrollment season is the peak.** The same post calls it "often the highest-volume information-collection period of the year", with forms, tuition acknowledgments and waitlist intake arriving at once. It also mentions founders "chasing form responses". (Same URL.)
- **Spreadsheets break first.** "spreadsheet sprawl that eats founder evenings"; "spreadsheets fail first as the school grows". Ecole Schools (a vendor), updated Aug 14, 2026. https://ecoleschools.org/microschool-tools-and-resources/
- **Our own pain copy (approved).** "Enrollment lives in a form builder." (`src/components/home/home-copy.ts`, `PAIN_COPY`.) The Sage Field case study's "before" row: "Spreadsheet with family names, tour dates, and status columns maintained manually." (`src/components/customers/sagefield-garden/sagefield-copy.ts`.)
- **Gap:** I found no first-hand Reddit or forum quotes. Search engines didn't index r/microschool or r/homeschool threads, and reddit.com refused direct fetches. See Open questions.

## Evidence (numbered: quote — publisher, year — URL)

1. "the majority of people (81%) have abandoned an online form after beginning to fill it out". The Manifest, 2018 (n=502 US adults). https://themanifest.com/web-design/6-steps-avoiding-online-form-abandonment. Same survey, per coverage: "nearly 70 percent chose to abandon the process entirely" rather than come back later. *Caveat: old and not school-specific. Verified via search snippets, not a full-page read.*
2. Responding to a web lead within an hour made firms nearly 7 times as likely to qualify it as responding later. Oldroyd, McElheran & Elkington, "The Short Life of Online Sales Leads", Harvard Business Review, 2011 (audit of 2,241 US companies). https://hbr.org/2011/03/the-short-life-of-online-sales-leads. *Caveat: I read secondary summaries only, so the exact wording is unconfirmed. Check it at hbr.org before quoting. It supports instant confirmations and self-serve tour booking.*
3. "Sixty percent of parents said school websites influenced their enrollment choices." Niche, 2023 K-12 Parent Survey. https://www.niche.com/about/enrollment-insights/2023-niche-k-12-parent-survey/. The 2022 survey: school websites (54%) were the most influential channel in final enrollment decisions, ahead of school visits (48%). https://www.niche.com/about/enrollment-insights/2022-niche-survey-of-parents-searching-for-k-12-schools/. *Caveat: niche.com returned 403 to fetches, so these are search-snippet quotes. A second search couldn't re-find the 2023 "60%" figure, so **don't use it** until it's checked against the report. Niche sells review listings. A verified alternative: "70% of parents still use official school or district websites and third-party sites like GreatSchools.org" (fetch summary wording). GreatSchools, Dec 9, 2025, 1,000+ K–12 parents. https://blog.greatschools.org/2025/12/09/new-national-survey-finds-parents-want-clearer-school-information-and-are-more-satisfied-when-they-can-find-it/*
4. "The median number of students in private microschools is 22." EdChoice (Michael Q. McShane, summarizing the National Microschooling Center survey), Jun 12, 2025. https://www.edchoice.org/the-state-of-microschooling/. Context: a 22-student school has no admissions office, so the founder is the admissions office.
5. "65 percent offering sliding scale tuition and discounts". National Microschooling Center, *American Microschools: A Sector Analysis*, May 2025. https://microschoolingcenter.org/news-blog/2025-american-microschools-sector-analysis. Supports agreement variants and per-family discounts set at enrollment.

## Tool stack alternative

What founders use instead, and how it breaks:

- **Google Forms + Google Sheets.** Free and the most common default. It's in 14 of our 46 prospect tool stacks (`docs/features-research/_rivals.md`, built from `src/data/outreach/*.ts`). Failure modes: no payments or e-signatures, so it gets bolted onto Venmo and DocuSign. Responses land in disconnected sheets, and the founder becomes "the manual reconciler" (NavEd). There's no status pipeline, no family login, no reminders for half-finished forms, and no hand-off to tuition.
- **Jotform.** In 6 of 46 prospect stacks (`_rivals.md`). It can take payments and signatures, but per search summaries its free and Starter tiers cap forms, monthly submissions and payments. *Unconfirmed on jotform.com this session.* It's still a form, not a pipeline: there's no accept/decline workflow, no enrollment checklist, and no parent portal afterwards.
- **DocuSign / Dropbox Sign** for enrollment agreements: a separate login and a separate place to check who has signed.
- **Calendly** for tours: bookings aren't tied to the application. Appears in startup guides (theschoolhouse.org, per search).
- **Email and group texts** for "did you finish the health form?" follow-ups, sent by hand.

## Rivals (per rival: facts + URL + "checked Nov 2026")

> The comparison rivals are **Brightwheel, Playground and Transparent Classroom** (`docs/features-research/_rivals.md`, Nov 22, 2026). Procare was dropped for lack of microschool adoption evidence. Its notes are kept below and marked "not used".

### Brightwheel (checked Nov 2026)
- **Offers admissions: yes.** The help center lists Programs and waitlists, digital forms, an Admissions Dashboard, Admission packets, Contracts ("Send a PDF contract for families to review, acknowledge, and digitally sign"), Document Requests, Fillable Documents, a Program Waitlist Report and messaging prospects. https://help.mybrightwheel.com/en/articles/6143589-overview-of-brightwheel-admissions-features
- **CRM & enrollment forecasting:** "Capture inquiries from your website, calls, walk-ins, and referrals"; families "book available tour times themselves"; "automatic tour confirmations and reminders"; seat forecasting. Access is limited to "Superadmins, admins, and managers". The page doesn't say which plan includes it. https://mybrightwheel.com/crm-and-enrollment-forecasting/
- **Application fees:** search summaries of the enrollment page say admissions packets can include application fees. *Unconfirmed on the page itself.* https://mybrightwheel.com/childcare-enrollment-registration/
- **Pricing:** quote only. "We'll need some info to customize your pricing." https://mybrightwheel.com/pricing. "Brightwheel Premium pricing is customized for each program rather than published as a price list." https://mybrightwheel.com/blog/how-much-is-brightwheel-premium
- **Fit:** it positions itself as "#1 childcare software". Its billing page title is "The #1 Childcare Billing Software and Payment App in 2026". https://mybrightwheel.com/features/billing. Its tools center on centers (classroom transitions, seat forecasting by room, subsidies). It has no microschool page (`_rivals.md`).

### Transparent Classroom (checked Nov 2026)
- **Offers admissions: yes, basic.** "Applications are a unique type of form in Transparent Classroom that can be shared with and filled out by prospective families that do not yet have a Transparent Classroom account." Applications can be embedded on the school website. Staff move them through states such as Submitted, Offered, Rejected and Accepted, and accepting can create parent accounts. https://transparent-classroom.helpscoutdocs.com/article/52-applications-overview and https://transparent-classroom.helpscoutdocs.com/article/56-accepting-applications (the second via search summary)
- **Application fee: no built-in payments.** You paste a third-party "payment button" (PayPal is the example; "you can use any company") into a School Info article titled exactly "Application Complete", and completed applications redirect there. https://transparent-classroom.helpscoutdocs.com/article/57-collecting-an-application-fee
- **Pricing:** "$2.00 USD" per child per month. "Each month, you are charged only for children actively enrolled the previous month." The pricing page doesn't mention admissions. https://www.transparentclassroom.com/pricing
- **Fit:** Montessori record keeping first ("Simple, Meaningful Record Keeping", per `_rivals.md`).

### Playground (checked Nov 2026)
- **Offers admissions: yes.** "Each enrollment listing gives you a unique link for guardians to register or join your waitlist." Links can be shared by email, text or social, or as a QR code, with unlimited listings. Families can "save and exit an enrollment form at any time", and progress autosaves if the browser times out. Staff work a funnel with five columns (applied, waitlisted, accepted, rejected, dropped), and stage changes send automatic emails. The help center mentions eSignatures and "application fees". https://help.tryplayground.com/en/articles/9702730-enrollment-overview
- **Enrollment page:** "Enrollment software that looks and feels as good as your care". "Schedule and confirm tours automatically." "Automatically charge application, enrollment, or deposit fees." "Capture leads directly from your website." https://www.tryplayground.com/solutions/enrollment
- **Application-fee processing cost:** "Application fees through an enrollment listing are always charged to the program" (fetch summary of the billing-settings help article). https://help.tryplayground.com/en/articles/6267221-configure-billing-settings
- **Pricing:** none published. The pricing page shows only a phone number. https://www.tryplayground.com/pricing. Free access in some states (AZ, IA, ID, KS, NY) per its homepage. https://www.tryplayground.com/
- **Fit:** "Childcare management software directors love"; "5,000+ child care programs" (homepage). Microschool owners do review it (see `_rivals.md`). Of the three, it's the strongest admissions rival: waitlist, autosave, tours and fees are all built in.

### Procare (checked Nov 2026), not used
- **Offers online registration: per its capability page (search summary only).** Registration forms let parents sign waivers and pay registration fees by card. *Not fetched directly. Unconfirmed.* https://www.procaresoftware.com/capabilities/family-registration-enrollment/
- **Tours, waitlist, accept/decline pipeline:** unconfirmed.
- **Pricing:** no numbers. "one low monthly price" for "everything you need to manage your child care business"; the CTA is "Request A Demo". https://www.procaresoftware.com/pricing-table/
- **Fit:** "child care business" positioning, from the same page. `_rivals.md` found 0 of 46 microschool prospects using Procare.

### Suggested better-fit rival: KaiPod Newton (checked Nov 2026)
- KaiPod Learning runs a microschool accelerator (KaiPod Catalyst, per Cato coverage in search). Newton is sold as "Microschool Management Software": "Owning a microschool is demanding, but managing it shouldn't be." For enrollment you can "import an enrollment form from your website" into Newton. No pricing is published. https://www.kaipodlearning.com/newton-microschool-management-software/
- Newton is the only rival found that targets microschools by name **and** comes from an organization embedded in the founder community. **However**, `_rivals.md` found no Newton use in our 46 prospect stacks, so there's no adoption evidence yet. It's worth a column only if a page needs a "made for microschools too" foil.

## Draft copy (sections as in 2e)

### What converting feature pages do for this job (patterns)
I sampled Brightwheel's billing and CRM pages (fetched), Brightwheel's enrollment page (search summary), and Procare's registration page (search summary). A planned fetch of further examples (Finalsite Enrollment, SchoolMint, Jotform) was cut off by the web-tool limit. Patterns seen:
- The headline names the job, not the product: "#1 childcare billing software"; "Simplify your childcare billing".
- They quantify time saved, as in "Save up to 5 hours each week…" (Brightwheel billing). We have no measured equivalent, so **don't invent one**.
- They lead with the family's self-serve action ("Let families book available tour times themselves") and then the admin's view of the pipeline.
- They pair a feature grid with a FAQ about cost and setup.

### Hero
- **Headline:** From first click to enrolled, **in one place.** (8 words)
- **Body:** Publish your application, take fees, book tours, review and accept families, then send the enrollment checklist and agreement. Every step lands in one pipeline, and enrolled families move straight into billing and the parent portal. (35 words)
- **One-liner:** Applications, tours, agreements and fees, tracked from inquiry to enrolled. (10 words)

### Capabilities, admin / founder
1. **Build your apply form.** Add steps, custom questions and acknowledgments, then publish one link for your website, email or social posts.
2. **Take application fees.** Turn on an optional fee. Families pay by card or bank through Stripe before they submit.
3. **Let families book visits.** Open tour, interview and shadow-day times. Families pick a slot, and everyone gets a reminder the day before.
4. **Review every application.** See status, contact details and progress in one list. Mark under review, accept or decline, even from your phone.
5. **Send the enrollment checklist.** One click sends forms, uploads, fees and the agreement to sign. You see what's done and what's missing.
6. **Nudge unfinished families automatically.** Families with a half-finished application or checklist get reminder emails after three days and a week.

### Capabilities, families
1. **Apply at your own pace.** Start the application, save a draft and come back later from any browser.
2. **Book a visit yourself.** Choose a tour, interview or shadow day from the open times after you apply.
3. **One checklist to enroll.** Health forms, documents, fees and the agreement, one item at a time, with progress you can see.
4. **Both parents included.** A second guardian gets their own sign-in to help finish enrollment.
5. **Pay fees online.** Card or bank, with the processing fee shown before you pay.

### Capabilities, staff
Not applicable. Staff have no admissions role. Skip this tab, or say: "Once a family is enrolled, teachers see the student in My Students."

### Use cases
1. **Open-house week.** *Scenario:* A founder shares one apply link and the tour page in a newsletter and on Instagram. *Outcome:* Tour bookings and applications arrive in Submissions with contact details, instead of in DMs and a spreadsheet.
2. **Accepting a family in the car line.** *Scenario:* A shadow day goes well and the founder wants to say yes the same afternoon. *Outcome:* She opens the application on her phone and marks it accepted. She sends the enrollment checklist from the web that evening.
3. **The half-finished application.** *Scenario:* A parent starts the form at 10 pm and never comes back. *Outcome:* MudKitchen emails a reminder after three days and again after a week, and the founder sees the draft in Submissions.
4. **Two agreements, one school.** *Scenario:* Most families sign the standard agreement, but one needs a different version. *Outcome:* The founder picks the agreement version when starting enrollment, and the family signs it inside the checklist.

### FAQ
1. **Can families apply from their phone?** Yes, in any mobile browser through your apply link. The MudKitchen app is for families who are already enrolled. Before that, it sends them to the web to finish their application or enrollment.
2. **Can I charge an application fee?** Yes. Set the label and amount in the apply form builder. Families pay by card or bank account through Stripe, and you connect Stripe once under Payments. Fees need the full plan.
3. **What do families complete after I accept them?** Your enrollment checklist: forms, document uploads, fees, acknowledgments and the enrollment agreement. When it's done, mark the student enrolled and the full parent portal opens.
4. **What if paperwork was done on paper?** Use Mark as enrolled. You can complete every checklist step at once, or enroll the student without changing the checklist.
5. **Do tours and shadow days connect to applications?** Yes. Families book them from their apply dashboard after submitting. Visits show up in Schedule and link back to the application. The public tour page lets anyone book without logging in once it's switched on for your school.

### Comparison rows

| Row | MudKitchen | Google Forms + Sheets stack | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Online application families can save and finish later | Yes (`parent-documentation.ts` → `open-apply-dashboard`) | Partial: Forms drafts depend on the family's Google sign-in. *Unverified* | Digital forms: yes. https://help.mybrightwheel.com/en/articles/6143589-overview-of-brightwheel-admissions-features (draft saving unconfirmed) | Yes: "save and exit an enrollment form at any time". https://help.tryplayground.com/en/articles/9702730-enrollment-overview | Applications fillable without an account: yes. https://transparent-classroom.helpscoutdocs.com/article/52-applications-overview |
| Application fee in the same flow | Yes, card or ACH via Stripe | No. Add Venmo/PayPal separately | Search summary says packets can include fees (unconfirmed). https://mybrightwheel.com/childcare-enrollment-registration/ | Yes: "Automatically charge application, enrollment, or deposit fees." https://www.tryplayground.com/solutions/enrollment | No built-in payments: third-party "payment button" (e.g. PayPal). https://transparent-classroom.helpscoutdocs.com/article/57-collecting-an-application-fee |
| Families self-book tours | Yes, plus interviews and shadow days | No (add Calendly) | Yes, via CRM. https://mybrightwheel.com/crm-and-enrollment-forecasting/ | "Schedule and confirm tours automatically." https://www.tryplayground.com/solutions/enrollment | Not listed (unconfirmed) |
| Accept / decline pipeline | Yes, on web and mobile | Manual status column | Admissions Dashboard. https://help.mybrightwheel.com/en/articles/6143589-overview-of-brightwheel-admissions-features | Funnel: applied, waitlisted, accepted, rejected, dropped. https://help.tryplayground.com/en/articles/9702730-enrollment-overview | States such as Submitted, Offered, Rejected, Accepted. https://transparent-classroom.helpscoutdocs.com/article/56-accepting-applications (search summary) |
| Family-level waitlist | Program status "Waitlist" only (no queue found) | Manual | Waitlist tab and Program Waitlist Report (help center, above) | Yes, families join from the listing link (help center, above) | Unconfirmed |
| E-signed enrollment agreement | Yes, inside the checklist | No (add DocuSign) | Contracts with e-signature. (help center, above) | eSignatures mentioned. (help center, above) | Unconfirmed |
| Automatic reminders for unfinished applications | Yes, after 72 h and 7 days | No | Unconfirmed | Automated emails on stage changes. Reminders for unfinished forms unconfirmed | Unconfirmed |
| Enrolled family moves straight into billing and parent portal | Yes | No | Billing is in Brightwheel (https://mybrightwheel.com/features/billing) | Billing is in Playground (https://www.tryplayground.com/solutions/billing) | Billing not on pricing page. https://www.transparentclassroom.com/pricing |
| Published price | Book a demo (not public) | Free | Quote only. https://mybrightwheel.com/pricing | Quote only (phone number). https://www.tryplayground.com/pricing | $2.00 per child per month. https://www.transparentclassroom.com/pricing |

Honest takeaway: Playground matches MudKitchen on most admissions rows and has a family-level waitlist that MudKitchen lacks. MudKitchen's real differences here are interview and shadow-day booking, unfinished-application reminders, agreement variants, and being built for a K–8 founder-run school rather than a childcare center.

## Open questions / things you could not verify

- **First-hand founder quotes** (Reddit r/microschool, r/homeschool, Facebook groups, podcasts) weren't reachable. Every pain quote above comes from vendor blogs or op-eds. Ask Julius for real quotes from Sage Field or demo calls.
- **The HBR 2011 "7×" wording** and the **Niche 2022/2023 percentages** come from search summaries. Both pages blocked or weren't fetched. Confirm them before publishing.
- **Brightwheel:** whether application fees and CRM are on all plans or only Premium. **Playground:** whether the website lead forms and tour booking need its website add-on, and whether it reminds families about unfinished forms. (Procare's registration page wasn't fetched. Procare is not used.)
- **The public tour page is "When MudKitchen enables it"** (`admin-documentation.ts`). Confirm it's on by default for paid schools before advertising it.
- **Waitlist:** a program can be set to "Waitlist" status, but I found no family-level waitlist queue. Don't advertise "waitlist management" beyond program status.
- Whether the free plan includes application fees. Code suggests no, since Payments is locked. Confirm with pricing.
- I found no measured time-saved number for MudKitchen admissions. Don't use one.
