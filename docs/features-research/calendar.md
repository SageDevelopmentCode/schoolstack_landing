# Calendar & schedule

Researched Nov 22, 2026. Feature slug: `calendar` (school events, plus tours, interviews and shadow days/visits). Rivals: Brightwheel, Playground, Transparent Classroom (per `docs/features-research/_rivals.md`). Procare notes are marked **not used**.

## Product truth (capabilities by role, with file paths; web/mobile)

> "Mobile" below means the MudKitchen **iPhone app** (Expo code in `apps/mobile`). Google Play isn't live yet; the download page runs an Android waitlist. In copy, say "iPhone app", never "iOS and Android".

How it works in one line: the admin's **Schedule** has two jobs. (1) The school calendar: events (field trips, no-school days, community, academic) that families and staff see. (2) Visits: open slots for tours, family interviews and shadow days that prospective families book, with automatic reminder emails.

Admin Schedule tabs: "Overview", "Events", "Permissions", "Tours & interviews", "Shadow days", "All visits" (`src/components/school-admin/schedule/schedule-tabs.ts`). Catalog: "School calendar, events, and availability" (`src/lib/organization-settings/catalog.ts`).

### School admin / founder — school calendar

| Capability | Proof | Web / mobile |
|---|---|---|
| Create events: title, date, all-day or start/end time, location, description, type (field trip, no school, community, academic, other), color (10 options) | `src/lib/school-events/types.ts` (`SchoolEventType`, `SchoolEventColorKey`, `OrganizationEvent`); `src/components/school-admin/schedule/SchoolEventFormPanel.tsx`, `EventColorPicker.tsx` | Both (`apps/mobile/src/components/school-admin/schedule/school-event-form-sheet.tsx`, `garden/schedule-events-panel.tsx`) |
| Audience: all families (main portal) or one program's families | `types.ts` ("Null = visible on the main portal and all program portals"); `src/lib/school-events/event-audience.ts` (`formatOrganizationEventAudienceLabel`: "All families (main portal only)" / program name) | Both |
| Let teachers or specific staff add and edit events | `src/lib/school-events/schedule-settings.ts` (`ScheduleEventPermissions`: roles teacher/staff + `staff_member_ids`, default off); `ScheduleEventPermissionsTab.tsx` | Web (Permissions tab) |
| New events appear in families' and teachers' notification bell ("posted a calendar event") | `src/lib/school-events/event-activity.ts` (`CALENDAR_EVENT_POSTED`); `src/lib/parent-portal/parent-activity-notifications.ts`; `src/lib/school-teacher/activity-notifications.ts` | Web confirmed |

### School admin / founder — tours, interviews, shadow days

| Capability | Proof | Web / mobile |
|---|---|---|
| Open or close time slots families can book for tours and interviews | Admin guide "Set tour and interview availability" (`src/lib/school-admin/admin-documentation.ts`); `ToursInterviewsTabContent.tsx` | Both (`apps/mobile/src/components/school-admin/schedule/garden/schedule-tours-panel.tsx`) |
| Shadow days: choose which school days are open for whole-day observation visits | Guide "Set shadow day availability"; `garden/schedule-shadow-panel.tsx` (mobile) | Both |
| Visits as steps after an application (tour, interview, shadow day) | Guide "Add post-submit steps (tour, interview, shadow day)" | Web |
| Public tour booking page, no login, with group-tour capacity and custom intake questions ("When MudKitchen enables it") | Guide "Public tour booking page"; routes `src/app/school/[slug]/tour/page.tsx`, `src/app/school/[slug]/apply/schedule-tour/page.tsx` | Web (public page) |
| All visits in one list, linked to the application | Guide "View scheduled visits"; `ScheduledVisitsSection.tsx`, `ScheduleVisitsData.tsx` | Both (`garden/schedule-visits-panel.tsx`) |
| Book a visit for a family yourself (manual booking, guest registrant) | `src/components/school-admin/schedule/AdminScheduleManualBookingDialog.tsx`, `AdminManualGuestRegistrantForm.tsx` | Web |
| Automatic reminder emails: families the day before (code also has a day-of reminder); admins get a weekly Monday digest plus day-before (and day-of) summaries; extra recipients under Settings → Notifications → Visits | Guide "Automatic visit reminder emails"; `src/lib/admissions/scheduled-visit-reminders.ts` (`day_before`, `day_of`, `isMondayMorningWindow`); run daily from `src/lib/tuition/billing-cron.ts` | Email |
| On the **Free plan**: Tours & interviews and All visits stay open; Overview, Events, Permissions and Shadow days are locked | `schedule-tabs.ts` (`FREE_PLAN_LOCKED_SCHEDULE_TABS`); `src/lib/school-admin/free-plan-upgrade.ts` | Both |

### Families / parents

| Capability | Proof | Web / mobile |
|---|---|---|
| Family calendar by month or list view; tap for time, location, notes | Parent guide "View your family calendar" (`src/lib/parent-portal/parent-documentation.ts`); `src/components/school-parent/calendar/ParentCalendarPage.tsx`, `ParentCalendarAgendaPanel.tsx` | Both (`apps/mobile/src/app/parent/[slug]/calendar.tsx`) |
| Next event on the home page with a link to the calendar | Same guide ("Use the home page shortcut") | Both |
| "Add to my calendar" (.ics for Apple, Google or Outlook), "Copy details", directions in Google Maps | `src/components/school-parent/calendar/garden/GardenEventDrawer.tsx`; `src/lib/school-events/calendar-event-export.ts` | Web |
| "Open in Maps, Copy details, Share event" | `apps/mobile/src/components/parent/calendar/garden/sheets/garden-event-sheet.tsx` | Mobile |
| Program portals show that program's events; main portal shows school-wide | `event-audience.ts` (`describeParentPortalCalendarScope`) | Both |
| Book tours, interviews, shadow days from the apply dashboard or public tour page; reminder email the day before | Admin guides above; `scheduled-visit-reminders.ts` | Web |

### Staff / teachers

| Capability | Proof | Web / mobile |
|---|---|---|
| School calendar by month, week or day | Teacher guide "View upcoming school events" (`src/lib/school-teacher/teacher-documentation.ts`); `src/components/school-teacher/TeacherCalendarPage.tsx` | Both (`apps/mobile/src/app/teacher/[slug]/calendar.tsx`) |
| Today's events on the dashboard ("Classroom snapshot", Start here) | Teacher guide "See what's on today" | Both |
| Add/edit events when the admin grants permission | `TeacherCalendarInitialData.canManageEvents` (`src/lib/school-events/types.ts`); `apps/mobile/src/components/teacher/calendar/garden/use-teacher-calendar-controller.ts` | Both |

### What it does NOT do (don't claim)
- **No RSVPs** for school events (no RSVP fields in `src/lib/school-events/*`).
- **No live calendar subscription/sync** (only one-time .ics per event on web). "Google Calendar sync" is listed as a *custom build* in `CUSTOM_COPY.tags` (`src/components/home/home-copy.ts`).
- **No recurring events** field in `OrganizationEvent`.
- **No email or push when a school event is posted** (bell only). Visit reminders are email only.
- Public tour page needs MudKitchen to enable it ("When MudKitchen enables it").

## Founder pain (with quotes + sources)

Reddit couldn't be searched (blocked for the search tool). Quotes are from news and research.

- **Families check school apps constantly.** One parent "logged more than 45 checks" of her school apps over three days and has "16 apps tucked into a single folder on her phone." — Star Tribune via GovTech, Nov 16, 2026 — https://www.govtech.com/education/k-12/why-some-parents-feel-overwhelmed-by-school-apps
- **The schedule lands on one parent.** "72 percent feel it's their job to stay on top of kids' schedules" (working mothers). The same research describes the "perpetual mental awareness of schedules including early release days, carpools, doctor's appointments." — Bright Horizons Modern Family Index, Dec 20, 2017 — https://brighthorizons.com/newsroom/mental-load-impact-working-mothers-study *(second quote from search summary of the 2017 report)*
- **Founders run admissions themselves.** Private microschools have a median of 20 students; leaders spend an average of "93 hours per year" on compliance alone. — The 74, Jun 11, 2026 — https://www.the74million.org/article/exclusive-7-things-to-know-about-microschools-in-2026/ Tours, interviews and shadow days are booked around the founder's teaching day.
- **MudKitchen approved framing:** "Important tasks depend on memory." (`PAIN_COPY`); custom tag "Google Calendar sync" shows founders ask for it (`CUSTOM_COPY`).

## Evidence (numbered: quote — publisher, year — URL)

1. "72 percent feel it's their job to stay on top of kids' schedules" — Bright Horizons Modern Family Index (working mothers), 2017 — https://brighthorizons.com/newsroom/mental-load-impact-working-mothers-study
2. "Breadwinning mothers are three times more likely than breadwinning fathers to be keepers of their children's schedules" (76% vs. 22%) — Bright Horizons, 2017 — same URL
3. "50% said it influenced their decision to enroll" (communication quality) — ParentSquare & Hanover Research parent study (n=1,031), Oct 2026 — https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/ *(vendor-sponsored; supports tour/visit communication)*
4. "53 percent expressed that information shared by their children's school is not always easy to access and understand" — SchoolStatus 2024 report via eSchool News, 2024 — https://www.eschoolnews.com/district-management/2024/04/10/school-home-communication-remains-challenge/
5. One parent "logged more than 45 checks" of her school apps over three days. — Star Tribune via GovTech, 2026 — https://www.govtech.com/education/k-12/why-some-parents-feel-overwhelmed-by-school-apps *(anecdote)*

Strongest two: #1 (72% of working mothers say keeping kids' schedules is their job) and #3 (half of parents say communication influenced whether they enrolled).

Not found: a solid, sourced statistic on tour no-show rates or the effect of reminder emails on visit attendance. Don't use one without a source.

## Tool stack alternative

Typical stack: a shared Google Calendar (often a public embed on the website), Calendly or Acuity for tours, Google Forms for interview requests, a PDF school-year calendar, plus reminder texts by hand. `src/lib/outreach/tool-replacements.ts` maps "Google Calendar" to calendar and "Google Calendar booking" to tour scheduling.

Failure modes:
- **Two disconnected systems.** Tours booked in Calendly don't link to the application; the founder copies names between tools. MudKitchen visits link to the submission.
- **Public by default.** A public Google Calendar embed shows field-trip locations and times to anyone (general behavior of public calendars; no source collected).
- **PDF calendars go stale.** A mid-year change means re-sending the PDF; families keep the old one.
- **No program filter.** One shared calendar shows every program's events to every family.
- **Reminders depend on memory.** Without automatic emails, the founder texts each visiting family the night before.
- **Shadow days aren't a calendar concept.** Whole-day observation visits get tracked in a spreadsheet.

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel — included (price not public)
- Calendar events: staff create them on web (My School > Calendar) and mobile; "everything is organized by room"; families see events for their child's rooms. Calendar Sharing (admin toggle) lets families add events to personal calendars; "Events can't be edited or deleted from personal calendars." — https://help.mybrightwheel.com/en/articles/942407-add-events-to-your-program-calendar (dated Jul 1, 2026; checked Nov 2026)
- RSVP: via separate Sign-ups ("Create sign-up sheets for events, supplies, parent-teacher conferences & more") — https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more (title-level evidence from `_rivals.md`; article body not opened)
- Tours: "Let families book available tour times themselves"; "Set recurring availability and control how many families can book"; "Send automatic tour confirmations and reminders." Tier/add-on: **unconfirmed**. — https://mybrightwheel.com/crm-and-enrollment-forecasting/ (checked Nov 2026)
- Shadow days: not found.

### Playground — included (price not public)
- "Manage the Calendar": admins create events under Scheduling > Calendar; "Everyone is Invited" by default or Specific Groups (class, program, listing, staff); RSVP toggle with an RSVP-by date ("RSVPs can't be enabled on recurring events"); Repeats; "Add to my Calendar" ICS on web; subscribing "will only sync public events"; public events get a shareable link. — https://help.tryplayground.com/en/articles/7017265-manage-the-calendar (checked Nov 2026; "Updated over a week ago")
- Tours (CRM): "Allow parents to book tours directly from your website"; "Automatically send confirmation, reminders, and follow-ups texts and/or emails." Access: "To get access to CRM, reach out to your dedicated account manager." — https://help.tryplayground.com/en/articles/9875841-what-is-crm (updated Aug 18, 2026; checked Nov 2026)
- Shadow days: not found.

### Transparent Classroom — Google Calendar connection ($2/child/month)
- Events come from connecting a Google Calendar to a school or classroom (homepage feature list; help article "Events: Connecting a Google Calendar"). — https://www.transparentclassroom.com/ and https://transparent-classroom.helpscoutdocs.com/category/7-category (checked Nov 2026)
- Tour/interview booking: not listed on the homepage. RSVP: not found.

### Procare — NOT USED (reference only)
- "send newsletters and keep families aware of calendars and upcoming events" — https://www.procaresoftware.com/capabilities/family-engagement/ ; lead tools let Procare Online users "set up tours" (search summary); public self-booking unconfirmed. (checked Nov 2026)

## Draft copy (sections as in 2e)

Tone references: Playground ("Built-in calendar for events, menus, and RSVPs"), Brightwheel's CRM page ("Let families book available tour times themselves"), Transparent Classroom's event help. Rivals split events and tours across calendar and CRM products; MudKitchen's honest angle is one Schedule for the school year and for admissions visits, including shadow days.

**Hero headline:** Lead: "The school calendar and every visit," Accent: "in one schedule." (9 words)

**Hero body (35 words):** Post field trips and no-school days for the families who need them. Open slots for tours, interviews and shadow days, and let MudKitchen send the reminders. Families and teachers see it all on their phones.

**One-liner (11 words):** School events and admissions visits in one schedule, reminders included.

### Capabilities — Admin / founder
- **Events for the right families** — Post an event for the whole school or one program, with time, place, type and color.
- **Tours that book themselves** — Open time slots for tours and interviews. Families pick one; you see it under All visits.
- **Shadow days, built in** — Choose which school days are open for whole-day observation visits.
- **Reminders sent for you** — Families get an email before their visit. You get a Monday digest and a heads-up the day before.
- **Visits tied to applications** — Each visit links to the family's application, so you're ready when they walk in.
- **Share the pen** — Let teachers or chosen staff add events, or keep the calendar to admins.

### Capabilities — Families
- **This month at a glance** — See school events by month or as a list, with your next event on the home page.
- **Add it to your calendar** — Save any event to Apple, Google or Outlook Calendar, or copy the details.
- **Directions in one tap** — Open the field-trip address in Maps.
- **Book your visit** — Pick a tour, interview or shadow-day time and get a reminder email the day before.

### Capabilities — Staff / teachers
- **Today on your dashboard** — Today's events show on your dashboard, so you're not surprised by an assembly.
- **Day, week or month** — Switch views to plan the week ahead.
- **Add events when allowed** — If your admin gives you permission, add and edit events from web or app.

### Use cases
1. **Snow day** — *Scenario:* School closes tomorrow. *Outcome:* The founder adds a "No school" event for all families; it shows on every family's calendar and home page and in their notification bell. (Pair with a Bulletin post or Message for an email and push alert.)
2. **Program field trip** — *Scenario:* Only the upper-elementary program visits the nature center. *Outcome:* The event goes to that program's families, who add it to their own calendar and open the address in Maps.
3. **Spring tour season** — *Scenario:* Ten families want tours in March. *Outcome:* The founder opens Tuesday and Thursday morning slots; families book, get a reminder the day before, and she reads Monday's digest over coffee.
4. **Shadow day before enrollment** — *Scenario:* An accepted applicant wants to try a full day. *Outcome:* The family picks an open shadow day linked to the application, and the lead teacher sees it on the calendar.

### FAQ
- **Can families add school events to their own calendar?** Yes. On the web, "Add to my calendar" downloads an event file for Apple, Google or Outlook Calendar. In the app, families can copy or share event details and open the location in Maps. (35 words)
- **Can prospective families book a tour without an account?** Yes, when the public tour page is turned on for your school. Families pick a slot and answer your intake questions; bookings show under Tour submissions. Applicants can also book visits from their apply dashboard. (38 words)
- **Who gets reminders?** Families get an email the day before a tour, interview or shadow day. Admins get a weekly Monday digest of upcoming visits and a summary the day before. You can add extra recipient emails in Settings. (38 words)
- **Can teachers add events?** Only if you allow it. In the Permissions tab you can let all teachers, all staff, or specific people add and edit school events. Everyone else sees the calendar read-only. (32 words)
- **Does it sync with Google Calendar?** There's no live sync today. Families can add individual events to Google, Apple or Outlook Calendar. A live Google Calendar sync can be set up as a custom integration. (32 words)

### Comparison rows

| Row | MudKitchen | Tool stack (Google Calendar + Calendly + Forms) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| School events calendar for families | Yes, web + app | Google Calendar embed | Yes, by room ([help](https://help.mybrightwheel.com/en/articles/942407-add-events-to-your-program-calendar)) | Yes ([help](https://help.tryplayground.com/en/articles/7017265-manage-the-calendar)) | Via connected Google Calendar ([home](https://www.transparentclassroom.com/)) |
| Audience targeting | All families or one program | One calendar per audience | By room ([help](https://help.mybrightwheel.com/en/articles/942407-add-events-to-your-program-calendar)) | Everyone or specific groups ([help](https://help.tryplayground.com/en/articles/7017265-manage-the-calendar)) | School or classroom calendar ([home](https://www.transparentclassroom.com/)) |
| Add to personal calendar | One-time .ics per event (web) | Native | Calendar Sharing toggle ([help](https://help.mybrightwheel.com/en/articles/942407-add-events-to-your-program-calendar)) | ICS + subscribe (public events only) ([help](https://help.tryplayground.com/en/articles/7017265-manage-the-calendar)) | Google Calendar |
| RSVP | No | Google Forms / Calendly | Via Sign-ups ([help](https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more)) | Yes, not on recurring events ([help](https://help.tryplayground.com/en/articles/7017265-manage-the-calendar)) | Not found |
| Self-booked tours | Yes (public page when enabled; apply dashboard) | Calendly/Acuity | Yes, tier unconfirmed ([page](https://mybrightwheel.com/crm-and-enrollment-forecasting/)) | Yes via CRM, account-manager access ([help](https://help.tryplayground.com/en/articles/9875841-what-is-crm)) | Not listed |
| Interviews + shadow days | Yes, both | Manual | Not found | Custom meeting types ([help](https://help.tryplayground.com/en/articles/9875841-what-is-crm)); shadow days not found | Not listed |
| Visit reminders | Email to families; admin digests | Calendly emails | Confirmations + reminders ([page](https://mybrightwheel.com/crm-and-enrollment-forecasting/)) | Texts and/or emails ([help](https://help.tryplayground.com/en/articles/9875841-what-is-crm)) | n/a |
| Public price | Tours & interviews open on Free plan | Calendly has a free tier (not checked) | Quote only ([pricing](https://mybrightwheel.com/pricing)) | Quote only ([llms.txt](https://www.tryplayground.com/llms.txt)) | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: Playground's calendar has RSVPs, recurring events and subscription feeds that MudKitchen lacks. MudKitchen's angles: shadow days, interviews and tours in the same Schedule as school events, visits linked to applications, and admin digests, with tours available on Free.

## Open questions / things you could not verify

- Whether the public tour page is on for all schools or only when MudKitchen enables it (guide says the latter); copy should say "when enabled".
- Day-of family visit reminder exists in code (`day_of`) but the admin guide only mentions day-before; confirm which is live before naming it.
- Visit reminders run inside a once-daily job (`vercel.json` `0 12 * * *` UTC); timing of "Monday morning" digest depends on that.
- Brightwheel tour booking tier; Brightwheel RSVP details (article body not opened).
- Bright Horizons "perpetual mental awareness" line is from a search summary of the 2017 report; the 72% and 76% vs 22% lines were fetched verbatim.
- No sourced statistic on tour no-shows or reminder effectiveness was found.
- Reddit / founder forums not searchable this session.
