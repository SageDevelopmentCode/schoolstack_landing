# Student records (admin Students · teacher My Students · parent My children)

Research date: 22 Nov 2026. Rivals: Brightwheel, Playground, Transparent Classroom (see `_rivals.md`). Procare notes kept, marked "not used". Covers the student roster, health info (allergies, medications, health updates), emergency contacts and authorized pickup.

## Product truth (capabilities by role, with file paths; web/mobile)

**Platform note:** "Mobile" below means the MudKitchen **iPhone app**. It is iPhone-only today (Google Play is not live; the download page runs an Android waitlist). In copy, write "iPhone app", never "iOS and Android". Push notifications reach iPhone users only.

The model: a student enters the roster when their application is **marked enrolled in Admissions**, so there's no re-typing. Each student record has **Overview** (name, DOB, grade, status, programs), **Family** (household, primary email/phone), **Health** (allergies, medications, health updates), **Photo permissions**, **Classrooms**, and on the family side, an **Authorized pickup** list. Parents, teachers and admins can all add to the health profile, and the other side is notified.

Health item types (`src/lib/student-health/types.ts`):
- **Allergy**: allergen, severity (low / medium / high), treatment notes ("Treatment used in case of a reaction")
- **Medication at school**: name, dose, time of day, days of week, instructions, start date, end date or ongoing
- **Health update**: title + details + date range (e.g. "Stomach bug — staying home today", "Cleared for PE after ankle sprain")

Each item records who added it (`addedBy: "parent" | "school"`) and when it was updated.

### School admin / founder
| Capability | Proof | Web / Mobile |
|---|---|---|
| Enrolled-students roster, fed from Admissions ("Students appear here once their applications are marked enrolled.") | `src/components/school-admin/students/StudentsPage.tsx`, `StudentsTableData.tsx` | Web + mobile (`apps/mobile/src/app/school-admin/[slug]/students/index.tsx`) |
| "Students at a glance": enrolled, new enrollments (last 30 days), needs attention (no classroom), standing health items | `StudentsPage.tsx`, `useStudentsModel.ts` (strings "New enrollments", "Last 30 days", "Needs attention", "Has standing health items") | Web + mobile |
| Search by student, family or email; filter by program | `StudentsPage.tsx` ("Search students, families, or email", "All programs") | Web + mobile |
| Student profile: Overview, Family, Health, Photo permissions, Classrooms, link to the original application | `src/components/school-admin/students/StudentDetailPanel.tsx` ("Core profile information…", "Household contact details…", "View the original application for this student.") | Web + mobile (`student-detail-screen.tsx`) |
| Add/edit/remove allergies, medications and health updates. "Families are notified when you add or update health items here." | `src/components/school-parent/health/ParentChildHealthTab.tsx` (admin variant, ~line 105), `apps/mobile/src/components/school-admin/students/garden/admin-health-form-sheet.tsx`, `student-health-panel.tsx` | Web + mobile |
| Photo/media consent per student | `src/lib/students/photo-media-consent.ts`, `StudentDetailPanel.tsx` (`ConsentChip`) | Web |
| Assign classrooms from the student list | `StudentClassroomPicker.tsx` (see `classrooms.md`) | Web + mobile |
| Collect emergency contacts, physician, insurance and immunizations at enrollment with ready-made checklist forms: "Emergency Contact, Health & Immunization Form", "Emergency Medication Plan", immunization records | `src/lib/admissions/enrollment-checklist-item-templates.ts` (`health_emergency_form` fields "Emergency contact name", "Emergency contact phone", "Relationship to child", "Physician name", "Clinic / practice"; `medication_plan`; `immunization_records`) | Web (Admissions) |
| See the family's pickup list at pickup time (attendance) | `src/components/school-admin/attendance/AttendancePickupSheet.tsx` | Web + mobile |
| Activity log of health and pickup-list changes | `src/lib/student-health/student-health-notifications.ts`, `src/lib/authorized-pickup/authorized-pickup-notifications.ts` (`logActivityEvent`), `src/components/school-admin/AdminActivityNotificationsPanel.tsx` | Web |

### Staff / teachers (My Students)
| Capability | Proof | Web / Mobile |
|---|---|---|
| Roster of assigned students with search ("press / to jump to it"), program filters, and an All students tab | `src/lib/school-teacher/teacher-documentation.ts` (~150–176), `src/components/school-teacher/TeacherMyStudentsPage.tsx` | Web + mobile (`apps/mobile/src/app/teacher/[slug]/my-students.tsx`) |
| "Health flags" tile: tap to show only students with health items | `teacher-documentation.ts` ("Tap a number, like Health flags, to show just those students."), `src/lib/student-health/types.ts` (`HealthAttentionSummary`: high-severity allergies, active medications) | Web + mobile |
| Student profile with Overview, Family and Health tabs | `teacher-documentation.ts` (~211–236) | Web + mobile (`teacher-student-detail-screen.tsx`, "Health info on file") |
| Teachers can add or update health items. "Families and the school office are notified when you add or update health items here." | `ParentChildHealthTab.tsx` (teacher variant), `src/app/api/teacher-portal/students/[studentId]/health/route.ts` (POST), `[itemId]/route.ts` (PATCH, DELETE), `src/lib/student-health/authorize-teacher-student.ts` | Web |
| Message the family from the student profile | `apps/mobile/src/components/teacher/students/garden/teacher-student-detail-screen.tsx` ("Message the family") | Mobile |

### Families / parents (My children)
| Capability | Proof | Web / Mobile |
|---|---|---|
| Child record with sections: Profile, Health, Authorized pickup, Teachers, Application, Enrollment checklist | `src/components/school-parent/children/ParentChildRecordWorkspace.tsx`, `garden/child-record-format.ts` (labels) | Web + mobile (`apps/mobile/src/components/parent/children/garden/`) |
| Upload the child's profile photo | `garden/ChildSnapshotCard.tsx` ("Add photo", "Change photo"), `apps/mobile/src/components/parent/children/editable-student-photo.tsx` | Web + mobile |
| Health profile: add allergies (with severity and treatment), medications at school (dose, time, days, dates) and health updates. "Teachers and the school office are notified when you share updates here." | `src/components/school-parent/health/ParentChildHealthTab.tsx`, `ParentHealthFormPanel.tsx`, `src/lib/parent-portal/parent-documentation.ts` ("Update student health info", ~line 400) | Web + mobile (`garden/health/child-health-section.tsx`, `garden-health-form-sheet.tsx`) |
| Authorized pickup list: name, relationship, phone, notes. "People allowed to pick up {child}. They do not need a MudKitchen account." | `src/components/school-parent/pickup/ParentChildPickupTab.tsx`, `ParentPickupContactFormSidebar.tsx`, `src/lib/authorized-pickup/types.ts` | Web + mobile (`garden/pickup/child-pickup-section.tsx`) |
| "Reuse from another child": copy pickup contacts between siblings | `src/components/school-parent/pickup/ParentPickupReuseSheet.tsx`, `src/lib/authorized-pickup/load-family-pickup-reuse-options.ts` | Web |
| Home "Start here" prompts: "Update your child's health profile", "Set your authorized pickup list" | `src/lib/organization-settings/catalog.ts` (`update_child_health`, `authorized_pickup`), `garden/ChildNextStepsCard.tsx` ("Review {name}'s health profile") | Web + mobile |
| See the child's teachers | `garden/ChildTeamCard.tsx` | Web + mobile |

### Existing approved copy
- `src/components/home/home-copy.ts`: "Student records and family information"; "Keep schedules, notes, and student details in one place."
- `src/lib/marketing/download-app-slides.ts`: "Teachers find every student's details in My Students."
- `src/lib/marketing/product-preview-tabs.ts` (Enrollment): "Enrollment with health info, emergency contacts, uploads, and signatures."

### Watch-outs (keep out of copy)
- **Emergency contacts are not a structured field on the student record.** They're collected through the enrollment checklist form ("Emergency Contact, Health & Immunization Form"). The parent help guide summary says "Keep health records, allergies, and emergency contacts up to date" (`parent-documentation.ts` ~403), but the Health tab only has allergies, medications and updates. Say "collect emergency contacts at enrollment", not "emergency contacts on every profile".
- No printable emergency card / emergency info report, no immunization tracker on the profile (immunizations are uploaded/collected via enrollment checklist), no roster export, no custom student fields found.
- Health-change "notifications" are activity events in the portals' activity feeds. No email/push for health changes was found. Say "notified in MudKitchen", not "emailed" or "texted".
- Admins and teachers can't edit the family's pickup list. Families own it.

## Founder pain (with quotes + sources)

1. **Allergies are in every class.** "An estimated 1 in 13 children (8%), or 2 students per classroom, are affected with food allergies." (CDC, 2024, https://cdc.gov/school-health-conditions/food-allergies/index.html) A substitute or new aide needs that information on day one, not in a binder in the office.
2. **Custody and pickup are a real risk.** "In 2023, 59% of all AMBER Alerts that were issued were for family abduction cases." NCMEC advises parents to "Advise the child's school or daycare of custody orders." (NCMEC, https://www.missingkids.org/FamilyAbduction) Schools need a current list of who may take a child, kept by the family.
3. **Health records are a legal duty, even for private schools.** Texas: "All schools and child-care facilities are required to maintain immunization records" (25 TAC §97.67), and the rules cover "public or private primary or secondary schools" (§97.61). Florida private schools "shall require students to present a certification of immunization" (Fla. Stat. 1002.42(6)).
4. **Information lives in too many places.** The MudKitchen home page already names this: "Student details sit in spreadsheets." (`src/components/home/home-copy.ts`) Sage Field's own experience is the founder story to use here. Third-party founder quotes could not be collected (reddit.com is blocked for the research tool).

## Evidence (numbered: quote — publisher, year — URL)

1. "An estimated 1 in 13 children (8%), or 2 students per classroom, are affected with food allergies." — Centers for Disease Control and Prevention, 2024 (page dated 9 July 2024) — https://cdc.gov/school-health-conditions/food-allergies/index.html
2. "At least 2 in 5 children (40%) have been treated in the emergency department for food allergy reactions." — CDC, 2024 — https://cdc.gov/school-health-conditions/food-allergies/index.html
3. "In 2023, 59% of all AMBER Alerts that were issued were for family abduction cases." / "Of the 28,886 cases of missing children reported to NCMEC in 2023, 4.1% were family abductions." — National Center for Missing & Exploited Children, 2023 data — https://www.missingkids.org/FamilyAbduction
4. "All schools and child-care facilities are required to maintain immunization records" … "sufficient for a valid audit or other assessment" and "Immunization records may be maintained in paper and/or electronic form." — Texas Administrative Code, 25 TAC §97.67 (via Cornell LII), current text checked Nov 2026 — https://www.law.cornell.edu/regulations/texas/25-Tex-Admin-Code-SS-97-67. Scope: "public or private primary or secondary schools" — 25 TAC §97.61 — https://www.law.cornell.edu/regulations/texas/25-Tex-Admin-Code-SS-97-61
5. Florida private schools "shall require students to present a certification of a school-entry health examination" (s. 1002.42(5)) and must "Require students to present a certification of immunization" (s. 1002.42(6)(a)). — Florida Legislature, 2025 statutes — https://www.flsenate.gov/Laws/Statutes/2025/1002.42

## Tool stack alternative

What founders use today:
- **Enrollment via Google Forms or Jotform**, with answers landing in a response spreadsheet (`_rivals.md`: Google Forms appears in 14 of 46 prospect tool stacks, Jotform in 6).
- **A master Google Sheet** of students, parents, phones and allergies.
- **A Google Drive folder per family** for immunization records and signed forms.
- **A red emergency binder** with printed allergy and contact sheets.
- **Pickup lists** on the enrollment form, or in texts ("Grandma is getting Leo today").

How it fails:
- **Out of date by October.** Families change phones, medications and custody arrangements, but the form was a one-time snapshot and no one re-sends it.
- **The teacher doesn't see it.** Allergies sit in the office spreadsheet, not on the teacher's class list.
- **Pickup by text.** A "Grandma's coming today" text sits in one staff member's phone. The next adult at the door doesn't know.
- **No trail.** Nobody can say who changed the allergy note, or when.
- **Sensitive data shared too widely.** A shared Drive folder or sheet gives every helper every family's health and custody details.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel** (checked Nov 2026)
- Contact types: Parent, Family, Approved Pickup, Emergency Contact. Emergency contacts "are not invited to create brightwheel accounts and cannot check a student in/out." https://help.mybrightwheel.com/en/articles/1161612-add-and-invite-student-contacts
- Allergies field with badges on student profiles, medications as a free-form field. The Student Emergency Information report includes allergies, medications, emergency and parent contacts, and doctor info. https://help.mybrightwheel.com/en/articles/9659904-print-student-information-for-emergencies (from search results)
- Parents with edit rights can manage contacts, but "the provider will not be alerted when a new contact is added." https://help.mybrightwheel.com/en/articles/1161627-manage-your-child-s-contacts-and-approved-pickup-list (from search results)
- Tier: unconfirmed (quote only). https://mybrightwheel.com/pricing/

**Playground** (checked Nov 2026)
- Student profile tabs: Overview, Billing, Paperwork, Feed, Activity, Assessments, Immunizations, Settings. Admins edit allergies and medications on Overview and can add custom fields. https://help.tryplayground.com/en/articles/9557921-student-profile-overview
- "Families cannot update a student's allergies or medications on their own." They must ask the admin. https://help.tryplayground.com/en/articles/5406865-view-edit-a-student-s-profile-as-a-family (from search results)
- Guardian types include "Authorized Pickup" ("only have the ability to check a student in and out") and "Emergency Contact" ("Listed as a guardian but has no access to Playground"). https://help.tryplayground.com/en/articles/6460616-add-manage-guardians-as-a-family
- Printable emergency cards (one page per student: medical info, guardians). https://help.tryplayground.com/en/articles/9533710-printable-emergency-cards-for-students (from search results)
- Price: quote only. https://www.tryplayground.com/pricing

**Transparent Classroom** (checked Nov 2026)
- "Simply use the [Parent] dropdown menu to view the allergies". "[Parents] will give you the option to view Parents, Approved Adults, Emergency Contact, Normal Hours, and Birthdates", and these can be printed. "To update information such as Emergency Contacts and Normal Hours, you need to edit from the child's profile page." https://transparent-classroom.helpscoutdocs.com/article/21-children-page
- Medications, structured health updates, and notifications on change: **unconfirmed**.
- $2/child/month. https://www.transparentclassroom.com/pricing

**Procare (not used)** (checked Nov 2026)
- Family Data holds enrollment, classrooms and immunization records, plus authorized pickups and emergency contacts (Getting Started guide, several years old, from search results). http://cdn.procaresoftware.com/pdfs/support/Procare-User-Guide.pdf

## Draft copy (sections as in 2e)

**Hero headline:** Lead: "Every child's details," Accent: "current, shared and in one place." (9 words)

**Hero body (34 words):** Families keep allergies, medications and pickup lists up to date from their phone. Teachers see them on their roster. When anyone adds a health update, the other side is notified in MudKitchen.

**One-liner (12 words):** Student records families keep current and teachers can actually see.

**Capabilities: School admin**
1. **Roster from enrollment**: Students appear the moment you mark them enrolled. No retyping from the application.
2. **One profile per child**: Family contacts, programs, classrooms, health and photo permissions on one page.
3. **Health at a glance**: See which students have standing health items, and add or update allergies, medications and notes.
4. **Emergency info at enrollment**: Collect emergency contacts, physician and immunizations with ready-made enrollment forms.
5. **Who's missing a class**: Spot enrolled students without a classroom and place them in a few taps.

**Capabilities: Staff**
1. **Your students first**: Your assigned students, searchable, with a tab for everyone else at school.
2. **Health flags**: Tap one number to see every student with allergies or medications at school.
3. **Share what you saw**: Log a health update, like "ate lunch, no reaction", and the family and office are notified.
4. **Call the family**: Family contacts are on each profile, and you can message parents from the iPhone app.

**Capabilities: Families**
1. **You keep it current**: Add allergies with severity and treatment, medications with dose and schedule, or a quick health update.
2. **Your pickup list**: Add grandparents, sitters or carpool parents with phone and notes. They don't need an account.
3. **Siblings in one step**: Copy pickup contacts from one child to another.
4. **The school hears you**: Teachers and the office are notified when you add or change health information.
5. **From your phone**: Everything works on the web and in the MudKitchen iPhone app.

**Use cases**
1. *A new peanut allergy, mid-year.* Scenario: A child is diagnosed in November. Outcome: The parent adds the allergy with "high" severity and EpiPen instructions from her phone. The lead teacher and office are notified, and the child now shows under Health flags.
2. *"Grandpa's getting her today."* Scenario: A grandfather picks up for the first time. Outcome: The family added him to the authorized pickup list in September. The teacher sees him in Record Pickup and confirms.
3. *A substitute's first morning.* Scenario: The lead teacher is out sick. Outcome: The sub signs in with a one-time code, taps Health flags and sees the two students with medications today, with dose and time.
4. *Stomach bug at home.* Scenario: A parent keeps a child home. Outcome: She posts a health update ("staying home today") with dates, and the teacher sees it before roll call.

**FAQ**
1. *Who can update a child's health information?* Families, teachers and school admins can all add or update allergies, medications and health updates. Whenever one side makes a change, the other side is notified in MudKitchen, and each item shows who added it and when. (39 words)
2. *Where do emergency contacts go?* Collect them at enrollment with the ready-made "Emergency Contact, Health & Immunization Form" in your enrollment checklist. Day-to-day pickup permissions live on each child's authorized pickup list, which families manage. (32 words)
3. *Do authorized pickup contacts need an account?* No. Families add a name, relationship, phone and notes. Staff see that person when recording pickup, and the parents are notified who collected their child. (29 words)
4. *Can teachers see every student's health information?* Teachers see their assigned students first and can open any enrolled student's profile, including the Health tab. Give staff access only to people you'd trust with that information. (31 words)
5. *Do I have to retype students from applications?* No. When you mark an application enrolled in Admissions, the student appears on your roster with their family details. (24 words)

**Comparison rows**

| Label | MudKitchen | Tool stack (Forms + Sheets + Drive + binder) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Allergies with severity + treatment | Yes | Free-text cell | Allergy field + badges ([help](https://help.mybrightwheel.com/en/articles/9659904-print-student-information-for-emergencies)) | Allergies on Overview ([help](https://help.tryplayground.com/en/articles/9557921-student-profile-overview)) | Allergies viewable/printable ([help](https://transparent-classroom.helpscoutdocs.com/article/21-children-page)) |
| Medication schedule (dose, time, days) | Yes | Free text | Free-form medications field ([help](https://help.mybrightwheel.com/en/articles/9659904-print-student-information-for-emergencies)) | Medications on Overview ([help](https://help.tryplayground.com/en/articles/9557921-student-profile-overview)) | Unconfirmed |
| Families update health info themselves | Yes, and staff are notified | Re-submit the form | Parents with edit rights ([help](https://help.mybrightwheel.com/en/articles/1161627-manage-your-child-s-contacts-and-approved-pickup-list)) | No, must ask the admin ([help](https://help.tryplayground.com/en/articles/5406865-view-edit-a-student-s-profile-as-a-family)) | Via forms (unconfirmed) |
| Family-managed authorized pickup list | Yes, no account needed | On the form / by text | Approved Pickup contacts; provider not alerted of new ones ([help](https://help.mybrightwheel.com/en/articles/1161627-manage-your-child-s-contacts-and-approved-pickup-list)) | Authorized Pickup guardian type ([help](https://help.tryplayground.com/en/articles/6460616-add-manage-guardians-as-a-family)) | Approved Adults ([help](https://transparent-classroom.helpscoutdocs.com/article/21-children-page)) |
| Emergency contacts | Collected at enrollment (checklist form) | On the form | Emergency Contact type ([help](https://help.mybrightwheel.com/en/articles/1161612-add-and-invite-student-contacts)) | Emergency Contact guardian type ([help](https://help.tryplayground.com/en/articles/6460616-add-manage-guardians-as-a-family)) | On child profile ([help](https://transparent-classroom.helpscoutdocs.com/article/21-children-page)) |
| Printable emergency sheet | No | The binder | Emergency info report ([help](https://help.mybrightwheel.com/en/articles/9659904-print-student-information-for-emergencies)) | Emergency cards ([help](https://help.tryplayground.com/en/articles/9533710-printable-emergency-cards-for-students)) | Print from Children page ([help](https://transparent-classroom.helpscoutdocs.com/article/21-children-page)) |
| Roster built from enrollment | Yes | Copy-paste | Unconfirmed | Unconfirmed | Unconfirmed |
| Published price | See MudKitchen pricing | Free | Quote only ([pricing](https://mybrightwheel.com/pricing/)) | Quote only ([pricing](https://www.tryplayground.com/pricing)) | $2/child/mo ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: MudKitchen's strongest differentiator is the **two-way health profile** (families and teachers both update it, the other side is notified, each item shows who added it), set against Playground's admin-only edits. The gaps to own or fix: a printable emergency sheet, and emergency contacts as structured profile fields.

## Open questions / things you could not verify

- **Emergency contacts:** decide whether to add a structured emergency-contact field to the student record. Today it depends on the enrollment checklist form, and the parent help guide implies it's on the Health tab.
- **Printable emergency info:** all three rivals offer it in some form. MudKitchen has none.
- **Notification channel for health changes:** only activity-log events were found. Confirm whether admins/teachers get email or push for a parent's health update before saying "notified".
- **Rival details from search summaries** (Brightwheel allergy badges/emergency report, Playground family edit limits and emergency cards) should be opened and re-checked before publishing.
- **Arizona immunization rule for private schools** (A.R.S. 15-873) was not checked.
- **Founder quotes:** reddit.com is blocked for the research tool.
