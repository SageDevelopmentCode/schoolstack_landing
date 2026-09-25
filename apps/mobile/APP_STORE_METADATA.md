# MudKitchen — App Store Connect (iOS)

Copy-paste reference for listing metadata. Bundle ID: `com.mudkitchen.schoolstack.mobile` ([`app.json`](app.json)).

Legal URLs (also in [DEPLOY.md](DEPLOY.md)): [Privacy](https://trymudkitchen.com/privacy) · [Account deletion](https://trymudkitchen.com/account-deletion)

## Chosen listing (v1.0)

| Field | Value | Length |
|-------|--------|--------|
| **Name** | MudKitchen | (App Store) |
| **Subtitle** | Microschools, families & staff | 29 / 30 max |
| **Keywords** | See below | 98 / 100 max |

### Keywords (paste as one line)

```text
microschool,parent portal,tuition,billing,enrollment,admissions,attendance,messaging,teacher,forms
```

**Rationale:** Balanced discovery for parents (portal, tuition, forms), school ops (enrollment, admissions, attendance), and staff (messaging, teacher). Subtitle does not repeat `parent portal`, so that term stays in keywords only.

### Promotional text (optional, editable without new build)

One app for your microschool—messages, tuition, enrollment, and attendance for families, teachers, and admins.

### Description

Paste the block below into App Store Connect → **Description** (4,000 character max). **3,099 characters** as of v1.0 listing copy.

```text
MudKitchen brings your whole school community into one calm, thoughtful mobile experience—built for microschools, co-ops, and small independent schools where everyone wears more than one hat.

If your school runs on MudKitchen, this is the app families, teachers, and admins open every day. Sign in with the account your school provides and keep the important parts of school life in one place: conversations, calendars, tuition, enrollment, attendance, and the forms that used to scatter across email.

WHY YOUR SCHOOL WILL LOVE IT ON MOBILE

• One app, every role — Parents, teachers, and school leaders each get a portal shaped for their work—not a one-size-fits-all screen that nobody actually uses.

• Less chasing, more teaching — Messages, bulletins, and updates stay tied to your school so families aren’t digging through personal inboxes and staff aren’t repeating the same answer in three channels.

• Tuition where families already are — Review balances and take care of billing from the same app used for everything else at school.

• From first inquiry to enrolled — Application and enrollment progress stay clear for families; admins can review submissions and move students forward without being chained to a laptop.

FOR FAMILIES

Stay in the loop without the clutter.

• Message teachers and the school office
• Pay tuition and view billing
• Follow application and enrollment checklists step by step
• See attendance history for your children
• Review and sign forms and documents
• Join volunteer committees and respond to classroom signup requests
• Read the school bulletin and calendar
• Manage notification preferences for your household

FOR TEACHERS

Support a calmer school day.

• View your class roster and student details
• Record and review attendance
• Message families and colleagues
• Catch up on school announcements and updates
• Join committees and volunteer signups when your school enables them

FOR SCHOOL ADMINS

Keep operations moving when you’re away from your desk.

• Work admissions submissions and enrollment workflows
• Manage students, classrooms, and staff portal access
• Run attendance and daily rosters
• Publish bulletin announcements
• Review payment and transaction history
• Coordinate committees, schedules, tours, and events
• Use program-specific tools your school turns on—like dedicated program schedules and rosters—when they’re part of how you run

BUILT FOR REAL SMALL SCHOOLS

MudKitchen isn’t a bloated district system squeezed onto a phone. It’s for schools where relationships matter, programs are distinctive, and software should feel human—not corporate.

Your school chooses which features appear in your portal. What you see after you log in reflects how your school actually runs.

GETTING STARTED

MudKitchen mobile is for communities already on the MudKitchen platform. You’ll need login credentials from your school. If you don’t have access yet, contact your school office—or visit trymudkitchen.com to learn how schools get started.

Questions or help: trymudkitchen.com/support
Privacy policy: trymudkitchen.com/privacy
```

### What’s New (1.0.0)

Initial App Store release: parent, teacher, and school admin portals with messaging, tuition, enrollment, attendance, forms, and school operations tools.

---

## Alternate keyword sets

Swap only if launch audience changes; keep ≤ 100 characters and avoid duplicating the subtitle.

| Audience | Keywords |
|----------|----------|
| Small school / hybrid | `microschool,private school,parent portal,homeschool,tuition,enrollment,volunteer,attendance,calendar` |
| School staff first | `school admin,admissions,enrollment,attendance,classroom,roster,tuition,billing,messaging,bulletin` |
| Families first | `parent portal,school app,tuition payment,enrollment,forms,attendance,messages,calendar,volunteer,signup` |

Re-count in App Store Connect before saving alternates.

## App Store Connect steps

1. Open the MudKitchen app → **App Information** / version **1.0** localization (e.g. English U.S.).
2. Set **Subtitle** and **Keywords** from the table above.
3. Paste **Description** (from section above) and **Promotional Text** (if used).
4. Confirm **Description** is ≤ 4,000 characters and **Keywords** ≤ 100 characters in Connect’s counter.
5. Save and submit with your TestFlight / App Store release.
