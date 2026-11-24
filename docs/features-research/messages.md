# Messages

Researched Nov 22, 2026. Feature slug: `messages`. Rivals: Brightwheel, Playground, Transparent Classroom (per `docs/features-research/_rivals.md`). Procare notes are kept below but marked **not used**.

## Product truth (capabilities by role, with file paths; web/mobile)

> "Mobile" below means the MudKitchen **iPhone app** (Expo code in `apps/mobile`). Google Play isn't live yet; the download page runs an Android waitlist. In copy, say "iPhone app", never "iOS and Android".

How it works in one line: every conversation is a private thread between a family and one school contact (the school office, or a teacher assigned to their child). Messages arrive in real time, with email and push alerts. Admins can send one message to many families, and each family gets it as its own private thread.

### School admin / founder

| Capability | Proof | Web / mobile |
|---|---|---|
| Shared "school office" inbox: families message the school, not one person's phone | `src/lib/messages/contacts.ts` (`school_office` contact, subtitle "Admin"); `src/components/school-admin/AdminMessagesPage.tsx` | Both (`apps/mobile/src/app/school-admin/[slug]/messages/index.tsx`, `[threadId].tsx`) |
| Send one message to many families. Filter by program, class/group, grade or individual parents; each family receives a **private 1:1 thread**, so replies stay private | `src/components/school-admin/messages/AdminMessagesAudiencePicker.tsx` (sections "Program", "Class / group", "Grade", "Individual parents"); `AdminMessagesBroadcastCompose.tsx` (placeholder "Write a message to send to each parent individually…"); `src/lib/messages/admin-broadcast-send.ts` | Both (`apps/mobile/src/components/school-admin/messages/garden/admin-broadcast-sheet.tsx`, `admin-broadcast-audience.tsx`) |
| Broadcast limits: up to 200 recipients per send; confirm step above 10 recipients | `src/lib/messages/admin-broadcast-constants.ts` (`ADMIN_BROADCAST_MAX_RECIPIENTS = 200`, `ADMIN_BROADCAST_CONFIRM_THRESHOLD = 10`) | Both |
| See conversations between families and teachers "for your review", in their own inbox section | `src/lib/messages/admin-thread-sections.ts` (label "Parent & teacher conversations", description "For your review — messages between families and staff, not your school office inbox.") | Web confirmed; mobile inbox uses same API (not separately verified) |
| Message staff | `src/lib/messages/contacts.ts` (`listAdminMessageContacts`) | Both |
| Talk to MudKitchen support in the same inbox | `src/lib/messages/platform-support.ts`; `notifyPlatformSupportParentMessage` in `src/lib/messages/message-notifications.ts` | Both |

### Families / parents

| Capability | Proof | Web / mobile |
|---|---|---|
| Message the school office and the teachers assigned to their own children (no one else's) | `src/lib/messages/contacts.ts` (`listParentMessageContacts` builds contacts from `student_teacher_assignments` for the family's students) | Both (`apps/mobile/src/app/parent/[slug]/messages/*`) |
| Co-op mode: message other families enrolled in the same program | `src/lib/messages/coop-peer-messaging.ts` (`assertCoopPeerMessageAllowed`); `src/components/school-parent/ParentCoopFamilyMessageButton.tsx`; parent guide "Connect with other co-op families" in `src/lib/parent-portal/parent-documentation.ts` | Both (program portal routes `apps/mobile/src/app/parent/[slug]/p/[programSlug]/messages/*`) |
| Program portals keep program threads separate from school-wide threads | `src/lib/messages/message-audience.ts` (`describeParentPortalMessagesScope`) | Both |
| Choose which email addresses get alerts (login email included by default) | Parent guide "Manage email notification preferences" (`parent-documentation.ts`); `src/components/school-parent/ParentNotificationSettingsPage.tsx` | Both (`apps/mobile/src/app/parent/[slug]/more/notifications.tsx`) |
| Notification bell with the last 30 days of messages, bulletin posts, calendar items | Parent guide "Check your notification center" (`parent-documentation.ts`) | Web confirmed |

### Staff / teachers

| Capability | Proof | Web / mobile |
|---|---|---|
| One inbox for families and other staff; unread threads highlighted; dashboard Start here shows a count when messages need a reply | Teacher guides "Check your inbox", "Reply to a family message" (`src/lib/school-teacher/teacher-documentation.ts`) | Both (`apps/mobile/src/app/teacher/[slug]/messages/*`) |
| Contacts are the families of students assigned to them, plus staff | `src/lib/messages/contacts.ts` (`listTeacherMessageContacts`) | Both |

### All roles (shared mechanics)

| Capability | Proof |
|---|---|
| Real-time delivery (no refresh) | `src/lib/messages/use-message-realtime.ts` (Supabase `postgres_changes` channel) |
| Push to the mobile app and browser push on web | `src/lib/messages/expo-push.ts`, `src/lib/messages/web-push.ts`, `web-push-client.ts`; dispatched in `message-notifications.ts` |
| Email alert for a new message, skipped if the person read the thread in the last 15 minutes, and at most one email per thread every 30 minutes | `src/lib/messages/message-email-debounce.ts` (`MESSAGE_EMAIL_ACTIVE_READ_MINUTES = 15`, `MESSAGE_EMAIL_COOLDOWN_MINUTES = 30`) |
| Daily unread-message digest email (runs in the daily job) | `src/lib/messages/unread-message-digest.ts`; called from `src/lib/tuition/billing-cron.ts`; schedule `0 12 * * *` in `vercel.json` |
| Attachments: up to 5 files, 10 MB each | `src/lib/messages/message-attachment-storage.ts` (`MAX_MESSAGE_ATTACHMENTS = 5`, `MAX_MESSAGE_ATTACHMENT_BYTES`) |
| Edit or delete your own text messages (not ones with attachments) | `src/lib/messages/message-mutation-eligibility.ts`; `edit-portal-message.test.ts`, `delete-portal-message.test.ts` |
| Unsent drafts are kept | `src/lib/messages/message-composer-draft-storage.ts` |
| Unread counts per thread and per inbox | `src/lib/messages/use-messages-unread-count.ts`, `unread-count-api.ts`, `message-thread-read-stamps.ts` |
| Every message is a permanent written record tied to the student/family | Threads stored in `portal_message*` tables (`src/lib/messages/threads.ts`, `messages.ts`) |

### What it does NOT do (don't claim)
- **No per-message read receipts** ("Seen by…"). Only unread counts. A repo-wide search for read-receipt UI found nothing.
- **No SMS/text delivery.** Alerts are push + email. ("SMS integrations" is listed as a *custom build* in `CUSTOM_COPY.tags`, `src/components/home/home-copy.ts`.)
- **No translation**, no scheduled send, no multi-family group chat (broadcasts fan out as private threads; co-op peers message 1:1).
- **Not on the Free plan.** Free allows only `dashboard`, `schedule`, `admissions`, `my_school` (`src/lib/organization-settings/plans.ts`); `/api/school-admin/messages` is gated in `src/lib/school-admin/free-plan-api-guard.ts`.

### Approved copy that already covers this
- App store slide 3: "Real conversations with teachers, not lost in email." / "Message staff directly in the app—no digging through inboxes." (`src/lib/marketing/download-app-slides.ts`)
- Family section: "Parents should not have to search through old emails, group chats, and scattered links…" (`src/components/home/home-copy.ts`, `FAMILY_COPY`)
- Pain section: "Parent updates happen in texts and email." (`PAIN_COPY`)

## Founder pain (with quotes + sources)

Reddit (r/microschools, r/homeschool, r/Teachers) could not be fetched this session (the search tool blocks reddit.com). Quotes below come from news reporting and research; none are invented.

- **Parents are drowning in apps and badges.** A Minnesota parent "has 16 apps tucked into a single folder on her phone" and "logged more than 45 checks" of them over three days; another says "the higher that number is, the more anxiety I get" about notification badges. A third parent: "I want to be informed," but she "just doesn't want yet another app." — Star Tribune via GovTech, Nov 16, 2026 — https://www.govtech.com/education/k-12/why-some-parents-feel-overwhelmed-by-school-apps
- **Parents feel like the school's assistant.** A parent in the same story says she feels like her children's "executive assistant." — same source.
- **Founders already carry the back office alone.** Private microschools have a median enrollment of 20 students; one funder describes them as "a world of 20- to 50-student schools," and says budgeting, invoicing and business insurance "are time-consuming." — The 74, Jun 11, 2026 — https://www.the74million.org/article/exclusive-7-things-to-know-about-microschools-in-2026/
- **Small schools win on relationships.** A microschool advocate says small schools can "form close relationships with families." — same source. Messaging is where that relationship lives, so it can't sit in a founder's personal texts.
- **MudKitchen's own framing (approved):** "Parent updates happen in texts and email… Important tasks depend on memory." (`PAIN_COPY`, `src/components/home/home-copy.ts`)

## Evidence (numbered: quote — publisher, year — URL)

1. "Messages decreased the percentage of students who failed to earn course credit from 15.8% to 9.3%—a 41% reduction." (Weekly one-sentence teacher-to-parent messages; 435 students in a summer credit-recovery program.) — Kraft & Rogers, *Economics of Education Review* 47, 2015 (HKS abstract page) — https://www.hks.harvard.edu/publications/underutilized-potential-teacher-parent-communication-evidence-field-experiment
2. Automated messages to parents about missed work, grades and absences "reduced course failures by 27 percent, increased class attendance by 12 percent." (Treatment students failed 0.71 classes on average vs 0.97 for control.) — Bergman & Chan, *Journal of Human Resources* 56(1), 2021 — https://jhr.uwpress.org/content/56/1/125.full ; summary at J-PAL: https://www.povertyactionlab.org/node/2353 *(wording taken from search summaries of the abstract; re-check exact phrasing before quoting on a page)*
3. "63% of parents said communication quality influenced their decision to stay at a school." — ParentSquare & Hanover Research national parent study (1,031 K-12 parents, fielded Jul–Aug 2026), press release Oct 21, 2026 — https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/ *(vendor-sponsored)*
4. "Only school safety (94%), quality of teachers (92%), and academic performance (89%) rank higher than accessibility of communication (86%)" as factors parents weigh when choosing a school. — same ParentSquare/Hanover release, 2026 — same URL
5. 90% of parents who would recommend their child's school say they are satisfied or very satisfied with the communication they receive. — GreatSchools survey of 1,100 parents, reported by Education Week, Dec 2025 — https://www.edweek.org/leadership/what-parents-want-most-from-schools-clear-honest-communication/2025/12 *(paraphrase of EdWeek's figure, not a verbatim quote)*
6. "All told, she has 16 apps tucked into a single folder on her phone." — Star Tribune (via GovTech), 2026 — https://www.govtech.com/education/k-12/why-some-parents-feel-overwhelmed-by-school-apps *(anecdote, not a statistic; use as color)*

Strongest two for a page: #1 (41% reduction from simple weekly messages) and #3 (63% say communication affected whether they stayed).

## Tool stack alternative

What microschools use instead: the founder's personal phone (iMessage/SMS group texts), WhatsApp or GroupMe groups, Gmail, Remind, ClassDojo, Facebook groups. `src/lib/outreach/tool-replacements.ts` maps Remind, ClassDojo, GroupMe and "WhatsApp group" to MudKitchen messaging.

Concrete failure modes:
- **Private matters leak into group space.** A group text or WhatsApp group has no "reply privately by default"; one family's reply goes to everyone. MudKitchen broadcasts land as private threads, so replies stay 1:1 (`admin-broadcast-send.ts`).
- **Phone numbers are exposed.** In a group text every member sees every number. (WhatsApp group number visibility: third-party guides say members see each other's numbers; WhatsApp's own help on this could not be confirmed this session, so don't state it as fact.)
- **No shared school record.** When a teacher texts a parent from a personal phone, the founder can't see it and it leaves with the teacher. MudKitchen keeps family–teacher threads visible to admins "for your review" (`admin-thread-sections.ts`).
- **Founder's phone becomes the school line.** No shared office inbox; messages are lost when the founder is teaching.
- **Things get buried.** Announcements, logistics and chit-chat share one stream; "It just gets very overwhelming because there can be so many announcements, all at one time, too." (parent, Star Tribune/GovTech 2026, URL above)
- **Remind** is now "part of the ParentSquare family" (remind.com banner seen in search results, Nov 2026). Free-plan class/participant caps and message-length limits appear in Remind's help center per search snippets, but the pages returned 403, so the numbers are **unconfirmed**.

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel — included (price not public)
- Pricing page lists "Parent messaging" and "Staff messaging" under Communication; no tiers or prices, only "Request pricing." — https://mybrightwheel.com/pricing (checked Nov 2026). `_rivals.md` records the forms FAQ: "Your price is based on enrollment capacity and you get access to all features on the platform."
- Help article "Start messaging in brightwheel" (last updated Jun 2, 2026): each child has an Admin-only thread and a Teacher & admin thread; "Admins can broadcast announcements to an entire classroom"; "Admins can send direct messages to parents not visible to other non-admin staff for more sensitive topics"; parents can message admins and teachers in their child's room(s) but "cannot message each other directly"; teachers cannot message each other directly. — https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel (checked Nov 2026)
- Read receipts for families: **unconfirmed** (not in the help article; brightwheel marketing pages hedge "where available").

### Transparent Classroom — no built-in two-way messaging found
- Homepage feature list names photos, daily summaries, conference reports, forms and Google Calendar events; no messaging feature. — https://www.transparentclassroom.com/ (checked Nov 2026)
- "Sending Announcements" (updated Dec 20, 2024): announcements go out by email; "Replies will be sent to the email address associated with the staff user who sent the announcement." — https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements (checked Nov 2026)
- A UserVoice request asks for "a live chat feature between teachers and parents" — https://transparentclassroom.uservoice.com/forums/145102-general/suggestions/31665475-internal-messaging-system . Whether it has shipped: **unconfirmed**.
- Price: "$2.00 USD per child / month," one plan. — https://www.transparentclassroom.com/pricing (checked Nov 2026)

### Playground — included (price not public)
- "Chat for Administrators" help article: "Use group chats to message multiple staff members, guardians, or entire classrooms at once" (one classroom per chat); "All Staff" option to message everyone; attachments PNG/JPG, MOV/MP4, PDF, CSV; Spanish ↔ English translation of chats; archive keeps content visible; transcript download is web-only. — https://help.tryplayground.com/en/articles/7424291-chat-for-administrators (checked Nov 2026; page shows "Updated over a week ago", no date)
- Family permissions under Settings > Communication control whether families can chat with other families, teachers and/or admins; staff can turn off "Discoverable" so families can't start new chats with them. — same URL
- Feed announcements can go out in-app, by email and by SMS; "Only Primary Guardians linked to the specified recipients will receive Emails and SMS messages"; posts can be scheduled and pinned; optional parent signature to acknowledge. — https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web (checked Nov 2026)
- Marketing page: "Send messages directly to families or groups without using your personal phone number." Lists custom group chats and chat moderation. No prices; "Get a free demo." — https://tryplayground.com/solutions/communication (checked Nov 2026). `_rivals.md`: "custom pricing based on program size and needs".
- Per-message read receipts: **not found** in the help article (it covers marking chats read/unread only).

### Procare — NOT USED (dropped from the rival set; kept for reference)
- Family engagement page: "two-way communication"; "a dedicated messaging channel with parents to discuss more confidential topics"; "translate messages to Spanish or English on demand"; optional "AI message rewrite"; "Procare can send emails and text messages to families." Pricing: "just one price for all the capabilities you need," quote-only. — https://www.procaresoftware.com/capabilities/family-engagement/ (checked Nov 2026)
- Help index (Parent Messaging, updated Nov 20, 2026): private conversations with parents/guardians; "Send SMS for Emergencies (website only)"; SMS delivery status dashboard. — https://www.procaresupport.com/procare-online/docs/messages (checked Nov 2026)
- Read receipts: **unconfirmed**.

## Draft copy (sections as in 2e)

Reference pages looked at for tone: Playground's communication page ("Streamline staff and family messaging", "without using your personal phone number"), Brightwheel pricing/feature lists, Procare family engagement page, Transparent Classroom homepage. Common patterns: short noun-led feature names, one benefit sentence each, privacy framed as "confidential topics". (ParentSquare's and ClassDojo's pages could not be fetched this session.)

**Hero headline:** Lead: "School conversations, in one place." Accent: "Not your phone." (8 words)

**Hero body (32 words):** Families message the school office and their child's teachers in one app. Replies stay private, alerts arrive by push and email, and every conversation stays with the school, not a personal phone.

**One-liner (11 words):** Private family messaging that lives with your school, not your phone.

### Capabilities — Admin / founder
- **One shared office inbox** — Families write to "the school," not your cell. Anyone on your admin team can pick up the thread.
- **Message many, reply privately** — Pick a program, class, grade or parents. Each family gets its own thread, so replies never go to everyone.
- **See teacher conversations** — Family–teacher threads appear in their own section for your review, so nothing important happens out of sight.
- **Send files with the message** — Attach up to five files to a message: a permission slip, a schedule, a photo.
- **Reply from anywhere** — The same inbox works on the web and in the mobile app, with push alerts when families write.

### Capabilities — Families
- **Message the right person** — Write to the school office or your child's teachers. The app only shows people connected to your family.
- **Alerts that don't nag** — Push and email alerts for new messages, skipped while you're already reading the thread.
- **Every reply in one thread** — No hunting through texts and email. The whole conversation stays together on phone and web.
- **Choose where emails go** — Add a second email address for alerts, or keep just your login email.

### Capabilities — Staff / teachers
- **Families of your students** — Your contacts are the families of students assigned to you, plus your colleagues.
- **Know what needs a reply** — Unread threads stand out, and your dashboard shows how many are waiting.
- **Keep your number private** — Talk with families in the app instead of from your personal phone.
- **Fix a typo** — Edit or delete a message you sent, as long as it has no attachment.

### Use cases
1. **Snow-day closure** — *Scenario:* At 6:10am the founder decides to close. *Outcome:* One message to every enrolled family goes out as private threads with push alerts; questions come back one-to-one, not into a 40-person group chat.
2. **Allergy question for one teacher** — *Scenario:* A parent wants the lead teacher to know about a new allergy. *Outcome:* They message the teacher directly; the founder can see the thread in "Parent & teacher conversations" and add it to the student record.
3. **Field-trip permission reminder for one class** — *Scenario:* Three families in the upper-elementary group haven't returned a slip. *Outcome:* The founder filters by class and sends the slip as an attachment to just those families.
4. **Teacher leaves mid-year** — *Scenario:* A teacher moves away in March. *Outcome:* Her conversations with families stay in the school's records instead of on her phone.

### FAQ
- **Can parents reply to a message sent to the whole class?** Yes, and their reply is private. When you message a group, MudKitchen sends each family its own thread, so replies come back only to the school. (34 words)
- **How do families get notified?** By push notification in the MudKitchen app, browser notifications on the web, and email. Email skips people who just read the thread and is limited to one per thread every 30 minutes. A daily digest covers anything still unread. (44 words)
- **Can I see what teachers and families are saying?** Yes. School admins see family–teacher conversations in a separate "Parent & teacher conversations" section, labelled for review, apart from the school office inbox. (28 words)
- **Can families message each other?** Only in co-op program portals, where families in the same program can message one another one-to-one. In a regular school portal, families message the school office and their child's teachers. (33 words)
- **Can I send texts (SMS)?** Not today. Messages arrive by app push, browser notification and email. SMS can be set up as a custom integration. (21 words)

### Comparison rows

| Row | MudKitchen | Tool stack (texts / WhatsApp / Gmail / Remind) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Two-way family ↔ school messaging | Yes, web + iPhone app | Yes, but spread over several apps | Yes ([help](https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel)) | Yes, chat ([help](https://help.tryplayground.com/en/articles/7424291-chat-for-administrators)) | Not found; announcement replies go to the sender's email ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| Group message, private replies | Yes: each family gets its own thread | No: group texts reply to all | Classroom announcements ([help](https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel)); reply behavior unconfirmed | Group chats reach a whole classroom in one chat ([help](https://help.tryplayground.com/en/articles/7424291-chat-for-administrators)); Feed posts for one-way announcements | Emailed announcements; replies to sender's email ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| Shared office inbox (not one person's phone) | Yes, "school office" contact | No | Admin-only child thread ([help](https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel)) | "without using your personal phone number" ([page](https://tryplayground.com/solutions/communication)); shared office inbox unconfirmed | No (email) |
| Admin can review family–teacher threads | Yes ("for your review" section) | No | Admins view all except private admin–staff threads ([help](https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel)) | "Built-in chat moderation" ([page](https://tryplayground.com/solutions/communication)); details unconfirmed | n/a |
| Attachments | Up to 5 files, 10 MB each | Varies by app | Unconfirmed | Images, videos, PDF, CSV ([help](https://help.tryplayground.com/en/articles/7424291-chat-for-administrators)) | 20 MB total per announcement ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| SMS / text | No (push + email) | Yes | Unconfirmed | Feed posts by SMS to primary guardians ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | Photos can go by text ([help](https://transparent-classroom.helpscoutdocs.com/article/70-use-photos-to-share-with-parents-and-record-progress)); messages n/a |
| Translation | No | No | Unconfirmed | Spanish ↔ English in chat ([help](https://help.tryplayground.com/en/articles/7424291-chat-for-administrators)) | Unconfirmed |
| Public price | Not stated here | Mostly free | Quote only ([pricing](https://mybrightwheel.com/pricing)) | Quote only ([llms.txt](https://www.tryplayground.com/llms.txt), via `_rivals.md`) | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: Playground and Brightwheel match or beat MudKitchen on SMS and translation. MudKitchen's angles are private-reply broadcasts, the shared school-office inbox, admin review of family–teacher threads, and messaging that sits with enrollment, billing and records built for a K–8 microschool.

## Open questions / things you could not verify

- Playground: whether replies to a classroom group chat go to all members (likely, since it is one chat) and how "chat moderation" works were not confirmed in help docs. The "Chat for Administrators" page shows no update date.
- **Reddit / founder forums:** reddit.com is blocked for the search tool; no founder or parent forum quotes were collected. Skool "Microschool Founders Grove" not checked.
- Bergman & Chan exact abstract wording ("27 percent… 12 percent") is from search summaries; re-check on the JHR page.
- Brightwheel and Procare read receipts, attachments and SMS details are unconfirmed.
- Remind free-plan limits (classes, participants, characters) unconfirmed (help center returned 403).
- Whether admin mobile shows the "Parent & teacher conversations" section the same way as web was not checked on device.
- MudKitchen pricing for messaging is not stated; it is off on the Free plan in code (`plans.ts`).
