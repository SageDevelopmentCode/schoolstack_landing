# Classroom signups

Slug: `classroom-signups`. Researched Nov 22, 2026. Rivals: Brightwheel, Playground and Transparent Classroom (see `_rivals.md`).

> **Read first:**
> - Teachers create and manage signups **on the web only**. The teacher mobile screen is a "coming soon" placeholder (`apps/mobile/src/app/teacher/[slug]/more/classroom-signups.tsx`), so leave it out of the copy.
> - Families respond on **web and mobile**.
> - Admins have **no dedicated signups page**. They turn the feature on or off for staff and families in settings.
> - Signups don't take payments and don't add to calendars (neither appears in the code).

## Product truth (capabilities by role, with file paths; web/mobile)

Feature flags: `classroom_signups` for teachers ("Parent volunteer signups for classroom events") and parents ("Respond to teacher volunteer requests"). It is on by default for both — `src/lib/organization-settings/catalog.ts:145,165,323-328,425-430`.

### Staff / teachers (web)

| Capability | Proof |
|---|---|
| Five starting templates: **Reading buddies**, **Class event helpers** (e.g. "Spring play volunteers": Sets & scenery, Costumes, Setup & cleanup), **Field trip chaperones**, **Class party contributions** ("Healthy snacks"…), and **Blank**. | `src/lib/classroom-signups/templates.ts`; `src/lib/classroom-signups/types.ts` (`ClassroomSignupTemplateId`); `src/components/classroom-signups/teacher/SignupTemplateSidebar.tsx` |
| Three signup types: **Time slots** (label, date, start, end, capacity), **Roles & tasks** (name, description, quantity needed), and **Open signup** (a "Prompt for parents" families answer with a note). | `types.ts` (`ClassroomSignupType`, `ClassroomSignupTimeSlot`, `ClassroomSignupRole`, `SIGNUP_TYPE_LABELS`); `ClassroomSignupConfigureForm.tsx:133-476` |
| Options: allow multiple selections, cap the number of families, optional response deadline. | `types.ts` (`ClassroomSignupConfig.allowMultipleSelections`, `maxFamilies`; `responseDeadline`); `ClassroomSignupConfigureForm.tsx:156-166` |
| Audience: families of the teacher's assigned students, one classroom, or several classrooms. | `types.ts` (`ClassroomSignupAudience`); `src/lib/classroom-signups/audience.ts`; `validate-signup-audience.ts` |
| Status flow: Draft, Open, Closed. | `types.ts` (`SIGNUP_STATUS_LABELS`); `src/app/api/teacher-portal/classroom-signups/[signupId]/route.ts` |
| Signup list with metrics (open signups, responses this week, needing attention). The dashboard "Start here" card shows sheets with open slots. | `types.ts` (`ClassroomSignupMetrics`); `useTeacherClassroomSignupsModel.ts:106`; `teacher-documentation.ts:89,110,383-416` |
| Open a signup to see slots, roles and which families signed up. **Export CSV** (Family, Guardian, Email, Student, Signed up for, Note, Submitted), with spreadsheet-formula injection neutralised. | `teacher-documentation.ts:376-379`; `src/lib/classroom-signups/export-responses-csv.ts` |
| **Send reminder** to families who haven't signed up yet: an editable message (up to 1,000 characters) sent **by email and phone notification**, at most once per hour per signup. The default text is "<Teacher> needs help with '<title>'. Please sign up by <deadline>." | `teacher-documentation.ts:409-414`; `src/lib/classroom-signups/signup-reminder-rules.ts`; `signup-reminders.ts` (`sendClassroomSignupReminderEmail`, `sendExpoPushToUsers`); `ClassroomSignupNotifyModal.tsx:29,85-158`; `src/app/api/teacher-portal/classroom-signups/[signupId]/remind/route.ts` |
| Published, closed and response events are written to the school activity log. | `src/lib/classroom-signups/classroom-signup-notifications.ts` |

### Families / parents (web + mobile)

| Capability | Proof | Web | Mobile |
|---|---|---|---|
| Open signups appear in the **Start here** card on Home and in a signups list (Needs response / Signed up / Closed) with a "Next up" card. | `parent-documentation.ts:487-513`; `src/app/api/parent-portal/signups/attention/route.ts`; `src/components/classroom-signups/parent/garden/SignupsNextUpCard.tsx`, `SignupsListCard.tsx`; `types.ts` (`ParentClassroomSignupListStatus`) | ✓ | ✓ (`apps/mobile/src/components/parent/classroom-signups/*`) |
| Pick a time slot or role, choose which child it's for, and add a note. **Full slots and roles are marked "Full"** and can't be picked. | `garden/GardenSignupOptions.tsx:46-120`; `garden/useSignupResponseForm.ts:41-110`; `src/lib/classroom-signups/utils.ts` (`isSlotFull`, `isRoleFull`) | ✓ | ✓ |
| Change or **withdraw** a signup later. | `useSignupResponseForm.ts:15,27,46` (withdraw = DELETE); `parent-documentation.ts:509-510` | ✓ | ✓ |
| **Privacy:** families see how full a slot is, but not other families' names. Other responses are anonymised before reaching the parent. | `src/lib/classroom-signups/parent-response-visibility.ts` (`toParentVisibleSignupResponses`) | ✓ | ✓ |
| Reminders arrive by email and push, with a sign-up button. | `signup-reminders.ts`; `ClassroomSignupNotifyModal.tsx:153` ("Families see this message with the signup title and a button to sign up.") | email | push |

### Admin / founder

| Capability | Proof | Web | Mobile |
|---|---|---|---|
| Turn Classroom signups on or off for the staff and parent portals. | `catalog.ts` (`teacher.classroom_signups`, `parent.classroom_signups`) | ✓ | — |
| No admin signups page was found. Activity is logged to the school activity log (see above). Don't claim "admins see every signup" without checking. | grep of `src/app/school/[slug]/admin`, `src/components/school-admin` | — | — |

## Founder pain (with quotes + sources)

- **Volunteer gaps cancel events.** "More than half of PTO and PTA leaders (54%) have had to cancel or scale back school events because of low volunteer turnout." — PTO Today, Feb 5, 2026 — https://www.ptotoday.com/pto-today-articles/state-of-school-volunteering-pto-pta-leaders
- **The asks don't reach everyone.** "52% of leaders say these groups [dads, grandparents, caregivers] don't volunteer more often because they aren't the primary recipients of school communications." Also: "37% say volunteer opportunities don't fit their schedules." — same URL
- **Small, specific asks work.** "Short, simple, and flexible volunteer shifts have helped 58% of schools re-engage volunteers." — same URL
- **Rival founder answer: use a spreadsheet.** When a Transparent Classroom user asked for parents "to be able to login and sign up for events", the founder replied: "You can do this today by embedding a Google Sheet in a page for parents to see." The status is Declined (2017). — https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/18556135-online-parent-teacher-conference-sign-up-schedule
- **Microschools still run one-off signups on generic tools.** Family Lyceum has a SignUpGenius page left over from 2023 summer camps (`src/data/outreach/family-lyceum.ts:68`). Little Sprigs ran a 2026 summer-program sign-up on a Google Form, with Omella emailing for payment (`little-sprigs-tampa.ts:47-48`; https://littlesprigsoftampa.org/).
- **Sign-up tools' own advice shows the sprawl.** SignUpGenius recommends specific roles and defined time slots, because vague slots go unclaimed (search summary of https://www.signupgenius.com/resources/classroom-volunteer-sign-up). SignUp.com suggests one interest form first, then a separate sheet per classroom activity (search summary of signuphelp.zendesk.com).

Reddit and parent forums blocked automated access. A human pass for first-person "room parent" quotes would help.

## Evidence (numbered: quote — publisher, year — URL)

1. "Short, simple, and flexible volunteer shifts have helped 58% of schools re-engage volunteers." — PTO Today, 2026 — https://www.ptotoday.com/pto-today-articles/state-of-school-volunteering-pto-pta-leaders
2. "Digital sign-ups, such as QR codes or volunteer management platforms, have helped 42% of schools…" — PTO Today, 2026 — same URL
3. "More than half of PTO and PTA leaders (54%) have had to cancel or scale back school events because of low volunteer turnout." — PTO Today, 2026 — same URL
4. Easiest roles to fill: "Classroom volunteers/room parent roles: 44%" (against "Event volunteers… 58%" among the hardest). — PTO Today, 2026 — same URL
5. **Parents at small private schools do show up.** "Volunteered at school", 2019: **private elementary 75.9%**, private overall 72.1%, public 39.9%. — NCES, Digest of Education Statistics Table 207.40, 2022 edition — https://nces.ed.gov/programs/digest/d22/tables/dt22_207.40.asp?current=yes
6. **Sign-up sheets are a mass habit.** "5.7 million+ sign ups created" and "102 million+ needs filled" in 2025. — SignUpGenius, "2025 by the Numbers", Dec 19, 2025 — https://www.signupgenius.com/blog/signupgenius-year-in-review

PTO Today gives no sample size or field dates. Cite it as "a 2026 PTO Today survey of PTO and PTA leaders".

## Tool stack alternative

- **SignUpGenius / SignUp.com.** Parents get one more account and one more link. The free tier shows ads. The sheet doesn't know which families are in which classroom, so the teacher pastes email lists. There's no link to the child's record, and the "who signed up" list is often visible to every parent.
- **Google Forms / Sheets.** No capacity limits (two families take the same chaperone seat), no reminders to only the families who haven't answered, and someone reconciles the sheet by hand.
- **Paper sheet on the classroom door.** It only reaches parents who come to pickup. That makes the "aren't the primary recipients of school communications" problem (52%, see founder pain above) worse, and misses hybrid and drop-off families.
- **Group text / WhatsApp.** "I can do Tuesday!" messages scroll away, the teacher tallies by hand, and nobody knows a slot is full.

Concrete failure moments:
- Four families bring cupcakes and nobody brings plates.
- The field-trip bus has two chaperones because the third signed up in a different thread.
- The teacher spends Sunday night copying names from a SignUpGenius page into an email.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel**: **Included** ("access to all features on the platform").
- Sign-ups with four slot types: Item slot (supplies or snacks), Time slot, Recurring slot and Time series (e.g. conferences).
- Admin, Manager, Staff and Lead Staff can create them ("Log in on the web"). Staff without Parent Messaging can't access Sign-ups.
- Families sign up, add notes and cancel under Paperwork > Sign-ups. "Families cannot see who else signed up" but see "Filled". Families get an email or text confirmation.
- Limits: no link to calendar events, no payment through sign-ups, no printed sheets. Room targeting is not described. The help article doesn't mention reminders.
- Source: https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more (checked Nov 2026)
- Brightwheel's forms page promises "Reduce no-shows and keep slots filled with auto-reminders." — https://mybrightwheel.com/childcare-forms/ (checked Nov 2026)

**Playground**: **Not listed.** The feature index (llms.txt) has no sign-up, volunteer or conference page. — https://www.tryplayground.com/llms.txt (checked Nov 2026). A third-party directory lists "Volunteer Management": **unconfirmed**.

**Transparent Classroom**: **Not offered.** A parent event/conference sign-up request is marked Declined, and the founder suggests embedding a Google Sheet. — https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/18556135-online-parent-teacher-conference-sign-up-schedule (checked Nov 2026). Pricing: $2/child/month — https://www.transparentclassroom.com/pricing

**Honest read:** Brightwheel is the real competitor here, with more slot types, recurring slots and texts. MudKitchen's edges:
- Classroom-scoped audiences.
- Roles with quantities.
- A reminder that goes only to families who haven't answered (email + push).
- CSV export.
- Templates for microschool moments.
- One login with everything else.

## Draft copy (sections as in 2e)

Reference pages (structure): SignUpGenius classroom volunteer page (https://www.signupgenius.com/resources/classroom-volunteer-sign-up): roles, slots and reminders up front. Brightwheel sign-ups help and blog ("5 Creative Ways to Use Brightwheel Sign-Ups for Holiday Activities", https://mybrightwheel.com/blog/holiday-activity-sign-ups): use-case-led. SignUp.com teachers page (https://signup.com/volunteerspot/teachers).

**Hero headline:** Classroom help, signed up *without the group text* (lead: "Classroom help, signed up" / accent: "without the group text", 8 words)

**Hero body (32 words):** Post a signup for chaperones, readers or party snacks. Families in that class pick a slot from their phone, full slots close themselves, and one reminder reaches only who hasn't answered.

**One-liner (10 words):** Volunteer and supply signups for each classroom, in one place.

**Capabilities: Staff**
- **Start from a template.** Reading buddies, event helpers, field-trip chaperones and party contributions come ready to edit.
- **Slots, roles or open.** Offer timed slots with capacity, roles with a number needed, or an open question.
- **Ask the right families.** Send to your assigned students' families, one classroom or several. No email lists to paste.
- **Remind only who's left.** One tap sends your message by email and phone notification to families who haven't signed up.
- **Export the list.** Download a CSV of who signed up, for which child, and their notes.

**Capabilities: Families**
- **See it on Home.** Open signups show in your Start here card and in the app.
- **Pick what fits.** Choose a slot or role, pick which child it's for, and add a note.
- **No double-booking.** Full slots are marked Full, so you can't take a seat that's gone.
- **Change your mind.** Edit or withdraw your signup from the same page.
- **Your name stays private.** Other parents see how full a slot is, not who took it.

**Capabilities: Admin / founder**
- **Turn it on per portal.** Enable Classroom signups for teachers and families from settings.
- **Keep it in one login.** Signups sit next to billing, messages and forms, so families don't need another account.

**Use cases**
1. **Field-trip chaperones.** *Scenario:* A teacher uses the chaperone template: three seats for Thursday's museum trip, deadline Tuesday. *Outcome:* The third seat fills Monday night and the slot shows Full, so no one shows up expecting to ride.
2. **Class party snacks.** *Scenario:* Roles for fruit, drinks, plates and napkins, each with a number needed. *Outcome:* Families pick what's left, plates get covered, and the teacher exports the list the day before.
3. **Weekly reading buddies.** *Scenario:* Time slots every Wednesday for a month, sent to two classrooms. *Outcome:* On Monday the teacher sends one reminder, and it reaches only the families who haven't answered, by email and phone.
4. **Spring play crew.** *Scenario:* Roles for sets, costumes and setup/cleanup, with a note asking about skills. *Outcome:* Parents who can sew say so in the note, and the teacher has the full crew list in one CSV.

**FAQ**
- **Who can see who signed up?** Teachers see every response. Families see how many spots are taken but not other families' names.
- **Can I stop two families taking the same slot?** Yes. Each time slot has a capacity and each role a number needed. When it's full, families see "Full" and can't select it.
- **How do reminders work?** From an open signup, choose Send reminder and edit the message. It goes by email and phone notification to families in the audience who haven't signed up, at most once an hour.
- **Do families need another account?** No. They respond in the same MudKitchen parent portal and iOS/Android app they use for messages, forms and billing.
- **Can I collect money for supplies through a signup?** Not through signups. Use roles to ask for items, or bill a class fee through MudKitchen billing.

**Comparison rows**

| Label | MudKitchen | Tool stack (SignUpGenius + group text) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Built-in signups | Yes | Separate free/paid tool | Yes ([help](https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more)) | Not listed ([llms.txt](https://www.tryplayground.com/llms.txt)) | Declined; "embed a Google Sheet" ([UserVoice](https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/18556135-online-parent-teacher-conference-sign-up-schedule)) |
| Slot types | Time slots, roles with quantity, open | Many (SignUpGenius) | Item, time, recurring, time series | — | — |
| Send to a classroom | Assigned students, one or several classrooms | Paste email lists | Not described | — | — |
| Capacity / "Full" | Yes | Yes | "Filled" status | — | — |
| Remind non-responders | Email + push, non-responders only | Paid tiers / manual | "Auto-reminders" ([forms page](https://mybrightwheel.com/childcare-forms/)); not in help article | — | — |
| Other families' names hidden | Yes | Often visible | Yes ("cannot see who else signed up") | — | — |
| Export | CSV | Yes | Unconfirmed | — | — |
| Price | MudKitchen plan | Free with ads; paid upgrades | Quote only | Quote only | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

## Open questions / things you could not verify

- **Teacher mobile:** placeholder only ("coming soon"). Teachers can't create, view or remind from the app.
- **Admin view:** no admin signups page found. Decide whether founders need a school-wide view (many microschool founders are also the teacher).
- **Payments and calendar:** signups don't collect money or add events to the calendar.
- **Brightwheel reminders:** the marketing page says "auto-reminders", but the help article doesn't mention reminders. Treat as unconfirmed detail.
- **Brightwheel CSV export:** not checked.
- **Playground signups:** nothing on Playground's own pages, and a directory says "Volunteer Management". Unconfirmed either way.
- **No independent data** on how much reminders raise volunteer sign-up rates in schools. Don't claim a percentage lift.
