# Bulletin

Researched Nov 22, 2026. Feature slug: `bulletin` (school announcements and flyers). Rivals: Brightwheel, Playground, Transparent Classroom (per `docs/features-research/_rivals.md`). Procare notes are marked **not used**.

## Product truth (capabilities by role, with file paths; web/mobile)

> "Mobile" below means the MudKitchen **iPhone app** (Expo code in `apps/mobile`). Google Play isn't live yet; the download page runs an Android waitlist. In copy, say "iPhone app", never "iOS and Android".

How it works in one line: the admin writes a post (title, message, up to 5 attachments such as a flyer), picks who sees it (whole school, parents, teachers, or specific programs), and publishes now or on a schedule, with an optional expiry date. Families and staff see it on their home page and in the bell, and get an email and a push alert.

Note: Bulletin is **off by default** for a new school (`bulletin: false` in `DEFAULT_FEATURES`, `src/lib/organization-settings/catalog.ts`) and is not on the Free plan (`src/lib/organization-settings/plans.ts`; `/bulletin` gated in `src/lib/school-admin/free-plan-api-guard.ts`). The catalog describes it as "Announcements and flyers for families and staff".

### School admin / founder

| Capability | Proof | Web / mobile |
|---|---|---|
| Write a post: title, message, attach a flyer | `src/components/school-admin/bulletin/BulletinPostEditor.tsx` (sections "Write it", "Attach a flyer") | Both (`apps/mobile/src/app/school-admin/[slug]/more/bulletin.tsx`, `apps/mobile/src/components/school-admin/bulletin/bulletin-post-editor-sheet.tsx`) |
| Up to 5 attachments, 10 MB each | `src/lib/school-bulletin/attachment-storage.ts` (`MAX_BULLETIN_ATTACHMENTS = 5`, `MAX_BULLETIN_ATTACHMENT_BYTES`) | Both |
| Choose the audience: school-wide, parents, teachers, or specific programs | `src/lib/school-bulletin/types.ts` (`BulletinAudience = "school_wide" \| "parents" \| "teachers" \| "program"`); editor section "Choose who sees it"; `bulletin-audience.ts` (`postVisibleToViewer`) | Both |
| Schedule publish ("Publish later instead of right away") | `BulletinPostEditor.tsx` ("Schedule publish", "Goes live on its own"); `bulletin-audience.ts` (`isBulletinPostActive` hides posts until `publishedAt`) | Both |
| Set expiry so a post "Hides from feeds after" a date, or "Stays up until you archive it." | `BulletinPostEditor.tsx`; `types.ts` (`expiresAt`) | Both |
| Drafts, scheduled, active, expired, archived states; "Save draft" / "Move to drafts" | `types.ts` (`BulletinPostDisplayStatus`); `src/components/school-admin/bulletin/bulletin-status.tsx` | Both (mobile metric row: "Active", "Drafts", "Scheduled", "Total posts" in `bulletin-metric-row.tsx`) |
| On publish, email to everyone in the audience and push to the app; scheduled posts email when they go live (daily job) | `src/lib/school-bulletin/bulletin-notifications.ts` (`sendBulletinPublishedEmailNotifications`, `sendPendingScheduledBulletinEmailsForOrganization`, guarded by `published_email_sent_at` so it sends once); `bulletin-expo-push.ts`; called from `src/lib/tuition/billing-cron.ts` | Both |
| Activity log entry when a post is published | `src/lib/school-bulletin/bulletin-activity.ts` | — |

### Families / parents

| Capability | Proof | Web / mobile |
|---|---|---|
| Recent posts appear at the top of the home page | Parent guide "Read school bulletin updates": "Recent bulletin posts appear at the top of your home page when your school publishes them." (`src/lib/parent-portal/parent-documentation.ts`); `src/lib/school-bulletin/posts-home.ts` | Both (`apps/mobile/src/app/parent/[slug]/bulletin/[postId].tsx`) |
| Open the full post and its images or files | Same guide: "Tap a post to read the full message and open any linked images or files." | Both |
| New posts also land in the bell to catch up later | Same guide; "Check your notification center" guide | Web confirmed |
| Program portals show only posts for that program | `bulletin-audience.ts` (`BulletinViewerScope` with `program_portal`) | Both |
| Email + push alert on publish | `bulletin-notifications.ts`, `bulletin-expo-push.ts` | Both |

### Staff / teachers

| Capability | Proof | Web / mobile |
|---|---|---|
| Read school-wide and teacher posts from the dashboard's "School Bulletin" button | Teacher guide "Read school bulletin updates" (`src/lib/school-teacher/teacher-documentation.ts`); `postVisibleToViewer` (teacher sees `school_wide` or `teachers`) | Both (`apps/mobile/src/app/teacher/[slug]/bulletin/[postId].tsx`) |
| Teachers do not post to the bulletin | Bulletin API routes under `src/app/api/school/[slug]/bulletin/` are admin routes; no teacher post route found | — |

### What it does NOT do (don't claim)
- No read/view tracking or "who has seen it" list (no view fields in `src/lib/school-bulletin/*`).
- No comments, likes, or required acknowledgment/signature.
- No pinning (expiry and scheduling only).
- No SMS. Email + push only.
- Teachers can't post.
- Scheduled posts become visible at their publish time, but the *email* for a scheduled post goes out with the daily job (cron `0 12 * * *` UTC in `vercel.json`), so it can lag by hours. Push timing for scheduled posts was not traced.

## Founder pain (with quotes + sources)

Reddit couldn't be searched (reddit.com blocked for the search tool). Quotes are from news and research.

- **Announcements pile up.** "It just gets very overwhelming because there can be so many announcements, all at one time, too." Another parent warned that if you don't check the school app daily, "you wouldn't know anything that's going on." — Star Tribune via GovTech, Nov 16, 2026 — https://www.govtech.com/education/k-12/why-some-parents-feel-overwhelmed-by-school-apps
- **Families want "a go-to, one-stop shop for information"** (district's stated goal in the same story) — same URL.
- **Hard-to-find information hurts trust.** 74% of parents likely to highly recommend their school say relevant information is easy to find, vs 20% of parents less likely to recommend. — GreatSchools via Education Week, Dec 2025 — https://www.edweek.org/leadership/what-parents-want-most-from-schools-clear-honest-communication/2025/12
- **MudKitchen approved framing:** "Parents should not have to search through old emails, group chats, and scattered links just to understand what is happening this week." (`FAMILY_COPY`, `src/components/home/home-copy.ts`)

## Evidence (numbered: quote — publisher, year — URL)

1. "53 percent expressed that information shared by their children's school is not always easy to access and understand" — SchoolStatus 2024 School-Family Communications Report, reported by eSchool News, Apr 2024 — https://www.eschoolnews.com/district-management/2024/04/10/school-home-communication-remains-challenge/ *(vendor survey; ~1,050 families per SchoolStatus)*
2. "45 percent reported that school communications are not frequent enough" — same source, 2024 — same URL
3. 74% of parents likely to highly recommend their school say relevant information is easy to find, compared with 20% of parents less likely to recommend it. — GreatSchools survey of 1,100 parents, Education Week, Dec 2025 — https://www.edweek.org/leadership/what-parents-want-most-from-schools-clear-honest-communication/2025/12 *(EdWeek's figures, paraphrased)*
4. "Only school safety (94%), quality of teachers (92%), and academic performance (89%) rank higher than accessibility of communication (86%)" — ParentSquare & Hanover Research parent study (n=1,031), Oct 2026 — https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/ *(vendor-sponsored)*
5. "It just gets very overwhelming because there can be so many announcements, all at one time, too," — parent quoted by Star Tribune (GovTech), 2026 — https://www.govtech.com/education/k-12/why-some-parents-feel-overwhelmed-by-school-apps *(quote, not a statistic)*

Strongest two: #1 (53% say school info isn't easy to access and understand) and #3 (74% vs 20%: easy-to-find info tracks with recommending the school).

## Tool stack alternative

Microschools post announcements through: email blasts from Gmail, group texts, WhatsApp/GroupMe, a Facebook group, a Google Doc or Canva flyer link, or a printed flyer in the cubby.

Failure modes:
- **Buried.** An announcement in a busy group chat scrolls away under replies; there's no "still current" view. Bulletin keeps active posts on the home page until they expire.
- **Stale info lingers.** A Facebook post or pinned message about last month's pickup change stays up. Bulletin expiry hides it automatically.
- **Wrong audience.** One group chat for everyone means teachers see family-only logistics, or the whole school gets a single program's field-trip note. Bulletin audiences split school-wide / parents / teachers / program.
- **No timing control.** You have to remember to send Sunday night. Bulletin schedules posts.
- **Attachments drift.** Flyers live in Drive links that break or need access requests. Bulletin attaches the file to the post.
- **Facebook groups need everyone on Facebook** and mix school notices with social posts (general observation; no source collected this session).

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel — announcements via messaging (price not public)
- "Admins can broadcast announcements to an entire classroom." Lead Staff and Staff cannot send them (per search summary of the help article). — https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel (updated Jun 2, 2026; checked Nov 2026)
- A separate bulletin board / home-page post feed with expiry: **unconfirmed** (not found in help results).
- Pricing: quote only. — https://mybrightwheel.com/pricing (checked Nov 2026)

### Playground — Feed announcements (price not public)
- Feed posts go to selected recipients and can be sent "through the app, email, SMS, or several at once"; "Only Primary Guardians linked to the specified recipients will receive Emails and SMS messages." — https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web (checked Nov 2026)
- Scheduling: "Scheduled announcements show at the top of your feed"; pinning: "Only announcements can be pinned," pinned until a chosen date; optional "Acknowledge" button for staff and parent signature request; family comments can be turned on/off per post; "View Recipients" shows who received it and which notifications were sent. — same URL
- Admins control which staff can create each post type ("Post creation permissions," default everyone). — same URL
- Pricing: quote only ("custom pricing based on program size and needs"). — https://www.tryplayground.com/llms.txt via `_rivals.md` (checked Nov 2026)

### Transparent Classroom — emailed announcements + Home feed ($2/child/month)
- "Sending Announcements" (updated Dec 20, 2024): school-wide or classroom announcements; "all recipients will receive an email notification right away"; optional "Include classroom staff"; attachments "limited to a total of 20MB"; replies go to the sender's email; "Parents and staff can also see an announcement feed on the [Home] page." — https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements (checked Nov 2026)
- Scheduling or expiry: **not mentioned** in the article.
- Pricing: "$2.00 USD per child / month." — https://www.transparentclassroom.com/pricing (checked Nov 2026)

### Procare — NOT USED (reference only)
- "Procare can send emails and text messages to families"; emergency SMS from the website. — https://www.procaresoftware.com/capabilities/family-engagement/ and https://www.procaresupport.com/procare-online/docs/messages (checked Nov 2026)

## Draft copy (sections as in 2e)

Tone references: Playground's communication page ("Engage families every day—without adding to your team's workload"), Transparent Classroom's announcements help article, Brightwheel's feature list. Rival pages lead with channels (app, email, SMS); MudKitchen's honest angle is "the one place families check", with audiences and auto-expiry.

**Hero headline:** Lead: "School news families actually find." Accent: "Then it tidies itself." (9 words)

**Hero body (33 words):** Post closures, flyers and reminders once. Pick who sees it, publish now or later, and set an end date. Families see it on their home page, with an email and a push alert.

**One-liner (10 words):** Announcements and flyers that reach the right families, then expire.

### Capabilities — Admin / founder
- **Post once, reach everyone** — One post appears on family and staff home pages and goes out by email and app push.
- **Pick who sees it** — Whole school, parents only, teachers only, or one program. Nobody gets news that isn't for them.
- **Schedule it for later** — Write Sunday's reminder on Friday. It goes live on its own at the time you choose.
- **Old news disappears** — Set an end date and the post drops off feeds after it, so families never act on stale info.
- **Attach the flyer** — Add up to five files, like a PDF flyer, a menu or a packing list.
- **Post from your phone** — Write, schedule and publish from the MudKitchen app as well as the web.

### Capabilities — Families
- **On your home page** — The latest school updates sit at the top of your home page, not in a group chat.
- **Alerts when it matters** — Get an email and a push notification when the school publishes a post for your family.
- **Open the files** — Tap a post to read it in full and open the flyer or form.
- **Catch up later** — Missed something? New posts wait in your notification bell.

### Capabilities — Staff / teachers
- **Staff-only notes** — Admins can post just to teachers: schedule changes, training days, reminders.
- **One tap from your dashboard** — Open the School Bulletin from your dashboard on web or in the app.
- **See what families see** — School-wide posts show up for you too, so you can answer family questions.

### Use cases
1. **Snow-day closure** — *Scenario:* The founder decides at 6am to close. *Outcome:* A school-wide post with a one-day end date goes out by email and push and sits at the top of every home page, then disappears tomorrow.
2. **Spring program flyer** — *Scenario:* Only the elementary program is going to the science museum. *Outcome:* The post and PDF go to that program's families only; the preschool families never see it.
3. **Staff in-service day** — *Scenario:* Teachers need the agenda for Friday's training. *Outcome:* A teachers-only post with the agenda attached, scheduled for Monday morning.
4. **Weekly lunch reminder** — *Scenario:* The founder writes reminders during Friday's quiet hour. *Outcome:* Each one is scheduled to publish on the right day without her remembering.

### FAQ
- **Who gets notified when I publish?** Everyone in the audience you picked. Families and staff get an email and a push notification in the MudKitchen app, and the post appears on their home page and in their notification bell. (35 words)
- **Can I post to just one program?** Yes. Choose parents, teachers, the whole school, or one or more programs. Families in a program portal only see posts meant for that program. (27 words)
- **What happens when a post expires?** It hides from family and staff feeds after the end date you set. If you don't set one, it stays up until you archive it. (27 words)
- **Can teachers post to the bulletin?** Not today. School admins write and publish posts; teachers read school-wide and teacher-only posts from their dashboard. Teachers can message families directly in Messages. (27 words)
- **Can I see who has read a post?** Not today. MudKitchen sends the email and push for you, but it doesn't show per-family read status for bulletin posts. (24 words)

### Comparison rows

| Row | MudKitchen | Tool stack (email / group chat / Facebook) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Announcement feed on the family home page | Yes | No (inbox or chat stream) | Unconfirmed; announcements sent as messages ([help](https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel)) | Yes, Feed ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | Yes, Home page feed ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| Audience control | School-wide, parents, teachers, programs | One list or group per channel | Whole classroom ([help](https://help.mybrightwheel.com/en/articles/2098452-start-messaging-in-brightwheel)) | Selected recipients/classrooms ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | School-wide or classroom, ± staff ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| Schedule for later | Yes | Email only (Gmail schedule send) | Unconfirmed | Yes ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | Not mentioned ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| Auto-expire / pin until a date | Expiry date | No | Unconfirmed | Pin until a date ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | Not mentioned |
| Attachments | Up to 5 files, 10 MB each | Yes | Unconfirmed | Photos/videos ≤30 MB; attachments not sent by SMS ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | 20 MB total ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| Delivery channels | Home page, email, app push | Whatever app it's posted in | In-app messaging | App, email, SMS ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | Email + Home feed ([help](https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements)) |
| Acknowledgment / read tracking | No | No | Unconfirmed | Parent signature + "View Recipients" ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | Not mentioned |
| Public price | Not stated here | Free | Quote only ([pricing](https://mybrightwheel.com/pricing)) | Quote only ([llms.txt](https://www.tryplayground.com/llms.txt)) | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: Playground's Feed has more (SMS, pinning, signatures). MudKitchen's angles: post expiry, program-scoped audiences, staff-only posts, and the bulletin living next to enrollment, billing and records in a system built for microschools.

## Open questions / things you could not verify

- Bulletin is off by default and not on Free. Confirm with the team whether marketing should present it as standard on paid plans.
- Push timing for **scheduled** posts (email goes with the daily job; push path not traced).
- Brightwheel: whether a separate announcement board or scheduling exists.
- Reddit / founder forums not searchable this session.
- SchoolStatus figures come from eSchool News coverage; the primary report PDF wasn't opened.
