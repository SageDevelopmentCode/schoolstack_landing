Update Nov 22, 2026: the app is now on Android too (private install link); copy updated.

# The MudKitchen app (families, staff and admins)

Slug: `mobile-app`. Researched Nov 22, 2026. Rivals: Brightwheel, Playground, Transparent Classroom (`_rivals.md`).

**Availability facts to get right in every line of copy:**
- **iPhone: live** on the App Store as "MudKitchen" (`src/lib/mobile-app-download/constants.ts` → `https://apps.apple.com/us/app/mudkitchen/id6815495426`).
- **Android: not live.** "Grab the app on iPhone, or join the Android waitlist—we'll email you when Google Play goes live." (`src/components/download/DownloadCtaBand.tsx`; `AndroidDownloadLeadSheet.tsx` "Google Play isn't live yet"). The Android build exists (`apps/mobile/app.json` `android.package`), but don't write "iOS and Android" until Play is live.
- **It's for schools already on MudKitchen**: "MudKitchen mobile is for schools already on the platform." (`DownloadCtaBand.tsx`)
- **Families get it after enrollment.** Before that, the app sends them to the web: "The {school} mobile app is available once your family is enrolled." (`apps/mobile/src/lib/admissions/parent-portal-access.ts`)

## Product truth (capabilities by role, with file paths; web/mobile)

One app serves all roles. Users sign in, pick their school ("Choose your school", "Switch school": `apps/mobile/src/components/choose-school-experience.tsx`, `switch-school-button.tsx`) and switch portals if they hold more than one role (`account-portal-switcher-card.tsx`, "Unable to switch portal"). Inside, screens carry the **school's logo and colors** (`organization-logo.tsx`; `apps/mobile/src/lib/organization-settings/build-admin-theme.ts`).

### Families / parents (`apps/mobile/src/app/parent/[slug]/**`)

| Capability | Proof |
|---|---|
| Home with "Start here" to-dos and upcoming events | `home.tsx`; `parent-home-screen.tsx`; `download-app-slides.ts` slide 2 |
| Messages with teachers and staff, including photo and file attachments | `messages/`; strings "Attach photo or file"; slide 3 "Real conversations with teachers, not lost in email." |
| Billing: balance, pay by card or bank on Stripe checkout, autopay, receipts, payment schedule, tuition agreements | `billing.tsx`; `apps/mobile/src/components/parent/billing/**`; slide 4 |
| Calendar | `calendar.tsx` |
| School bulletin posts | `bulletin/[postId].tsx` |
| My children: application and enrollment-checklist status, health information, authorized pickup | `more/children.tsx`, `more/children/[applicationId].tsx`; `components/parent/children` strings |
| Attendance history | `more/attendance.tsx` |
| Forms & documents to complete and sign | `more/forms-documents/` |
| Classroom volunteer sign-ups | `more/classroom-signups/` |
| Committees (explore, join, workspace, projects) | `more/committees/**` |
| Newsletters | `more/newsletters/` |
| Photos from school | `more/photos.tsx` |
| Notification center and notification settings | `more/notifications.tsx`; `parent-notification-settings-screen.tsx` |
| Co-op programs: curriculum, supply list, teaching schedule | `p/[programSlug]/curriculum.tsx`, `supply-list.tsx`, `teaching-schedule.tsx` |

### Staff / teachers (`apps/mobile/src/app/teacher/[slug]/**`)

| Capability | Proof |
|---|---|
| Home showing what needs attention today | `home.tsx`; slide 6 "Teachers see what needs attention without the scramble." |
| My Students with student details and profiles | `my-students.tsx`, `students/[studentId].tsx`; slide 8 |
| Attendance: "Mark Present", "N left to mark" | `more/attendance.tsx`; `apps/mobile/src/components/attendance`; slide 7 "Attendance and rosters, quick on the classroom floor." |
| My Hours time clock: "Clock in and out, see your week, and fix past days." | `more/my-hours.tsx`; `components/teacher/my-hours` |
| Messages with families and staff | `messages/` |
| Calendar, bulletin, newsletters | `calendar.tsx`, `bulletin/`, `more/newsletters/` |
| Upload class photos | `more/photos.tsx` ("Upload photos") |
| Classroom sign-ups and committees | `more/classroom-signups.tsx`, `more/committees/**` |

### School admins / founders (`apps/mobile/src/app/school-admin/[slug]/**`)

| Capability | Proof |
|---|---|
| Dashboard: setup progress, recent school activity, staff hours today, feature announcements, support requests | `dashboard.tsx`; `components/school-admin/dashboard` strings |
| Admissions: list and filter applications, open details and payments, accept or decline, mark enrolled. Starting enrollment is web-only | `admissions/submissions.tsx`, `admissions/submissions/[id].tsx`; slide 10 "Pipeline views from first application through enrolled." |
| Students and student profiles | `students/` |
| Messages | `messages/` |
| More: attendance, bulletin, classrooms, committees, photos, schedule, staff, staff hours, transactions | `more/*.tsx` |
| Tuition setup, apply-form building and most settings stay **on the web** | No mobile routes for tuition setup or flows. The mobile skill notes "web-only links" (`admin-mobile-garden-design` skill description) |

### Push notifications (`src/lib/notifications/mobile-push-catalog.ts`)
New message; committee join request (admins), join approved, task assigned, committee message, new resource, new event, new task; bulletin post published; school photos uploaded; classroom signup reminder; newsletter published; **child marked present**; **child picked up**; hour adjustment reviewed (staff). **No billing or admissions pushes.** Those go by email.

## Founder pain (with quotes + sources)

- **Scattered channels:** our approved copy says "Parents should not have to search through old emails, group chats, and scattered links just to understand what is happening this week." (`home-copy.ts`, `FAMILY_COPY`)
- **Too many channels feels like spam to parents.** SchoolCEO reports that families receive redundant communication, and one parent said repeated notifications about the same thing "feels like spam." SchoolCEO (Apptegy), Jan 24, 2025. https://www.apptegy.com/schoolceo/what-parents-want/
- **Founders run the school from their phone.** Microschools are small (median 22 students in private microschools; EdChoice 2025: https://www.edchoice.org/the-state-of-microschooling/), so the founder is usually also teaching. Desk time for admin is scarce. *(This is an inference, not a quote.)*
- **Spreadsheets and text threads.** "spreadsheet sprawl that eats founder evenings"; communication "scattered across text threads". Ecole Schools (a vendor), Aug 2026. https://ecoleschools.org/microschool-tools-and-resources/
- I found no first-hand Reddit or forum quotes (not reachable this session).

## Evidence (numbered: quote — publisher, year — URL)

1. "About nine-in-ten (91%) own a smartphone". Ages 30–49 (typical parents of school-age children): 97%. Pew Research Center, Mobile Fact Sheet, survey Jan 30–Jun 18, 2026, n=5,511 US adults. https://www.pewresearch.org/internet/fact-sheet/mobile/
2. "Nearly half of families reported that they have both downloaded their school or district's app and use it regularly." SchoolCEO (Apptegy), "What Parents Want", Jan 24, 2025 (1,400+ US parents). https://www.apptegy.com/schoolceo/what-parents-want/. *Vendor that sells school apps; public/charter families.*
3. Parents report schools reach them mainly by email (51.3%), then parent portal or app (23.5%) and text (13.8%). Alchemer, 2026 K-12 Parent Trust Report (474 US K-12 parents), May 19, 2026. https://www.alchemer.com/resources/blog/k-12-parent-sentiment-in-2026/. The article also says schools that "diversify into portals, text messages, and two-way digital channels see meaningfully higher engagement."
4. Only "around 2% of parents chose it [social media] as their most preferred communication method." SchoolCEO, 2025 (same URL as #2). Why it matters: a Facebook group isn't a substitute for an app.
5. Education & Training emails average a 35.64% open rate. Mailchimp email marketing benchmarks (data last updated Dec 2023). https://mailchimp.com/resources/email-marketing-benchmarks/. *Via search summary; Apple Mail Privacy Protection inflates opens.* Why it matters: about two-thirds of school emails go unopened, which is why push for messages, attendance and photos matters.

## Tool stack alternative

- **Group texts / WhatsApp / GroupMe.** Fast, but messages mix with family chatter, there's no record per student, staff share personal numbers, and new families miss the history.
- **Email + Google Drive links.** Parents dig through inboxes. Attachments and forms live in different places. (FAMILY_COPY pain.)
- **ClassDojo / Remind / Brightwheel's free tier for messaging only.** A separate app just for messages, plus Venmo for tuition, plus Google Forms for paperwork. Three apps for families to install and staff to check. *(ClassDojo appears in 1 of our 46 prospect files.)*
- **Paper sign-in and a sheet for teacher hours.** No mobile attendance or time clock.
- **Facebook group.** Only ~2% of parents prefer social media (Evidence 4).

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel (checked Nov 2026)
- **App: yes, one app for staff and families.** App Store "brightwheel: Child Care App". The listing describes sign in/out, messaging, learning assessments, daily sheet reports, photos, videos, calendars, scheduling, attendance and online bill pay (via search summary of the listing). https://apps.apple.com/app/id902823296. Android: *unconfirmed this session* (Google Play listing not returned).
- **Positioning:** daily reports (naps, meals, bathroom) and check-in are childcare features. https://mybrightwheel.com/ ("#1 childcare software").
- **Pricing:** quote only. https://mybrightwheel.com/pricing

### Playground (checked Nov 2026)
- **App: yes.** Parents use the Billing tab to "make payments", chat with staff, check in and out by QR code, and "Upload, view, and fill out forms" in Paperwork. Available "for iOS or Android". https://help.tryplayground.com/en/articles/5356813-guardian-app-overview. The homepage says one app serves admins, teachers and families (fetch summary). https://www.tryplayground.com/
- **Branding:** "Home-based providers and small businesses can brand the Playground app families already use." A standalone white-label App Store and Google Play app requires "a minimum of (5) locations". https://www.tryplayground.com/solutions/branded-app
- **Pricing:** not published. https://www.tryplayground.com/pricing

### Transparent Classroom (checked Nov 2026)
- **App: yes, limited.** The parent view on iOS and Android "currently shows the Homepage, Activity, and Photos" shared with parents. Parents can't use record-keeping features. A separate teacher app is listed for iPad (Montessori observation and photos). https://transparent-classroom.helpscoutdocs.com/article/40-share-with-parents-using-our-mobile-app (via search); App Store https://apps.apple.com/app/id1618332070
- **Messaging, push, texting** come through the Onespot partnership: "tuition billing, group chats, push notifications, text messaging". https://transparent-classroom.helpscoutdocs.com/article/452-onespot-transparent-classroom-partnership (via search)
- **Pricing:** $2.00 per child per month. https://www.transparentclassroom.com/pricing

### Procare: not used
Its site navigation lists a "Child Care App" (https://www.procaresoftware.com/pricing-table/). Families can pay "online or through the mobile app" (https://www.procaresoftware.com/capabilities/payment-processing/). Not researched further.

## Draft copy (sections as in 2e)

### Patterns from converting pages (Brightwheel app, Playground branded app, our own /download)
- Lead with the parent's moment ("Give families an experience they'll love, and feels unmistakably yours": Playground).
- Show the app per role with real screenshots. We already have 10 App Store slides (`download-app-slides.ts`). Reuse their headlines, which are approved.
- Show store badges right under the hero. We have only the App Store badge plus an Android waitlist.

### Hero
- **Headline:** Your whole school, **in one app.** (6 words). *Alt from approved slide 1:* "Everything your microschool needs together in one app."
- **Body:** Families pay tuition, message teachers and see what's next. Teachers take attendance and clock in. You review applications and see the day at a glance. Each screen carries your school's logo and colors. (35 words)
- **One-liner:** One app for families, teachers and admins, in your school's colors. (11 words)

### Capabilities, families
1. **Pay tuition in seconds.** See your balance, pay by card or bank, and turn on autopay. (Approved slide: "Tuition and billing where families already are.")
2. **Message teachers directly.** Real conversations with teachers, with photos and files, not lost in email.
3. **Know what's next.** Start-here to-dos, upcoming events, bulletin posts and newsletters on one home screen.
4. **Get notified when it matters.** A push alert when your child is marked present or picked up, or when new photos are posted.
5. **Keep records current.** Update health information and authorized pickup, and fill out school forms from your phone.

### Capabilities, staff
1. **Attendance on the floor.** Mark present from the roster, with a count of who's left to mark.
2. **Clock in and out.** Track your hours, see your week, and fix a missed punch.
3. **Every student's details.** My Students has profiles and family contacts, ready when you need them.
4. **Share the day.** Upload class photos and message families without giving out your number.

### Capabilities, admins
1. **Applications on the go.** Review new applications, accept or decline, and mark students enrolled from your phone.
2. **School at a glance.** Setup progress, recent activity and staff hours today on one dashboard.
3. **Messages and bulletin.** Answer families and post updates wherever you are.
4. **Payments as they land.** Check transactions without opening a laptop.

### Use cases
1. **Drop-off.** *Scenario:* A teacher marks the roster at 8:05 on her phone. *Outcome:* Parents get a push that their child is marked present, and the founder sees attendance without walking the building.
2. **Tuition due tomorrow.** *Scenario:* A parent gets the email reminder. *Outcome:* She opens the app in the car line, pays by bank account and turns on autopay. The receipt is in the app.
3. **Field-trip photos.** *Scenario:* A teacher uploads photos from the trip. *Outcome:* Families get a push that new photos are posted and see them in the app, with no shared-drive link.
4. **A new application at 9 pm.** *Scenario:* A family applies after a tour. *Outcome:* The founder opens it on her phone, reads the answers and payment, and marks it under review.

### FAQ
1. **Is the app on Android?** Not yet. The MudKitchen app is on the App Store for iPhone today. On Android, join the waitlist on our download page and we'll email you when it's on Google Play. Everything also works in a phone browser.
2. **Can families apply through the app?** Applications and enrollment checklists are completed on the web from your apply link. Once a family is enrolled, they sign in to the app for billing, messages and everything else.
3. **Does it show our school's brand?** Yes. Families download "MudKitchen", choose your school, and see your logo and colors throughout.
4. **What do push notifications cover?** New messages, bulletin posts, newsletters, new photos, classroom sign-up reminders, committee updates, and child check-in and pickup. Tuition reminders arrive by email.
5. **Do teachers and admins need a separate app?** No. The same app opens the family, staff or admin view based on your role. If you have more than one role, you can switch between them.

### Comparison rows

| Row | MudKitchen | Group text + email + Venmo | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| One app for families, staff and admins | Yes | No: 3+ apps | Yes (same app). https://apps.apple.com/app/id902823296 | Yes, per homepage. https://www.tryplayground.com/ | Parent view plus a separate iPad teacher app. https://transparent-classroom.helpscoutdocs.com/article/40-share-with-parents-using-our-mobile-app |
| iPhone / Android | iPhone live; Android waitlist | n/a | iPhone yes; Android unconfirmed this session | "iOS or Android". https://help.tryplayground.com/en/articles/5356813-guardian-app-overview | iOS and Android (parent view) |
| Pay tuition in the app | Yes: card or bank, autopay | Venmo/Zelle, no ledger | "online bill pay" (App Store listing) | Billing tab, "make payments". (guardian app article) | Via Onespot partner. https://transparent-classroom.helpscoutdocs.com/article/452-onespot-transparent-classroom-partnership |
| Two-way messaging with attachments | Yes | Yes, but personal numbers and no record | Yes (App Store listing) | Chat with staff. (guardian app article) | Group chats via Onespot partner |
| School's own branding | School logo and colors inside the MudKitchen app | n/a | Unconfirmed | Branded experience; own store listing needs 5+ locations. https://www.tryplayground.com/solutions/branded-app | Unconfirmed |
| Staff attendance and time clock on phone | Yes: attendance plus My Hours | Paper or sheet | Attendance and check-in (listing) | Check-in by QR (parent side); staff time tracking listed on homepage | Unconfirmed |
| Admins review applications on phone | Yes | n/a | Unconfirmed | Unconfirmed | Unconfirmed |
| Push for check-in / pickup | Yes ("Child marked present", "Child picked up") | No | Unconfirmed | Unconfirmed | Push via Onespot partner |

Honest takeaway: every rival has a capable app, and Playground and Brightwheel are on Android today, which we aren't. Our differences are one app across admin, staff and family roles with the school's own colors at any size (Playground needs 5+ locations for a standalone app), admissions on the phone, and the teacher time clock.

## Open questions / things you could not verify

- **The Google Play launch date.** Until it's live, every page must say "iPhone now, Android coming". Don't use "iOS and Android" from earlier drafts.
- Brightwheel's Android listing and branding options. Playground's staff-app details. TC's staff app on Android.
- Whether the in-app branding (logo and colors) applies on all parent screens or only some. Check with a simulator pass (see memory: parent-mobile verification notes).
- No billing pushes exist. If product adds tuition-due pushes, update FAQ 4.
- Mailchimp's 35.64% education open rate came from a search summary. Confirm it on the page.
- No first-hand founder quotes about apps were found.
