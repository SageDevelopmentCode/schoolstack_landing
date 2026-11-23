# Newsletters

Researched Nov 22, 2026. Feature slug: `newsletters`. Rivals: Brightwheel, Playground, Transparent Classroom (per `docs/features-research/_rivals.md`). Procare notes are marked **not used**.

## Product truth (capabilities by role, with file paths; web/mobile)

> "Mobile" below means the MudKitchen **iPhone app** (Expo code in `apps/mobile`). Google Play isn't live yet; the download page runs an Android waitlist. In copy, say "iPhone app", never "iOS and Android".

How it works in one line: the admin builds a weekly "storybook" newsletter from guided prompts (opening note, learning, a moment, what's next, an invitation for home, a child's words), plus dates, reminders, photos from the school's own photo library and a short update per teacher. On publish, families get an email and a push alert and read it in the parent portal or app. Staff read it too.

### School admin / founder

| Capability | Proof | Web / mobile |
|---|---|---|
| Builder in Communication → Newsletters | `src/components/school-admin/newsletter/NewsletterPage.tsx`, `NewsletterWorkspace.tsx`; nav in `src/lib/organization-settings/feature-nav.ts` (`COMMUNICATION_CHILDREN`, route `my_school/newsletters`) | **Web only** (no admin newsletter route under `apps/mobile/src/app/school-admin/`) |
| Guided story blocks with prompts: "Opening note", "Little discoveries", "A moment worth sharing", "Looking ahead", "An invitation for home", "A child's words", plus custom blocks (max 10 enabled, 6 custom) | `src/lib/school-admin/newsletter/newsletter-template.ts`; `newsletter-types.ts` (`NewsletterStoryBlockKind`); `newsletter-limits.ts` (`MAX_ENABLED_STORY_BLOCKS = 10`, `MAX_CUSTOM_STORY_BLOCKS = 6`) | Web |
| Optional sections: Dates ("Dates for your calendar"), Reminders, Photos, Teacher updates; toggle per school template | `newsletter-types.ts` (`NewsletterSections`); `NewsletterSectionsSheet.tsx` ("Family calendar" → "Dates", "Reminders"; "Teacher updates"); `newsletter-render.ts` | Web |
| A short update per teacher, written in the editor against your staff list | `newsletter-types.ts` (`teacherUpdates: Record<string,string>`); `NewsletterRegionEditors.tsx` (loads `staffMembers`) | Web |
| Photos picked from the school photo library or uploaded; cover image; up to 30 photos, captions ≤ 80 characters | `NewsletterGalleryPickerSheet.tsx`; `newsletter-types.ts` (`galleryPhotoId`, `coverGalleryPhotoId`); `newsletter-limits.ts` (`MAX_NEWSLETTER_PHOTOS = 30`, `MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH = 80`) | Web |
| Up to 30 dates and 30 reminders per edition (typed in; not pulled from the calendar) | `newsletter-limits.ts`; `NewsletterEvent` in `newsletter-types.ts` | Web |
| "Before you publish" readiness checklist (title, week, content) | `src/lib/school-admin/newsletter/newsletter-readiness.ts` | Web |
| Live preview; editions by week; drafts saved to MudKitchen | `NewsletterPreviewPanel.tsx`; `NewsletterOverviewPage.tsx`; `src/app/api/school/[slug]/newsletters/editions/[editionId]/save/route.ts` | Web |
| Version history with restore ("Restore this version?") | `NewsletterVersionHistorySheet.tsx`; `.../versions/route.ts`, `.../versions/[versionId]/restore/route.ts` | Web |
| Publish → families notified; "Return to draft" takes it down from the parent portal ("Nothing is sent to families") | `.../publish/route.ts`; `NewsletterModals.tsx` | Web |
| "Download or copy": Download HTML, Download text, Copy text. Dialog says: "HTML is a standalone page, not an email-delivery template. Nothing is sent." | `NewsletterModals.tsx`; `newsletter-export.ts` | Web |
| School branding in the masthead (school name, signature, primary color); footer "Made with MudKitchen" | `newsletter-types.ts` (`NewsletterSchoolMeta`); `newsletter-branding.ts` (`MUDKITCHEN_FOOTER_LABEL`) | Web |
| Available on the Free plan (builder only) | `src/lib/school-admin/free-plan-upgrade.ts` (`isFreePlanAdminPathOpen`: `my_school` + `newsletters` open); `free-plan-api-guard.ts` (`SCHOOL_SLUG_OPEN_SUFFIXES = ["/newsletters"]`) | Web |

### Families / parents

| Capability | Proof | Web / mobile |
|---|---|---|
| Email on publish: subject "New newsletter — {School}", button "Read newsletter", sent to each family's notification emails | `src/lib/emails.ts` (`sendNewsletterPublishedEmail`, `buildNewsletterPublishedEmailHtml`); `newsletter-notifications.ts` (`loadFamilyNotificationEmails`) | — |
| Push notification to the app | `src/lib/school-admin/newsletter/newsletter-expo-push.ts` (portal "parent") | Mobile |
| Read each edition full-screen; past editions listed | `src/components/school-parent/newsletters/ParentNewslettersPage.tsx`, `NewslettersReader.tsx`, `NewsletterFullScreenFrame.tsx`; route `src/app/school/[slug]/parent/(protected)/newsletters/[editionId]/read/page.tsx` | Both (`apps/mobile/src/app/parent/[slug]/more/newsletters/*`, program portal too) |
| Catalog label: "Weekly school newsletters from your admin" | `src/lib/organization-settings/catalog.ts` | — |

### Staff / teachers

| Capability | Proof | Web / mobile |
|---|---|---|
| Read published newsletters ("Published school newsletters to read") | `src/components/school-teacher/newsletters/TeacherNewslettersPage.tsx`; `src/app/school/[slug]/teacher/(protected)/newsletters/[editionId]/read/page.tsx`; catalog teacher `newsletters` | Both (`apps/mobile/src/app/teacher/[slug]/more/newsletters/*`) |
| Teachers don't edit the newsletter themselves; the admin writes each teacher's update | All newsletter write routes use `requireSchoolAdminUser` (e.g. `.../publish/route.ts`) | — |

### What it does NOT do (don't claim)
- Not an email-marketing tool: the email is a notice with a "Read newsletter" button, not the full newsletter in the inbox; the HTML download is "not an email-delivery template."
- No scheduled publish (publish is immediate; no schedule field in `NewsletterEdition`).
- No open/read analytics.
- No admin mobile editor.
- Dates aren't pulled automatically from the school calendar.
- Push/email go to families; no staff notification found (`newsletter-expo-push.ts` targets portal "parent").
- On Free, families' `newsletters` flag is capped off (`PLAN_FEATURE_ALLOW_LIST.free.parent = []` in `plans.ts`), so a Free school can build and download/copy but families likely can't read it in the portal. **Confirm before claiming either way.**

## Founder pain (with quotes + sources)

Reddit couldn't be searched (blocked for the search tool). Quotes are from news and research.

- **Founders have no time for production work.** A microschool funder says budgeting, invoicing and business insurance "are time-consuming"; private microschools have a median of 20 students, so the founder usually writes the newsletter herself. — The 74, Jun 11, 2026 — https://www.the74million.org/article/exclusive-7-things-to-know-about-microschools-in-2026/
- **Families want learning news, not just logistics.** Nearly 80% of parents want clear information on academic offerings. — GreatSchools via Education Week, Dec 2025 — https://www.edweek.org/leadership/what-parents-want-most-from-schools-clear-honest-communication/2025/12
- **Inbox noise.** "It just gets very overwhelming because there can be so many announcements, all at one time, too." — parent, Star Tribune via GovTech, Nov 2026 — https://www.govtech.com/education/k-12/why-some-parents-feel-overwhelmed-by-school-apps
- **Rival framing of the old way:** Brightwheel's own site has pages titled "printing paper newsletters that parents lose or ignore" (URL slug seen in search results: https://mybrightwheel.com/childcare-centers/printing-paper-newsletters-that-parents-lose-or-ignore.md; content not opened).

## Evidence (numbered: quote — publisher, year — URL)

1. Education + Training: average open rate **35.64%**, click rate 3.02% (Mailchimp benchmark table; "last updated in December 2023"; Mailchimp notes Apple Mail Privacy Protection may affect open-rate accuracy). — Mailchimp, 2023 — https://mailchimp.com/resources/email-marketing-benchmarks/ *(figures read from search summary of the page; re-check the table before quoting)*
2. "64% of parents feel informed when schools provide updates about their child's academic progress." and only 68% say school communication "feels personalized." — ParentSquare & Hanover Research parent study (n=1,031), Oct 2026 — https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/ *(vendor-sponsored)*
3. More than 78 percent of families reported that they don't receive suggestions and resources for how they can support learning at home. — SchoolStatus 2024 K-12 Family Survey — https://www.schoolstatus.com/blog/unlocking-success-insights-from-the-2024-k-12-family-survey *(wording from search summary; vendor survey; verify)*
4. "45 percent reported that school communications are not frequent enough" — SchoolStatus 2024 report via eSchool News, Apr 2024 — https://www.eschoolnews.com/district-management/2024/04/10/school-home-communication-remains-challenge/
5. Nearly 80% of parents want clear information on academic offerings. — GreatSchools (1,100 parents) via Education Week, Dec 2025 — https://www.edweek.org/leadership/what-parents-want-most-from-schools-clear-honest-communication/2025/12 *(EdWeek figure, paraphrased)*

Strongest two: #1 (even in education, roughly a third of emails get opened) and #3 (78% of families get no ideas for supporting learning at home, which is exactly what the "An invitation for home" block is for).

## Tool stack alternative

Typical microschool stack: Canva or Google Docs → export PDF → attach to a Gmail blast; or Mailchimp / Smore / Constant Contact. `src/lib/outreach/tool-replacements.ts` maps Mailchimp to MudKitchen newsletters.

Failure modes:
- **PDF on a phone.** Families have to download and pinch-zoom a PDF; photos make it heavy.
- **A second contact list.** Mailchimp/Smore lists have to be kept in sync with enrollment by hand; a new family misses three weeks.
- **Photos copied around.** The founder downloads photos from her phone or a shared album, then re-uploads them to Canva. In MudKitchen she picks from the photos already in the school library.
- **Another subscription.** Smore lists educator plans from about $79/year (Capterra listing; Smore's own pricing page not verified) — https://www.capterra.com/p/173379/SMORE/pricing/
- **No archive families can find.** Old newsletters live in individual inboxes. MudKitchen keeps every published edition in the parent portal and app.
- **Blank-page problem.** Generic templates don't prompt for the things families want (learning, what's next, something to try at home). MudKitchen's blocks are prompts.

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel — included (price not public)
- "Create newsletters easily on the web as a teacher or administrator." Sent immediately: "brightwheel will immediately send the newsletter as a message to the parents of all active students" in the chosen rooms; parents read it in the mobile app. — https://help.mybrightwheel.com/en/articles/3400687-send-newsletters (dated Oct 6, 2025; checked Nov 2026)
- Limits: "Only photos logged as an activity for a student can be added to newsletters"; one photo per section; max 30 sections; title/headings 70 characters; preview required before sending. — same URL
- Separate "curriculum newsletters" for brightwheel Experience Curriculum subscribers (search summary of https://help.mybrightwheel.com/en/articles/13266382-send-monthly-curriculum-newsletters-to-families; not opened).
- Scheduling: not mentioned in the article.

### Playground — included (price not public)
- Communication page: "Run professional newsletters with your branding"; "Fully branded with your logo, colors, and fonts"; "Schedule or send instantly"; drag-and-drop editor with links, images and attachments. — https://tryplayground.com/solutions/communication (checked Nov 2026)
- Delivery channel (email vs in-app): **unconfirmed**; a search summary of another Playground page mentions "customizable email newsletters." No help-center article on newsletters was found.
- Pricing: quote only. — https://www.tryplayground.com/llms.txt via `_rivals.md`

### Transparent Classroom — no newsletter feature found
- Homepage features list doesn't include newsletters. — https://www.transparentclassroom.com/ (checked Nov 2026)
- Closest equivalent: emailed announcements with attachments up to 20 MB total. — https://transparent-classroom.helpscoutdocs.com/article/269-sending-announcements (updated Dec 20, 2024; checked Nov 2026)

### Procare — NOT USED (reference only)
- Procare Online newsletters (published/updated Nov 20, 2026): drag-and-drop or HTML editor, templates, "Schedule Later", "Print as PDF", recipients by room/tag/status, personalization shortcuts, photos ≤5 MB, 4 attachments ×10 MB. — https://www.procaresupport.com/procare-online/docs/creating-newsletters (checked Nov 2026)

## Draft copy (sections as in 2e)

Tone references: Playground ("Run professional newsletters with your branding"), Brightwheel's newsletter help article, Procare's newsletter help (not used). Rivals sell newsletters as an editor; MudKitchen's honest angle is "prompts plus your own photos, so it gets written in 20 quiet minutes", and families read it where they already check school.

**Hero headline:** Lead: "A weekly newsletter" Accent: "that almost writes itself." (7 words)

**Hero body (33 words):** Answer a few friendly prompts, pick photos from your school's library, and add a line from each teacher. Publish, and families get an email and app alert to read it on any phone.

**One-liner (11 words):** Guided weekly newsletters, built from your school's own photos and stories.

### Capabilities — Admin / founder
- **Prompts, not a blank page** — Guided blocks like "Little discoveries", "Looking ahead" and "An invitation for home" tell you what to write.
- **Photos already here** — Pick pictures from your school's photo library instead of downloading and re-uploading them.
- **A line from each teacher** — Add a short update for each teacher, listed from your staff roster.
- **Check before you publish** — A readiness list flags a missing title, week or content before families see it.
- **Undo with version history** — Restore an earlier version of an edition if an edit goes wrong.
- **Take it anywhere** — Download HTML or text, or copy the text to paste into another tool.

### Capabilities — Families
- **An alert, not an attachment** — Get an email and an app notification with a "Read newsletter" button. No PDF to download.
- **Made for phones** — Each edition opens full-screen on your phone or computer.
- **Every past edition** — Older newsletters stay in your portal, so you can find last month's dates.
- **Something to try at home** — Editions can include an invitation for home that connects school learning to your evenings.

### Capabilities — Staff / teachers
- **Read what families read** — Published newsletters appear in your portal and app, so you know what families were told.
- **Your class in the story** — The founder adds a short update for each teacher, so every classroom is represented.

### Use cases
1. **Friday wrap-up in 20 minutes** — *Scenario:* The founder has one free period on Friday. *Outcome:* She fills in the prompts, picks four photos from this week's uploads, publishes, and every family gets an email and push.
2. **Field-trip photos** — *Scenario:* Teachers uploaded 40 farm-trip photos on Tuesday. *Outcome:* The newsletter's photo section and cover are picked from those uploads, captions and all.
3. **New family joins mid-year** — *Scenario:* A family enrolls in February. *Outcome:* They open the newsletters tab and read back through January's editions, with no mailing list to update.
4. **Typo after publishing** — *Scenario:* The pickup time in Reminders was wrong. *Outcome:* The founder returns it to draft, fixes it and republishes; version history keeps the earlier copy.

### FAQ
- **Do families get the newsletter by email?** They get an email saying a new newsletter is out, with a "Read newsletter" button, plus a push notification in the app. The newsletter itself opens in the parent portal on any phone or computer. (39 words)
- **Can I use photos teachers already uploaded?** Yes. You can pick photos and a cover image from your school's photo library, or upload new ones. Each photo can have a short one-line caption. (29 words)
- **Can teachers contribute?** Each edition can include a "Teacher updates" section with a short note per teacher. The admin writes or pastes those notes in the builder; teachers read published editions in their own portal. (32 words)
- **Can I send it through Mailchimp instead?** You can download the newsletter as HTML or text, or copy the text, and use it elsewhere. The HTML is a standalone page, not an email template, so check formatting in your email tool. (37 words)
- **Can I schedule a newsletter?** Not today. Newsletters publish when you click Publish. You can keep an edition in draft until you're ready. (19 words)

### Comparison rows

| Row | MudKitchen | Tool stack (Canva/Docs + Gmail, Mailchimp, Smore) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Built-in newsletter builder | Yes, guided prompts | Separate tools | Yes, sections editor ([help](https://help.mybrightwheel.com/en/articles/3400687-send-newsletters)) | Yes, drag-and-drop ([page](https://tryplayground.com/solutions/communication)) | Not found ([home](https://www.transparentclassroom.com/)) |
| Photos from the school's library | Yes, any library photo, up to 30 | Manual download/upload | Only activity-logged photos; 1 per section ([help](https://help.mybrightwheel.com/en/articles/3400687-send-newsletters)) | Images supported ([page](https://tryplayground.com/solutions/communication)); library source unconfirmed | n/a |
| Who receives it | Enrolled families, read in portal/app | Whoever is on the list | Parents of active students in chosen rooms ([help](https://help.mybrightwheel.com/en/articles/3400687-send-newsletters)) | Unconfirmed | n/a (announcements by classroom) |
| Schedule send | No | Yes (Mailchimp/Gmail) | Not mentioned ([help](https://help.mybrightwheel.com/en/articles/3400687-send-newsletters)) | Yes ([page](https://tryplayground.com/solutions/communication)) | n/a |
| School branding | Name, colors, signature | Yes | Unconfirmed | Logo, colors, fonts ([page](https://tryplayground.com/solutions/communication)) | n/a |
| Past editions archive for families | Yes, in portal + app | Scattered in inboxes | In each student's message thread ([help](https://help.mybrightwheel.com/en/articles/3400687-send-newsletters)) | Unconfirmed | n/a |
| Version history | Yes, with restore | Docs/Canva only | Unconfirmed | Unconfirmed | n/a |
| Public price | Builder open on Free plan | Smore ~$79/yr educator ([Capterra](https://www.capterra.com/p/173379/SMORE/pricing/)) | Quote only ([pricing](https://mybrightwheel.com/pricing)) | Quote only ([llms.txt](https://www.tryplayground.com/llms.txt)) | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

## Open questions / things you could not verify

- Free plan: can families read newsletters a Free school publishes? Code caps parent `newsletters` off on Free. Confirm with product before using "free newsletter builder" in copy.
- Mailchimp benchmark figures came from a search summary of the page (data last updated Dec 2023); re-check the table.
- SchoolStatus "78 percent" wording from a search summary; primary report not opened.
- Playground newsletter delivery (email vs app) and archive unconfirmed; no help article found.
- Brightwheel scheduling and branding unconfirmed.
- Reddit / founder forums not searchable this session.
