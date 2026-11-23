# Attendance (roll call)

Research date: 22 Nov 2026. Source of truth for product claims: the code and in-app help in this repo. Nothing marked "coming soon" is included.

Note on the help guides: `admin-documentation.ts` has no attendance guide yet, and the parent/teacher guides do not cover attendance either. Every claim below is proven from components, API routes and libs instead.

## Product truth (capabilities by role, with file paths; web/mobile)

**Platform note:** "Mobile" below means the MudKitchen **iPhone app**. It is iPhone-only today (Google Play is not live; the download page runs an Android waitlist). In copy, write "iPhone app", never "iOS and Android". Push notifications reach iPhone users only.

What attendance is in MudKitchen: one record per student per day, with three possible states: **Present**, **Absent**, **Picked up**. Unmarked students show as **Not marked**. Each mark stores a time and who recorded it. Pickup also stores *who* collected the child, picked from the family's parents on file or their authorized pickup list.
- Types: `src/lib/school-admin/attendance/attendance-types.ts` (`AttendanceRecordStatus = "present" | "absent" | "picked_up"`, `pickedUpByName`, `recordedByName`, `presentAt/absentAt/pickedUpAt`)
- Not in the product today (keep it out of copy): a **Tardy/Late** status, parent self check-in (kiosk, QR or PIN), parents reporting an absence, and an attendance export/CSV report. Searches of `src/components/school-admin/attendance`, `src/app/api/school-admin/attendance` and the parent attendance components found none of these.

### School admin / founder
| Capability | Proof | Web / Mobile |
|---|---|---|
| Daily roster with tap-to-filter tiles: Present, Absent, Not marked, Picked up | `src/components/school-admin/attendance/GardenAttendancePage.tsx` (lines ~135–150, "Mark daily attendance and record pickups for enrolled students.") | Web |
| Mark Present, Mark Absent, Mark Present again, Record Pickup | `src/components/school-admin/attendance/AttendanceActionLabel.tsx` | Web + mobile |
| Record pickup by choosing the adult from "Parents on file" or "Authorized pickup" | `src/components/school-admin/attendance/AttendancePickupSheet.tsx`, `src/lib/school-admin/attendance/attendance-pickup-contacts.ts`, `src/app/api/school-admin/attendance/pickup-contacts/route.ts` | Web + mobile (`apps/mobile/src/components/attendance/attendance-pickup-sheet.tsx`) |
| Move day by day (previous/next day, jump to today); past days can be marked | `src/components/school-admin/attendance/AttendancePage.tsx` (`?date=` param, `shiftDate`), `DashboardAttendanceSection.tsx` ("Previous day"/"Next day") | Web + mobile ("Jump to today") |
| Per-student history: each day's status, time, who picked up, who recorded it | `AttendanceStudentDetailSheet.tsx`, `AttendanceHistoryModal.tsx`, `src/lib/school-admin/attendance/attendance-history.ts` | Web + mobile (`attendance-detail-sheet.tsx`) |
| Today's attendance on the admin Dashboard ("X of Y students present") | `src/components/school-admin/attendance/DashboardAttendanceSection.tsx`, `src/lib/school-admin/attendance/dashboard-attendance.ts`, `src/components/school-admin/dashboard/garden/GardenAttendanceBoard.tsx` | Web |
| Turn attendance on per program (e.g. skip it for a drop-in or enrichment program); only students in attendance-enabled programs show on the roster | `src/lib/school-admin/attendance/program-attendance-enabled.ts`, `attendance-roster.ts` (lines ~192–199), `src/components/school-admin/admissions/ProgramParentPortalSettingsCard.tsx` | Web (settings) |
| Roster shows each student's programs and classrooms | `attendance-types.ts` (`programNames`, `classroomNames`), `attendance-roster.ts` | Web + mobile |
| Search the roster, "N left to mark" | `apps/mobile/src/components/attendance/attendance-screen.tsx`, `attendance-roster-panel.tsx` | Mobile (web has filter tiles) |
| Mobile app screen | `apps/mobile/src/app/school-admin/[slug]/more/attendance.tsx` → shared `AttendanceScreen` | Mobile |

### Staff / teachers
| Capability | Proof | Web / Mobile |
|---|---|---|
| Attendance page with the same roster, marks and pickup sheet | `src/components/school-teacher/TeacherAttendancePage.tsx`, `src/app/api/teacher-portal/attendance/{route,records/route,history/route,pickup-contacts/route}.ts` | Web |
| Guided roll call: one student at a time, plus a "Show who's left" strip and "Today · N left to mark" | `src/components/school-teacher/home/garden/TeacherRollCallDialog.tsx`, `src/components/school-teacher/attendance/useTeacherAttendanceModel.ts` ("guided roll call"), strings "Take roll call", "Show who's left" | Web |
| Roll call from the teacher Dashboard's day rhythm | `src/components/school-teacher/home/garden/TeacherDayRhythm.tsx`, `TeacherDashboardAttendanceStudentCard.tsx` | Web |
| Mark present/absent and record pickup from a phone | `apps/mobile/src/app/teacher/[slug]/more/attendance.tsx` (shared `AttendanceScreen`, "Mark present, record absences, and log pickups.") | Mobile |
| Teachers see the whole school roster for attendance, not only their own students | `src/app/api/teacher-portal/attendance/route.ts` calls `loadAttendanceRoster(admin, organizationId, date)` | Web + mobile |
| Attendance can be turned on or off for the teacher portal | `src/lib/organization-settings/catalog.ts` (`teacher.attendance`) | — |

### Families / parents
| Capability | Proof | Web / Mobile |
|---|---|---|
| Push notification when their child is marked present: "{Child} was marked present today." | `src/lib/school-admin/attendance/attendance-parent-expo-push.ts` (line ~79), `src/lib/notifications/mobile-push-catalog.ts` (`attendance.present`) | Mobile push |
| Push notification at pickup: "{Child} was picked up by {Name}." | `attendance-parent-expo-push.ts` (lines ~135–137), catalog `attendance.pickup` | Mobile push |
| Pushes go out once per day: a second "present" mark does not resend | `src/lib/school-admin/attendance/attendance-push-gating.ts` | — |
| Attendance page: Latest day, Recent weeks (colour-coded), History list, day drawer showing "Picked up by", "Recorded by", "Recorded at" | `src/components/school-parent/attendance/ParentAttendancePage.tsx`, `garden/AttendanceLatestDayCard.tsx`, `garden/AttendanceRecentWeeksCard.tsx`, `garden/AttendanceDayDrawer.tsx` | Web |
| Same history on the phone ("Check-in history and absences at a glance."), switch between children | `apps/mobile/src/components/parent/attendance/parent-attendance-screen.tsx`, `apps/mobile/src/app/parent/[slug]/more/attendance.tsx` | Mobile |
| Parents manage the authorized pickup list that staff choose from at pickup | see `students.md`; `src/components/school-parent/pickup/ParentChildPickupTab.tsx` | Web + mobile |

### Existing approved copy to stay consistent with
- `src/lib/marketing/product-preview-tabs.ts`: "Log daily attendance for every student, track who showed up, and navigate week by week."
- `src/lib/marketing/download-app-slides.ts`: "Attendance and rosters, quick on the classroom floor." / "Mark attendance and search rosters from the classroom."
- `src/components/home/home-copy.ts`: "Attendance tracking" (feature list)

## Founder pain (with quotes + sources)

1. **The founder is the whole admin layer.** NewSchools Venture Fund warned that microschools run with "a thin or non-existent administrative layer (no principal)" and that "micro schools may place a lot of non-instructional tasks on teachers." (NewSchools Venture Fund, 2015, https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/) Roll call, pickup and the paper trail land on the same 1–2 adults who are teaching.
2. **Knowing the rules is founders' top need.** The 74's summary of the National Microschooling Center's 2025 sector analysis (800 schools) says founders' biggest need is understanding the rules and laws that apply to their programs (The 74, Linda Jacobson, 21 May 2025, https://www.the74million.org/article/exclusive-report-as-movement-grows-microschools-arent-so-micro-anymore/). Attendance records are one of the few rules that apply almost everywhere a school is formally a private school (see Evidence).
3. **Founders are educators, not office managers.** Iman Alleyne (founder of Kind Academy): "Many educators have never been taught to view their school as a business." (Education Next, Kerry McDonald, 16 Dec 2025, https://www.educationnext.org/so-you-want-to-open-a-microschool/)
4. **A sign-in sheet is not pickup permission.** A sign-in sheet template publisher warns schools to use "a separate authorization and identity-check procedure rather than treating a signature on this sheet as pickup permission" (signinsheethub.com, n.d., https://signinsheethub.com/school-sign-in-sheet/, seen only as a search summary, vendor content). The paper approach splits "who is here" from "who may take them home".
5. **Families want to know their child arrived.** This is an inference, not a sourced stat: MudKitchen sends a push at check-in and at pickup. Playground called check-in/out notifications "the long awaited ability for families to get notifications when their children are checked in or out" (Playground changelog, 2025, https://www.tryplayground.com/changelog/settings-revamp-update-billing-plans-check-in-and-out-notifications).

Founder-forum quotes (Reddit r/microschools, r/homeschool) could not be collected: reddit.com is blocked for the research tool. See Open questions.

## Evidence (numbered: quote — publisher, year — URL)

1. "The enrollment register shall show the absence or attendance of each student enrolled for each school day of the year" — Florida Legislature, Florida Statutes s. 1003.23(2), 2026 statutes — https://m.flsenate.gov/Statutes/1003.23
2. The same subsection applies to "public, parochial, religious, denominational, and private K-12 schools, including private tutors" and "The register shall be open for the inspection by the designated school representative or the district school superintendent". Breaking it is "a misdemeanor of the second degree". — Florida Legislature, s. 1003.23(2), 2026 — https://m.flsenate.gov/Statutes/1003.23
3. Florida private schools "shall keep and prepare records in accordance with the provisions of s. 1003.23(2)" — Florida Legislature, s. 1002.42(4), 2025 — https://www.flsenate.gov/Laws/Statutes/2025/1002.42
4. Arizona defines a private school as one where "academic instruction is provided for at least the same number of days and hours each year as a public school." — Arizona Legislature, A.R.S. 15-802(G)(3), current text checked Nov 2026 — https://www.azleg.gov/ars/15/00802.htm. A day-by-day record is how a school shows it met this.
5. Texas: "TEA does not regulate, approve, register, or accredit private schools." — Texas Education Agency, page checked Nov 2026 — https://tea.texas.gov/about-tea/contact-us/complaints/information-about-texas-private-school-accreditation-commission. Schools in Texas Education Freedom Accounts (TEFA, the state ESA) must "Be accredited by an organization recognized by the Texas Private School Accreditation Commission" — Texas Comptroller / TEFA, 2026 — https://educationfreedom.texas.gov/schools/. Texas sets no attendance-record statute for private schools. Any requirement comes through the accreditor (unverified per accreditor).
6. Chronic absenteeism "declined from its peak of 28 percent in 2021-22" but "remained high, at around 23 percent in 2023-24." — FutureEd (Bella DiMarco), 2025 — https://www.future-ed.org/chronic-student-absenteeism-varies-sharply-by-grade-level/. This is public-school data, so use it as context, not a microschool claim.

## Tool stack alternative

What founders use today:
- **Paper sign-in/sign-out sheet on a clipboard** at the door, sometimes with parent initials. Free printable versions are widely shared (Jotform, Vertex42, microschool blogs).
- **A Google Sheet** with a row per student and a column per day, filled in from memory or from the paper sheet.
- **Group text** ("Is Maya coming today?") for absences, and a text to parents at pickup.
- **A general time-clock app** (Jibble and similar) bent into use for students.

How it fails:
- **No proof of who took the child.** A signature on a sign-in sheet records a name, not an authorization check. The authorized list lives somewhere else (an enrollment form, a binder, the founder's memory).
- **Gaps you find later.** When a day is missed on paper, nobody notices until a funder, accreditor or the state asks for it (FL s. 1003.23 requires a register "for each school day of the year").
- **Data entered twice.** Clipboard first, then the spreadsheet. Two copies drift apart.
- **No parent loop.** Parents don't hear "arrived" or "picked up by Grandma" unless someone texts them by hand.
- **No history per child.** Answering "how many days did Leo miss this semester?" means scrolling a spreadsheet.
- **Substitute or second teacher can't run it.** The system lives in the founder's head and on the founder's laptop.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel** (checked Nov 2026)
- Lists "Student check-in & out", "Ratio tracking" and "Attendance reporting" as platform features. No prices are published, only "Request pricing". https://mybrightwheel.com/pricing/
- Check-in methods: Kiosk (4-digit code), QR "Quick Scan", or Attendance Mode, depending on the program's settings. https://help.mybrightwheel.com/en/articles/1445626-check-in-and-out-as-staff (staff article, same methods apply). Kiosk set-up: https://help.mybrightwheel.com/en/articles/1329844-set-up-a-check-in-kiosk (from search results, page not opened)
- Approved Pickup is a contact type. Approved pickups "can only perform pickup/drop-off actions". https://help.mybrightwheel.com/en/articles/1161612-add-and-invite-student-contacts (from search results)
- Which tier includes check-in: **unconfirmed**. No tier breakdown is published.

**Transparent Classroom** (checked Nov 2026)
- $2.00 USD per child / month, one plan: "Unlimited classrooms. Unlimited staff." https://www.transparentclassroom.com/pricing
- Attendance states are buttons ("P, A, T"), and admins can customize which states appear. Sign In / Sign Out record timestamps. Parents can sign in/out on a Dropoff page with an e-signature. The Attendance Report covers absences, tardies, early/late arrivals and minutes. https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview
- The Drop-off page uses a 6-digit parent PIN on a staff device. https://transparent-classroom.helpscoutdocs.com/article/327-drop-off (from search results)
- Push notifications to parents at check-in: **unconfirmed** (not covered in the attendance article).

**Playground** (tryplayground.com, checked Nov 2026)
- Pricing: none published. Custom pricing via Book a Demo (see `_rivals.md`). https://www.tryplayground.com/pricing
- Statuses: the Students tab shows "Signed in", "Signed out" and "Absent" counts. Each student is "Checked in" or "Checked out". No "late" status is mentioned. https://help.tryplayground.com/en/articles/16111397-attendance-overview
- Check-in methods: Kiosk Mode (family QR or PIN on a shared tablet), teacher check-in from the mobile Roster (one at a time or in bulk), Contactless (signature request sent to the guardian's phone), and the admin web dashboard. Past records can be edited ("Edit times"). Same URL.
- Who picks up: "Authorized Pickup" is a guardian permission type. "Authorized pickups only have the ability to check a student in and out." https://help.tryplayground.com/en/articles/6460616-add-manage-guardians-as-a-family. Each check-in/out is attributed to whoever signed, with "Timestamped signatures and guardian info always captured" (https://www.tryplayground.com/solutions/attendance).
- Parent notifications: "Guardians can now receive notifications when their children are checked in or out." (changelog dated 15 Sep 2025) https://www.tryplayground.com/changelog/settings-revamp-update-billing-plans-check-in-and-out-notifications. Families can also submit absences if the school allows it (attendance overview).
- Reports: Attendance Daily, Total time, Percentage, Ratio, Daily Absences / No Shows and more. Export to spreadsheet or print. https://help.tryplayground.com/en/articles/16111397-attendance-overview
- Extras built for childcare: geofenced check-in, door-lock integration, "On My Way" pickup queue, ratio alerts (https://www.tryplayground.com/solutions/attendance). There is also a Texas child care subsidy rule requiring photo + signature + location on each check-in/out from 1 Sep 2026, for subsidy-funded students (https://help.tryplayground.com/en/articles/16772066-texas-subsidy-attendance, from search results). That is childcare subsidy, not private-school law.

**Procare (not used: dropped from the rival set, see `_rivals.md`)** (checked Nov 2026)
- Pricing: "one low monthly price". No prices or tiers are published. https://www.procaresoftware.com/pricing/
- Advertises "contactless check-in/check-out solutions" and tracks "attendance and any room movement", health checks and authorized pick-ups. https://www.procaresoftware.com/capabilities/classroom-management/
- Each authorized pickup person gets a unique four-digit PIN. https://www.procaresoftware.com/blog/security-for-pick-ups-and-drop-offs-with-procare/ (blog, from search results)

## Draft copy (sections as in 2e)

Copy patterns noted: Brightwheel and Procare lead with a module list (check-in, ratios, reporting). Homebase leads with "free" and plain verbs (clock in, timesheets). The strongest pattern to borrow is verb-first, concrete nouns, no adjectives. A wider benchmarking pass was cut short by the tool limit (see Open questions).

**Hero headline:** Lead: "Roll call in a minute," Accent: "pickup on the record." (8 words)

**Hero body (31 words):** Mark each child present or absent from a laptop or phone. At pickup, choose who collected them from the family's approved list. Parents get a notification, and every day is saved.

**One-liner (10 words):** Daily attendance and pickup, recorded once, shared with families instantly.

**Capabilities: School admin**
1. **Today at a glance**: Present, absent, not marked and picked up, counted on your dashboard. Tap a number to see exactly who.
2. **Pickup with a name**: Record who collected each child, chosen from parents on file or the family's authorized pickup list.
3. **Every day, on file**: Step back to any day to view or fix it. Each mark keeps the time and who recorded it.
4. **Per-student history**: Open a child to see their attendance day by day, including pickups, without digging through a spreadsheet.
5. **Only the programs you track**: Turn attendance on per program, so drop-in or enrichment students stay off the daily roster.

**Capabilities: Staff**
1. **Guided roll call**: Go through the class one child at a time. The app shows who is still left to mark.
2. **From your phone**: Mark present, absent or picked up from the classroom floor in the MudKitchen iPhone app.
3. **Safe handoffs**: At pickup, see only the adults the family approved, then confirm with one tap.
4. **Search the roster**: Find a student fast by name, then mark them without scrolling.

**Capabilities: Families**
1. **"Arrived" on your phone**: Get a notification when your child is marked present for the day.
2. **Know who picked up**: A notification names the adult who collected your child.
3. **Your child's record**: See the latest day, recent weeks and full history, including who recorded each day.
4. **You set the pickup list**: Add grandparents, sitters or carpool parents. They don't need an account.

**Use cases**
1. *Morning roll call with one adult in the room.* Scenario: The founder is greeting families at the door while 14 kids settle in. Outcome: She opens guided roll call on her phone, taps through each child, and parents get an "arrived" notification without a single text.
2. *Grandma picks up for the first time.* Scenario: A grandmother arrives at 3:15 and the teacher has never met her. Outcome: The teacher opens Record Pickup, sees her on the family's authorized list, confirms, and the parents get "picked up by" with her name.
3. *The ESA or accreditor asks for attendance.* Scenario: A funder or reviewer asks how many days a student attended this term. Outcome: The founder opens the student's attendance history and reads it day by day, with times and who recorded each mark. (There is no export yet; do not promise a report.)
4. *A forgotten Friday.* Scenario: Nobody marked attendance on a busy field-trip day. Outcome: On Monday the admin steps back to Friday, marks it, and the record shows who entered it and when.

**FAQ**
1. *Can parents see attendance?* Yes. Families see their child's latest day, recent weeks and full history on the web and in the iPhone app. They also get push notifications when their child is marked present and when they are picked up. (35 words)
2. *How does pickup work?* When a child leaves, staff tap Record Pickup and choose the adult from the family's parents on file or their authorized pickup list. Families keep that list up to date themselves. People on it don't need a MudKitchen account. (41 words)
3. *Can teachers take attendance, or only the office?* Both. Teachers have an Attendance page with guided roll call on the web, and the same roster in the mobile app. Each mark records who made it. (29 words)
4. *Can I fix yesterday's attendance?* Yes. Move to any past day, change the mark, and the record keeps the time and the person who made the change. (24 words)
5. *Do all my programs need attendance?* No. Attendance is turned on per program, so an enrichment or drop-in program can stay off the daily roster. (21 words)

**Comparison rows** (rival cells are from each rival's own pages; sources below)

| Label | MudKitchen | Tool stack (paper sheet + Google Sheets + texts) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Mark present/absent | Yes, web + app | Yes, by hand | Yes ([pricing](https://mybrightwheel.com/pricing/)) | Checked in / out / absent ([help](https://help.tryplayground.com/en/articles/16111397-attendance-overview)) | Yes, P/A/T buttons ([help](https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview)) |
| Tardy / late status | No (present, absent, picked up only) | Yes, if you add a column | Unconfirmed | Not mentioned ([help](https://help.tryplayground.com/en/articles/16111397-attendance-overview)) | Yes, "T" state ([help](https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview)) |
| Who picked up, from an approved list | Yes, chosen from parents + authorized pickup list | Name written on sheet, no check | Approved Pickup contact type ([help](https://help.mybrightwheel.com/en/articles/1161612-add-and-invite-student-contacts)) | Authorized Pickup guardian type signs check-out ([help](https://help.tryplayground.com/en/articles/6460616-add-manage-guardians-as-a-family)) | "Approved Adults" list on file; how pickup is checked is unconfirmed ([help](https://transparent-classroom.helpscoutdocs.com/article/21-children-page)) |
| Parent self check-in (kiosk/PIN/QR) | No | Parent signs the sheet | Kiosk / QR ([help](https://help.mybrightwheel.com/en/articles/1445626-check-in-and-out-as-staff)) | Kiosk QR/PIN, contactless signature ([help](https://help.tryplayground.com/en/articles/16111397-attendance-overview)) | Dropoff page with PIN + e-signature ([help](https://transparent-classroom.helpscoutdocs.com/article/327-drop-off)) |
| Parent notified at arrival + pickup | Yes, push both times | Only if someone texts | Unconfirmed | Yes, check-in/out notifications ([changelog](https://www.tryplayground.com/changelog/settings-revamp-update-billing-plans-check-in-and-out-notifications)) | Unconfirmed |
| Per-student history with who recorded it | Yes | Manual lookup | "Attendance reporting" ([pricing](https://mybrightwheel.com/pricing/)) | Signer attributed on each record ([help](https://help.tryplayground.com/en/articles/16111397-attendance-overview)) | Attendance Report ([help](https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview)) |
| Attendance export / report file | No | It is already a spreadsheet | Reporting listed ([pricing](https://mybrightwheel.com/pricing/)) | Yes, export/print reports ([help](https://help.tryplayground.com/en/articles/16111397-attendance-overview)) | Export not mentioned ([help](https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview)) |
| Published price | See MudKitchen pricing | Free | Quote only ([pricing](https://mybrightwheel.com/pricing/)) | Quote only ([pricing](https://www.tryplayground.com/pricing)) | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: on raw attendance features, Playground and Brightwheel do more (kiosks, exports, ratios). MudKitchen's edge is the simple daily roll call plus a pickup tied to the family's own list, inside the same app families already use for enrollment, billing and messages, built for a K–8 microschool day rather than a daycare check-in desk.

## Open questions / things you could not verify

- **Reddit / founder forums:** reddit.com is blocked for the research tool, so there are no verbatim founder posts. Collect 2–3 quotes by hand from r/microschools, r/homeschool, or the Microschool Founders Grove Skool community if we want founder-voice proof.
- **Texas attendance rules:** No state statute requires attendance records for Texas private schools (TEA does not regulate them). Whether TEPSAC-recognized accreditors require them for TEFA schools was not checked accreditor by accreditor.
- **Arizona ESA:** Whether ESA-funded microschools must keep attendance logs was not confirmed. A.R.S. 15-802 only sets the "same number of days and hours" definition.
- **RAND estimate:** RAND puts chronic absenteeism at ~19% of K–12 students (about 9.4 million) for 2023–24, but this came from a search summary only (https://www.rand.org/pubs/research_reports/RRA956-34.html). It is not used above.
- **Rival tier placement:** Brightwheel and Playground publish no tiers or prices, and TC has one plan. Brightwheel/TC kiosk and pickup details and the Playground Texas-subsidy article came from search summaries (marked). Open and re-check them before publishing a comparison. Brightwheel parent arrival notifications: unconfirmed.
- **Product gaps to decide on before copy:** no Tardy status, no attendance export, no parent-reported absence, no parent self check-in. Keep these out of copy, or decide whether to build them.
- **Help guides:** No attendance guide exists in `admin-documentation.ts` / `teacher-documentation.ts` / `parent-documentation.ts`. Consider adding one so the help docs match the marketing.
- **Copy benchmarking** was limited (tool usage cap hit). Feature pages reviewed: Brightwheel pricing/features list, Playground /solutions/attendance, Homebase pricing, Procare capability pages (not used).
