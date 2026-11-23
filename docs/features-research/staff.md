# Staff management

Research date: 22 Nov 2026. Rivals: Brightwheel, Playground, Transparent Classroom (see `_rivals.md`). Procare notes kept, marked "not used". Payroll ("coming soon") is excluded.

Note on the help guides: `admin-documentation.ts` has no staff guide. The teacher guide covers what staff see once they're in (`src/lib/school-teacher/teacher-documentation.ts`: dashboard, My Students, profiles). Admin claims below come from components and libs.

## Product truth (capabilities by role, with file paths; web/mobile)

**Platform note:** "Mobile" below means the MudKitchen **iPhone app**. It is iPhone-only today (Google Play is not live; the download page runs an Android waitlist). In copy, write "iPhone app", never "iOS and Android". Push notifications reach iPhone users only.

The model: a **staff record** (name, email, job title, photo, employment status) linked to a **portal account** with a role of **Teacher** or **Staff**. Both roles sign into the staff portal with a **one-time code sent to their email**: no passwords to hand out. Staff are linked to students directly ("Learners") and through classrooms (see `classrooms.md`).

### School admin / founder
| Capability | Proof | Web / Mobile |
|---|---|---|
| Add a staff member: first/last name, email ("Sign-in codes go here."), job title (e.g. "Lead Teacher"), portal role Teacher or Staff | `src/components/school-admin/staff/StaffPage.tsx` (lines ~265–396), `src/lib/staff/staff-members.ts` (`StaffPortalRole = "teacher" \| "staff"`) | Web + mobile (`apps/mobile/src/components/school-admin/staff/garden/admin-staff-form-sheet.tsx`) |
| Passwordless sign-in: "They can sign in with a one-time code sent to their email." Copy a sign-in link to send yourself | `StaffDetailPane.tsx` / `StaffPage.tsx` strings ("Sign-in link copied.", "They can sign in at {url} with {email}.") | Web + mobile ("Couldn't copy the link") |
| Sign-in status per person: "No account", "Never signed in", "Portal active", "Access off", "Last signed in {date}" | `src/components/school-admin/staff/staff-portal-chip.ts`, `src/lib/staff/staff-portal-login-status.ts` | Web + mobile |
| Deactivate / reactivate portal access ("They can no longer sign in to the teacher portal."). The record and history stay | `StaffDetailPane.tsx` ("Deactivate portal access?"), `src/app/api/...` via `useStaffModel.ts` | Web + mobile |
| Employment status: Active, Inactive, On leave | `staff-members.ts` (`StaffEmploymentStatus`), `StaffDetailPane.tsx` (~line 334) | Web + mobile |
| "Profiles to finish": flags staff missing an email or job title | `src/lib/school-admin/admin-staff-roster-metrics.ts` (`staffProfileNeedsReview`), `StaffPage.tsx` (~181) | Web + mobile ("Needs review") |
| Assign learners: pick the students each staff member works with. Undo supported | `src/components/school-admin/staff/StaffAssignedStudentsSection.tsx` ("Pick the students this staff member works with.", "Changed your mind? Undo puts them back.") | Web + mobile ("Assign students") |
| See each person's classrooms and learners ("Learners & groups") | `StaffDetailPane.tsx`, `StaffAssignedStudentsSection.tsx` | Web + mobile |
| Search by name, email or title; filter by status | `StaffPage.tsx` ("Search name, email or title", "Filter staff") | Web + mobile |
| Staff profile photos | `src/lib/staff/staff-photo-storage.ts`, `upload-staff-profile-photo-client.ts` | Web |
| Let the Teacher role, the Staff role, or named staff members manage school calendar events | `src/lib/school-events/schedule-settings.ts` (`userCanManageOrganizationEvents`), `src/components/school-admin/schedule/ScheduleEventPermissionsTab.tsx` | Web |
| Which staff-portal pages are on (My Students, Attendance, My Hours, Messages, Calendar, Forms, Committees, Newsletters, Classroom signups) is set per school | `src/lib/organization-settings/catalog.ts` (`teacher: {...}`) | — |
| Mobile admin screens | `apps/mobile/src/app/school-admin/[slug]/more/staff/{index,[id]}.tsx` | Mobile |

### Staff / teachers (what a new hire gets on day one)
| Capability | Proof | Web / Mobile |
|---|---|---|
| Dashboard with what needs attention, their classrooms and assigned students | `src/lib/school-teacher/teacher-documentation.ts` (~line 73) | Web + mobile |
| My Students: assigned students first, plus an All students tab; profiles with Overview, Family, Health | `teacher-documentation.ts` (~150–234), `src/components/school-teacher/TeacherMyStudentsPage.tsx` | Web + mobile |
| Message a family from a student's profile | `apps/mobile/src/components/teacher/students/garden/teacher-student-detail-screen.tsx` ("Message the family") | Mobile |
| Attendance, My Hours, Calendar, Messages, Classroom signups (when turned on) | `catalog.ts`; see `attendance.md`, `staff-hours.md` | Web + mobile |
| If their login isn't linked yet: "Your login isn't linked to a staff record yet" / "Your school admin can assign students from My School → My Students." | `TeacherMyStudentsPage.tsx` strings | Web |

### Families
| Capability | Proof | Web / Mobile |
|---|---|---|
| See their child's teachers ("{Child}'s team"): name, job title, photo, with a Teachers tab | `src/components/school-parent/children/garden/ChildTeamCard.tsx`, `TeacherAvatar.tsx`; `src/lib/admissions/parent-portal-access.ts` (`ParentAssignedTeacher`) | Web + mobile |

### Not in the product (keep out of copy)
- No custom roles or per-permission toggles beyond Teacher vs Staff and the per-school page set. No staff documents/certifications/background-check tracking, no staff schedules, no HR fields (pay rate, hire date). Payroll is coming soon.
- Teacher and Staff roles get the same portal today. The only difference found is the Schedule permission setting. Don't promise different access levels.

## Founder pain (with quotes + sources)

1. **Every departure hurts.** NewSchools Venture Fund: "By design, micro schools may only employ one or two full-time teachers," so "any turnover (particularly midyear departures) will have a massive impact." (2015, https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/) Onboarding a replacement fast, and cutting off the old account, matters more in a 3-person team.
2. **Private-school teachers leave more often.** "12 percent left the teaching profession" among private school teachers between 2020–21 and 2021–22, against 8% of public school teachers. (NCES/IES, 13 Dec 2023, https://ies.ed.gov/learn/press-release/eight-percent-public-school-teachers-left-teaching-2021-rate-unchanged-last-measured-2012)
3. **Shared logins linger after people leave.** In a Beyond Identity survey, "83% of employees admitted to maintaining continued access to accounts" from a previous employer (Help Net Security, 21 Feb 2022, https://www.helpnetsecurity.com/2022/02/21/employees-maintaining-accounts-access/). In a school, those accounts hold children's health and family contact details.
4. **Founders are educators first.** "Eighty-six percent of founders have an education background, compared with 71% last year." (The 74 on the National Microschooling Center's 2025 analysis, 21 May 2025, https://www.the74million.org/article/exclusive-report-as-movement-grows-microschools-arent-so-micro-anymore/) And: "Many educators have never been taught to view their school as a business." (Iman Alleyne, Education Next, 16 Dec 2025, https://www.educationnext.org/so-you-want-to-open-a-microschool/)
5. Founder-forum quotes could not be collected (reddit.com is blocked for the research tool).

## Evidence (numbered: quote — publisher, year — URL)

1. "12 percent left the teaching profession" (private school teachers, 2020–21 to 2021–22). "Eighty-two percent of private school teachers remained at the same school". — NCES / Institute of Education Sciences, 2023 — https://ies.ed.gov/learn/press-release/eight-percent-public-school-teachers-left-teaching-2021-rate-unchanged-last-measured-2012
2. "any turnover (particularly midyear departures) will have a massive impact" — NewSchools Venture Fund, 2015 — https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/
3. "micro schools may place a lot of non-instructional tasks on teachers" — NewSchools Venture Fund, 2015 — same URL
4. "83% of employees admitted to maintaining continued access to accounts", and "56% of these employees said they had used this continued digital access". — Beyond Identity survey, reported by Help Net Security, 2022 — https://www.helpnetsecurity.com/2022/02/21/employees-maintaining-accounts-access/ (vendor survey of US/UK/Ireland former employees; sample size not stated)
5. "Eighty-six percent of founders have an education background, compared with 71% last year." — The 74 (National Microschooling Center 2025 sector analysis, 800 schools), 2025 — https://www.the74million.org/article/exclusive-report-as-movement-grows-microschools-arent-so-micro-anymore/

## Tool stack alternative

What founders use today:
- **A shared school Google account or shared passwords** (one Gmail, one Drive, one Canva) that every teacher logs into.
- **A staff roster in a Google Sheet** (names, phones, emails, roles).
- **Google Drive folders** shared per teacher for class lists and student info.
- **Group text or WhatsApp** for staff communication.

How it fails:
- **Offboarding is a password change.** When an assistant leaves, the founder has to change the shared password and tell everyone else. Often it never happens (see evidence #4).
- **No "who sees what".** A shared Drive folder of student files is all-or-nothing. A new aide sees every family's health notes.
- **Student lists go stale.** Each teacher's class list is a copy that drifts from the real enrollment.
- **No sign-in visibility.** The founder can't tell whether a new hire ever set up their account.
- **Five tools to onboard.** Calendar, messaging, roster, timesheet and forms each need a separate invite.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel** (checked Nov 2026)
- Roles: Admin ("Has full access, including Billing and Subscription."), Manager ("admin access without Billing and Subscription"), Lead Staff ("Can edit child information."), Staff ("Default staff role."), Staff Without Parent Messaging ("Cannot message families."), Billing Only, plus multi-site roles. https://help.mybrightwheel.com/en/articles/2109290-understanding-staff-permissions-and-roles
- Staff are added on the web under Staff & Payroll. The mobile app can add only Staff or Lead Staff, and email is optional for those roles. https://help.mybrightwheel.com/en/articles/942340-add-staff (from search results)
- Staff can only see the rooms they're assigned to. Admins/Managers see all rooms. https://help.mybrightwheel.com/en/articles/942343-assign-staff-to-rooms (from search results)
- Staff Management module also lists "Roster management", "Staff scheduling", "Development hours", "Payroll". Price on request. https://mybrightwheel.com/pricing/

**Playground** (checked Nov 2026)
- "Playground has two default roles: administrator and teacher", plus custom roles. Teachers "can't access billing or enrollment". Admins can remove the "View all students" permission so a role sees only its classroom. https://help.tryplayground.com/en/articles/8062988-staff-roles (from search results; the page returned 404 when opened directly)
- Add staff one by one or by CSV roster. Sign-up emails go out automatically and can be resent by email/text or as a copied link. Deactivating "restricts them from logging into Playground and will remove their classroom assignments". https://help.tryplayground.com/en/articles/5101959-add-invite-staff-to-playground and https://help.tryplayground.com/en/articles/8618904-edit-manage-staff (from search results)
- Staff Information report (name, email, classrooms). https://help.tryplayground.com/en/articles/13510608-reports-overview (from search results)
- Price: quote only. https://www.tryplayground.com/pricing

**Transparent Classroom** (checked Nov 2026)
- "Unlimited staff" on a $2/child/month plan. https://www.transparentclassroom.com/pricing
- Admins mark a staff user inactive under Directory > Staff, which blocks login but keeps their name on existing records. https://transparent-classroom.helpscoutdocs.com/article/387-how-to-make-users-inactive (from search results)
- Role/permission detail: **unconfirmed**.

**Procare (not used)** (checked Nov 2026)
- "Create custom roles with permissions that fit the unique needs of your center." Staff records include "timecard hours, immunizations, employee profiles". https://www.procaresoftware.com/capabilities/child-care-staff-management/

## Draft copy (sections as in 2e)

**Hero headline:** Lead: "Add a teacher in a minute," Accent: "remove access in one click." (10 words)

**Hero body (33 words):** Add staff with their name and email, and they sign in with a one-time code. No shared passwords. Assign their students, see who has signed in, and turn access off when someone leaves.

**One-liner (10 words):** Your team's accounts, students and access, managed in one place.

**Capabilities: School admin**
1. **No shared passwords**: Each person signs in with a one-time code sent to their own email. Nothing to reset when someone leaves.
2. **See who's set up**: Know at a glance who has never signed in, who is active, and whose profile is unfinished.
3. **Assign their students**: Pick the students each staff member works with. They see them first in My Students.
4. **Off in one step**: Deactivate portal access when someone leaves. Their record and history stay; their sign-in doesn't.
5. **Track status**: Mark staff active, inactive or on leave, with job titles families can see.

**Capabilities: Staff**
1. **Everything on day one**: A dashboard, their students, messages, calendar and roll call, ready the first time they sign in.
2. **Know your students**: Open any student to see family contacts and health notes before the first morning.
3. **Web or phone**: The same portal works in a browser and in the MudKitchen iPhone app.
4. **Your own login**: Sign in with a code sent to your email. No password to remember or share.

**Capabilities: Families**
1. **Meet the team**: See your child's teachers with names, job titles and photos.
2. **See all their teachers**: Open the Teachers tab on your child's record to see everyone assigned to their class group. *(Proof: `ChildTeamCard.tsx` "See all teachers". Don't claim this list controls who parents can message; that was not checked.)*

**Use cases**
1. *A new assistant starts Monday.* Scenario: The founder hires a part-time assistant on Friday. Outcome: She adds his name and email, assigns his eight students, and on Monday he signs in with a code and sees his class, their allergies and today's roll call.
2. *A teacher leaves mid-year.* Scenario: A lead teacher gives notice in February. Outcome: On her last day the founder turns off her portal access. The record stays, and her students are reassigned to the new teacher.
3. *Did the new hire ever log in?* Scenario: Two weeks in, the founder isn't sure the new aide is reading messages. Outcome: The staff list shows "Never signed in", and she copies the sign-in link to text him.
4. *Maternity leave.* Scenario: A teacher goes on leave for the spring. Outcome: The founder marks her "On leave" and keeps her record ready for her return.

**FAQ**
1. *How do staff sign in?* With a one-time code sent to the email you added for them, on the web or in the MudKitchen iPhone app. There are no passwords to create, share or reset. (30 words)
2. *What happens when I deactivate someone?* They can no longer sign in to the staff portal. Their record stays, so past attendance marks, messages and hours still show who did them. You can reactivate them later. (34 words)
3. *Can teachers see every student?* Teachers see their assigned students first, with an All students tab for the rest of the school. Families' health and contact details are visible on student profiles, so add only people you trust with that information. (39 words)
4. *What's the difference between Teacher and Staff?* Both use the same staff portal today. The role mainly helps you label your team and decide who may manage school calendar events. (25 words)
5. *Can I manage staff from my phone?* Yes. The MudKitchen iPhone app lets you add staff, edit profiles, assign students and turn portal access off or on. (21 words)

**Comparison rows**

| Label | MudKitchen | Tool stack (shared logins + Sheets + Drive) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Individual staff logins | Yes, email one-time code | Usually one shared account | Yes ([add staff](https://help.mybrightwheel.com/en/articles/942340-add-staff)) | Yes, emailed invite ([help](https://help.tryplayground.com/en/articles/5101959-add-invite-staff-to-playground)) | Yes ([inactive users](https://transparent-classroom.helpscoutdocs.com/article/387-how-to-make-users-inactive)) |
| Turn off access, keep history | Yes, deactivate/reactivate | Change the password | Unconfirmed | Deactivate; removes classroom assignments ([help](https://help.tryplayground.com/en/articles/8618904-edit-manage-staff)) | Mark inactive; name kept on records ([help](https://transparent-classroom.helpscoutdocs.com/article/387-how-to-make-users-inactive)) |
| See who has signed in | Yes ("Never signed in", last sign-in) | No | Unconfirmed | Resend invite; sign-in status unconfirmed ([help](https://help.tryplayground.com/en/articles/5101959-add-invite-staff-to-playground)) | Unconfirmed |
| Role levels | Teacher / Staff (same access today) | None | 6+ roles ([help](https://help.mybrightwheel.com/en/articles/2109290-understanding-staff-permissions-and-roles)) | Admin, Teacher + custom roles ([help](https://help.tryplayground.com/en/articles/8062988-staff-roles)) | Unconfirmed |
| Assign students to a staff member | Yes, directly or via classroom | Separate lists per teacher | Via rooms ([help](https://help.mybrightwheel.com/en/articles/942343-assign-staff-to-rooms)) | Via classrooms ([help](https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms)) | Via classrooms ([help](https://transparent-classroom.helpscoutdocs.com/article/21-children-page)) |
| Manage staff from a phone | Yes, admin app | Partly | Staff/Lead Staff only on mobile ([help](https://help.mybrightwheel.com/en/articles/942340-add-staff)) | Unconfirmed | Unconfirmed |
| Published price | See MudKitchen pricing | Free | Quote only ([pricing](https://mybrightwheel.com/pricing/)) | Quote only ([pricing](https://www.tryplayground.com/pricing)) | $2/child/mo, unlimited staff ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: Brightwheel and Playground have finer permission control. MudKitchen's edge is passwordless sign-in, visible sign-in status and one-step offboarding in a tool sized for a 2–10 person team.

## Open questions / things you could not verify

- **Permissions depth:** MudKitchen has no custom roles. If prospects ask "can an aide see health info but not family contacts?", the answer today is no.
- **Brightwheel/Playground sign-in status visibility** and Brightwheel deactivation behaviour: unconfirmed.
- **Playground Staff Roles page** returned 404 on direct fetch. The facts come from search-result text of that URL.
- **Teacher vs Staff role:** confirm with the team whether any portal difference exists beyond Schedule permissions.
- **Microschool staffing data** (staff per school, share part-time) was not found. NMC reports may have it, but the PDF couldn't be parsed.
- **Founder quotes:** reddit.com is blocked for the research tool. Collect by hand.
