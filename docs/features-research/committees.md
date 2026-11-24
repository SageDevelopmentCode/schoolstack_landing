# Committees & volunteering

Slug: `committees`. Researched Nov 22, 2026. Rivals: Brightwheel, Playground and Transparent Classroom (see `_rivals.md`).

> **Read first: what this feature is not.** The code has **no volunteer-hours tracking or ledger**: nothing logs, totals or reports a family's hours. "Hours" in the codebase means staff time clock (My Hours). Committees are **workspaces** with duty roles, tasks, resources, a calendar, messages and projects. Don't write "track volunteer hours" on the page. Also, the outreach plan `src/data/outreach/family-lyceum.ts:161` tells a prospect "you see each family's hours in one place", which the product doesn't support today. Fix that line or build the feature.

## Product truth (capabilities by role, with file paths; web/mobile)

Feature flags: `committees` exists for the admin, teacher and parent portals (`src/lib/organization-settings/catalog.ts:133,153,164`). It is **on by default for admin and staff, off by default for parents** (`parent.committees: false`, line 164), so the admin turns it on for families. The admin documentation says: "Set up a committee with tasks, resources, calendar, and members" (`src/lib/school-admin/admin-documentation.ts:791-841`).

### Admin / founder

| Capability | Proof | Web | Mobile |
|---|---|---|---|
| Create a committee from a template or blank. Templates: Annual Volunteer, Event, Long-Term Role, Hybrid, and "Custom committee" (from scratch). Templates preload duty roles (e.g. Committee Lead, Faculty Liaison, Booth Coordinator, Event Logistics Lead), task groups (Fall Project, Spring Project, Booths & Activities…) and a term label. | `src/lib/committees/templates.ts`; `src/components/school-admin/committees/CommitteeCreateWizard.tsx`; `.../garden/GardenCreateCommitteeDialog.tsx`; mobile `apps/mobile/src/components/school-admin/committees/garden/admin-create-committee-sheet.tsx` | ✓ | ✓ |
| Workspace sections: Home, Role & Duties (about), Resources, Calendar, Tasks, Projects, Messages, Members, Activity, Settings. | `src/lib/committees/types.ts` (`CommitteeWorkspaceSection`, `COMMITTEE_SECTION_LABELS`); `src/components/school-admin/committees/sections/*` | ✓ | ✓ (home, about, members, settings, activity, join requests, projects) |
| Member roles: member, lead, faculty liaison, admin. Named **duty roles** can be assigned to members. | `src/lib/committees/types.ts` (`CommitteeRole`, `CommitteeDutyRole`); `src/lib/committees/duty-roles.ts`; `sections/EditDutyRolePanel.tsx` | ✓ | ✓ |
| Invite members by name and email; review **join requests** (approve or decline) from families and staff. | `admin-documentation.ts:817-841`; `src/components/school-admin/committees/CommitteeJoinRequestsPanel.tsx`; `src/lib/committees/join-requests.ts`; mobile `admin-join-requests.tsx` | ✓ | ✓ |
| Resources: PDFs, docs, links and checklists, with **access limited to specific duty roles** ("Booth lead only"). | `src/lib/committees/permissions.ts`; `src/lib/committees/resources.ts`; `resource-file-storage.ts`; `sections/CommitteeResourcesSection.tsx` | ✓ | — |
| Tasks with groups, statuses (open, claimed, in progress, done), assignee and due date. Assignees get notified. | `src/lib/committees/types.ts` (`CommitteeTask`); `src/lib/committees/tasks.ts`; `notify-committee-task-assignment.ts`; `committee-notifications.ts` (`sendCommitteeTaskAssignedNotifications`) | ✓ | ✓ |
| Committee calendar: meetings, deadlines, service days, events. | `src/lib/committees/events.ts`; `sections/CommitteeCalendarSection.tsx` | ✓ | ✓ |
| Projects with a status and a **supply list** per project. | `src/lib/committees/committee-projects.ts`; `committee-project-supply-list-storage.ts`; `sections/CommitteeProjectSupplyListCard.tsx`; mobile route `apps/mobile/src/app/school-admin/[slug]/more/committees/[committeeId]/project/[projectId].tsx` | ✓ | ✓ |
| Committee message thread with file attachments. | `src/lib/committees/messages.ts`; `committee-message-attachment-storage.ts`; `sections/CommitteeMessagesSection.tsx` | ✓ | ✓ |
| Activity feed of who did what. | `src/lib/committees/activity-feed.ts`; `CommitteeActivityFeed.tsx`; mobile `admin-committee-activity.tsx` | ✓ | ✓ |
| Archive a committee at year end ("History is preserved"). | `sections/CommitteeSettingsSection.tsx:189-204` | ✓ | ✓ (settings) |
| Daily digest email of committee activity, plus instant push to members and admins. | `src/lib/committees/daily-digest.ts`; `committee-expo-push.ts`; `isCommitteeDailyDigestEnabled` in `src/lib/notifications/org-notification-settings` | email | push |

### Families / parents

| Capability | Proof | Web | Mobile |
|---|---|---|---|
| See committees you belong to and open invitations; accept to join. | `parent-documentation.ts:460-485`; `src/components/school-parent/committees/ParentCommitteeMineList.tsx` | ✓ | ✓ |
| Browse open committees, read each duty role, and **request to join** with a preferred role, grade and a note. | `ParentCommitteeBrowseList.tsx`; `ParentCommitteeDetail.tsx:104-137`; `src/lib/committees/types.ts` (`ParentCommitteeBrowseItem`); mobile `apps/mobile/src/app/parent/[slug]/more/committees/explore/[committeeId].tsx` | ✓ | ✓ |
| Work in the committee workspace: tasks, resources (if your duty role allows), calendar, messages, projects. | `ParentCommitteeWorkspace.tsx`; `garden/GardenCommitteeWorkspaceLayout.tsx`; mobile `.../committees/workspace/[committeeId].tsx`; `apps/mobile/src/components/parent/committees/garden/{sections,projects,sheets}` | ✓ | ✓ |
| Notified when assigned a task, when a request is approved or declined, and when messages are posted (email + push), plus the optional daily digest. | `committee-notifications.ts` (`sendCommitteeJoinApprovedNotifications`, `...MessagePosted...`); `committee-expo-push.ts` | email | push |
| Home shortcut "Join a committee". | `catalog.ts:231-233` | ✓ | — |

### Staff / teachers

| Capability | Proof | Web | Mobile |
|---|---|---|---|
| Same browse, request-to-join and workspace experience as parents, without the grade field. Typical role: faculty liaison. | `src/components/school-teacher/committees/TeacherCommitteesPage.tsx` (wraps `PortalCommitteesPage`, `showGradeField={false}`); `src/lib/committees/teacher-committees.ts` | ✓ | ✓ (`apps/mobile/src/app/teacher/[slug]/more/committees/{explore,workspace}`) |

## Founder pain (with quotes + sources)

Reddit (r/microschools, r/PTA) and the Well-Trained Mind forums blocked automated fetches this session. The quotes below come from PTO Today's 2026 leader survey, microschool websites and vendor pages.

- **A small group does everything.** PTO Today's leader survey: "Nearly all leaders (97%) say the same small group of volunteers is doing most of the work, leading to burnout." It also says "a dedicated few are carrying the majority of responsibilities" and "Many PTOs are running on a very small team, which increases the workload for those who do show up." — PTO Today, Feb 5, 2026 — https://www.ptotoday.com/pto-today-articles/state-of-school-volunteering-pto-pta-leaders
- **"Parents assume others will step up."** The same survey (45%). — same URL
- **Microschools *require* volunteering, but the opportunities live in email.**
  - Creation Acres (microschool): full-time families owe 20 service hours a year and 5 in summer, and the site says a list of opportunities is "sent out periodically" (paraphrased in our research notes). — https://www.creationacres.com/admissions/family-commitment (via `src/data/outreach/creation-acres.ts:146-150`)
  - Family Lyceum: "Parents contribute at least 20 volunteer hours to the school". The site doesn't show where families see the options or sign up. — https://www.familylyceum.com/ (via `src/data/outreach/family-lyceum.ts:49,152-153`)
- **Co-ops want parent involvement and hours handled in the same tool.** A cooperative preschool reviewing Playground on Capterra wished for options "that work with the way our parents are involved in the running of our school and tracking the hours they work at the school" (search snippet; Capterra returned 403, so unverified). — https://www.capterra.com/p/220200/Playground/reviews/
- **Records drift apart.** A co-op software vendor says families and coordinators often keep separate hour records that don't match (vendor blog, from a search summary). — https://nav.education/blog/co-op-volunteer-hours-billing-ledger/
- **Coordinator time.** A co-op guide estimates 3–5 hours a week to run a 25–30-student co-op and calls attendance and volunteer tracking the most time-intensive parts (vendor blog, from a search summary). — https://nav.education/blog/how-to-manage-homeschool-co-op/

Phrases to reuse: "the same small group", "burnout", "parents assume others will step up", "a list of opportunities is sent out", "committee chairs".

## Evidence (numbered: quote — publisher, year — URL)

1. **Private-school parents volunteer at almost twice the public-school rate.** The table reports "Volunteered at school": 2019 total 43.0%, **public 39.9%, private 72.1%** (private elementary 75.9%). — NCES, *Digest of Education Statistics*, Table 207.40 (2019 NHES-PFI data), 2022 edition — https://nces.ed.gov/programs/digest/d22/tables/dt22_207.40.asp?current=yes
2. "Nearly all leaders (97%) say the same small group of volunteers is doing most of the work, leading to burnout." — PTO Today, 2026 — https://www.ptotoday.com/pto-today-articles/state-of-school-volunteering-pto-pta-leaders
3. "A large majority (82%) report relying on fewer than 10 active volunteers at their school." — PTO Today, 2026 — same URL
4. Hardest roles to fill: "Board roles (president, treasurer, secretary, VP, etc.): 57%" and "Leadership or coordinator positions (committee chairs, etc.): 48%". — PTO Today, 2026 — same URL
5. "Two-thirds of leaders (66%) report personally volunteering up to 10 hours per week for their school." — PTO Today, 2026 — same URL
6. "Parents with children under 18 formally volunteered at a higher rate (37 percent) than those without children in their household (25 percent), a nearly 12 percentage-point difference." (2023 CPS Civic Engagement and Volunteering data) — AmeriCorps press release, 2024 — https://americorps.gov/newsroom/press-release/more-757-million-people-volunteered-america-americorps-reports. *The quote appears in search results for this page, but the page returns 403 to direct fetches, so open it in a browser before publishing.*

Caveat on PTO Today: the article gives no sample size or field dates. Cite it as "a 2026 PTO Today survey of PTO and PTA leaders".

## Tool stack alternative

What a microschool or co-op uses instead:
- **Email list or group text** for "we need help with…". Failure modes: one long thread, the same few people answer, and new families don't know what roles exist.
- **SignUpGenius / SignUp.com** for shifts. Good for one-off slots, but no ongoing workspace: no duty roles, shared files, tasks or history. SignUp.com's own advice is to start with a "Committee Picker SignUp Sheet or Volunteer Interest Form" and then build separate sheets per activity, so it takes several tools for one committee (search summary of signuphelp.zendesk.com). The free tier shows ads.
- **Google Drive folders** for the event binder, vendor contacts and last year's notes. Failure modes: access tied to someone's personal account, and the folder leaves with the chair.
- **Google Sheets** for "who's on what committee" and, at co-ops, volunteer hours. Failure modes: families and coordinator keep different records, and nobody gets a reminder.
- **Facebook/WhatsApp groups** for committee chatter. These mix with social posts, the founder can't see progress, and nothing gets archived at year end.

Concrete failure moments: the fall-festival chair moves away and the booth plan was in her Gmail. A new family wants to help but can't see which committees exist. The founder has to ask in three places whether the spring-auction tasks are done.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel**
- Committee workspaces: **Not listed.** The pricing page's feature list ("Everything you need to run your center") mentions no committees, volunteer roles or volunteer hours. — https://mybrightwheel.com/pricing (checked Nov 2026)
- Volunteer shifts: **Included via Sign-ups.** Admins and staff create Item, Time, Recurring and Time-series slots, and parents sign up and cancel under Paperwork > Sign-ups. Brightwheel's blog suggests a list "for volunteer shifts". — https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more (checked Nov 2026)
- Pricing: quote only, "access to all features". — https://mybrightwheel.com/childcare-forms/ (checked Nov 2026)

**Playground**
- Committees / volunteer management: **Not listed** on its own pages. Its llms.txt feature index (billing, enrollment, communication, attendance, paperwork, food program, etc.) has no volunteer, committee or sign-up page. — https://www.tryplayground.com/llms.txt (checked Nov 2026)
- A third-party software directory lists "Volunteer Management" as a Playground feature: **unconfirmed** on Playground's site.
- Pricing: "custom pricing based on program size and needs". — https://www.tryplayground.com/llms.txt (checked Nov 2026)

**Transparent Classroom**
- Committees / volunteer management: **Not listed.** Searches of its help center (transparent-classroom.helpscoutdocs.com) found no volunteer or committee articles. A 2017 request for parent event/conference sign-ups is marked **Declined**, with the founder's reply: "You can do this today by embedding a Google Sheet in a page for parents to see." — https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/18556135-online-parent-teacher-conference-sign-up-schedule (checked Nov 2026)
- Pricing: $2.00 per child per month. — https://www.transparentclassroom.com/pricing (checked Nov 2026)

## Draft copy (sections as in 2e)

Reference pages to model on (structure only; not re-checked this session because the web limit was hit): SignUpGenius "PTA/PTO sign ups" (https://www.signupgenius.com/how-to-use/pta-pto-sign-up), Brightwheel sign-ups (help article above), Konstella and Membership Toolkit PTA pages. They lead with "stop chasing volunteers", name the jobs (chairs, room parents, events) and show the parent's view.

**Hero headline:** Parent committees that run *without the reply-all chain* (lead: "Parent committees that run" / accent: "without the reply-all chain", 8 words)

**Hero body (32 words):** Give each committee its own space for roles, tasks, files, dates and messages. Families ask to join from their portal, you approve, and everyone sees what's next, on web and phone.

**One-liner (10 words):** Committee workspaces for the parents who keep your school running.

**Capabilities: Admin / founder**
- **Start from a template.** Annual volunteer, event, long-term role or hybrid committees come with duty roles and task groups ready to edit.
- **Name the jobs.** Create duty roles like Booth Coordinator or Faculty Liaison so each volunteer knows exactly what they own.
- **Approve who joins.** Families and staff request to join with a preferred role and a note. You approve or decline in one tap.
- **Share files by role.** Keep the event binder, vendor list and checklists in Resources, and limit sensitive files to specific roles.
- **See progress at a glance.** Tasks, the calendar and the activity feed show what's done, what's claimed and what's due.
- **Archive at year end.** Close a committee when the term ends. Its history stays for next year's chair.

**Capabilities: Families**
- **Find a way to help.** Browse open committees, read what each role involves, and ask to join.
- **Know your part.** See the tasks assigned to you, due dates and the files your role needs.
- **Talk in one thread.** Message the committee and attach files, without a group text.
- **Get nudged, not buried.** Get an email or phone alert when you're assigned a task, plus an optional daily summary.

**Capabilities: Staff**
- **Join as liaison.** Teachers request to join committees and work alongside parents in the same workspace.
- **Stay in the loop.** See committee tasks, dates and messages from the staff portal or app.

**Use cases**
1. **Fall festival.** *Scenario:* The founder creates an Event Committee, names a Booth Coordinator and a Logistics Lead, and adds the site map to Resources. *Outcome:* Twelve families claim booth tasks, and the founder checks progress from the activity feed instead of a 60-message thread.
2. **New family wants to help.** *Scenario:* A parent who joined in January opens Committees, reads the duty roles and requests to join the garden committee with a note about weekends. *Outcome:* The lead approves it the same day, and the parent sees the next work date on the calendar.
3. **Chair hand-off.** *Scenario:* The auction chair is stepping down. *Outcome:* The new chair opens last year's archived committee and finds the vendor list, checklist and messages, because none of it lived in the old chair's Gmail.
4. **Co-op supply run.** *Scenario:* A co-op's science committee plans a spring project with a supply list. *Outcome:* Members see what's needed per project and who's on it, without a separate spreadsheet.

**FAQ**
- **Can families join on their own?** They can request to join from their portal, choosing a preferred role and adding a note. A school admin approves or declines each request. You can also invite people directly by name and email.
- **Does it track volunteer hours?** Not today. Committees organise roles, tasks, files, dates and messages. If your school requires a set number of hours, track the totals separately for now. *(Keep this answer honest until hours tracking ships.)*
- **Can teachers be on committees?** Yes. Staff browse and request to join from the staff portal and app, and can hold roles like faculty liaison.
- **Who can see committee files?** Members see a committee's resources, and you can limit any file to specific duty roles. Admins always see everything.
- **Does it work on phones?** Yes. Families, staff and admins can open committee workspaces in the MudKitchen iOS and Android app, with push alerts for new tasks and messages.

**Comparison rows**

| Label | MudKitchen | Tool stack (email + SignUpGenius + Drive) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Committee workspaces | Yes: roles, tasks, files, calendar, messages, projects | Spread across 3–4 tools | Not listed ([pricing](https://mybrightwheel.com/pricing)) | Not listed ([llms.txt](https://www.tryplayground.com/llms.txt)) | Not listed ([help](https://transparent-classroom.helpscoutdocs.com/)) |
| Named duty roles | Yes, from templates | Written in an email | Not listed | Not listed | Not listed |
| Families request to join | Yes, with preferred role and note | Reply to an email | Not listed | Not listed | Not listed |
| Files limited by role | Yes | Drive sharing, by hand | Not listed | Not listed | Not listed |
| Volunteer shift sign-ups | Classroom signups (separate feature) | SignUpGenius | Yes, Sign-ups ([help](https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more)) | Unconfirmed | Declined request; "embed a Google Sheet" ([UserVoice](https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/18556135-online-parent-teacher-conference-sign-up-schedule)) |
| Task alerts on phone | Email + push | Depends on the tool | Unconfirmed | Unconfirmed | Unconfirmed |
| Year-end archive with history | Yes | Folder stays with the chair | Not listed | Not listed | Not listed |
| Price model | MudKitchen plan (see pricing page) | Mostly free; SignUpGenius paid tiers | Quote only ([forms FAQ](https://mybrightwheel.com/childcare-forms/)) | Quote only ([llms.txt](https://www.tryplayground.com/llms.txt)) | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

## Open questions / things you could not verify

- **Volunteer hours:** not in the product. Decide whether to build it (a per-family ledger tied to committees and signups) before the page promises it. Fix the claim in `src/data/outreach/family-lyceum.ts:161`. `creation-acres.ts:154-155` only promises sign-ups, which is fine.
- **Parent committees default to off** (`catalog.ts:164`). The page should say the school turns it on, or the default should change.
- **AmeriCorps 37% vs 25%:** the quote matches the search result for the press release, but the page returns 403 to fetches. Open it in a browser to confirm.
- **Capterra Playground quotes** (co-op hours wish, microschool fit): search snippets only, because Capterra returned 403.
- **Reddit / founder-forum quotes:** Reddit and Well-Trained Mind blocked automated access, and the web-research quota ran out mid-session. A human pass through r/microschools, r/homeschool co-op threads and the Microschool Founders Grove (Skool) would add first-person quotes.
- **Rival mobile push for sign-ups/tasks:** unconfirmed for all three.
- **Which plan includes Committees** in MudKitchen's own pricing: not checked here.
