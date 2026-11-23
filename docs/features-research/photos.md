# Photos

Researched Nov 22, 2026. Feature slug: `photos` (school photo sharing). Rivals: Brightwheel, Playground, Transparent Classroom (per `docs/features-research/_rivals.md`). Procare notes are marked **not used**.

## Product truth (capabilities by role, with file paths; web/mobile)

> "Mobile" below means the MudKitchen **iPhone app** (Expo code in `apps/mobile`). Google Play isn't live yet; the download page runs an Android waitlist. In copy, say "iPhone app", never "iOS and Android".

How it works in one line: admins and teachers upload photos into one private school gallery, grouped by the day they were taken. Signed-in families browse it on web and in the app and get an email and push when new photos arrive. Each family records a photo permission for each child (OK to share / limited / no photos), and admins see everyone's permission in one list before they share.

Catalog: admin "Photos — School photos and albums for families" (`src/lib/organization-settings/catalog.ts`). On by default for paid schools (`photos: true` in `DEFAULT_FEATURES`); not on the Free plan (`src/lib/organization-settings/plans.ts`; `/gallery` gated in `free-plan-api-guard.ts`).

### School admin / founder

| Capability | Proof | Web / mobile |
|---|---|---|
| Upload a batch of photos for a date; up to 25 per upload, 10 MB each; JPEG, PNG or WebP; images compressed on upload | `src/lib/school-gallery/storage.ts` (`MAX_GALLERY_PHOTOS_PER_UPLOAD = 25`, `MAX_GALLERY_PHOTO_BYTES`, `ALLOWED_MIME_TYPES`, `compressImageForUpload`); `src/app/api/school/[slug]/gallery/route.ts` (POST, `photoDate`) | Both (`src/components/school-admin/gallery/GardenGalleryUploadSheet.tsx`; `apps/mobile/src/components/school-admin/gallery/garden/admin-photo-upload-sheet.tsx`) |
| Gallery grouped by day | `src/lib/school-gallery/group-gallery-photos.ts` (`groupGalleryPhotosByDate`) | Both |
| Delete any photo | `src/app/api/school/[slug]/gallery/[photoId]/route.ts` (DELETE); `gallery-access.ts` (`canManageGalleryPhoto`: admins manage all) | Both |
| "Photo permissions — Before you share": every enrolled student's stored consent, with search and filters "Everyone", "OK to share", "Limited", "No photos", "Not answered", and last-updated date | `src/components/school-admin/gallery/PhotoMediaPermissionsSidebar.tsx` (subtitle "Stored consent for enrolled students (from enrollment and parent updates).") | Both (`apps/mobile/src/components/school-admin/gallery/garden/admin-photo-permissions-sheet.tsx`) |
| Consent captured at enrollment flows into the stored permission | `src/lib/students/photo-media-consent.ts` (`mapEnrollmentConsentToPhotoMediaConsent`) | — |
| Families get an email ("New photos — {School}") and push when photos are uploaded (once per upload batch) | `src/lib/school-gallery/gallery-notifications.ts` (`listEnrolledFamilyIds`, `parentEmailSentAt`); `gallery-expo-push.ts`; `src/lib/emails.ts` (`sendGalleryPhotosUploadedEmail`) | Both |
| Reuse gallery photos in the newsletter (photos + cover) | `src/components/school-admin/newsletter/NewsletterGalleryPickerSheet.tsx` | Web |
| Activity log of uploads | `src/lib/school-gallery/gallery-activity.ts` | — |
| (Separate) website photos for the public school profile | `src/components/school-admin/school-profile-photos/SchoolProfilePhotosSection.tsx` | Web |

### Families / parents

| Capability | Proof | Web / mobile |
|---|---|---|
| Photos tab: "School gallery and your child's photo permissions in one place." | `src/components/school-parent/photos/ParentPhotosPage.tsx` | Both (`apps/mobile/src/app/parent/[slug]/more/photos.tsx`, program portal too) |
| Browse the school gallery, full-screen viewer | `src/components/school-parent/photos/garden/ParentGardenGallery.tsx`, `GardenPhotoViewer.tsx`; `src/app/api/parent-portal/gallery/route.ts` (signed-in parent route) | Both |
| Set each child's photo permission: **Full consent** (website, social media, newsletters, print), **Limited consent** (shared only with enrolled families, not public marketing), **No consent** ("Do not photograph or record my child for school use…") | `src/lib/students/photo-media-consent.ts` (`PHOTO_MEDIA_CONSENT_OPTIONS`); `PhotoPermissionsPanel.tsx`, `PhotoPermissionsCard.tsx`, `PhotoPermissionsGuideCard.tsx` | Both |
| Email + push when new photos are posted | `gallery-notifications.ts` | Both |
| Parent onboarding can include "Upload profile pictures for your children" (child profile photos, not the gallery) | `catalog.ts` (`upload_child_photos`) | — |

### Staff / teachers

| Capability | Proof | Web / mobile |
|---|---|---|
| Upload photos to the school gallery | `src/app/api/teacher-portal/gallery/route.ts` (POST, `actorType: "teacher"`); web page via `SchoolGalleryPage` in `src/app/school/[slug]/teacher/(protected)/[feature]/page.tsx` | Both (`apps/mobile/src/app/teacher/[slug]/more/photos.tsx`, `teacher-photos-garden-screen.tsx`) |
| Manage (delete) only their own uploads | `src/lib/school-gallery/gallery-access.ts` (`uploadedBy === userId`) | Both |
| Family emails say the upload came from a teacher | `gallery-notifications.ts` (`type: "teacher"` for `teacher_portal` uploads) | — |

### What it does NOT do (don't claim)
- **No per-child or per-class albums.** One school gallery grouped by date; signed-in families see the whole gallery. No face or name tagging.
- **Permissions are not applied automatically.** The consent list helps the admin decide "before you share"; nothing blocks an upload that includes a "No photos" child.
- **No video** (JPEG/PNG/WebP only).
- **No download/save button** for families was found in the gallery viewer (web or mobile).
- **No comments or likes.**
- Whether program portals filter the gallery by program is **unconfirmed** (`programScope: "optional"` in the parent route; `listGalleryPhotosPage` takes no program filter).

## Founder pain (with quotes + sources)

Reddit couldn't be searched (blocked for the search tool). Quotes are from research.

- **Parents worry about photos specifically.** "About two-thirds of parents are concerned about someone finding out private information about their child (68%) or sharing photos of their child (67%)." — C.S. Mott Children's Hospital National Poll on Children's Health, Mar 16, 2015 — https://www.mottpoll.org/sites/default/files/documents/031615_sharenting_0.pdf
- **They've seen it go wrong.** 74% of parents on social media know another parent who shared too much about a child, including "inappropriate photos of a child (27%)." — same report.
- **Founders are on their own legally.** "Private and parochial schools at the elementary and secondary level generally do not receive such funding," so most private microschools aren't covered by FERPA; photo consent is the school's own policy to run. — U.S. Department of Education, Student Privacy Policy Office — https://studentprivacy.ed.gov/faq/which-educational-agencies-or-institutions-does-ferpa-apply
- **Teachers' personal phones.** Brightwheel's guidance tells staff to delete photos from personal devices once shared in the app (search summary of brightwheel material; not opened) — the same problem a microschool has when teachers text photos.

## Evidence (numbered: quote — publisher, year — URL)

1. "About two-thirds of parents are concerned about someone finding out private information about their child (68%) or sharing photos of their child (67%)" — C.S. Mott Children's Hospital National Poll on Children's Health, 2015 — https://www.mottpoll.org/sites/default/files/documents/031615_sharenting_0.pdf *(text extracted from the PDF; parents of children 0–4)*
2. "The majority of parents who use social media (74%) know of another parent who has shared too much information about a child on social media, including parents who gave embarrassing information about a child (56%), offered inappropriate photos of a child (27%)" — same, 2015 — same URL
3. Nearly 80% of parents feel other parents overshare on social media. — Mott Poll, Nov 2023 — https://mottpoll.org/sites/default/files/documents/112023_Sharenting.pdf *(from search summary; verify wording)*
4. "Private and parochial schools at the elementary and secondary level generally do not receive such funding." (i.e. U.S. Department of Education program funds, which trigger FERPA) — U.S. Department of Education, Student Privacy Policy Office (undated FAQ) — https://studentprivacy.ed.gov/faq/which-educational-agencies-or-institutions-does-ferpa-apply
5. "Schools often designate photos or videos of students participating in public events … as directory information and/or obtain consent from the parents or eligible students" — U.S. Department of Education, FAQs on Photos and Videos under FERPA (undated) — https://studentprivacy.ed.gov/faq/faqs-photos-and-videos-under-ferpa
6. "When you share a link to your album, anyone with the link can view the photos and add to the album." — Google Photos Help — https://support.google.com/photos/answer/6131416?hl=en

Strongest two: #1 (67% of parents worry about photos of their child being shared) and #6 (a shared-album link lets anyone who has it view and add photos).

## Tool stack alternative

Typical stack: Google Photos shared albums, a Dropbox or Google Drive folder, Shutterfly Share Sites, a private Facebook group, or photos texted from a teacher's phone into a group chat. `src/lib/outreach/tool-replacements.ts` maps Brightwheel, ClassDojo, Seesaw and others to MudKitchen photos.

Failure modes:
- **Links travel.** A Google Photos link can be forwarded; "anyone with the link can view the photos and add to the album" (Google Photos Help). MudKitchen's gallery needs a family login.
- **Consent lives in a spreadsheet** (or a paper enrollment form) that the teacher holding the camera never sees. MudKitchen shows each child's permission next to the gallery.
- **Photos stay on staff phones.** Group-text photos sit on personal devices indefinitely.
- **Families leave, access doesn't.** Ex-families keep the album link or stay in the Facebook group. MudKitchen access follows enrollment (login-gated).
- **No "new photos" signal.** Families don't know a shared album was updated unless someone posts in the chat. MudKitchen emails and pushes on upload.
- **Facebook-group posts are social-media posts.** For a "Limited consent" child, that may already be the wrong place.

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel — included (price not public)
- Pricing page lists "Photo & video sharing." — https://mybrightwheel.com/pricing (checked Nov 2026)
- Guardians view media in the child's Feed or the mobile Gallery; "Only the program controls access to a child's profile"; bulk download and video download are mobile-app only; Gallery isn't on web; direct social sharing is Apple-only. — https://help.mybrightwheel.com/en/articles/942382-view-download-and-share-your-child-s-photos-videos (dated Apr 28, 2026; checked Nov 2026)
- Photos are logged to individual children's profiles (newsletter help: "Only photos logged as an activity for a student can be added to newsletters"). — https://help.mybrightwheel.com/en/articles/3400687-send-newsletters
- Built-in photo-consent tracking: **unconfirmed**.

### Playground — included (price not public)
- "Share photos and videos with real-time notifications." — https://tryplayground.com/solutions/communication (checked Nov 2026)
- Feed photos and videos up to 30 MB, videos ≤ 90 seconds; Media Gallery of feed photos. — https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web (checked Nov 2026)
- Guardians download single items in the app; "Bulk downloading is only available on the website." No download-restriction setting mentioned. — https://help.tryplayground.com/en/articles/12835741-how-to-download-items-from-the-media-gallery (updated Mar 24, 2026; checked Nov 2026)
- Built-in photo-consent tracking: **not found**.

### Transparent Classroom — included ($2/child/month)
- Staff share photos by tagging children with "@"; parents receive them per their notification settings and can choose text or email delivery immediately, daily or weekly; untagged photos are visible only to staff; tagging also records lesson progress. — https://transparent-classroom.helpscoutdocs.com/article/70-use-photos-to-share-with-parents-and-record-progress (search summary; checked Nov 2026)
- Parents can upload photos of their child through the mobile app; staff acknowledge them. — https://transparent-classroom.helpscoutdocs.com/article/252-parent-app-photo-uploads (search summary)
- Homepage: "Connect photos to child progress." — https://www.transparentclassroom.com/ (checked Nov 2026)
- Photo-consent tracking: **unconfirmed**.

### Procare — NOT USED (reference only)
- "Share daily activities, videos, photos and milestones with families"; families can "react to photos." — https://www.procaresoftware.com/capabilities/family-engagement/ (checked Nov 2026)

## Draft copy (sections as in 2e)

Tone references: Playground ("Share photos and videos with real-time notifications"), Transparent Classroom ("Connect photos to child progress"), Brightwheel's photo help. Rivals lead with per-child feeds and downloads (daycare style). MudKitchen's honest angle is a private school gallery plus a clear record of each child's photo permission, which a founder can check before posting.

**Hero headline:** Lead: "School photos families love," Accent: "shared with permission." (7 words)

**Hero body (34 words):** Teachers upload the day's photos from their phones. Families see them in a private school gallery and get a heads-up. Each child's photo permission sits right beside it, so you know before you share.

**One-liner (11 words):** A private school photo gallery with every child's photo permission alongside.

### Capabilities — Admin / founder
- **Know before you share** — See every enrolled child's photo permission in one list: OK to share, limited, no photos, or not answered.
- **Permissions from enrollment** — Consent families give during enrollment is stored automatically; families can update it anytime.
- **Upload a whole day** — Add up to 25 photos at once from your phone or computer, filed under the date.
- **Families hear about it** — Families get an email and app notification when new photos are posted.
- **Reuse in the newsletter** — Pick gallery photos for your weekly newsletter without downloading anything.

### Capabilities — Families
- **Your school's gallery** — Browse the school's photos by day on your phone or computer, behind your login.
- **Set your child's permission** — Choose full, limited or no photo consent for each child, and change it whenever you like.
- **Never miss new photos** — Get a heads-up by email and app notification when the school posts.

### Capabilities — Staff / teachers
- **Upload from the classroom** — Add photos from the MudKitchen app right after the activity.
- **Off your personal phone** — Photos go to the school's gallery instead of sitting in your camera roll and group texts.
- **Your uploads, your edits** — Delete a photo you uploaded if you picked the wrong one.

### Use cases
1. **Field-trip photos** — *Scenario:* The class spends the morning at a farm. *Outcome:* The teacher uploads 20 photos from the bus; every family gets a "New photos" email and push, and the photos are filed under that date.
2. **New family with limited consent** — *Scenario:* A family chooses "Limited consent" at enrollment. *Outcome:* The founder sees it in Photo permissions and keeps that child out of the public website and social posts, while the private gallery stays open to enrolled families.
3. **Weekly newsletter** — *Scenario:* Friday's newsletter needs pictures. *Outcome:* The founder picks this week's best shots straight from the gallery.
4. **Permission check before a social post** — *Scenario:* The founder wants to post an end-of-year photo on Instagram. *Outcome:* She filters Photo permissions to "OK to share" and checks every child in the shot.

### FAQ
- **Who can see school photos?** Families signed in to your school's MudKitchen portal or app, plus your staff. Photos are not on a public link. (21 words)
- **How do photo permissions work?** Each family chooses, per child, full consent, limited consent (enrolled families only, no public marketing) or no consent. It starts from their enrollment answer and they can change it anytime. Admins see every child's choice in one list. (40 words)
- **Does MudKitchen hide photos of children without consent?** No. The permission list tells you who can be photographed and where photos may be shared, so you can decide before uploading or posting. It doesn't detect faces or block uploads. (36 words)
- **Can teachers upload photos?** Yes, from the web or the MudKitchen app. Teachers can delete their own uploads; admins can manage every photo. (20 words)
- **Can I share videos?** Not today. The gallery takes JPEG, PNG and WebP photos, up to 25 per upload and 10 MB each. (19 words)

### Comparison rows

| Row | MudKitchen | Tool stack (Google Photos / Drive / Facebook / texts) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Private, login-only gallery | Yes | Link-based; "anyone with the link can view" ([Google](https://support.google.com/photos/answer/6131416?hl=en)) | Yes, program controls access ([help](https://help.mybrightwheel.com/en/articles/942382-view-download-and-share-your-child-s-photos-videos)) | Yes, Media Gallery ([help](https://help.tryplayground.com/en/articles/12835741-how-to-download-items-from-the-media-gallery)) | Yes, tagged photos to parents ([help](https://transparent-classroom.helpscoutdocs.com/article/70-use-photos-to-share-with-parents-and-record-progress)) |
| Per-child photo permissions on record | Yes: full / limited / none, from enrollment | Spreadsheet or paper | Unconfirmed | Not found | Unconfirmed |
| Photos tied to individual children | No (school gallery by day) | No | Yes, logged to the child ([help](https://help.mybrightwheel.com/en/articles/3400687-send-newsletters)) | Unconfirmed | Yes, "@" tagging ([help](https://transparent-classroom.helpscoutdocs.com/article/70-use-photos-to-share-with-parents-and-record-progress)) |
| Teachers upload from phone | Yes, app + web | Yes | Yes | Yes | Yes, app ([home](https://www.transparentclassroom.com/)) |
| Families alerted to new photos | Email + push | Rarely | Unconfirmed | "real-time notifications" ([page](https://tryplayground.com/solutions/communication)) | Text or email, immediate/daily/weekly ([help](https://transparent-classroom.helpscoutdocs.com/article/70-use-photos-to-share-with-parents-and-record-progress)) |
| Video | No | Yes | Yes ([help](https://help.mybrightwheel.com/en/articles/942382-view-download-and-share-your-child-s-photos-videos)) | Yes, ≤90 s ([help](https://help.tryplayground.com/en/articles/9467285-manage-the-feed-on-the-web)) | Unconfirmed |
| Family download | Not found | Yes | Yes; bulk on mobile only ([help](https://help.mybrightwheel.com/en/articles/942382-view-download-and-share-your-child-s-photos-videos)) | Yes; bulk on web only ([help](https://help.tryplayground.com/en/articles/12835741-how-to-download-items-from-the-media-gallery)) | Unconfirmed |
| Public price | Not stated here | Free | Quote only ([pricing](https://mybrightwheel.com/pricing)) | Quote only ([llms.txt](https://www.tryplayground.com/llms.txt)) | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

Honest read: all three rivals tie photos to individual children and support video and downloads, which MudKitchen doesn't. MudKitchen's angle is photo permissions on record for every child, captured at enrollment and visible next to the gallery, plus reuse in newsletters, in a system built for a K–8 microschool.

## Open questions / things you could not verify

- Does a program portal show only that program's photos? Code suggests the whole school gallery; confirm before saying "per program".
- No family download in the viewer: confirm on device; families may long-press to save on mobile (OS behavior, not a feature).
- Transparent Classroom photo details came from search summaries of help articles (not opened directly).
- Mott 2023 "nearly 80%" wording unverified (search summary).
- Brightwheel's "delete photos from personal devices" guidance came from a search summary; not opened.
- Whether rivals store photo/media consent per child is unconfirmed for all three.
- Reddit / founder forums not searchable this session.
