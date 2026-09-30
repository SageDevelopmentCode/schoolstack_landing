# MudKitchen: "One Kitchen" (60s launch film)

A 60-second product film for microschool founders. The 16:9 master is 1920x1080 and the 9:16 variant is 1080x1920. Both run at 30fps for 1800 frames, and both are built in Remotion in this folder.

| What | Where |
|---|---|
| Frame-accurate timeline (single source of truth) | `src/timeline.ts` |
| Hub geometry ported from the homepage | `src/data/hub.ts` (from `src/components/sections/PainSection.tsx`) |
| VO lines + burned-in caption cues | `src/captions.ts` |
| Music / SFX / VO cue sheet | `src/audioCues.ts` |
| Scenes | `src/scenes/HubActs.tsx` (Acts I-II), `AdminAct.tsx`, `ParentAct.tsx`, `TeacherAct.tsx`, `FinaleAct.tsx` |

```bash
cd video/mudkitchen-film
npm install
npm run studio          # scrub in Remotion Studio (syncs brand assets first)
npm run render          # out/mudkitchen-16x9.mp4 + out/mudkitchen-9x16.mp4
npm run stills          # review stills at key frames -> out/stills/16x9
npm run stills -- 9x16  # same for vertical
npm run shotlist        # regenerate the tables in this doc from the timeline
```

Compositions: `MudKitchenFilm16x9`, `MudKitchenFilm9x16`, `MudKitchenFilm16x9NoCaptions`, plus `Acts/ActI-16x9` through `ActVI-9x16` for per-act review.

---

## 1. Creative treatment

It opens in the dark forest green of a school with too many tabs open. SCATTERED TODAY rises into place at the top, and a quiet serif line says *Too many tools*, then *Too many tabs*, while ten glass pills settle into orbit around an empty center, each one a place a founder has to check before bed. Dashed light pulls down every spoke, but it never arrives. Then the evidence, one line at a time: the forms light up and an enrollment inquiry drops into the empty middle (*Response 37 of ?*); Gmail lights and a parents' group chat slides in with 47 unread; the spreadsheets light and a roster called *(FINAL) (2)* takes its place. On the last beat the roster holds still while every pill around the ring lights up with a count badge. The camera pushes into the middle and the hook rises word by word in serif. On the kick, a cream highlighter swipes in and the words it's been waiting for land on it: *everything feels harder.* From there the film exhales. The type recedes, the ring pulls back into view, and each tool fires its light down its own line in a slow wave. As each trail lands it becomes a white feature chip, and a small clay bowl blooms in the middle. On *collapse*, the tools come unmoored and stream into the bowl as warm particles while the chips step out to take their places, and on *workspace* the bowl locks into a clay card with a magnetic snap and a glass chime: *One workspace.* As the voice names each feature, its chip flies into the card and docks: enrollment, billing, messaging, calendar, files. On *and more*, the rest rush in and the last slot flips through a blur of modules, and a cream circle punches through into the first portal. From here the film shows the real product on the site's own cream backing, in the same frames the homepage uses. The school admin demo opens on "Good morning, Admin." with the day's focus queue; the tour cursor moves through Admissions, where the Rivera family flips from Contacted to Enrolled, then My Students, where Emma is assigned to Oak Room and Jordan Taylor, then Finances, where the revenue chart draws itself on. A white admin alert becomes a parent's message, *Welcome to Oak Room, Emma!*, and drifts into a phone running the MudKitchen app. Sarah's home screen greets her, Google Forms and DocuSign melt into Emma's enrollment checklist while it ticks off and gets signed, and Venmo and PayPal melt into one Pay button. Gmail tries to peek in and gets the door shut on it, gently. The teacher's day is the teacher portal: Jordan's dashboard, a Mark all present that ripples down the attendance list like rain on a pond, a reply in the same Rivera thread, and a calm May calendar. At the end, three portals orbit one bowl, fold into a ring of loader dots, and resolve into *MudKitchen* above a clay pill that says *Book a demo.* The tag reads: *Built inside a real microschool.*

---

## 2. Shot list

Every row below is generated from `SHOTS` in `src/timeline.ts`. Timecodes are m:ss.s at 30fps. Beats are on a 92 BPM grid, one beat every ~19.6 frames (`beat(n)` in the timeline).

<!-- SHOTLIST:START -->
| Shot | Timecode | Frames | Title | Camera / motion | On-screen text | SFX / music | Color mode |
|---|---|---|---|---|---|---|---|
| S01 | 0:00.0-0:03.2 | 0-96 | Too many tools | Locked off. Kicker assembles in place at the top (letters rise with a 1.5-frame stagger, dot rows fade in either side) and holds. Centered Lora line 'Too many tools.' at f12 swaps to 'Too many tabs.' at f48 (old line exits up, new line enters from below). Ten glass pills pop onto the outer ellipse on the site's delay wave from f20 with a steady 4px drift; dashed connectors reach 72% of the way in and stop. | SCATTERED TODAY (kicker) / Too many tools. / Too many tabs. | Low room hum + single vinyl crackle at f0. Music bed starts at f0. Soft tick as the kicker assembles. Glassy tick per pill. | Forest `#2E4A3C` |
| S02 | 0:03.2-0:07.9 | 96-236 | Evidence | An empty dashed circle anchors the center (the missing hub). On each VO clip one tool group lights up (clay border, 1.08x, flowing connector) while the rest dim to 55%, and a card slides in along the lit connector: form fragment (Forms, DocuSign, Calendly), group-text stack (Gmail), roster sheet (Sheets, Docs, Drive). f220-236: the roster sheet holds steady while every pill lights in sequence with clay count badges (the pile-up). | Card fragments only (captions carry the VO) | Soft tick on each evidence beat (f96, f142, f186). | Forest `#2E4A3C` |
| S03 | 0:07.9-0:12.0 | 236-360 | Hook typography | Short push-in (f236-248): ring and card scale 1 to 1.25 and fade, max 4px blur. Hook starts at f240 so no frame is empty. Line 1 reveals word by word (rise + blur, no scale). On the kick (f313) the cream highlighter swipes first, then 'everything feels harder.' lands as one line (1.12 to 1 spring, 2px shake). f342-360 the type recedes (1 to 0.85, fade) into the hub pull-back. | When your school runs in five different places, / everything feels harder. | Whoosh-in on the push (f232). Kick drum on 'everything feels harder.' (f313). | Forest `#2E4A3C` |
| S04 | 0:12.0-0:16.2 | 360-486 | Tool to feature | Pull back to the hub. Each pill fires a light trail down its spoke (site delays 0-1.0s, wave around the ring). White feature chips pop in on arrival. MudKitchen bowl blooms at center. | Enrollment, Payments, Billing, Messaging, Contracts, Calendar, Files, Staff, Reports, Website (chip labels) | Rising shimmer per trail, pitched up around the ring. Soft bloom swell on the logo. | Forest `#2E4A3C` |
| S05 | 0:16.2-0:21.3 | 486-640 | Collapse, then the list docks | On 'collapse' (f486) the tool pills detach and spiral into the bowl as particles (motion blur) while the feature chips glide out to the tools' old spots. On 'workspace' (f534) the bowl shrinks into the header of a clay 'One workspace' card with a 2x3 grid of dashed module slots. Each spoken feature flies from its ring spot into its slot on its word: Enrollment f540, Billing f565, Messaging f584, Calendar f608, Files f627 (9:16 has no Billing / Files chips, so those pop in place). | One workspace (card header) / Enrollment, Billing, Messaging, Calendar, Files (docked modules) | Layered whoosh (f482), magnetic snap (f529), glass chime on lock-in (f534), soft tick as each module docks. | Forest `#2E4A3C` |
| S06 | 0:21.3-0:22.0 | 640-660 | And more, then punch | On 'and more' (f647) the remaining chips rush the last slot, which flips through Payments, Contracts, Staff, Reports, Website, Attendance, Admissions every 1.5 frames, then '+ 12 more'. f652-660 a cream #FFFAF4 circle punches out from the card center (match cut into Act III). | Payments / Contracts / Staff / Reports / Website / Attendance / Admissions / + 12 more (flip) | Whoosh as the remaining features rush in (f645). | Forest `#2E4A3C` |
| S07 | 0:22.0-0:24.4 | 660-732 | Admin: Dashboard | Cream #FFFAF4 backing. The website's admin demo in the homepage frame (16px radius, #DDD0BE border, no browser chrome): sidebar with Logo, clay 'Need help?' pill, MAIN / TOOLS groups. 'Good morning, Admin.' header, Today's focus queue (8 applications, 3 shadow days, 1 not marked), School signal card, metric cards count up (22 / 6 / $12,480 / 4), page scrolls to Today's attendance. Tour cursor rests on 'Review admissions', then clicks Admissions. | SCHOOL ADMIN (kicker) / Know what needs you. | Soft UI tick on the nav click. | Site cream `#FFFAF4` |
| S08 | 0:24.4-0:26.8 | 732-804 | Admin: Admissions | Admissions opens with Enrollment Flows / Submissions subtabs. Filter pills (All 17, New 3, Contacted, App Sent, Enrolled, Lost) over the submissions table. Jennifer Walsh's new row slides in; the cursor clicks the Rivera status and it flips Contacted to Enrolled (pill counts update). | Every family. One pipeline. | Card slides: soft paper swipes on the beat. | Site cream `#FFFAF4` |
| S09 | 0:26.8-0:29.2 | 804-876 | Admin: My School > My Students | My School opens (My Students, Programs, Staff, Classrooms, Tuition). Metric cards and the student table with photos. Cursor assigns Emma Rivera to Oak Room, then to Jordan Taylor; each chip pops and Needs attention counts down 2, 1, 0. | Records that stay current. | Two soft notification pings on the assignments. | Site cream `#FFFAF4` |
| S10 | 0:29.2-0:31.6 | 876-948 | Admin: Finances overview | Finances > Overview: Total Revenue $47,320, Expenses $31,840, Net Profit $15,480, Burn Rate count up; Revenue vs Expenses area chart draws on; category spending rings fill. | Finances without the spreadsheet. | Light ticks as the figures settle. | Site cream `#FFFAF4` |
| S11 | 0:31.6-0:32.1 | 948-963 | Finances flash | 0.5s stutter: giant cropped figures cut every 5 frames on cream, forest, then clay. | $47,320 / $12,480 / Paid | Three tape-stop hits. | Site cream `#FFFAF4` |
| S12 | 0:32.1-0:34.0 | 963-1020 | Notification to message | A white admin alert ('Rivera family is enrolled', thread #218) morphs into the parent message bubble 'Welcome to Oak Room, Emma!' with a delivered check. The bubble shrinks toward the phone position as a soft circular reveal opens the parent act. | Welcome to Oak Room, Emma! (thread #218) | Swoosh plus a bright 'sent' pop; room opens up (reverb tail). | Site cream `#FFFAF4` |
| S13 | 0:34.0-0:36.5 | 1020-1095 | Parent: Home | The MudKitchen mobile app on the phone. Parent home: forest gradient header ('Good morning, Sarah.', date pill, help / bulletin / notification buttons), Start here card, Upcoming events (Spring art showcase), then scrolls to child cards for Emma, Jake and Liam over the floating tab bar. Tap on Emma's 'Enrollment checklist'. | One place to stay in the loop. | Warm pad opens, birdsong-level texture (very low). | Site cream `#FFFAF4` |
| S14 | 0:36.5-0:39.5 | 1095-1185 | Parent: Apply + enroll | Emma's enrollment checklist pushes in. Google Forms and DocuSign ghosts dissolve into the phone. Rows tick off and the progress bar fills; an immunizations.pdf chip lands on Immunizations; the Community Agreement sheet slides up and the signature draws on, then Signed. | Apply, upload, sign. Done. | Pen scratch on signature. Soft click on upload. | Site cream `#FFFAF4` |
| S15 | 0:39.5-0:42.5 | 1185-1275 | Parent: Billing | Billing tab: 'Family tuition' header with Family view / Emma / Jake / Liam / Forms pills, Next payment card ($1,250.00, due May 15, $4,500.00 remaining). Venmo and PayPal ghosts dissolve into the Pay button. Press, squash, 'Paid · Thank you!', last-payment banner, Emma's May tuition flips to Paid. | One tuition. One button. | Button press thock, success chime. | Site cream `#FFFAF4` |
| S16 | 0:42.5-0:44.8 | 1275-1344 | Parent: Carousel | Carousel of app screens in phones, one per beat: Messages, Family calendar, Forms & agreements, My children. | EVERYTHING FAMILIES NEED (kicker) + screen titles | Page flicks on each beat. | Site cream `#FFFAF4` |
| S17 | 0:44.8-0:46.0 | 1344-1380 | Gmail peek gag | Phone returns on the Messages tab. Gmail icon peeks out from behind it; the phone slides shut on it with a soft thud and a small squash. f1370-1380 a #F0E6D8 sheet wipes up into the teacher act. | (none) | Tiny cartoon 'boop' on peek, cushioned thud on close. | Site cream `#FFFAF4` |
| S18 | 0:46.0-0:48.0 | 1380-1440 | Teacher: Dashboard | #F0E6D8 fades to cream. The website's teacher demo in the homepage frame: white top nav (MudKitchen logo, Dashboard / My Students / Messages / Calendar / Attendance pills, JT avatar). 'Good morning, Jordan.', Start here card, Classroom snapshot (8 learners), then scrolls to Oak / Maple / Cedar Room cards and the school bulletin. Cursor clicks Attendance. | TEACHER PORTAL (kicker) / Your class, at a glance. | Music thins to pad + light shaker. | Site cream `#FFFAF4` |
| S19 | 0:48.0-0:50.0 | 1440-1500 | Teacher: Attendance | Today's attendance for Monday, May 11. Cursor clicks 'Mark all present'; rows check off top to bottom, each check sends a ripple ring outward and its badge flips to Present; the button becomes 'Attendance saved'. | Attendance, done by 8:05. | Rising pitched plinks per check (satisfying scale). | Site cream `#FFFAF4` |
| S20 | 0:50.0-0:52.0 | 1500-1560 | Teacher: Messages | Messages with the Rivera Family thread open (same family from Acts III and IV). Sarah's pickup note sits in the thread; Jordan's reply types into the composer and is sent at f1538 with a Sent receipt. | Every family, one thread. | Keyboard taps, sent pop. | Site cream `#FFFAF4` |
| S21 | 0:52.0-0:54.0 | 1560-1620 | Teacher: Calendar | School calendar for May 2026: Staff Meeting, Nature Walk, Art Showcase and Field Day chips pop onto the grid and the Coming up list; super lands on the downbeat. f1606-1620 the frame shrinks while a forest sheet rises into the finale. | Teach more. Chase less. | Downbeat hit on super. | Site cream `#FFFAF4` |
| S22 | 0:54.0-0:55.5 | 1620-1665 | Mini hub return | Pull back. Only MudKitchen and three portal orbs orbit on a dashed ellipse (no tools left). | Parent / School Admin / Teacher (orb labels) | Music builds to final chord. | Forest `#2E4A3C` |
| S23 | 0:55.5-1:00.0 | 1665-1800 | Lockup | Orbs fold into the bowl. Wordmark types on in serif, sub line fades up, clay CTA pill springs in, tag last. | MudKitchen / Enrollment, billing & school operations, in one place. / Book a demo, trymudkitchen.com/get-started / Built inside a real microschool. | Final chord + logo sting (f1683). Tail decays to silence by f1800. | Forest `#2E4A3C` |
<!-- SHOTLIST:END -->

### Key hits (absolute frames)

| Hit | Frame | Why it matters |
|---|---|---|
| Kicker assembles | 2-33 | Tick SFX; letters rise in place, one font, dot rows close in |
| Ring in | 20 | Pills pop on the site's delay wave, stretched to 0-2.0s (music bed starts at f0) |
| Line swap | 48 | "Too many tools." exits up, "Too many tabs." enters from below |
| Evidence beats | 96, 142, 186 | One tool group lights per VO clip; the center card swaps content |
| Pile-up | 220-236 | Roster sheet holds; every pill lights in sequence with a count badge |
| Push-in | 236-248 | Ring + card scale 1 to 1.25 and fade, max 4px blur |
| Hook line 1 | 240 | Word-by-word rise, 5-frame stagger, no scale |
| "everything feels harder." | 313 (beat 16) | Kick drum; highlighter swipes first, line lands 4 frames later |
| Hook recede | 342-366 | Type scales to 0.85 and fades, overlapping the pull-back so no frame is empty |
| Trails fire | 372 + site delay | Wave: top first, sides at +6/+12/+18 frames, bottom at +30 |
| Collapse | 486-528 | On "collapse": pills spiral into the bowl, chips glide out to the pills' spots; motion blur 492-530 |
| Lock-in chime | 534 | On "workspace": bowl shrinks into the header of the One workspace card; shockwave ring + glass sweep |
| Features dock | 540, 565, 584, 608, 627 | Enrollment, Billing, Messaging, Calendar, Files each fly into a slot on their spoken word |
| "and more" | 647 | Remaining chips rush the last slot; it flips through 7 modules at 1.5 frames each, then "+ 12 more" |
| Punch-through | 652-660 | Cream circle wipe from the card center becomes Act III background |
| Finances stutter | 948-963 | Three 5-frame giant-type cuts |
| Notification becomes message | 972 | Thread #218 continuity starts |
| Cream flood | 996 | Circular wipe into Act IV |
| Gmail thud | 1362 | Phone slides shut on the peek |
| Teacher super downbeat | 1565 (beat 80) | "Teach more. *Chase less.*" |
| Logo sting | 1683 (beat 86) | Loader-dot ring collapses into the bowl; lockup builds |

---

## 3. Voiceover script

**Read:** warm, unhurried, founder-to-founder. Keep it close-mic and dry, with a smile on "pulls it together." About 150 wpm with breaths. Clips 01-05 are clipped and punchy; clip 07 has a slight lift; clip 13 is light and a little playful. The 113-word script lands between 0:00.1 and 0:59.7. Voice is continuous through the portal acts: clip 11 plays under My Students and Finances, clip 13 under billing, the carousel, and the Gmail gag ("email" on the thud at f1362).

**Recording / TTS:** record one continuous read (Eleven v3, "Hope", `[pause]` between lines) to `audio-source/vo-full-v2.mp3`, then run `node scripts/split-vo.mjs`. It cuts the read on its silences into one file per row of the table below (`public/audio/vo/<id>.wav`), applying per-clip speed-ups and pause caps so every clip fits its slot. Hand-recorded clips also work (`.wav`, `.mp3` or `.m4a`; trim leading silence). Each file is mounted at its start frame, so the read never drifts out of sync with the picture. `npm run sync-assets` (also run by `studio`, `stills` and `render`) measures every clip and warns when one runs past its max length. The music bed ducks from 0.45 to 0.22 under each clip. A single full-length `vo.wav` at frame 0 still works as a fallback when no clip files exist.

> Too many tools. Too many tabs.
> Enrollment lives in forms. Updates live in texts. Records live in spreadsheets.
> When your school runs in five different places — everything feels harder.
> MudKitchen pulls it together.
> Ten apps collapse into one workspace — enrollment, billing, messaging, calendar, files, and more.
> School admins see admissions, students, and alerts in one command center.
> Assign classrooms. Track tuition. See every dollar.
> Parents apply, upload, and sign forms, right from their phone.
> Tuition takes one tap. Messages, calendar, and forms live in one app, not buried in email.
> Teachers track students, attendance, and conversations — in a calmer day.
> One platform. Three portals. Built for microschools.
> MudKitchen. Book a demo at trymudkitchen.com/get-started.

<!-- VO:START -->
| File (`public/audio/`) | Starts | Frames | Max length | Line (read exactly) |
|---|---|---|---|---|
| `vo/01.wav` | 0:00.1 | 2-46 | 1.5s | Too many tools. |
| `vo/02.wav` | 0:01.6 | 48-94 | 1.5s | Too many tabs. |
| `vo/03.wav` | 0:03.2 | 96-140 | 1.5s | Enrollment lives in forms. |
| `vo/04.wav` | 0:04.7 | 142-184 | 1.4s | Updates live in texts. |
| `vo/05.wav` | 0:06.2 | 186-238 | 1.7s | Records live in spreadsheets. |
| `vo/06.wav` | 0:08.0 | 240-311 | 2.4s | When your school runs in five different places... |
| `vo/07.wav` | 0:10.4 | 313-366 | 1.8s | everything feels harder. |
| `vo/08.wav` | 0:12.3 | 368-460 | 3.1s | MudKitchen pulls it together. |
| `vo/09.wav` | 0:15.4 | 462-666 | 6.8s | Ten apps collapse into one workspace: enrollment, billing, messaging, calendar, files, and more. |
| `vo/10.wav` | 0:22.3 | 668-810 | 4.7s | School admins see admissions, students, and alerts in one command center. |
| `vo/11.wav` | 0:27.1 | 812-1028 | 7.2s | Assign classrooms. Track tuition. See every dollar. |
| `vo/12.wav` | 0:34.3 | 1030-1188 | 5.3s | Parents apply, upload, and sign forms, right from their phone. |
| `vo/13.wav` | 0:39.7 | 1190-1388 | 6.6s | Tuition takes one tap. Messages, calendar, and forms live in one app, not buried in email. |
| `vo/14.wav` | 0:46.3 | 1390-1538 | 4.9s | Teachers track students, attendance, and conversations, in a calmer day. |
| `vo/15.wav` | 0:51.3 | 1540-1656 | 3.9s | One platform. Three portals. Built for microschools. |
| `vo/16.wav` | 0:55.3 | 1658-1798 | 4.7s | MudKitchen. Book a demo at try mud kitchen dot com slash get started. |
<!-- VO:END -->

**Optional alternate last line** (same slot, 1700-1796): "MudKitchen. Finally, one kitchen for your whole school." The default stays the site-copy CTA line because it names the action and the URL. Use the alternate only on cuts where the CTA is carried by an end card or a platform button.

**Captions** are burned in from `src/captions.ts`: Poppins 500 at 36px (16:9) or 46px (9:16), two lines at most. Dark scenes use cream text on a `rgba(16,32,24,0.55)` backing, and cream scenes use forest text on a cream backing, so both clear WCAG AA. The portal acts (S07-S21) sit on cream, so they use the cream backing. Captions are suppressed in three places where the VO is already set as on-screen type: "Too many tools. / Too many tabs." (0-90), the kinetic hook (240-360) and the CTA lockup (1658-1800). A caption there would just repeat the frame.

---

## 4. Remotion / After Effects layer notes

### Z-order (top of list = back)

**Acts I-II (`HubActs.tsx`, one continuous shot, 0-660)**
1. Backdrop: `#2E4A3C`, sage fog at 16%, vignette 42%
2. Parallax rings: three faint ellipses at 1.35x/1.7x/2.1x the outer ring, drifting 60px across the act
3. Hub group (push-in / pull-back camera lives here; `CameraMotionBlur` wraps this layer during the collapse)
   - Connectors: static line (`#A6B89A`, 22%) under dashed overlay (`#C5D5B8`, 60%, dash `6 30`, offset loop every 42 frames = the site's 1.4s)
   - Light trails (SVG, Gaussian glow)
   - Particle streams behind detaching pills
   - Tool pills (glass: white 24%-12% gradient, 42% white border, 10px backdrop blur; Act I lit state adds a clay tint, cream border, 1.08x and a count badge during the pile-up)
   - Feature chips on the ring (white, site icon colors)
4. Core: shockwave ring, clay "One workspace" card (glass sweep, header title, 2x3 dashed module slots), bowl + wordmark (shrinks into the card header), chips in flight and docked, the "more" flip slot, punch-through circle
5. Act I (`IntroAct.tsx`): kicker, center line, dashed anchor slot, evidence card (form, texts and roster panes), hook typography with cream highlighter plate

**Acts III-V (`AdminAct`, `ParentAct`, `TeacherAct`)**
1. Backdrop: the site background `#FFFAF4` with a light `#F0E6D8` fog in all three acts (the teacher act fades in from `#F0E6D8`)
2. Decorative art (teacher only): `HeroLeft.webp` at 10%, drifting 16px
3. Competitor ghosts (parent only; they sit above the phone while dissolving)
4. Persistent device. Admin and teacher use `DemoFrame` (the homepage's `LandingScaledDemoFrame`: 16px radius, `#DDD0BE` border, `0 24px 60px rgba(43,36,29,0.10)`), laid out at website CSS pixels and scaled. The parent uses `Phone`, laid out in 375pt React Native points with an iOS status bar and the app's floating tab bar. Only the page layer re-keys per beat; the tour cursor (`DemoCursor`) lives inside the frame.
5. Kicker + super column (forest supers, clay kicker, clay italic on "Chase less")
6. Exit transition (finance stutter + light thread morph / `#F0E6D8` wipe / forest sheet rising into the finale)

Screen content is copied from the real demos into `src/demo/` rather than imported: the admin chrome and data from `AdminDashboardDemo.tsx` and the admin demo pages, the teacher shell from `SchoolTeacherDemoShell`, and the parent screens from `apps/mobile` (`ParentHomeScreen`, the enrollment checklist, `ParentBillingDueCard`). Accents use the MudKitchen scheme (primary `#2E4A3C`, clay `#A05C45`) in place of the demo tenants' colors.

**Global (`Film.tsx`)**: scenes, then film grain (overlay, 9%, quarter-res turbulence re-seeded every 2 frames), then captions, then audio.

### Easing references

| Use | Remotion | CSS / AE equivalent |
|---|---|---|
| All entrances | `EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1)` | `cubic-bezier(0.16,1,0.3,1)`. In AE, Value graph: first key outgoing influence 16% with steep velocity; second key incoming influence 70%, velocity 0 |
| Exits / pull-ins | `EXPO_IN = bezier(0.7, 0, 0.84, 0)` | Mirror of the above |
| Morphs, trails, carousel | `EXPO_IN_OUT = bezier(0.87, 0, 0.13, 1)` | Easy Ease with ~87% influence both sides |
| Orbit | `SOFT_IN_OUT = bezier(0.45, 0, 0.55, 1)` | Easy Ease 45% |
| UI cards | `spring({ damping: 18, stiffness: 220, mass: 1 })` | Damping ratio 0.61, ~9% overshoot, settles in ~13 frames. AE keys: 0% (f0), 109% (f7), 99.5% (f11), 100% (f14) |
| Hook slam | `spring({ damping: 11, stiffness: 260, mass: 0.9 })` | Damping ratio 0.36, ~30% overshoot. Scale starts at 170% (line 1) / 220% (line 2). AE: use the spring expression below |
| Dash flow | linear | The only linear motion in the film, matching the site |

AE spring expression (paste on Scale or Position; set `freq`/`decay` to match):

```js
// UI cards: freq 2.35, decay 9.0  |  hook slam: freq 2.75, decay 5.5
freq = 2.35; decay = 9.0;
n = 0; if (numKeys > 0) { n = nearestKey(time).index; if (key(n).time > time) n--; }
if (n > 0) { t = time - key(n).time; amp = velocityAtTime(key(n).time - thisComp.frameDuration / 10);
  value + amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t) / (freq * 2 * Math.PI); } else value;
```

### Consolidation physics

- **Trails**: each travels pill edge to chip in 14 frames (`EXPO_IN_OUT`), with a tail 35% of the path long. The start time is the site delay x 30 frames.
- **Pills detach** 486 + delay x 12 frames, on "collapse", and follow a quadratic Bezier (`spiralPoint`, tangential control point, swirl 0.4). Each shrinks 1.0 to 0.12 over 30 frames and leaves seven trailing dots in alternating sage and clay-highlight. The merge reads as a stream, not an explosion.
- **Chips step out** from the inner ring to their tool's old spot over 492-522 (`EXPO_IN_OUT`); in 9:16 the spot is pushed 1.2x wide and 1.1x tall so the chips clear the card.
- **Motion blur**: `<CameraMotionBlur shutterAngle={200} samples={6}>` wraps the hub from 492 to 530, which covers the merge. In AE, turn on layer motion blur for the same window (shutter 200, 6 samples).
- **Lock-in** (534, on "workspace"): the bowl pulses +22% while absorbing, then springs into the card header at 42px (50px in 9:16). The card (520x380, or 560x440 in 9:16) springs up from 532, a clay-highlight shockwave ring scales 0.6x to 3.8x over 20 frames, and a 40%-wide specular sweep crosses the card.
- **Docking**: each spoken feature starts its 8-frame flight 4 frames before its word (`EXPO_IN_OUT`, 40px arc), lands in its slot at 1.25x (1.08x in 9:16) with a 12% overshoot, and its dashed slot fills with cream. The unnamed chips fly to the sixth slot and fade out as the flip starts.

### Continuity devices

- **Thread #218 (Rivera family)** runs through the whole film. In Act III the Rivera submission moves from Contacted to Enrolled, Emma is assigned to Oak Room and Jordan Taylor, and the enrollment alert becomes the message "Welcome to Oak Room, Emma!". Act IV follows a parent (Sarah) through Emma's enrollment checklist and May tuition. In Act V Jordan replies in the Rivera Family thread. The film's "today" is Monday, May 11 everywhere.
- **Persistent anchors**: the admin window with its sidebar hop, the parent phone, and the teacher window. Beats change content inside a stable frame, which is the same move as the reference's constant-anchor montage.
- All names, schools, and amounts are demo data ("MudKitchen Microschool"). Student photos are the site's stock demo thumbnails. There is no real PII.

---

## 5. 9:16 variant

Safe zone: the top 220px and bottom 380px are kept clear of critical type (platform UI). Captions sit at bottom + 404px. All scenes read `useLayout()` and switch layout when `height > width`. There is no separate edit, so both ratios share every frame of timing.

<!-- SAFE916:START -->
| Shot | Title | 9:16 treatment |
|---|---|---|
| S01 | Too many tools | Re-laid-out |
| S02 | Evidence | Re-laid-out |
| S03 | Hook typography | Re-laid-out |
| S04 | Tool to feature | Re-laid-out |
| S05 | Collapse, then the list docks | Re-laid-out |
| S06 | And more, then punch | Re-laid-out |
| S07 | Admin: Dashboard | Re-laid-out |
| S08 | Admin: Admissions | Re-laid-out |
| S09 | Admin: My School > My Students | Re-laid-out |
| S10 | Admin: Finances overview | Re-laid-out |
| S11 | Finances flash | Center-safe as-is |
| S12 | Notification to message | Center-safe as-is |
| S13 | Parent: Home | Re-laid-out |
| S14 | Parent: Apply + enroll | Re-laid-out |
| S15 | Parent: Billing | Re-laid-out |
| S16 | Parent: Carousel | Re-laid-out |
| S17 | Gmail peek gag | Center-safe as-is |
| S18 | Teacher: Dashboard | Re-laid-out |
| S19 | Teacher: Attendance | Re-laid-out |
| S20 | Teacher: Messages | Re-laid-out |
| S21 | Teacher: Calendar | Center-safe as-is |
| S22 | Mini hub return | Center-safe as-is |
| S23 | Lockup | Re-laid-out |
<!-- SAFE916:END -->

What changes in the re-laid-out shots:

- **Hub (S02-S04)**: 6 of 10 tools (Google Forms, Venmo, Gmail, Calendly, DocuSign, Google Sheets) are re-spaced every 60 degrees on a tall ellipse (rx 330, ry 470). The inner chip ring is rx 170, ry 215. Pill type is 28px (vs 22px) and chips are 24px (vs 18px). The trail wave is re-timed from the top by angle. The VO still says "ten apps"; the four missing tools are Wix, PayPal, Google Drive, and Google Docs, and the evidence card and the badge pile-up carry the chaos. Tool groups are filtered to the six tools on screen. The card is 1.2x (672px wide), the kicker sits at safe top + 40, and Act I captions drop 16px so they clear the Calendly pill.
- **Hook (S03)**: re-broken to three lines + two lines at 96/124px so no line runs past ~900px.
- **Workspace list (S05-S06)**: the card is 560x440 with 24px chips docked at 1.08x. Only Enrollment, Messaging and Calendar have chips on the six-tool ring, so Billing and Files pop into their slots on their words.
- **Portal acts (S07-S21)**: the super moves to a top block (safeTop + 50) and the device is centered below it. Both demo frames are 1000x800 at y 540; the admin one lays out at 700 CSS px with the sidebar collapsed to icons, and the teacher one at 720 CSS px with icon-only nav pills. The phone is 440px wide centered at y 905, and carousel phones are 440px.
- **Lockup (S23)**: stacked. Logo at cy-330, 150px wordmark, subline wrapped at 820px, CTA pill stacked over the URL, tag at 24px.

---

## Reference calibration

The reference is `546f40465a104c19a72d04ff472511d8.MP4`, a Symphony product film: 94.5s, 1080x608, 25fps. I measured it with `ffmpeg` scene detection (threshold 0.25) and viewed keyframes at 2fps and 4fps.

- **Cut rhythm**: about 64 cuts, a mean shot of ~1.5s. The shape matters more than the mean. There are long holds on hero ideas (4.7s at 9.4-14.2s, 4.8s at 53.9-58.8s), a connector montage with 7 cuts in 2.7s (22.5-25.2s), and a data stutter with about 15 cuts in 3s (78.6-81.6s, every 0.12-0.4s). This film follows the same shape: long holds on the hook and the collapse, a word-synced list that docks one module per spoken feature and ends in a 1.5-frame flip (S05-S06), a 5-frame finance stutter (S11), and a carousel at one card per ~17 frames (S16).
- **Signature moves borrowed**:
  - A constant anchor with swapping content (S02 evidence card; also the Act III-V devices)
  - A constant anchor icon with swapping content and background, used as a match cut (the admin sidebar, parent phone, and teacher window)
  - Giant cropped type and numbers in a stutter montage (S11)
  - Centered chat bubbles with "Sending / Sent" chips (S12, S20)
  - An orbit ring with avatars (S22)
  - Card carousel (S16)
  - A dot-ring loader that resolves into the wordmark and URL on the end card (S23)
- **Type and density**: one idea per shot, either huge serif or small, crisp UI with nothing in between, and lots of negative space. The reference alternates dark and light fields to reset the eye; here the acts do that job (forest for the problem and the hub, cream for the three portals, forest again for the finale).
- **Where this film deliberately differs**: the average shot is longer (23 shots, ~2.6s each). It's for founders, and the brand voice is warm, not hype. The energy comes from motion inside persistent frames rather than hard cuts. The reference's photographic B-roll is replaced by brand color fields and the site's own illustrations.

## Brief conflicts, resolved

1. **"Max 6 words per super"** vs. the 9-word hook: the hook is kinetic type, which the brief allows ("kinetic type on hook only"). Every other super is 6 words or fewer.
2. **Lockup subline** ("Enrollment, billing & school operations — in one place.", 8 words): treated as lockup copy, not a super. It's the site's line, set small under the wordmark.
3. **"Replaces 7+ tools"** vs. the ten pills: the film shows the site's ten, and the VO says "Ten apps," which matches what's on screen.
4. **Italic clay on forest** measures about 1.9:1 contrast, which fails the "high contrast" rule. On the kick, a cream highlighter plate swipes under the italic line, so the clay sits on cream at about 4.5:1. The color and italic are unchanged, and the plate adds a beat of kinetic energy.
5. **Schedule / Bulletin** had no super in the brief. It gets "Schedule and bulletin, together." (4 words). The teacher beats get "Your class, at a glance.", "Attendance, done by 8:05.", and "Every family, one thread." ahead of the brief's "Teach more. Chase less."

## Audio cue sheet

Drop files into `public/audio/` using these names, then run `npm run sync-assets`, which writes `public/audio/manifest.json`. Only files that exist get mounted, so partial deliveries still render. `npm run sfx` synthesizes every `sfx/` file (D major, 48 kHz mono WAV); `npm run sfx -- pen whoosh-in` rebuilds just those. Replace any of them with a recorded or generated file under the same name.

<!-- AUDIO:START -->
| Timecode | Frame | File (`public/audio/`) | Cue | Gain |
|---|---|---|---|---|
| 0:00.0 | 0 | `vo.wav` | VO (single full read, fallback) | 1 |
| 0:00.0 | 0 | `music.mp3` | Music bed, 92 BPM, organic drums + muted synth pad (ducks to 0.22 under VO) | 0.45 |
| 0:00.0 | 0 | `sfx/hum.wav` | Low room hum | 0.2 |
| 0:00.0 | 0 | `sfx/crackle.wav` | Single vinyl crackle hit | 0.35 |
| 0:00.1 | 4 | `sfx/tick.wav` | Kicker assembles | 0.25 |
| 0:03.2 | 96 | `sfx/tick.wav` | Evidence beat 1: tool group lights | 0.25 |
| 0:04.7 | 142 | `sfx/tick.wav` | Evidence beat 2: tool group lights | 0.25 |
| 0:06.2 | 186 | `sfx/tick.wav` | Evidence beat 3: tool group lights | 0.25 |
| 0:07.7 | 232 | `sfx/whoosh-in.wav` | Push-in to the hook | 0.35 |
| 0:10.4 | 313 | `sfx/kick.wav` | Kick on 'everything feels harder.' | 0.45 |
| 0:12.4 | 372 | `sfx/shimmer.wav` | Light trails wave | 0.25 |
| 0:12.5 | 376 | `sfx/bloom.wav` | Logo bloom swell | 0.2 |
| 0:16.1 | 482 | `sfx/whoosh-layered.wav` | Spiral collapse | 0.35 |
| 0:17.6 | 529 | `sfx/magnet-snap.wav` | Magnetic snap | 0.4 |
| 0:17.8 | 534 | `sfx/glass-chime.wav` | Lock-in chime | 0.35 |
| 0:18.0 | 540 | `sfx/tick.wav` | Feature docks into the workspace 1 | 0.225 |
| 0:18.8 | 565 | `sfx/tick.wav` | Feature docks into the workspace 2 | 0.225 |
| 0:19.5 | 584 | `sfx/tick.wav` | Feature docks into the workspace 3 | 0.225 |
| 0:20.3 | 608 | `sfx/tick.wav` | Feature docks into the workspace 4 | 0.225 |
| 0:20.9 | 627 | `sfx/tick.wav` | Feature docks into the workspace 5 | 0.225 |
| 0:21.5 | 645 | `sfx/whoosh-in.wav` | 'and more': remaining features rush in | 0.25 |
| 0:27.2 | 816 | `sfx/ping.wav` | Alert ping 1 | 0.225 |
| 0:27.9 | 836 | `sfx/ping.wav` | Alert ping 2 | 0.225 |
| 0:31.6 | 948 | `sfx/tape-stop.wav` | Finances stutter | 0.25 |
| 0:32.7 | 982 | `sfx/sent-pop.wav` | Notification becomes message | 0.3 |
| 0:38.3 | 1150 | `sfx/pen.wav` | Signature | 0.25 |
| 0:41.2 | 1236 | `sfx/thock.wav` | Pay button press | 0.3 |
| 0:41.4 | 1242 | `sfx/success.wav` | Payment success | 0.25 |
| 0:44.9 | 1348 | `sfx/boop.wav` | Gmail peek | 0.25 |
| 0:45.4 | 1362 | `sfx/thud.wav` | Panel slides shut | 0.35 |
| 0:48.4 | 1452 | `sfx/plinks.wav` | Attendance check ripple | 0.25 |
| 0:51.3 | 1538 | `sfx/sent-pop.wav` | Teacher reply sent | 0.25 |
| 0:52.2 | 1565 | `sfx/downbeat.wav` | Teach more. Chase less. | 0.3 |
| 0:56.1 | 1683 | `sfx/sting.wav` | Logo sting + final chord | 0.4 |
<!-- AUDIO:END -->

Music brief: 60s instrumental, 92 BPM, D major. Organic kit (brushes, frame drum, shaker, light claps), felt piano, marimba, plucked guitar, a muted analog pad and round sub bass, with the midrange kept open for a VO that runs almost continuously from 0:22 to 0:46. `music.mp3` is timed to the film clock and mounted at frame 0, so its timestamps match the picture:

| Film time | Music |
|---|---|
| 0:00-0:08 | Scattered: sparse pad, ticking percussion, restless pluck |
| 0:08-0:12 | Hook: riser into one hard kick at 0:10.4 |
| 0:12-0:19 | Exhale: felt piano enters, shimmer builds; the picture's collapse (0:16.2) and lock-in (0:17.8) sit on the VO words |
| 0:19-0:22 | Three plucks at 0:20.2, reverse swell at 0:21.1 |
| 0:22-0:31.5 | Admin groove: brushed drums, bass, marimba ostinato |
| 0:31.5-0:34 | Tape-stop break at 0:31.6, pop back in at 0:32.7 |
| 0:34-0:46 | Parents: brighter and airy, accent at 0:41.2, playful stop hit at 0:45.4 |
| 0:46-0:52 | Teachers: pad, piano and shaker only |
| 0:52.2 | Full groove drops back in on the downbeat |
| 0:56.1 | Final warm chord and sting, decaying to silence by 1:00 |
