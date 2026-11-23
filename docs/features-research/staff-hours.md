# Timeclock & staff hours

Research date: 22 Nov 2026. Rivals: Brightwheel, Playground, Transparent Classroom (see `_rivals.md`). Procare notes are kept but marked "not used". **Payroll is "coming soon" and is excluded everywhere below** (`src/lib/organization-settings/catalog.ts` has `teacher.payroll: false`).

Note on the help guides: none of the three documentation files has a staff-hours or My Hours guide. The claims below are proven from components, libs and API routes.

## Product truth (capabilities by role, with file paths; web/mobile)

**Platform note:** "Mobile" below means the MudKitchen **iPhone app**. It is iPhone-only today (Google Play is not live; the download page runs an Android waitlist). In copy, write "iPhone app", never "iOS and Android". Push notifications reach iPhone users only.

The model: staff **clock in and clock out**, and each pair is a **session**. A day can have several sessions (morning + afternoon, or a break between). To fix a missed or wrong day, staff send an **hour adjustment**. Depending on a school setting, it either saves right away or waits for an admin to approve it.

### Staff / teachers ("My Hours")
| Capability | Proof | Web / Mobile |
|---|---|---|
| Time clock card: Clock in / Clock out, "On the clock for {elapsed}", "Started at {time}" | `src/components/school-teacher/my-hours/garden/MyHoursTimeClockCard.tsx` | Web |
| Same clock on the phone: "Clock in when your day starts. Each session saves here when you clock out." | `apps/mobile/src/components/teacher/my-hours/garden/teacher-my-hours-garden-screen.tsx`, `apps/mobile/src/app/teacher/[slug]/more/my-hours.tsx` | Mobile |
| Several sessions per day ("Add another session") | `apps/mobile/src/components/teacher/my-hours/garden/sheets/*`, `src/lib/school-teacher/my-hours/my-hours-adjustment-rules.ts` (`SESSION_MAX = 12`) | Web + mobile |
| Today / Week / Month views and totals ("Your week", "Your month", "This week: Xh of 40h") | `src/components/school-teacher/my-hours/garden/MyHoursViews.tsx`, `MyHoursRail.tsx`, `src/lib/school-teacher/my-hours/my-hours-summaries.ts` (`MY_HOURS_WEEK_GOAL_MINUTES = 40 * 60`, fixed, not configurable) | Web + mobile |
| Fix a past day or add forgotten hours ("Forgot to clock in? Add the hours you worked.") with an optional reason | `src/components/school-teacher/my-hours/garden/MyHoursAdjustPanel.tsx`, `src/lib/school-teacher/my-hours/my-hours-adjustments.ts` | Web + mobile (`use-adjust-editor.ts`) |
| Guard rails: clock-out must be after clock-in, sessions can't overlap, "Clock out before changing this day." | `src/lib/school-teacher/my-hours/adjust-validation.ts`, `my-hours-adjustment-rules.ts` | Web + mobile |
| Pending status: "Submitted days stay pending until your school approves them." / "Waiting on your school" | `MyHoursAdjustPanel.tsx`, `MyHoursRail.tsx` | Web + mobile |
| Push notification when the admin approves or denies a change | `src/lib/notifications/mobile-push-catalog.ts` (`staff_hours.adjustment_reviewed`: "Opens My Hours in the teacher mobile app") | Mobile push |
| My Hours can be turned on/off for the staff portal | `catalog.ts` (`teacher.my_hours`), mobile string "My Hours is not enabled" | — |

### School admin / founder ("Staff hours")
| Capability | Proof | Web / Mobile |
|---|---|---|
| Live view: who is "On the clock" right now (with live elapsed time), "Sessions today", "Finished today" | `src/components/school-admin/staff-hours/StaffHoursPage.tsx`, `StaffHoursLiveElapsed.tsx` | Web + mobile (`apps/mobile/src/components/school-admin/staff-hours/garden/staff-hours-screen.tsx`, "Clocked in now", "No one is clocked in right now.") |
| Summary: totals per staff member for any date range, quick ranges (This week, Last 7 days, Last 30 days), filter by one person | `StaffHoursPage.tsx` ("Hours by staff", "Totals for this range", "Quick ranges", "Filter by staff member") | Web + mobile ("Filter the summary by one person") |
| Requests: approve or deny hour adjustments, seeing Current vs Proposed sessions. History shows Approved / Denied / Superseded | `src/components/school-admin/staff-hours/StaffHoursRequestsPanel.tsx`, `src/app/api/school-admin/staff-hours/adjustments/` | Web + mobile ("Approve", "Hours approved", "Request denied") |
| Setting: "Require approval for hour adjustments" (on by default). Off = "Teacher changes update their hours right away." | `StaffHoursPage.tsx`, `catalog.ts` (`staff_hours_adjustments_require_approval: true`) | Web + mobile |
| Email to admins when a change needs review, linking straight to the request (max 4 per day) | `src/lib/school-teacher/my-hours/my-hours-adjustments.ts` (~line 691, `reviewUrl … ?view=requests&request=…`), `my-hours-adjustment-rules.ts` (`STAFF_HOURS_ADJUSTMENT_EMAIL_CAP = 4`) | Email |
| Mobile admin screen | `apps/mobile/src/app/school-admin/[slug]/more/staff-hours.tsx` | Mobile |

### Families
Not applicable. Families don't see staff hours.

### Not in the product (keep out of copy)
- No CSV/PDF export of hours, no pay rates, no overtime calculation, no PTO/time-off requests, no geofence or kiosk/PIN clock-in, no rounding, no lock/close date. Searches of `src/components/school-admin/staff-hours`, `src/components/school-teacher/my-hours` and `src/app/api/school-admin/staff-hours` found none.
- Admins cannot edit a staff member's hours directly in the UI. Changes come from the staff member as an adjustment that the admin approves or denies (no edit control strings in `StaffHoursPage.tsx` / `StaffHoursRequestsPanel.tsx`). Worth confirming with the team.
- Payroll (coming soon).

### Existing approved copy
- `src/lib/marketing/product-preview-tabs.ts` (Timeclock tab): "Log hours, track sessions, and view weekly and monthly totals in one place."

## Founder pain (with quotes + sources)

1. **Hourly helpers are where the legal risk is.** Lead teachers are usually exempt: "The salary and salary basis requirements do not apply to bona fide teachers." (DOL Fact Sheet #17D, rev. Aug 2024, https://www.dol.gov/agencies/whd/fact-sheets/17d-overtime-professional) But a microschool's aftercare staff, aides, front-desk help and part-time assistants often aren't teaching as their primary duty. For non-exempt workers the employer must keep "Hours worked each day" and "Total hours worked each workweek" (DOL Fact Sheet #21, https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping). Whether a given aide is exempt is a legal question, and copy should not give legal advice.
2. **People forget to clock in.** In a QuickBooks Time survey of 731 U.S. business owners, "34 percent of business owners agree that employees forgetting to clock in or out" is the biggest problem (QuickBooks/Intuit, 2018 survey, https://quickbooks.intuit.com/time-tracking/resources/avoiding-timesheet-errors/).
3. **Errors are weekly, and rarely reviewed.** Same survey: "Some 40 percent deal with timesheet errors at least once a week," and there are "59 percent — the majority of small business owners — who do not require employees to review their timesheets." (same URL)
4. **The founder does it alone.** NewSchools Venture Fund: microschools "may only employ one or two full-time teachers" and run with "a thin or non-existent administrative layer (no principal)" (2015, https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/). Nobody else chases missing timesheets.
5. Founder-forum quotes (r/smallbusiness, r/microschools) could not be collected: reddit.com is blocked for the research tool.

## Evidence (numbered: quote — publisher, year — URL)

1. "Every covered employer must keep certain records for each non-exempt worker." The list includes "Hours worked each day." and "Total hours worked each workweek." — U.S. Department of Labor, Wage and Hour Division, Fact Sheet #21 (rev. July 2008) — https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping
2. "Each employer shall preserve for at least three years payroll records". Records on which wage computations are based "should be retained for two years, i.e., time cards". — U.S. DOL, Fact Sheet #21, 2008 — https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping
3. "Any timekeeping plan is acceptable as long as it is complete and accurate." — U.S. DOL, Fact Sheet #21, 2008 — https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping
4. "The salary and salary basis requirements do not apply to bona fide teachers." (teachers whose primary duty is "teaching, tutoring, instructing or lecturing") — U.S. DOL, Fact Sheet #17D, rev. Aug 2024 — https://www.dol.gov/agencies/whd/fact-sheets/17d-overtime-professional
5. "One in five payrolls in the United States contains errors, each costing an average of $291." "Time/attendance and expense errors were the most common payroll errors." — EY survey, released via Paycom/Business Wire, 22 Dec 2022 — https://www.paycom.com/about/press-room/ey-survey-payroll-errors-average-291-each-impacting-the-economy/ (caveat: 508 respondents at companies with 250–10,000 employees, far bigger than a microschool, and the release comes from a payroll vendor)
6. "Some 40 percent deal with timesheet errors at least once a week." / "34 percent of business owners agree that employees forgetting to clock in or out" is the biggest problem. — QuickBooks Time (Intuit), Pollfish survey of 731 U.S. business owners, Sept 2018 — https://quickbooks.intuit.com/time-tracking/resources/avoiding-timesheet-errors/ (vendor survey)

## Tool stack alternative

What founders use today:
- **Paper timesheet** on the fridge or a clipboard, totalled by hand at the end of the pay period.
- **Google Sheet** that staff type their hours into (often from memory on Friday).
- **Texts** ("I got in at 7:40 and left at 3:15").
- **A standalone time-clock app.** Homebase's free Basic plan covers 1 location and up to 10 employees, with timesheet storage up to 90 days. Location-based mobile clock-in is on paid plans from $30/location/month, and payroll is a $49/month + $6/employee add-on (Homebase pricing, checked Nov 2026, https://www.joinhomebase.com/pricing). When I Work, Clockify and Jibble fill the same role (their pricing was not checked).

How it fails:
- **Reconstructed, not recorded.** Hours written down days later are guesses. The QuickBooks survey above found 40% of owners handle timesheet errors weekly.
- **Missed punches with no paper trail.** A forgotten clock-out gets "fixed" by a text, and nobody can later show who changed what.
- **Another login for staff.** A separate time-clock app is one more account for staff to remember, apart from the school's messages, roster and calendar.
- **No approval step.** In a shared Google Sheet anyone can edit any row.
- **Lost history.** Paper gets thrown out, yet DOL guidance says time cards should be kept two years.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel** (checked Nov 2026)
- Lists "Time tracking", "Staff scheduling" and "Payroll" under Staff Management. No prices are published ("Request pricing"). https://mybrightwheel.com/pricing/
- A Brightwheel blog says Premium adds staff tools including time tracking (https://mybrightwheel.com/blog/how-much-is-brightwheel-premium, search result only). The tier is **unconfirmed** on Brightwheel's own pricing page.
- Staff check in via Kiosk (4-digit code), QR Quick Scan, or Attendance Mode. Staff see timecards in the app with regular and overtime hours. Staff can't edit: "These entries can only be viewed, not edited or deleted." Changes go to the admin through Messaging. https://help.mybrightwheel.com/en/articles/1445626-check-in-and-out-as-staff
- Admins add, edit and delete timecards, export, see overtime and an audit history. "If you choose to use the Custom date range, you can only view information for 180 days at a time." https://help.mybrightwheel.com/en/articles/1546574-add-manage-staff-timecards

**Playground** (checked Nov 2026)
- Pricing: quote only. https://www.tryplayground.com/pricing
- "Staff members clock in and out using their Playground mobile app": the center's QR code, or a 4-digit PIN on the center tablet. Personal-device clock-in only if the admin enables it. Teachers can view hours, but "If you notice an issue with your timesheet, you must contact your administrator directly." Time-off requests are supported. https://help.tryplayground.com/en/articles/9441159-staff-hours-for-teachers
- Admins record missed days, edit entries and view edit history. Settings: rounding to 15 minutes, block clock-in "more than 5 minutes before their scheduled shift time", a "Staff hours close date", and geofencing for personal devices. Reports include CSV/PDF staff-hours reports, Paycom/Paylocity exports, and "Overtime (>8/day)" / "Overtime (>40+/wk)". Hours flow to Playground Payroll if used. https://help.tryplayground.com/en/articles/9376492-manage-edit-staff-attendance

**Transparent Classroom** (checked Nov 2026)
- No staff time clock or hours report found on its pricing page or attendance help article. Attendance covers children ("Sign In"/"Sign Out" for drop-off and pickup). https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview, https://www.transparentclassroom.com/pricing. Staff time tracking: **not listed / unconfirmed**.

**Procare (not used: dropped from the rival set)** (checked Nov 2026)
- "Facilitate clock in/out and record breaks on a mobile kiosk, which tracks your staff payroll hours." Timecards with withholdings and accrued leave. Payroll. https://www.procaresoftware.com/capabilities/child-care-staff-management/

## Draft copy (sections as in 2e)

**Hero headline:** Lead: "Staff hours that add up," Accent: "without the timesheet chase." (9 words)

**Hero body (32 words):** Staff clock in and out from their phone or laptop. Missed a punch? They send a fix, and you approve it. See who's on the clock and each person's totals for any range.

**One-liner (11 words):** A simple time clock for your team, with approvals built in.

**Capabilities: School admin**
1. **Who's on the clock**: See everyone clocked in right now, how long they've been working, and who finished today.
2. **Totals for any range**: Pick this week, the last 30 days or custom dates, and see hours per staff member.
3. **Approve every fix**: When staff change a past day, you see current and proposed hours side by side, then approve or deny.
4. **Your rules**: Require approval for hour changes, or let them save right away. Switch it anytime in Settings.
5. **Email when needed**: Get an email with a direct link when a change is waiting for you.

**Capabilities: Staff**
1. **One-tap clock in**: Clock in when your day starts and out when it ends, on the web or in the iPhone app.
2. **Split days are fine**: Log several sessions in one day, like a morning block and after-school care.
3. **Your week and month**: See your totals by day, week and month, with a running total for the week.
4. **Fix a forgotten punch**: Add hours you missed or correct a day, with a note explaining why.
5. **Know when it's approved**: Get a notification when your school approves or denies your change.

**Capabilities: Families**
Not applicable. Families don't see staff hours.

**Use cases**
1. *The aftercare aide who forgot to clock out.* Scenario: An aide leaves at 5:30 but the clock still says "on the clock" the next morning. Outcome: She opens My Hours, clocks out, fixes yesterday with a note, and the founder approves it from her phone in two taps.
2. *Payday for a three-person team.* Scenario: The founder pays two part-time assistants every two weeks. Outcome: She opens Summary, picks the last 14 days, and reads each person's total instead of adding up a paper sheet.
3. *Is anyone here yet?* Scenario: The founder is at a tour across town at 7:45am. Outcome: The Live view in the iPhone app shows which staff have clocked in.
4. *Keeping a record you can stand behind.* Scenario: A former assistant questions their hours from last month. Outcome: Every session and every approved or denied change is on file, with the original and proposed times.

**FAQ**
1. *Do teachers need a separate time-clock app?* No. Clocking in is part of the staff portal they already use for students, messages and the calendar, on the web and in the MudKitchen iPhone app. (31 words)
2. *What happens when someone forgets to clock in?* They open My Hours, pick the day, and add the hours they worked with an optional note. If your school requires approval, the change waits for you. Otherwise it saves right away. (37 words)
3. *Can I approve changes from my phone?* Yes. Pending hour changes show up in the admin iPhone app and on the web, with the current and proposed times side by side. You also get an email with a link. (35 words)
4. *Does MudKitchen run payroll?* Not today. MudKitchen records hours and shows totals per person for any date range, so you can enter them into your payroll provider. (24 words) *(Do not mention export: there is none.)*
5. *Can a day have more than one session?* Yes. Staff can clock in and out more than once a day, for example around a lunch break or a split shift. (24 words)

**Comparison rows**

| Label | MudKitchen | Tool stack (paper / Google Sheets / Homebase) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Staff clock in/out | Yes, web + app (own login) | Paper, sheet, or Homebase app | Kiosk, QR or Attendance Mode ([help](https://help.mybrightwheel.com/en/articles/1445626-check-in-and-out-as-staff)) | App QR or tablet PIN ([help](https://help.tryplayground.com/en/articles/9441159-staff-hours-for-teachers)) | Not listed ([help](https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview)) |
| Staff can request a fix themselves | Yes, adjustment with note | Text the owner | No, message the admin ([help](https://help.mybrightwheel.com/en/articles/1445626-check-in-and-out-as-staff)) | No, contact the admin ([help](https://help.tryplayground.com/en/articles/9441159-staff-hours-for-teachers)) | n/a |
| Approval workflow for changes | Yes, optional setting | No | Admin edits directly; audit history ([help](https://help.mybrightwheel.com/en/articles/1546574-add-manage-staff-timecards)) | Admin edits directly; edit history ([help](https://help.tryplayground.com/en/articles/9376492-manage-edit-staff-attendance)) | n/a |
| Live "who's on the clock" | Yes | No | Unconfirmed | Unconfirmed | n/a |
| Totals per person for a date range | Yes | Manual sums | Time summary, 180-day custom range cap ([help](https://help.mybrightwheel.com/en/articles/1546574-add-manage-staff-timecards)) | Staff hours reports ([help](https://help.tryplayground.com/en/articles/9376492-manage-edit-staff-attendance)) | n/a |
| Overtime calculation | No | Manual | Yes ([help](https://help.mybrightwheel.com/en/articles/1546574-add-manage-staff-timecards)) | Yes, >8/day and >40/wk ([help](https://help.tryplayground.com/en/articles/9376492-manage-edit-staff-attendance)) | n/a |
| Export for payroll | No | Already a sheet; Homebase exports (unchecked) | Yes, export/print ([help](https://help.mybrightwheel.com/en/articles/1546574-add-manage-staff-timecards)) | CSV/PDF + Paycom/Paylocity ([help](https://help.tryplayground.com/en/articles/9376492-manage-edit-staff-attendance)) | n/a |
| Published price | See MudKitchen pricing | Free to $30+/location/mo ([Homebase](https://www.joinhomebase.com/pricing)) | Quote only ([pricing](https://mybrightwheel.com/pricing/)) | Quote only ([pricing](https://www.tryplayground.com/pricing)) | $2/child/mo, no staff clock listed ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: Brightwheel and Playground have deeper time tracking (overtime, exports, kiosks, geofence, payroll). MudKitchen's honest pitch is a simpler clock built into the same staff portal, with a self-serve fix-and-approve loop that both rivals route through messaging the admin. Don't claim parity on payroll features.

## Open questions / things you could not verify

- **Export:** MudKitchen has no hours export. The biggest gap against Brightwheel and Playground for a payroll hand-off. Decide whether to build CSV export before launching this page.
- **Admin direct edit:** Confirm whether an admin can edit or add a session for a staff member without them submitting an adjustment. Nothing in the UI suggests it can.
- **Retention:** How long MudKitchen keeps clock sessions was not checked (relevant to the DOL 2-/3-year guidance). Don't claim compliance.
- **Fixed 40-hour week bar** (`MY_HOURS_WEEK_GOAL_MINUTES`) may confuse part-time staff. Consider it before featuring the bar in screenshots.
- **Brightwheel tier** for time tracking (Premium?) is only from a Brightwheel blog seen in search results.
- **Exempt vs non-exempt staff in microschools:** no data on how many microschool staff are hourly. The FLSA framing should stay general ("if you have hourly staff…"), not legal advice.
- **Founder quotes:** reddit.com is blocked for the research tool. Collect by hand if needed.
- **When I Work / Clockify pricing** not checked.
