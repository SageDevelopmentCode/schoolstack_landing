# Classrooms

Research date: 22 Nov 2026. Rivals: Brightwheel, Playground, Transparent Classroom (see `_rivals.md`). Procare notes kept, marked "not used".

Note on the help guides: `admin-documentation.ts` has no classrooms guide. `teacher-documentation.ts` covers the staff side ("Browse students by classroom", lines ~178–208). Admin claims come from components and libs.

## Product truth (capabilities by role, with file paths; web/mobile)

**Platform note:** "Mobile" below means the MudKitchen **iPhone app**. It is iPhone-only today (Google Play is not live; the download page runs an Android waitlist). In copy, write "iPhone app", never "iOS and Android". Push notifications reach iPhone users only.

The model: a **classroom** is a named group (e.g. "Kindergarten Group A") that can be tied to one **program** or left open to all programs. It has a status of **open, full or inactive**, a **roster of enrolled students**, and **staff** in the role of **Lead teacher** or **Assistant**. A student can belong to more than one classroom. Classrooms then drive what teachers see first and which teachers families see.
- Types: `src/lib/school-admin/classrooms.ts` (`ClassroomStatus = "open" | "full" | "inactive"`, `ClassroomStaffRole = "lead" | "assistant"`, `programId`, `leadTeacherNames`)

### School admin / founder
| Capability | Proof | Web / Mobile |
|---|---|---|
| Create a classroom: name, optional program ("Leave on All programs if any student can join."), status | `src/components/school-admin/classrooms/ClassroomsPage.tsx`, `ClassroomDetailPane.tsx`, `src/lib/school-admin/classrooms.ts` | Web + mobile (`apps/mobile/src/components/school-admin/classrooms/garden/admin-classroom-form-sheet.tsx`) |
| Assign staff as Lead teacher or Assistant | `ClassroomDetailPane.tsx` (line ~59: `ROLE_LABELS = { lead: "Lead teacher", assistant: "Assistant" }`) | Web + mobile ("Assign staff") |
| Add students to the roster from the enrolled list; students in the classroom's program are listed first; remove with Undo | `ClassroomDetailPane.tsx` ("Add students from your enrolled list.", "Students in {program} are listed first.", "Changed your mind? Undo puts them back.") | Web + mobile ("Add students") |
| "Classrooms at a glance": flags rooms that "Need a lead teacher" | `ClassroomsPage.tsx`, `useClassroomsModel.ts` | Web + mobile ("Every classroom has a lead teacher.") |
| Search by classroom, program or teacher; filter | `ClassroomsPage.tsx` ("Search classroom, program or teacher") | Web + mobile |
| Delete a classroom, with confirmation ("This cannot be undone.") | `ClassroomDetailPane.tsx` ("Delete {name}?") | Web + mobile |
| From the Students page: put a student in one or more classrooms, see "Unassigned" students, with a check that the classroom fits the student's program | `src/components/school-admin/students/StudentClassroomPicker.tsx` ("Pick every classroom this student belongs to.", "Selected classroom doesn't apply to this student's program."), `StudentsPage.tsx` ("View unassigned", "Every student has a classroom and lead teacher.") | Web + mobile (`admin-classroom-assign-sheet.tsx`) |
| Each student row shows classroom and lead teacher ("Teacher: {names}") | `src/components/school-admin/students/GardenStudentCells.tsx`, `src/lib/school-admin/format-student-classroom-label.ts` | Web + mobile |
| Classroom names appear on the attendance roster | `src/lib/school-admin/attendance/attendance-types.ts` (`classroomNames`) | Web + mobile |
| Mobile admin screens | `apps/mobile/src/app/school-admin/[slug]/more/classrooms/{index,[classroomId]}.tsx` | Mobile |

### Staff / teachers
| Capability | Proof | Web / Mobile |
|---|---|---|
| "Your groups": tap a classroom card to filter My Students to that group | `src/lib/school-teacher/teacher-documentation.ts` ("Under Your groups, tap a classroom card to show only students in that group."), `TeacherMyStudentsPage.tsx` ("Search this classroom") | Web + mobile |
| Dashboard classroom cards with "View students" | `teacher-documentation.ts` ("tap View students on a classroom card to open the filtered roster"), ~line 92 | Web |
| Staff record shows their "Learners & groups" | `src/components/school-admin/staff/StaffDetailPane.tsx` | Web + mobile |

### Families
| Capability | Proof | Web / Mobile |
|---|---|---|
| Their child's teachers appear once the child is in a class group: "Assigned teachers will appear here once {child} is linked to a class group." | `src/components/school-parent/children/garden/ChildTeamCard.tsx` | Web + mobile |

### Not in the product (keep out of copy)
- No capacity number, no staff-to-child ratio tracking or alerts, no "move a student between rooms during the day" (current vs home room), no scheduled moves, no per-classroom schedule/timetable, no classroom-scoped permissions. Status is just open / full / inactive.

## Founder pain (with quotes + sources)

1. **The school is one or two groups.** NMC's 2025 analysis put the median nonpublic microschool at 22 students: "That figure has jumped to 22." (The 74, 21 May 2025, https://www.the74million.org/article/exclusive-report-as-movement-grows-microschools-arent-so-micro-anymore/) NewSchools: "micro schools may only employ one or two full-time teachers" (2015, https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/). Founders need simple groups (a K–2 pod and a 3–5 pod), not daycare room logistics with ratios and room transfers.
2. **Groups change every term.** Mixed-age microschools regroup often (by level, by program, by day). Inference: no stat found. Every regroup means re-sharing class lists in a paper/Drive setup.
3. **Teachers need their own kids first.** A teacher in a 40-student school still needs to see "my 12" with allergies and parent contacts, not scroll the whole school. CDC: food allergies affect "2 students per classroom" (see Evidence #3).
4. Founder-forum quotes could not be collected (reddit.com is blocked for the research tool).

## Evidence (numbered: quote — publisher, year — URL)

1. "In 2024, the median number of students in a typical microschool was 16. That figure has jumped to 22" (charter/district-affiliated: "a median size of 36 students") — The 74 (Linda Jacobson), reporting the National Microschooling Center's 2025 sector analysis of 800 schools, 2025 — https://www.the74million.org/article/exclusive-report-as-movement-grows-microschools-arent-so-micro-anymore/
2. "By design, micro schools may only employ one or two full-time teachers." — NewSchools Venture Fund, 2015 — https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/
3. "An estimated 1 in 13 children (8%), or 2 students per classroom, are affected with food allergies." — CDC, 2024 — https://cdc.gov/school-health-conditions/food-allergies/index.html
4. Rival baseline: Brightwheel staff "can only view the classrooms they are assigned to" (help center, from search results) — https://help.mybrightwheel.com/en/articles/942343-assign-staff-to-rooms. This shows class grouping is the standard way these tools decide what a teacher sees.

(Hard statistics for this feature are thin: class grouping is an organizing tool, not a compliance or cost line. See Open questions.)

## Tool stack alternative

What founders use today:
- **A tab per group in the master Google Sheet**, or a class list on the whiteboard.
- **Google Drive folders per class** holding the roster, allergy list and parent contacts.
- **Google Classroom** for assignments, used as a de facto roster. It is a classroom/LMS tool, not a family or records system (general description, product not checked this session).
- **Group texts per class** for parents.

How it fails:
- **Copies drift.** A child who switches groups is moved in one sheet and not the others.
- **Teachers lose the health context.** The class list and the allergy sheet are separate documents.
- **Families don't know who teaches their child.** Unless someone emails it out each term.
- **No signal for gaps.** Nothing flags the student who isn't in any group or the class with no lead.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel** (checked Nov 2026)
- Rooms: created under My School > Rooms > "+ New Room". https://help.mybrightwheel.com/en/articles/942335-create-manage-rooms (from search results)
- Staff are assigned to rooms. Staff can only view the classrooms they're assigned to, and Admins/Managers are assigned to all rooms. https://help.mybrightwheel.com/en/articles/942343-assign-staff-to-rooms (from search results)
- Room ratios and capacity with out-of-ratio alerts. https://help.mybrightwheel.com/en/articles/3363096-room-ratios-and-capacity (title from search results). The pricing page lists "Ratio tracking". https://mybrightwheel.com/pricing/
- Tier: unconfirmed (quote only).

**Playground** (checked Nov 2026)
- My School > Classrooms > "+ Add Class". Optional capacity ("the maximum number of students that can be assigned to this classroom") and ratio ("the number of students per number of staff members"). https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms
- Homeroom vs Current classroom (can change through the day). Bulk "Assign Class". Scheduled future moves ("Execute Action Immediately" unchecked). "Staff can be assigned to multiple homeroom classrooms." Active/inactive toggle. Same URL.
- Teachers see all students by default. Unchecking "View all students" limits a role to its classroom. https://help.tryplayground.com/en/articles/8062988-staff-roles (from search results)
- Price: quote only. https://www.tryplayground.com/pricing

**Transparent Classroom** (checked Nov 2026)
- "Unlimited classrooms" on the $2/child/month plan. https://www.transparentclassroom.com/pricing
- "The Children Page is a list of the children in your classroom (a class roster)." From it, staff can view allergies, Approved Adults and emergency contacts and print them. https://transparent-classroom.helpscoutdocs.com/article/21-children-page

**Procare (not used)** (checked Nov 2026)
- Tracks "attendance and any room movement" and "real-time staff-to-child ratios". https://www.procaresoftware.com/capabilities/classroom-management/

## Draft copy (sections as in 2e)

**Hero headline:** Lead: "Group your students," Accent: "give every teacher their class." (8 words)

**Hero body (33 words):** Create classrooms for your pods, grades or programs. Add a lead teacher and assistants, then add students from your enrolled list. Teachers see their group first, and families see who teaches their child.

**One-liner (10 words):** Simple class groups that connect students, teachers and families.

**Capabilities: School admin**
1. **Groups that fit you**: Name a classroom anything: a pod, a grade band, a program. Tie it to one program or leave it open.
2. **Lead and assistant**: Assign staff as lead teacher or assistant. See which classrooms still need a lead.
3. **Add from enrolled**: Build each roster from students already enrolled, with the classroom's own program listed first.
4. **Find the gaps**: See students with no classroom and fix them from the student list in a few taps.
5. **More than one group**: Put a student in several classrooms when they split time between groups.

**Capabilities: Staff**
1. **Your group first**: Tap a classroom card to filter your roster to just those students.
2. **Health at hand**: Open any student in your group to see allergies, medications and family contacts.
3. **From the dashboard**: Classroom cards on your home page open the right roster in one tap.

**Capabilities: Families**
1. **Your child's team**: See the teachers assigned to your child's class group, with names, titles and photos.

**Use cases**
1. *Setting up the first week.* Scenario: A founder opens with 18 students in two mixed-age groups. Outcome: She creates "Seedlings (K–2)" and "Explorers (3–5)", assigns a lead to each, adds students from the enrolled list, and families see their child's teachers that day.
2. *A mid-year regroup.* Scenario: Two students move up to the older group in January. Outcome: The admin changes their classrooms from the student list. Teachers' rosters and families' teacher cards update without anyone re-sending a class list.
3. *The enrichment program.* Scenario: Some students also attend a Friday nature program. Outcome: They are added to a second classroom tied to that program, while staying in their main group.
4. *A new assistant joins the older group.* Scenario: An assistant starts in the Explorers room. Outcome: The admin adds her as Assistant, and she sees those students first in My Students.

**FAQ**
1. *Do I need classrooms if I only have one group?* Not strictly. Even one classroom with a lead teacher makes sure families see who teaches their child, and gives teachers a filtered roster. (29 words)
2. *Can a student be in more than one classroom?* Yes. Pick every classroom a student belongs to. MudKitchen checks that each one fits the student's program. (20 words)
3. *What roles can staff have in a classroom?* Lead teacher or Assistant. The admin view flags any classroom that doesn't have a lead teacher yet. (19 words)
4. *Does MudKitchen track ratios or room capacity?* No. Classrooms in MudKitchen are groups of students and teachers, with a simple open, full or inactive status. (22 words)

**Comparison rows**

| Label | MudKitchen | Tool stack (Sheets + Drive + whiteboard) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Create class groups | Yes, web + app | A tab or folder per group | Rooms ([help](https://help.mybrightwheel.com/en/articles/942335-create-manage-rooms)) | Classrooms ([help](https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms)) | Classrooms, unlimited ([pricing](https://www.transparentclassroom.com/pricing)) |
| Lead vs assistant roles | Yes | Not tracked | Unconfirmed | Homeroom staff; lead/assistant unconfirmed ([help](https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms)) | Unconfirmed |
| Student in several groups | Yes | Copy the row | Unconfirmed | Homeroom + current classroom ([help](https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms)) | Unconfirmed |
| Teachers see their group first | Yes, "Your groups" filter | Separate lists | Staff see only assigned rooms ([help](https://help.mybrightwheel.com/en/articles/942343-assign-staff-to-rooms)) | Optional "View all students" limit ([help](https://help.tryplayground.com/en/articles/8062988-staff-roles)) | Children page = class roster ([help](https://transparent-classroom.helpscoutdocs.com/article/21-children-page)) |
| Families see their child's teachers | Yes | Only if emailed | Unconfirmed | Unconfirmed | Unconfirmed |
| Ratio / capacity tracking | No | No | Yes ([help](https://help.mybrightwheel.com/en/articles/3363096-room-ratios-and-capacity)) | Yes ([help](https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms)) | Unconfirmed |
| Flags unassigned students / rooms without a lead | Yes | No | Unconfirmed | Unconfirmed | Unconfirmed |
| Published price | See MudKitchen pricing | Free | Quote only ([pricing](https://mybrightwheel.com/pricing/)) | Quote only ([pricing](https://www.tryplayground.com/pricing)) | $2/child/mo ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: Brightwheel and Playground model rooms for licensed childcare (ratios, capacity, room moves). MudKitchen models groups for a small K–8 school. Frame it as "the right size", not "more features".

## Open questions / things you could not verify

- **Statistics are thin** for this feature. No primary-source data on how microschools group students (mixed-age prevalence, groups per school). The NMC sector analysis PDF may have it but couldn't be parsed (no PDF tools available). Consider dropping the Evidence block from this page and leaning on product clarity.
- **Families see their child's teachers** on rival platforms: not checked.
- **Whether classrooms restrict staff access** in MudKitchen: My Students has an "All students" tab, so classrooms filter but don't restrict. Confirm before any privacy claim.
- **Google Classroom** details were not checked this session. Keep the tool-stack mention generic.
- **Founder quotes:** reddit.com is blocked for the research tool.
